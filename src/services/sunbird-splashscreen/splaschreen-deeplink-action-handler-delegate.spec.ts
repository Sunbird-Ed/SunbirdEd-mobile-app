import {SplaschreenDeeplinkActionHandlerDelegate} from './splaschreen-deeplink-action-handler-delegate';
import {RouterLinks} from '../../app/app.constant';
import {Router} from '@angular/router';
import {Events} from '@app/util/events';
import {of} from 'rxjs';
import {
    AuthService,
    ContentService,
    CourseService,
    FrameworkService,
    FrameworkUtilService,
    PageAssembleService,
    ProfileService,
    SharedPreferences,
    StorageService,
    TelemetryService
} from 'sunbird-sdk';
import {AppGlobalService} from '../app-global-service.service';
import {TelemetryGeneratorService} from '../../services/telemetry-generator.service';
import {CommonUtilService} from '../../services/common-util.service';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {UtilityService} from '../utility-service';
import {LoginHandlerService} from '../login-handler.service';
import {TranslateService} from '@ngx-translate/core';
import {QRScannerResultHandler} from '../qrscanresulthandler.service';
import {SbProgressLoader} from '../sb-progress-loader.service';
import {Location} from '@angular/common';
import {NavigationService} from '../navigation-handler.service';
import {ContentPlayerHandler} from '../content/player/content-player-handler';
import {PageId} from '../telemetry-constants';
import {FormAndFrameworkUtilService} from '../formandframeworkutil.service';
import {mockDeeplinkConfig} from './splashscreen-deeplink-action-handler-delegate.spec.data';
import {UpdateProfileService} from '../update-profile-service';
import {mockContentData} from '../../app/content-details/content-details.page.spec.data';


