import {Inject, Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {MenuController} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {SharedPreferences} from 'sunbird-sdk';
import {AppThemes, StatusBarTheme} from '@app/app/app.constant';

@Injectable()
export class AppHeaderService {

    constructor(private menuCtrl: MenuController,
                private statusBar: StatusBar,
                @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences
    ) {
    }

    private headerEvent = new Subject<any>();
    headerEventEmitted$ = this.headerEvent.asObservable();

    private headerConfig = new Subject<any>();
    headerConfigEmitted$ = this.headerConfig.asObservable();


    private sideMenuItemEvent = new Subject<any>();
    sideMenuItemEventEmitted$ = this.sideMenuItemEvent.asObservable();

    sidebarEvent(name: any) {
        this.headerEvent.next(name);
    }

    sideMenuItemEvents($event) {
        this.sideMenuItemEvent.next($event);
    }

    getDefaultPageConfig() {
        const defaultConfig = {
            showHeader: true,
            showBurgerMenu: true,
            showKebabMenu: false,
            kebabMenuOptions: [],
            pageTitle: '',
            actionButtons: ['search'],
        };
        return defaultConfig;
    }

    hideHeader() {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = false;
        defaultConfig.showBurgerMenu = false;
        this.updatePageConfig(defaultConfig);
        this.menuCtrl.enable(false);
    }

    showHeaderWithBackButton(iconList?, pageTitle?) {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = true;
        defaultConfig.showBurgerMenu = false;
        defaultConfig.actionButtons = iconList ? iconList : [];
        defaultConfig.pageTitle = pageTitle;
        this.updatePageConfig(defaultConfig);
        this.menuCtrl.enable(false);
    }

    showHeaderWithHomeButton(iconList?, pageTitle?) {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = true;
        defaultConfig.showBurgerMenu = true;
        defaultConfig.actionButtons = iconList ? iconList : [];
        defaultConfig.pageTitle = pageTitle;
        this.updatePageConfig(defaultConfig);
        this.menuCtrl.enable(true);
    }

    updatePageConfig(config) {
        this.headerConfig.next(config);
    }

    async showStatusBar() {
        const theme = await this.preferences.getString('current_selected_theme').toPromise();
        if (theme === 'JOYFUL') {
            document.querySelector('html').setAttribute('data-theme', AppThemes.JOYFUL);
            document.querySelector('html').setAttribute('device-accessable-theme','accessible' );
            const themeColor = getComputedStyle(document.querySelector('html')).getPropertyValue('--app-primary-header');
            this.statusBar.backgroundColorByHexString(themeColor);
        }
    }

    hideStatusBar() {
        this.statusBar.backgroundColorByHexString(StatusBarTheme.SET_DEFAULT);
    }
}
