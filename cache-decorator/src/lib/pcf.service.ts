// import { Injectable } from '@nestjs/common';
// import * as cfenv from 'cfenv';

// @Injectable()
// export class CFEnvService {
//     private appEnv: cfenv.AppEnv;

//     constructor() {
//         this.appEnv = cfenv.getAppEnv();
//         console.log('Environment is local??: ', this.appEnv.isLocal);
//     }

//     getAppName(): string {
//         return this.appEnv.name || 'defaultAppName';
//     }

//     getSpaceName(): string {
//         return this.appEnv.app['space_name'] || 'defaultSpaceName';
//     }

//     getServiceName(serviceName: string): any {
//         const services = this.appEnv.getServices();
//         return services[serviceName];
//     }

//     isLocal(): boolean {
//         return this.appEnv.isLocal;
//     }

// }
