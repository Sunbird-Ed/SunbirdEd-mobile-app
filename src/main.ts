import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { configuration } from './configuration/configuration';
import { hmrBootstrap } from './hmr';
import 'reflect-metadata';
import 'hammerjs';
import * as dayjs from 'dayjs';

window.dayjs = dayjs;
window.dayjs.extend(require('dayjs/plugin/duration'));

if (configuration.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (configuration.hmr) {
  if (module['hot']) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}
