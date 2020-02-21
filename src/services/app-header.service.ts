import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Injectable()
export class AppHeaderService {

    constructor(private menuCtrl: MenuController) { }

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
}
