# NestJS Caching Decorator

This package provides a caching decorator for NestJS APIs. It allows you to easily cache the results of your API endpoints using Redis.

## Installation

To use the caching decorator, install the package:

```sh
npm install @nestjs-decorators/cache-decorator


Configuration
First, import the CacheDecoratorModule in your main AppModule:

import { Module } from '@nestjs/common';
import { CacheDecoratorModule } from '@nestjs-decorators/cache-decorator';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheDecoratorModule.forRoot({
      host: 'localhost',
      port: 6379,
      password: 'xxxxx', // Replace with your Redis password
      tls: 'any certificate which is required' // Replace with your TLS certificate if needed
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

Usage
To cache the results of an API endpoint, use the @Cached decorator provided by the package.

import { Controller, Get } from '@nestjs/common';
import { Cached } from '@nestjs-decorators/cache-decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Cached(1000) // Cache duration in milliseconds
  getData() {
    return this.appService.getData();
  }
}

In this example, the getData method will cache its result for 1000 milliseconds. You can adjust the cache duration as needed.
```
