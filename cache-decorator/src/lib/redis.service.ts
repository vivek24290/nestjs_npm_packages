import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';
import { RedisProviderOptions } from './redis-provider.interface';

@Injectable()
export class RedisService {
  private inMemoryCache = new Map<
    string,
    { value: string; expiresAt: number }
  >();
  private redisAvailable = true;

  public constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClient,
    private readonly options: RedisProviderOptions
  ) {
    // Check Redis connectivity
    if (this.options.enableOfflineMode) {
      this.pingRedis();
    }
  }

  private async pingRedis() {
    try {
      await this.client.ping();
      this.redisAvailable = true;
    } catch (error) {
      console.error(
        'Redis is unavailable. Falling back to in-memory cache.',
        error
      );
      this.redisAvailable = false;
    }

    // Periodically check Redis connectivity
    setInterval(async () => {
      try {
        await this.client.ping();
        this.redisAvailable = true;
      } catch {
        this.redisAvailable = false;
      }
    }, 5000); // Check every 5 seconds
  }

  async set(key: string, value: string, expirationSeconds: number) {
    const jsonValue = JSON.stringify(value);

    if (!jsonValue.trim() || this.isEmpty(jsonValue)) {
      return;
    }

    const compressedValue = jsonValue;
    const expiresAt = Date.now() + expirationSeconds * 1000;

    if (this.redisAvailable) {
      try {
        await this.client.set(key, compressedValue, 'EX', expirationSeconds);
      } catch (error) {
        console.error(
          'Error setting Redis cache. Falling back to in-memory cache.',
          error
        );
        this.inMemoryCache.set(key, { value: compressedValue, expiresAt });
      }
    } else {
      this.inMemoryCache.set(key, { value: compressedValue, expiresAt });
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redisAvailable) {
      try {
        const cachedResponse = await this.client.get(key);
        if (cachedResponse) {
          return cachedResponse;
        }
      } catch (error) {
        console.error(
          'Error retrieving Redis cache. Checking in-memory cache.',
          error
        );
      }
    }

    const inMemoryEntry = this.inMemoryCache.get(key);
    if (inMemoryEntry && Date.now() < inMemoryEntry.expiresAt) {
      return inMemoryEntry.value;
    }

    // If entry is expired or doesn't exist
    this.inMemoryCache.delete(key);
    return null;
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
