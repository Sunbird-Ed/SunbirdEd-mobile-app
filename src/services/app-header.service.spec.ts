import {AppHeaderService} from './app-header.service';
import {MenuController} from '@ionic/angular';
import {SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of} from 'rxjs';
import onboarding from './../assets/configurations/config.json';
import { StatusBar } from '@capacitor/status-bar';


jest.mock('@capacitor/status-bar', () => {
    return {
      ...jest.requireActual('@capacitor/status-bar'),
        StatusBar: {
            getInfo: jest.fn(() => Promise.resolve()),
            show: jest.fn(),
            hide: jest.fn(),
            setBackgroundColor: jest.fn()
        }
    }
})

describe('AppHeaderService', () => {
    let appHeaderService: AppHeaderService;

    const mockMenuCtrl: Partial<MenuController> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        appHeaderService = new AppHeaderService(
            mockMenuCtrl as MenuController,
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
        StatusBar.setBackgroundColor = jest.fn();
        mockSharedPreferences.getString = jest.fn(() => of('JOYFUL'));
        const mHeader = {getAttribute: jest.fn(() => 'DEFAULT'), setAttribute: jest.fn()};
        jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
            switch (selector) {
                case 'html':
                    return mHeader as any;
            }
        });
        window.getComputedStyle = jest.fn(() => ({
            getPropertyValue: jest.fn()
        })) as any

        appHeaderService.showStatusBar()
        setTimeout(() => {
            // expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith("--joyful-warning");
            done();
        }, 0);

    });

    it('should theme is not joyful go to else part', () => {
        StatusBar.setBackgroundColor = jest.fn();
        mockSharedPreferences.getString = jest.fn(() => of('DEFAULT'));

        appHeaderService.showStatusBar().then(() => {
            expect(StatusBar.setBackgroundColor).not.toHaveBeenCalledWith('#FFD954');
        });
    });

    it('should hide statusbar and set background color', () => {
        StatusBar.setBackgroundColor = jest.fn();
        appHeaderService.hideStatusBar();
        expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith({"color": "#BB000000"});

    });
});