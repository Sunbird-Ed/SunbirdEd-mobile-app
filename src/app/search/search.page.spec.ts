import { SearchPage } from './search.page';
import { MimeType, ContentType, RouterLinks, EventTopics } from '@app/app/app.constant';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    SharedPreferences,
    ContentService,
    EventsBusService,
    DownloadEventType,
    ContentEventType,
    CourseService,
    SearchHistoryService,
    PageAssembleService
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform,  NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService
} from 'services';
import { Scanner } from 'typescript';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
import { of, Subscription, throwError } from 'rxjs';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { FormAndFrameworkUtilService } from '../../services';

describe('SearchPage', () => {
    let searchPage: SearchPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => {})
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        convertFileSrc: jest.fn(() => 'img'),
        showContentComingSoonAlert: jest.fn(),
        showToast: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        unsubscribe: jest.fn()
    };
    const mockEvent: Partial<Events> = {
        unsubscribe: jest.fn(),
        subscribe: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRoterExtras = {
        extras: { state: undefined}
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockpageService: Partial<ContentService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockNavCtrl: Partial<NavController> = {
        navigateForward: jest.fn(() => Promise.resolve(true))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(),
        getString: jest.fn(() => of('ka' as any))
    };
    const mockCourseService: Partial<CourseService> = {};
    const mocksearchHistoryService: Partial<SearchHistoryService> = {};
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app')),
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({}))
    };
    const mockPopoverController: Partial<PopoverController> = {};
    beforeAll(() => {
        searchPage = new SearchPage(
            mockContentService as ContentService,
            mockpageService as PageAssembleService,
            mockEventsBusService as EventsBusService,
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockCourseService as CourseService,
            mocksearchHistoryService as SearchHistoryService,
            mockAppversion as AppVersion,
            mockchangeDetectionRef as ChangeDetectorRef,
            mockZone as NgZone,
            mockEvent as Events,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockTranslate as TranslateService,
            mockHeaderService as AppHeaderService,
            mockPopoverController as PopoverController,
            mockLocation as Location,
            mockRouter as Router,
            mockNavCtrl as NavController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchPage', () => {
        beforeEach(() => {
            const extras = {
                extras: {
                    state: {
                        dialCode : 'sampleDialCode',
                        contentType: 'contentType',
                        corRelationList: 'corRelationList',
                        source: 'source',
                        enrolledCourses: 'enrolledCourses' as any,
                        userId: 'userId',
                        shouldGenerateEndTelemetry: false
                    }
                }
            };

            mockRouter.getCurrentNavigation = jest.fn(() => extras as any);
        });
        it('should create a instance of searchPage', () => {
            expect(searchPage).toBeTruthy();
        });
    });
    
    // arrange
    // act
    // assert
    // describe('ngOnInit', () => {
    it('should fetch app name on ngOnInit', (done) => {
        // arrange
        // act
        searchPage.ngOnInit();
        // assert
        expect(mockAppversion.getAppName).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.appName).toEqual('Sunbird');
            done();
        }, 0);
    });
    // });

    it('should hide header on ionview will enter', () => {
        // arrange
        spyOn(searchPage, 'handleDeviceBackButton').and.stub();
        // act
        searchPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        expect(searchPage.handleDeviceBackButton).toHaveBeenCalled();
    });

    it('should set current FrameworkId', (done) => {
        // arrange
        // act
        searchPage.getFrameworkId();
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.currentFrameworkId).toEqual('ka');
            done();
        }, 0);
    });

});
