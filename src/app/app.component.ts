import { Router } from '@angular/router';
import { Component, EventEmitter } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppGlobalService, CommonUtilService, TelemetryGeneratorService, UtilityService, AppRatingService, AppHeaderService } from '../services/';
import { InteractType, InteractSubtype, Environment, PageId } from 'src/services/telemetry-constants';

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
      data: ''
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list',
      data: ''
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
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private router: Router
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

  handleHeaderEvents($event) {
    /*if ($event.name === 'back') {
      let navObj = this.app.getRootNavs()[0];
      let activeView: ViewController = this.nav.getActive();
      if (activeView != null && ((<any>activeView).instance instanceof TabsPage)) {
        navObj = this.app.getActiveNavs()[0];
        activeView = navObj.getActive();
      }
      if (((<any>activeView).instance instanceof UserTypeSelectionPage)
        || ((<any>activeView).instance instanceof EnrolledCourseDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsPage)
        || ((<any>activeView).instance instanceof CollectionDetailsEtbPage)
        || ((<any>activeView).instance instanceof ContentDetailsPage)
        || ((<any>activeView).instance instanceof OnboardingPage)
        || ((<any>activeView).instance instanceof QrCodeResultPage)
        || ((<any>activeView).instance instanceof FaqPage)
        || ((<any>activeView).instance['pageId'] === 'ProfileSettingsPage')
      ) {
        this.headerServie.sidebarEvent($event);
        return;
      }
      if (navObj.canGoBack()) {
        return navObj.pop();
      } else {
        this.commonUtilService.showExitPopUp(this.activePageService.computePageId((<any>activeView).instance), Environment.HOME, false);
      }
    } else {*/
      this.headerService.sidebarEvent($event);
    //}
  }

  menuItemAction(menuName) {
    switch (menuName.menuItem) {
      case 'USERS_AND_GROUPS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.USER_GROUP_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );

        this.router.navigateByUrl('/user-and-groups');
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(UserAndGroupsPage, { profile: this.profile });
        // }
        break;

      case 'REPORTS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.REPORTS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO Add new routing
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(ReportsPage, { profile: this.profile });
        // }
        break;

      case 'SETTINGS': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SETTINGS_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(SettingsPage);
        // }
        break;
      }
      case 'LANGUAGE': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.LANGUAGE_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(LanguageSettingsPage, {
        //     isFromSettings: true
        //   });
      }
        break;

      case 'HELP':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.HELP_CLICKED,
          Environment.USER,
          PageId.PROFILE);
        // migration-TODO
        // if (this.app.getRootNavs().length > 0) {
        //   this.app.getRootNavs()[0].push(FaqPage, {
        //     isFromSettings: true
        //   });

        break;

      case 'LOGOUT':
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        } else {
          // migration-TODO
          // this.logoutHandlerService.onLogout();
        }
        break;

    }
  }
}
