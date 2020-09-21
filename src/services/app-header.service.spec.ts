import {AppHeaderService} from './app-header.service';
import {MenuController} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';

describe('AppHeaderService', () => {
    let appHeaderService: AppHeaderService;

    const mockMenuCtrl: Partial<MenuController> = {};
    const mockStatusBar: Partia<StatusBar> = {};

    beforeAll(() => {
        appHeaderService = new AppHeaderService(
            mockMenuCtrl as MenuController,
            mockStatusBar as StatusBar
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

    it('should set background color of statusbar', () => {
        mockStatusBar.backgroundColorByHexString = jest.fn();
        appHeaderService.showStatusBar();

        expect(mockStatusBar.backgroundColorByHexString).toHaveBeenCalledWith('#FFD954');
    });

    it('should hide statusbar and set background color', () => {
        mockStatusBar.backgroundColorByHexString = jest.fn();
        appHeaderService.hideStatusBar();
        expect(mockStatusBar.backgroundColorByHexString).toHaveBeenCalledWith('#BB000000');

    });
});
