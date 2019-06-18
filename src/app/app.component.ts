import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
