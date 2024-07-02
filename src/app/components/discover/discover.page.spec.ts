import { DiscoverComponent } from './discover.page';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../../util/events';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../../services/app-header.service';
import { ContentAggregatorHandler } from '../../../services/content/content-aggregator-handler.service';
import { AppGlobalService, CommonUtilService, FormAndFrameworkUtilService, OnboardingConfigurationService, TelemetryGeneratorService } from '../../../services';
import { NavigationService } from '../../../services/navigation-handler.service';
import { mockDiscoverPageData } from '../../../app/components/discover/discover.page.spec.data';
import { ContentFilterConfig } from '../../../app/app.constant';
import { ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { PrimaryCaregoryMapping } from '../../app.constant';
import { mockOnboardingConfigData } from './discover.page.spec.data';

describe('DiscoverComponent', () => {
    let discoverComponent: DiscoverComponent;
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {};
    const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({}))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getGuestUserInfo: jest.fn(() => Promise.resolve(ProfileType.TEACHER))
    };
    const mockSharedPrefernces: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(ProfileType.TEACHER))
    };

    const mockOnBoardingConfigService: Partial<OnboardingConfigurationService> = {
        getAppConfig: jest.fn(() => mockOnboardingConfigData)
    };

    beforeAll(() => {
        discoverComponent = new DiscoverComponent(
            mockSharedPrefernces as SharedPreferences,
            mockAppVersion as AppVersion,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockEvents as Events,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockContentAggregatorHandler as ContentAggregatorHandler,
            mockNavService as NavigationService,
            mockCommonUtilService as CommonUtilService,
            mockPopoverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockOnBoardingConfigService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should be create an instance of DiscoverComponent', () => {
        expect(discoverComponent).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should fetch appName, displayElements, and showHeaderWithHomeButton', (done) => {
            // arrange
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockDiscoverPageData));
            const data = jest.fn((fn => fn({ name: 'download' })));
            mockHeaderService.headerEventEmitted$ = {
                subscribe: data
            } as any;
            mockRouter.navigate = jest.fn();
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            mockSharedPrefernces.getString = jest.fn(() => of(ProfileType.TEACHER));
            // act
            discoverComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockContentAggregatorHandler.newAggregate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should fetch appName, displayElements and headerEvents should redirect to notification', (done) => {
            // arrange
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            PrimaryCaregoryMapping['primarycategory'] = { icon: 'icon path' }
            mockPlatform.is = jest.fn(platform => platform === 'android');
            mockDiscoverPageData[1].code = 'other_boards';
            mockDiscoverPageData[3].data[0].icon = undefined;
            mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockDiscoverPageData));
            const data = jest.fn((fn => fn({ name: 'notification' })));
            mockHeaderService.headerEventEmitted$ = {
                subscribe: data
            } as any;
            mockRouter.navigate = jest.fn();
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            mockSharedPrefernces.getString = jest.fn(() => of(ProfileType.TEACHER));
            // act
            discoverComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockContentAggregatorHandler.newAggregate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    it('should open searchPage and getSupportedContentFilterConfig', (done) => {
        // arrange
        mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() => Promise.resolve([]));
        mockRouter.navigate = jest.fn();
        // act
        discoverComponent.openSearchPage();
        // assert
        setTimeout(() => {
            expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig).toHaveBeenCalledWith(ContentFilterConfig.NAME_COURSE);
            expect(mockRouter.navigate).toHaveBeenCalled();
            done();
        }, 0);
    });
    describe('navigateToDetailPage', () => {
        it('should navigate to detail page with data in item', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockNavService.navigateToDetailPage = jest.fn();
            // act
            discoverComponent.navigateToDetailPage({
                data: {
                    content: {},
                    isAvailableLocally: true
                }
            });
            // assert
            expect(mockNavService.navigateToDetailPage).toHaveBeenCalled();
        });
        it('should show offlineToast if data is not available or internet not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCommonUtilService.presentToastForOffline = jest.fn();
            // act
            discoverComponent.navigateToDetailPage({
                data: {
                    isAvailableLocally: false
                }
            });
            // assert
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('OFFLINE_WARNING_ETBUI');
        });
    });
    it('should navigate to viewmore activity', () => {
        // arrange
        mockCommonUtilService.getTranslatedValue = jest.fn();
        mockRouter.navigate = jest.fn();
        // act
        discoverComponent.navigateToViewMoreContentsPage({ meta: { searchCriteria: {} } });
        // assert
        expect(mockRouter.navigate).toHaveBeenCalled();
    });
    describe('', () => {
        it('should get data and open popover', () => {
            // arrange
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({})),
            } as any)));
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.onViewMorePillList({ data: 'sample' }, 'Mathematics');
            // assert
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
        it('should return if event or data is not available', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.onViewMorePillList(undefined, 'Maths');
            // assert
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });
    describe('handle pill select', () => {
        it('should return if event or event.data is not available', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.handlePillSelect(undefined, undefined);
            // assert
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
        it('should navigate to categoryList page and section.code is popular_categories', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.handlePillSelect({
                data: [{
                    value: {}, name: 'event1'
                }]
            }, {
                code: 'popular_categories',
                dataSrc: {
                    params: {
                        config: [{
                            type: 'filter', code: 'popular_categories', values: [{ name: 'na1' }]
                        }, {
                            type: 'filterConfigIdentifier', code: 'code', values: [{ name: 'na2', code: 'code1' }]
                        }]
                    }
                }
            });
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
        it('should navigate to categoryList page and section.code is other_boards', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.handlePillSelect({
                data: [{
                    value: {}, name: 'event1'
                }]
            }, {
                code: 'other_boards',
                dataSrc: {
                    params: {
                        config: [{
                            type: 'filter', code: 'code', values: [{ name: 'na1' }]
                        }, {
                            type: 'filterConfigIdentifier', code: 'other_boards', values: [{ name: 'na2', code: 'event1' }]
                        }]
                    }
                }
            });
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
        it('should navigate to categoryList page and section.code is browse_by_audience', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            discoverComponent.handlePillSelect({
                data: [{
                    value: {}
                }]
            }, {
                code: 'browse_by_audience',
                dataSrc: {
                    params: {
                        config: [{
                            type: 'filter', code: 'code', values: [{ name: 'na1' }]
                        }, {
                            type: 'filterConfigIdentifier', code: 'browse_by_audience', values: [{ name: 'na2', code: 'code1' }]
                        }]
                    }
                },
                landingDetails: {
                    title: 'title1',
                    description: 'description'
                }
            });
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });
    it('clearAllSubscriptions', () => {
        //arrange
        //act
        discoverComponent.clearAllSubscriptions();
        //assert
    });
    it('should fetch displayElements', () => {
        // arrange
        mockDiscoverPageData[1].code = 'browse_by_audience';
        mockContentAggregatorHandler.newAggregate = jest.fn(() => Promise.resolve(mockDiscoverPageData));
        // act
        discoverComponent.tabViewWillEnter();
        // assert
        expect(mockContentAggregatorHandler.newAggregate).toHaveBeenCalled();
    });
    it('should call clearAllSubscription on ionViewWillLeave', () => {
        // arrange
        discoverComponent.clearAllSubscriptions = jest.fn();
        // act
        discoverComponent.ionViewWillLeave();
        // assert
        expect(discoverComponent.clearAllSubscriptions).toHaveBeenCalled();
    });
    it('should call clearAllSubscription on ngOnDestroy', () => {
        // arrange
        discoverComponent.clearAllSubscriptions = jest.fn();
        // act
        discoverComponent.ngOnDestroy();
        // assert
        expect(discoverComponent.clearAllSubscriptions).toHaveBeenCalled();
    });
    it('should call doRefresh and call emit', () => {
        // arrange
        const hideRefresher = {
            emit: jest.fn()
        };
        const refresher = {
            target: {
                complete: jest.fn()
            }
        };
        jest.spyOn(hideRefresher, 'emit');
        jest.spyOn(discoverComponent, 'fetchDisplayElements');
        // act
        discoverComponent.doRefresh(refresher);;
        // assert
        expect(discoverComponent.fetchDisplayElements).toHaveBeenCalled();
    });
});
