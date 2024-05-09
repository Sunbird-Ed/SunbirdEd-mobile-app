import { Platform } from '@ionic/angular';
import { of } from 'rxjs';
import { SplashScreenService } from './splash-screen.service';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from './sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplashscreenImportActionHandlerDelegate } from './sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { AppGlobalService } from './app-global-service.service';
import { partial } from 'lodash';

describe('SplashScreenService', () => {
    let splashScreenService: SplashScreenService;
    const mockPlatform: Partial<Platform> = {};
    const mockSplashScreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockSplashScreenImportActionHandlerDelegate: Partial<SplashscreenImportActionHandlerDelegate> = {};
    const mockSplashScreenTelemetryActionHandlerDelegate: Partial<SplashcreenTelemetryActionHandlerDelegate> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateTelemetryForSplashscreen: jest.fn()
    }

    beforeAll(() => {
        splashScreenService = new SplashScreenService(
            mockSplashScreenImportActionHandlerDelegate as SplashscreenImportActionHandlerDelegate,
            mockSplashScreenTelemetryActionHandlerDelegate as SplashcreenTelemetryActionHandlerDelegate,
            mockSplashScreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    it('should be create a instanc of SplashScreenService', () => {
        expect(splashScreenService).toBeTruthy();
    });

    describe('handleSunbirdSplashScreenActions', () => {
        it('should handle splash screen actions', (done) => {
            // arrange
            mockPlatform.is = jest.fn((os) => {
                let isAndroid = false;
                switch (os) {
                    case 'android':
                        isAndroid = true;
                        break;
                }
                return isAndroid;
            });
            mockSplashScreenTelemetryActionHandlerDelegate.onAction = jest.fn(() => of(undefined));
            mockSplashScreenImportActionHandlerDelegate.onAction = jest.fn(() => of(undefined));
            mockSplashScreenDeeplinkActionHandlerDelegate.onAction = jest.fn(() => of(undefined));
            // act
            splashScreenService.handleSunbirdSplashScreenActions();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalledWith('android');
                expect(mockSplashScreenTelemetryActionHandlerDelegate.onAction).toHaveBeenCalled();
                expect(mockSplashScreenImportActionHandlerDelegate.onAction).toHaveBeenCalled();
                expect(mockSplashScreenDeeplinkActionHandlerDelegate.onAction).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not handle splash screen actions for other OS', (done) => {
            // arrange
            mockPlatform.is = jest.fn((os) => {
                let isIos = false;
                switch (os) {
                    case 'ios':
                        isIos = true;
                        break;
                }
                return isIos;
            });
            //  act
            splashScreenService.handleSunbirdSplashScreenActions();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalledWith('android');
                done();
            }, 0);
        });

        it('should not handle splash screen not displayed and not reloaded', (done) => {
            // arrange
            mockPlatform.is = jest.fn((os) => {
                let isIos = false;
                switch (os) {
                    case 'ios':
                        isIos = true;
                        break;
                }
                return isIos;
            });
            window['splashscreen'].getActions = jest.fn(()=>{})
            mockAppGlobalService.isSplashscreenDisplay = false
            //  act
            splashScreenService.handleSunbirdSplashScreenActions();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalledWith('android');
                done();
            }, 0);
        });
    });
});
