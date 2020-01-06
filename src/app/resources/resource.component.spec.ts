import {ResourcesComponent} from '@app/app/resources/resources.component';
import {Container} from 'inversify';
import {ContentService, EventsBusService, FrameworkServiceImpl, ProfileService, ProfileServiceImpl, SharedPreferences} from 'sunbird-sdk';
import {EventsBusServiceImpl} from 'sunbird-sdk/events-bus/impl/events-bus-service-impl';
import {ContentServiceImpl} from 'sunbird-sdk/content/impl/content-service-impl';
import {NgZone} from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    SunbirdQRScanner,
    TelemetryGeneratorService
} from '@app/services';
import {Events, MenuController, ToastController} from '@ionic/angular';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Network} from '@ionic-native/network/ngx';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SplaschreenDeeplinkActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {mockContentData} from '@app/app/content-details/content-details.page.spec.data';
import {of} from 'rxjs';
import {FrameworkService, FrameworkUtilService} from 'sunbird-sdk/dist';

describe('ResourcesComponent', () => {
    let resourcesComponent: ResourcesComponent;
    const container = new Container();

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({}))
    };
    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en'))
    };
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockframeworkService: Partial<FrameworkService> = {
        getActiveChannelId: jest.fn()
    };
    const mockContentService: Partial<ContentService> = {};
    const mockSplashScreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockQRScanner: Partial<SunbirdQRScanner> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedBoardMediumGrade: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockNetwork: Partial<Network> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateExtraInfoTelemetry: jest.fn(),
        generateStartSheenAnimationTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockToastCtrlService: Partial<ToastController> = {};
    const mockMenuController: Partial<MenuController> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockContentData)
    };

    beforeAll(() => {
        resourcesComponent = new ResourcesComponent(
            mockProfileService as ProfileServiceImpl,
            mockEventBusService as EventsBusServiceImpl,
            mockFrameworkUtilService as FrameworkUtilService,
            mockframeworkService as FrameworkService,
            mockContentService as ContentServiceImpl,
            mockSharedPreference as SharedPreferences,
            mockSplashScreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockNgZone as NgZone,
            mockQRScanner as SunbirdQRScanner,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockNetwork as Network,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslateService as TranslateService,
            mockToastCtrlService as ToastController,
            mockMenuController as MenuController,
            mockHeaderService as AppHeaderService,
            mockRouter as Router
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of ResourceComponent', () => {
        expect(resourcesComponent).toBeTruthy();
    });

    it('should call relevant services when subscribeUtility() called upon', (done) => {
        // arrange
        mockQRScanner.startScanner = jest.fn();
        spyOn(resourcesComponent, 'getGroupByPage').and.stub();
        spyOn(resourcesComponent, 'loadRecentlyViewedContent').and.stub();
        spyOn(resourcesComponent, 'getLocalContent').and.stub();
        spyOn(resourcesComponent, 'getPopularContent').and.stub();
        spyOn(resourcesComponent, 'swipeDownToRefresh').and.stub();


        mockTelemetryGeneratorService.generateStartSheenAnimationTelemetry = jest.fn();
        mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
        mockAppGlobalService.openPopover = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockContentService.searchContentGroupedByPageSection = jest.fn(() => {
            of({
                name: 'sample_name', sections: {
                    count: 2, name: 'sample_string', contents: 2,
                }
            });
        });
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'savedResources:update') {
                fn({update: 'sample_update_result'});
            }

            if (topic === 'event:showScanner') {
                fn({pageName: 'library'});
            }
            if (topic === 'onAfterLanguageChange:update') {
                fn({selectedLanguage: 'ur'});
                resourcesComponent.selectedLanguage = 'ur';
            }

            if (topic === 'app-global:profile-obj-changed') {
            }
            if (topic === 'force_optional_upgrade') {
                fn({upgrade: 'sample_result'});
                mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
                resourcesComponent.isUpgradePopoverShown = true;
            }
        });
        // act
        resourcesComponent.subscribeUtilityEvents();
        // assert
        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should getActive ChannelId when getActiveChannelId()', (done) => {
        // arrange
        mockframeworkService.getActiveChannelId = jest.fn(() => {
            return of('sample_channel');
        });
        // act
        resourcesComponent.getChannelId();
        setTimeout(() => {
            // assert
            expect(mockframeworkService.getActiveChannelId).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should configure and set details of board, medium and class when getPopularContent() is called', (done) => {
        // arrange
        spyOn(resourcesComponent, 'getGroupByPage').and.stub();
        spyOn(mockTelemetryGeneratorService, 'generateStartSheenAnimationTelemetry').and.stub();
        spyOn(mockframeworkService, 'getActiveChannelId').and.returnValue(of('sample_channelId'));
        // act
        resourcesComponent.getChannelId();
        resourcesComponent.getPopularContent(false);
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getGroupByPage).toHaveBeenCalled();
            expect(resourcesComponent.getGroupByPageReq.board).toBe(undefined);
            expect(resourcesComponent.getGroupByPageReq.channel).toEqual(
                (expect.arrayContaining(['sample_channelId']))
            );
            done();
        }, 0);
    });

    it('should get board, medium and grade if available and search Data accordingly when called', () => {
        // arrange
        mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockContentService.searchContentGroupedByPageSection = jest.fn(() => of());
        mockNgZone.run = jest.fn();
        // act
        resourcesComponent.getGroupByPage();
        // assert
        expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockContentService.searchContentGroupedByPageSection).toHaveBeenCalled();
    });
});
