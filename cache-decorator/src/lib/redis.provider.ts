import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import * as fs from 'fs';
import { RedisProviderOptions } from './redis-provider.interface';

export type RedisClient = Redis;

export function createRedisProvider(
  options: RedisProviderOptions
): Provider<RedisClient> {
  return {
    provide: 'REDIS_CLIENT',
    useFactory: (): RedisClient => {
      return new Redis({
        host: options.host,
        port: options.port,
        password: options.password,
        tls: options.tls,
        // const pemFilePath = require.resolve('library/cache-decorator/DellTechCA_Combined.pem'); //Put Installed NodeModulesPath
        // tls: {
        //  ca: [fs.readFileSync(pemFilePath)]
        //},
      });
    },
  };
}
