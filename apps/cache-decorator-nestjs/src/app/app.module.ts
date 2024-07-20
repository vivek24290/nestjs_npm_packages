import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheDecoratorModule } from '@nest-js/cache-decorator';

@Module({
  imports: [
    CacheDecoratorModule.forRoot({
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
