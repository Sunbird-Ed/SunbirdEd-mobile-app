import {AppHeaderService} from './app-header.service';
import {MenuController} from '@ionic/angular';
import {StatusBar} from '@awesome-cordova-plugins/status-bar/ngx';
import {SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of} from 'rxjs';
import onboarding from './../assets/configurations/config.json';
import { mockOnboardingConfigData } from '../app/components/discover/discover.page.spec.data';

describe('AppHeaderService', () => {
    let appHeaderService: AppHeaderService;

    const mockMenuCtrl: Partial<MenuController> = {};
    const mockStatusBar: Partial<StatusBar> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        appHeaderService = new AppHeaderService(
            mockMenuCtrl as MenuController,
            mockStatusBar as StatusBar,
            mockSharedPreferences as SharedPreferences,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of appHeaderService', () => {
        // assert
        expect(appHeaderService).toBeTruthy();
    });

    it('sidebarEvent', () => {
        // act
        appHeaderService.sidebarEvent('event_name');
    });

    it('sideMenuItemEvents', () => {
        // act
        appHeaderService.sideMenuItemEvents('some_event');
    });

    it('getDefaultPageConfig', () => {
        // act
        appHeaderService.getDefaultPageConfig();
    });

    it('hideHeader', () => {
        // arrange
        mockMenuCtrl.enable = jest.fn(() => (Promise.resolve(undefined)));

        // act
        appHeaderService.hideHeader();

        // assert
        expect(mockMenuCtrl.enable).toHaveBeenCalledWith(false);
    });

    describe('showHeaderWithBackButton', () => {
        it('should called without iconList', () => {
            // arrange
            mockMenuCtrl.enable = jest.fn(() => (Promise.resolve(undefined)));

            // act
            appHeaderService.showHeaderWithBackButton();

            // assert
            expect(mockMenuCtrl.enable).toHaveBeenCalledWith(false);
        });

        it('should called with iconList', () => {
            // arrange
            mockMenuCtrl.enable = jest.fn(() => (Promise.resolve(undefined)));

            // act
            appHeaderService.showHeaderWithBackButton(['some_icon']);

            // assert
            expect(mockMenuCtrl.enable).toHaveBeenCalledWith(false);
        });
    });

    describe('showHeaderWithHomeButton', () => {
        it('should called without iconList', () => {
            // arrange
            mockMenuCtrl.enable = jest.fn(() => (Promise.resolve(undefined)));

            // act
            appHeaderService.showHeaderWithHomeButton();

            // assert
            expect(mockMenuCtrl.enable).toHaveBeenCalledWith(true);
        });

        it('should called with iconList', () => {
            // arrange
            mockMenuCtrl.enable = jest.fn(() => (Promise.resolve(undefined)));

            // act
            appHeaderService.showHeaderWithHomeButton(['some_icon']);

            // assert
            expect(mockMenuCtrl.enable).toHaveBeenCalledWith(true);
        });
    });

    it('updatePageConfig', () => {
        // act
        const mockConfig = {
            showHeader: true,
            showBurgerMenu: true,
            pageTitle: '',
            actionButtons: ['search'],
        };
        appHeaderService.updatePageConfig(mockConfig);
    });

    it('should set background color of statusbar', (done) => {
        const customTheme = onboarding.theme;
        mockStatusBar.backgroundColorByHexString = jest.fn();
        mockSharedPreferences.getString = jest.fn(() => of('JOYFUL'));
        const selectedTheme = getComputedStyle(document.querySelector('html')).getPropertyValue('--joyful-warning');

        appHeaderService.showStatusBar().then(() => {
            expect(mockStatusBar.backgroundColorByHexString).toHaveBeenCalledWith(selectedTheme);
            done();
        });

    });

    it('should theme is not joyful go to else part', () => {
        mockStatusBar.backgroundColorByHexString = jest.fn();
        mockSharedPreferences.getString = jest.fn(() => of('DEFAULT'));

        appHeaderService.showStatusBar().then(() => {
            expect(mockStatusBar.backgroundColorByHexString).not.toHaveBeenCalledWith('#FFD954');
        });
    });

    it('should hide statusbar and set background color', () => {
        mockStatusBar.backgroundColorByHexString = jest.fn();
        appHeaderService.hideStatusBar();
        expect(mockStatusBar.backgroundColorByHexString).toHaveBeenCalledWith('#BB000000');

    });
});