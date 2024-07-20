import {
  applyDecorators,
  ExecutionContext,
  UseInterceptors,
  NestInterceptor,
  Injectable,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from './redis.service';
import { Observable, catchError, of, tap } from 'rxjs';
// import { CFEnvService } from './pcf.service';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

// Decorator which extends CacheInterceptor
@Injectable()
export class CachedInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector // private readonly cfEnvService: CFEnvService
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    // if (this.cfEnvService.isLocal()) {
    //     return next.handle();
    // }
    // else {
    let cacheKey: string | undefined = undefined;
    const handler = context.getHandler();
    const controller = context.getClass();
    const cacheOptions = this.reflector.get<{
      timeToLiveInMinutes: number;
      includeUserNameInCacheKey: boolean;
    }>('cacheOptions', handler);
    const httpContext: HttpArgumentsHost = context.switchToHttp();
    const request = httpContext.getRequest();

    // const appName = this.cfEnvService.getAppName();
    // const spaceName = this.cfEnvService.getSpaceName();
    const userName = cacheOptions.includeUserNameInCacheKey
      ? request.user?.name
      : '';
    const actionName = handler.name; //Function Name of the handler
    const controllerName = controller.name; // Class name of the controller
    const actionArgs = {
      params: request.params,
      query: request.query,
      body: request.body,
    };
    const hasArguments =
      Object.keys(actionArgs.params).length > 0 ||
      Object.keys(actionArgs.query).length > 0 ||
      Object.keys(actionArgs.body).length > 0;

    if (userName) {
      cacheKey =
        `${userName}:${controllerName}:${actionName}` +
        (hasArguments
          ? `${getDeterministicHashCode(JSON.stringify(actionArgs))}`
          : '');
    } else {
      cacheKey =
        `${controllerName}:${actionName}` +
        (hasArguments
          ? `${getDeterministicHashCode(JSON.stringify(actionArgs))}`
          : '');
    }

    const cachedResponse = await this.redisService.get(cacheKey);

    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    //Continuing with the current request and piping it to set the data in the cache.
    return next.handle().pipe(
      tap(async (response) => {
        await this.redisService.set(
          cacheKey || '',
          response,
          cacheOptions.timeToLiveInMinutes
        );
      }),
      catchError((err) => {
        console.log(err);
        throw err;
      })
    );
    // }
  }
}

function getDeterministicHashCode(str: string): number {
  let hash1 = (5381 << 16) + 5381;
  let hash2 = hash1;

  for (let i = 0; i < str.length; i += 2) {
    hash1 = ((hash1 << 5) + hash1) ^ str.charCodeAt(i);
    if (i === str.length - 1) {
      break;
    }
    hash2 = ((hash2 << 5) + hash2) ^ str.charCodeAt(i + 1);
  }

  return hash1 + hash2 * 1566083941;
}

export function Cached(
  timeToLiveSeconds: number = 180,
  includeUserNameInCacheKey: boolean = false
) {
  // Default TTL of 3 hour
  return applyDecorators(
    SetMetadata('cacheOptions', {
      timeToLiveInMinutes: timeToLiveSeconds * 60,
      includeUserNameInCacheKey: includeUserNameInCacheKey,
    }),
    UseInterceptors(CachedInterceptor)
  );
}
