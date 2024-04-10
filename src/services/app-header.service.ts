import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {MenuController} from '@ionic/angular';
import {StatusBar} from '@capacitor/status-bar';
import {SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {AppThemes, StatusBarTheme,AppMode} from '../app/app.constant';
import onboarding from './../assets/configurations/config.json';


@Injectable()
export class AppHeaderService {

    constructor(private menuCtrl: MenuController,
                @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    ) {
    }

    private headerEvent = new BehaviorSubject<any>({});
    headerEventEmitted$ = this.headerEvent.asObservable();

    private headerConfig = new BehaviorSubject<any>({});
    headerConfigEmitted$ = this.headerConfig.asObservable();


    private sideMenuItemEvent = new BehaviorSubject<any>({});
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

    async hideHeader() {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = false;
        defaultConfig.showBurgerMenu = false;
        this.updatePageConfig(defaultConfig);
        await this.menuCtrl.enable(false);
    }

    async showHeaderWithBackButton(iconList?, pageTitle?) {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = true;
        defaultConfig.showBurgerMenu = false;
        defaultConfig.actionButtons = iconList ? iconList : [];
        defaultConfig.pageTitle = pageTitle;
        this.updatePageConfig(defaultConfig);
        await this.menuCtrl.enable(false);
    }

    async showHeaderWithHomeButton(iconList?, pageTitle?) {
        const defaultConfig = this.getDefaultPageConfig();
        defaultConfig.showHeader = true;
        defaultConfig.showBurgerMenu = true;
        defaultConfig.actionButtons = iconList ? iconList : [];
        defaultConfig.pageTitle = pageTitle;
        this.updatePageConfig(defaultConfig);
        await this.menuCtrl.enable(true);
    }

    updatePageConfig(config) {
        this.headerConfig.next(config);
    }

    async showStatusBar() {
        const theme = await this.preferences.getString('current_selected_theme').toPromise();
        if (theme === 'JOYFUL') {
            document.querySelector('html').setAttribute('data-theme', AppThemes.JOYFUL);
            const customTheme = onboarding.theme;
            if((customTheme as any).name) {
                document.querySelector('html').setAttribute('data-color', (customTheme as any).name);
            }
            document.querySelector('html').setAttribute('device-accessable-theme','accessible' );
            const themeColor = getComputedStyle(document.querySelector('html')).getPropertyValue('--app-primary-header');
            StatusBar.setBackgroundColor({color: themeColor});      
        }
        const mode = await this.preferences.getString('data-mode').toPromise();
        if(mode===AppMode.DARKMODE){
            document.querySelector('html').setAttribute('data-mode',AppMode.DARKMODE);
        }else{
            document.querySelector('html').setAttribute('data-mode',AppMode.DEFAULT);
        }
        
    }

    hideStatusBar() {
        StatusBar.setBackgroundColor({color: StatusBarTheme.SET_DEFAULT});
    }
}
