import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';
// import { GZipHelper } from './gzip.helper';

@Injectable()
export class RedisService {
  public constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClient
  ) {}

  async set(key: string, value: string, expirationSeconds: number) {
    const jsonValue = JSON.stringify(value);
    if (value && jsonValue && jsonValue.trim() && !this.isEmpty(jsonValue)) {
      // const compressedValue = await GZipHelper.zip(jsonValue);
      const compressedValue = jsonValue;
      console.log('The Cache Key Is: ', key, ' Value is: ', compressedValue);
      await this.client.set(key, compressedValue, 'EX', expirationSeconds);
    }
  }

  async get(key: string): Promise<string | null> {
    console.log('Returning data from cache');
    const cachedResponse = await this.client.get(key);
    return cachedResponse ? cachedResponse : null;
  }

  private isEmpty(json: string): boolean {
    return (
      json === '[]' ||
      json.includes('"data":""') ||
      json.includes('"data":null') ||
      json.includes('"data":[]') ||
      json === 'null'
    );
  }
}
