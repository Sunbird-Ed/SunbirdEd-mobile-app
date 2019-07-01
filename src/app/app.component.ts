import { Component, EventEmitter } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppHeaderService } from 'src/services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home',
      data:''
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list',
      data:''
    },
    {
      title: 'Language Settings',
      url: '/language-settings',
      icon: 'globe',
      data: 'true'
    },
    {
      title: 'User Type Selection',
      url: '/user-type-selection',
      icon: 'list',
      data: 'false'
    }
  ];
  public headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search'],
  };
  public sideMenuEvent = new EventEmitter
;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private headerService: AppHeaderService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.headerService.headerConfigEmitted$.subscribe(config => {
      this.headerConfig = config;
    });
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
