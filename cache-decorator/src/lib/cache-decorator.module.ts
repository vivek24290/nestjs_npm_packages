import { DynamicModule, Module } from '@nestjs/common';
import { RedisProviderOptions } from './redis-provider.interface';
import { createRedisProvider } from './redis.provider';
import { RedisService } from './redis.service';

@Module({
  controllers: [],
  providers: [],
  exports: [],
})
@Module({})
export class CacheDecoratorModule {
  static forRoot(options: RedisProviderOptions): DynamicModule {
    const redisProvider = createRedisProvider(options);

    return {
      module: CacheDecoratorModule,
      providers: [redisProvider, RedisService],
      exports: [redisProvider, RedisService],
    };
  }
}