describe('SplaschreenDeeplinkActionHandlerDelegate', () => {
    let splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate;

    const mockContentService: Partial<ContentService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockPageAssembleService: Partial<PageAssembleService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockRouter: Partial<Router> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockQRScannerResultHandler: Partial<QRScannerResultHandler> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockLocation: Partial<Location> = {};
    const mockNavigationService: Partial<NavigationService> = {};
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {};
    const mockFormnFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getFormFields: jest.fn(() => Promise.resolve([]))
    };
    const mockUpdateProfileService: Partial<UpdateProfileService> = {};

    beforeAll(() => {
        splaschreenDeeplinkActionHandlerDelegate = new SplaschreenDeeplinkActionHandlerDelegate(
            mockContentService as ContentService,
            mockSharedPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockProfileService as ProfileService,
            mockPageAssembleService as PageAssembleService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockTelemetryService as TelemetryService,
            mockStorageService as StorageService,
            mockCourseService as CourseService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockUtilityService as UtilityService,
            mockLoginHandlerService as LoginHandlerService,
            mockTranslateService as TranslateService,
            mockQRScannerResultHandler as QRScannerResultHandler,
            mockSbProgressLoader as SbProgressLoader,
            mockLocation as Location,
            mockNavigationService as NavigationService,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockFormnFrameworkUtilService as FormAndFrameworkUtilService,
            mockUpdateProfileService as UpdateProfileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create an instance of SplaschreenDeeplinkActionHandlerDelegate', () => {
        expect(splaschreenDeeplinkActionHandlerDelegate).toBeTruthy();
    });

    describe('onAction()', () => {
        it('should navigate to the Profile page if user is logged in', (done) => {
            // arrange
            const payload = {
                url: 'https://staging.sunbirded.org/profile'
            };
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
                done();
            }, 0);
        });

        it('should navigate to the Guest-Profile page if user is not logged in', (done) => {
            // arrange
            const payload = {
                url: 'https://staging.sunbirded.org/profile'
            };
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
                done();
            }, 0);
        });

        it('should navigate to the library page if content ID is changed', (done) => {
            // arrange
            const payload = {
                url: 'https://staging.sunbirded.org/learn/course/do_21312548637480550413399?contentId=asdsd'
            };
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryService.updateCampaignParameters = jest.fn();
            mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
            const content = {
                identifier: 'do_212911645382959104165',
                primaryCategory: 'Digital Textbook',
                contentData: {primaryCategory: 'Digital Textbook', licenseDetails: undefined, attributions: ['sample-3', 'sample-1']},
                isAvailableLocally: false,
                children: {identifier: 'do_212911645382959104166'}
            };
            mockContentService.getContentDetails = jest.fn(() => of(content));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
                expect(mockTelemetryService.updateCampaignParameters).toHaveBeenCalledWith([{id: 'asdsd', type: 'ContentId'}]);
                expect(mockTelemetryGeneratorService.generateUtmInfoTelemetry).toHaveBeenCalledWith(
                    {contentId: 'asdsd'},
                    PageId.HOME,
                    {id: 'do_21312548637480550413399', type: 'Content', version: undefined},
                    [{id: 'Deeplink', type: 'AccessType'}]);
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate to the search page if selectedTab is available in the deeplink', (done) => {
            // arrange
            const payload = {
                url: 'https://staging.sunbirded.org/explore?medium=Hindi&medium=English&gradeLevel=Class%201&' +
                    'gradeLevel=Class%2010&&&publisher=NCERT&channel=01283607456185548825093&board=CBSE&mediaType=video&selectedTab=textbook'
            };
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            mockTelemetryService.updateCampaignParameters = jest.fn();
            mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([
                        'search'
                    ],
                    {
                        state: {
                            preAppliedFilter: {
                                filters: {
                                    board: [
                                        'CBSE'
                                    ],
                                    channel: [
                                        '01283607456185548825093'
                                    ],
                                    gradeLevel: [
                                        'Class 1',
                                        'Class 10'
                                    ],
                                    medium: [
                                        'Hindi',
                                        'English'
                                    ],
                                    mimeType: [],
                                    objectType: [
                                        'Content'
                                    ],
                                    primaryCategory: [
                                        'Digital Textbook',
                                        'eTextbook'
                                    ],
                                    status: [
                                        'Live'
                                    ]
                                },
                                query: ''
                            },
                            source: 'splash'
                        }
                    });
                done();
            }, 0);
        });

        it('should navigate to the search page with mimeType in filter if selectedTab is available in the deeplink', (done) => {
            // arrange
            const payload = {
                url: 'https://staging.sunbirded.org/search/explore/1?medium=Hindi&medium=English&gradeL' +
                    'evel=Class%201&gradeLevel=Class%2010&&&publisher=NCERT&channel' +
                    '=01283607456185548825093&board=CBSE&mediaType=video&selectedTab=all'
            };
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction(payload);
            // assert
            setTimeout(() => {
                expect(mockQRScannerResultHandler.parseDialCode).toHaveBeenCalledWith(payload.url);
                done();
            }, 0);
        });

        it('should check for payload and action if its search navigate to SearchPage', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction({action: 'ACTION_SEARCH', data: {request: 'sample'}});
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SEARCH], {state: {preAppliedFilter: 'sample'}});
        });

        describe('action_GOTO', () => {
            it('should handle payload and action navigation goTO', () => {
                // arrange
                mockRouter.navigate = jest.fn();
                // act
                splaschreenDeeplinkActionHandlerDelegate.onAction({
                    action: 'ACTION_GOTO',
                    data: {request: {params: 'sample', route: 'sample'}}
                });
                // assert
                expect(mockRouter.navigate).toHaveBeenCalledWith(['sample'], {state: {params: 'sample'}});
            });

            it('should handle and navigate if there is no data request', () => {
                // arrange
                mockRouter.navigate = jest.fn();
                // act
                splaschreenDeeplinkActionHandlerDelegate.onAction({action: 'ACTION_GOTO', data: {request: {route: 'sample'}}});
                // assert
                expect(mockRouter.navigate).toHaveBeenCalledWith(['sample']);
            });
        });

        it('should look for ACTION_SETPROFILE and if matches update profile according to the data', () => {
            // arrange
            mockUpdateProfileService.checkProfileData = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn();
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction({
                action: 'ACTION_SETPROFILE',
                data: {request: {board: ['CBSE'], medium: ['English'], grade: ['Class 10']}}
            });
            // assert
            expect(mockUpdateProfileService.checkProfileData).toHaveBeenCalled();
        });

        it('should navigate to details page if ACTION_PLAY is set', (done) => {
            // arrange
            mockContentService.getContentDetails = jest.fn(() => of(mockContentData));
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction({action: 'ACTION_PLAY', data: {request: {objectId: 'do-123'}}});
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle normal deeplink it ACTION_DEEPLINK is set', (done) => {
            // arrange
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockQRScannerResultHandler.parseDialCode = jest.fn(() => Promise.resolve(undefined));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockSbProgressLoader.show = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of('true'));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryService.updateCampaignParameters = jest.fn();
            mockTelemetryGeneratorService.generateUtmInfoTelemetry = jest.fn();
            const content = {
                identifier: 'do_212911645382959104165',
                primaryCategory: 'Digital Textbook',
                contentData: {primaryCategory: 'Digital Textbook', licenseDetails: undefined, attributions: ['sample-3', 'sample-1']},
                isAvailableLocally: false,
                children: {identifier: 'do_212911645382959104166'}
            };
            mockContentService.getContentDetails = jest.fn(() => of(content));
            mockFormnFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve(mockDeeplinkConfig));
            mockTelemetryGeneratorService.generateAppLaunchTelemetry = jest.fn();
            // act
            splaschreenDeeplinkActionHandlerDelegate.onAction({action: 'ACTION_DEEPLINK', data: {request: {url: 'https://staging.sunbirded.org/learn/course/do_21312548637480550413399?contentId=asdsd'}}});
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockFormnFrameworkUtilService.getFormFields).toHaveBeenCalled();
                expect(mockSbProgressLoader.show).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
