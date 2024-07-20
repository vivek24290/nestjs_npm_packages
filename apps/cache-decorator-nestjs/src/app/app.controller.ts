import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Cached } from '@nest-js/cache-decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Cached(1000)
  getData() {
    return this.appService.getData();
  }
}
