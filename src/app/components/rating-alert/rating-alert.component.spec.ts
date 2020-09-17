
import { AppRatingAlertComponent } from './rating-alert.component';
import { TelemetryService, SharedPreferences } from 'sunbird-sdk';
import { PopoverController, Platform, NavParams } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    UtilityService,
    AppRatingService,
    TelemetryGeneratorService,
    Environment,
    ImpressionType,
    ImpressionSubtype,
    InteractType,
    InteractSubtype
} from '../../../services';
import { of } from 'rxjs';
import { PreferenceKey, StoreRating } from '../../app.constant';
describe('AppRatingAlertComponent', () => {
    let appRatingAlertComponent: AppRatingAlertComponent;

    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'app_logo':
                    value = 'app_logo';
                    break;
                case PreferenceKey.APP_RATE_LATER_CLICKED:
                    value = 1;
                    break;
            }
            return of(value);
        }),
        putString: jest.fn(() => of(undefined))
    };

    const mockTelemetryService: Partial<TelemetryService> = {
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn()
    };

    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird')),
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app'))
    };

    const mockUtilityService: Partial<UtilityService> = {
        openPlayStore: jest.fn()
    };

    const mockAppRatingService: Partial<AppRatingService> = {
        rateLaterClickedCount: jest.fn(() => Promise.resolve(1)),
        setEndStoreRate: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {
    };
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn({
            unsubscribe: jest.fn()
        })),
    } as any;

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn(() => ('content-details'))
    };

    beforeAll(() => {
        appRatingAlertComponent = new AppRatingAlertComponent(
            mockSharedPreferences as SharedPreferences,
            mockTelemetryService as TelemetryService,
            mockPopOverController as PopoverController,
            mockAppVersion as AppVersion,
            mockUtilityService as UtilityService,
            mockAppRatingService as AppRatingService,
            mockPlatform as Platform,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockNavParams as NavParams,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of AppRatingAlertComponent', () => {
        expect(appRatingAlertComponent).toBeTruthy();
    });

    describe('ngOnint', () => {
        it('should generate impression telemetry and interact event with apperance count 1', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'app_logo':
                        value = 'app_logo';
                        break;
                    case PreferenceKey.APP_RATE_LATER_CLICKED:
                        value = undefined;
                        break;
                }
                return of(value);
            });
            // act
            appRatingAlertComponent.ngOnInit();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.APP_RATING_POPUP,
                'content-details',
                Environment.HOME);

            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.APP_RATING_APPEARED,
                    'content-details',
                    Environment.HOME,
                    undefined,
                    { appRatingPopAppearedCount: 1 });
                done();
            }, 0);

        });
        it('should generate impression telemetry and interact event with apperance count 2', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'app_logo':
                        value = 'app_logo';
                        break;
                    case PreferenceKey.APP_RATE_LATER_CLICKED:
                        value = 1;
                        break;
                }
                return of(value);
            });
            // act
            appRatingAlertComponent.ngOnInit();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                ImpressionSubtype.APP_RATING_POPUP,
                'content-details',
                Environment.HOME);

            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.APP_RATING_APPEARED,
                    'content-details',
                    Environment.HOME,
                    undefined,
                    { appRatingPopAppearedCount: 2 });
                done();
            }, 0);

        });
    });

    describe('rateLater', () => {
        it('should generate interact event with apperance count 1 and dismiss the popup', (done) => {
            // arrange
            // act
            appRatingAlertComponent.rateLater();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.RATE_LATER_CLICKED,
                    Environment.HOME,
                    'content-details',
                    undefined,
                    { rateLaterCount: 1 });
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith(null);
                done();
            }, 0);
        });
    });

    describe('rateOnStore', () => {
        it('should generate interact event with apperance count 1 and dismiss the popup', (done) => {
            // arrange
            appRatingAlertComponent.appRate = 4;
            // act
            appRatingAlertComponent.rateOnStore();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.openPlayStore).toHaveBeenCalledWith('org.sunbird.app');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_STORE_BUTTON_CLICKED,
                    Environment.HOME,
                    'content-details',
                    undefined,
                    { appRating: 4 });
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith(StoreRating.RETURN_CLOSE);
                done();
            }, 0);
        });
    });

    describe('submitRating', () => {
        it('should generate interact event and dismiss the popup if rating is >= 4', (done) => {
            // arrange
            appRatingAlertComponent.appRate = 4;
            // act
            appRatingAlertComponent.submitRating();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.RATING_SUBMITTED,
                    Environment.HOME,
                   'content-details',
                    undefined,
                    { appRating: 4 });
                expect(appRatingAlertComponent.currentViewText).toEqual({
                    heading: 'APP_RATING_THANKS_FOR_RATING',
                    message: 'APP_RATING_RATE_ON_PLAYSTORE',
                    type: 'storeRate'
                  });
                done();
            }, 0);
        });

        it('should generate interact event and dismiss the popup if rating is <= 4', (done) => {
            // arrange
            appRatingAlertComponent.appRate = 2;
            // act
            appRatingAlertComponent.submitRating();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.RATING_SUBMITTED,
                    Environment.HOME,
                   'content-details',
                    undefined,
                    { appRating: 2 });
                expect(appRatingAlertComponent.currentViewText).toEqual({
                    heading: 'APP_RATING_THANKS_FOR_RATING',
                    message: 'APP_RATING_REPORT_AN_ISSUE',
                    type: 'helpDesk'
                  });
                done();
            }, 0);
        });
    });

    describe('goToHelpSection', () => {
        it('should generate interact event and dismiss the popup', (done) => {
            // arrange
            // act
            appRatingAlertComponent.goToHelpSection();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.HELP_SECTION_CLICKED,
                    Environment.HOME,
                    'content-details');
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith(StoreRating.RETURN_HELP);
                done();
            }, 0);
        });
    });

    describe('closePopover', () => {
        it('should close the popover', () => {
            // arrange
            appRatingAlertComponent['backButtonFunc'] = {
                unsubscribe: jest.fn()
            };
            // act
            appRatingAlertComponent.closePopover();
            // assert
            expect(mockPopOverController.dismiss).toHaveBeenCalledWith(null);
            expect(appRatingAlertComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
        });
    });

});
