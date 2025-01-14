import { ConnectionOptions } from 'tls';

export interface RedisProviderOptions {
  host: string;
  port: number;
  password?: string;
  tls?: ConnectionOptions;
  enableOfflineMode?: boolean;
}
