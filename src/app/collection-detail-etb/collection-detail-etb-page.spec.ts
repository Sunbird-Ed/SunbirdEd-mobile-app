import { CollectionDetailEtbPage } from './collection-detail-etb.page';
import {
    ContentService, EventsBusService, ProfileService,
    StorageService, ContentImportResponse, ContentImportStatus
} from 'sunbird-sdk';
import { NavController, Events, PopoverController, Platform } from '@ionic/angular';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
    AppGlobalService, CommonUtilService, TelemetryGeneratorService, CourseUtilService, UtilityService, AppHeaderService,
    ComingSoonMessageService,
    ContentShareHandlerService,
} from '../../services';
import {
    Environment, ErrorType, ImpressionType, InteractSubtype, InteractType, Mode, PageId, ID
} from '../../services/telemetry-constants';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ActivatedRoute, Router } from '@angular/router';
import { TextbookTocService } from './textbook-toc-service';
import { Location } from '@angular/common';
import {
    contentDetailsMcokResponse1,
    contentDetailsMcokResponse2,
    contentDetailsMcokResponse3,
    mockcollectionData
} from './collection-detail-etb-page.spec.data';
import { of, Subscription, Observable } from 'rxjs';

describe('collectionDetailEtbPage', () => {
    let collectionDetailEtbPage: CollectionDetailEtbPage;
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockProfileService: Partial<ProfileService> = {
        addContentAccess: jest.fn()
    };
    const mockStorageService: Partial<StorageService> = {};
    const mockNavCtrl: Partial<NavController> = {};
    const mockzone: Partial<NgZone> = {};
    const mockevents: Partial<Events> = {};
    const mockpopoverCtrl: Partial<PopoverController> = {};
    const mockplatform: Partial<Platform> = {};
    const mocktranslate: Partial<TranslateService> = {};
    const mocksocial: Partial<SocialSharing> = {};
    const mockappGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn()
    };
    const mockcommonUtilService: Partial<CommonUtilService> = {

    };
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateBackClickedTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockcourseUtilService: Partial<CourseUtilService> = {};
    const mockutilityService: Partial<UtilityService> = {};
    const mockfileSizePipe: Partial<FileSizePipe> = {};
    const mockheaderService: Partial<AppHeaderService> = {};
    const mockcomingSoonMessageService: Partial<ComingSoonMessageService> = {};
    const mocklocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockroute: Partial<ActivatedRoute> = {};
    const mockrouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockcollectionData)
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mocktextbookTocService: Partial<TextbookTocService> = {};
    const mockcontentShareHandler: Partial<ContentShareHandlerService> = {};


    beforeAll(() => {
        collectionDetailEtbPage = new CollectionDetailEtbPage(
            mockContentService as ContentService,
            mockEventBusService as EventsBusService,
            mockProfileService as ProfileService,
            mockStorageService as StorageService,
            mockNavCtrl as NavController,
            mockzone as NgZone,
            mockevents as Events,
            mockpopoverCtrl as PopoverController,
            mockplatform as Platform,
            mocktranslate as TranslateService,
            mocksocial as SocialSharing,
            mockappGlobalService as AppGlobalService,
            mockcommonUtilService as CommonUtilService,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
            mockcourseUtilService as CourseUtilService,
            mockutilityService as UtilityService,
            mockfileSizePipe as FileSizePipe,
            mockheaderService as AppHeaderService,
            mockcomingSoonMessageService as ComingSoonMessageService,
            mocklocation as Location,
            mockroute as ActivatedRoute,
            mockrouter as Router,
            mockchangeDetectionRef as ChangeDetectorRef,
            mocktextbookTocService as TextbookTocService,
            mockcontentShareHandler as ContentShareHandlerService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of collectionDetailEtbPage', () => {
        expect(collectionDetailEtbPage).toBeTruthy();
    });

    it('should get the appName', () => {
        mockcommonUtilService.getAppName = jest.fn(() => Promise.resolve('diksha'));
        collectionDetailEtbPage.ngOnInit();
        expect(mockcommonUtilService.getAppName).toHaveBeenCalled();
    });

    it('should extract content data', () => {
        const data = contentDetailsMcokResponse1;
        collectionDetailEtbPage.isUpdateAvailable = false;
        collectionDetailEtbPage.showLoading = true;
        mockcommonUtilService.networkInfo = { isNetworkAvailable: true };
        mocktelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
        mockheaderService.hideHeader = jest.fn();
        mockStorageService.getStorageDestinationDirectoryPath = jest.fn();
        const importData: ContentImportResponse[] = [{
            identifier: 'do_123456789',
            status: ContentImportStatus.ALREADY_EXIST
        }];
        mockContentService.importContent = jest.fn(() => of(importData));
        mockheaderService.getDefaultPageConfig = jest.fn(() => ({
            showHeader: true,
            showBurgerMenu: true,
            pageTitle: 'string',
            actionButtons: ['true'],
        }));
        mockheaderService.updatePageConfig = jest.fn();
        mockevents.publish = jest.fn();
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.extractApiResponse(data);
        expect(mocktelemetryGeneratorService.generateSpineLoadingTelemetry).toHaveBeenCalled();
        expect(mockheaderService.hideHeader).toHaveBeenCalled();
        expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
        expect(mockContentService.importContent).toHaveBeenCalled();
        expect(mockheaderService.getDefaultPageConfig).toHaveBeenCalled();
        expect(mockheaderService.updatePageConfig).toHaveBeenCalled();
        expect(mockevents.publish).toHaveBeenCalled();
    });

    it('should call setchildcontents when isUpdateAvailable is falsy', () => {
        const data = contentDetailsMcokResponse2;
        collectionDetailEtbPage.isUpdateAvailable = false;
        mockcommonUtilService.networkInfo = { isNetworkAvailable: false };
        spyOn(collectionDetailEtbPage, 'setChildContents').and.stub();
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.extractApiResponse(data);
        // assert
        expect(collectionDetailEtbPage.isUpdateAvailable).toBeFalsy();
        expect(collectionDetailEtbPage.setChildContents).toHaveBeenCalled();
        expect(collectionDetailEtbPage.setCollectionStructure).toHaveBeenCalled();
    });

    it('should call setCollectionStructure when content is not available locally', () => {
        const data = contentDetailsMcokResponse3;
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.extractApiResponse(data);
        expect(collectionDetailEtbPage.setCollectionStructure).toHaveBeenCalled();

    });

    it('should generate license section telemetry', () => {
        const params = 'expanded';
        mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const telemetry = {
            id: 'do_21281258639073280011490',
            type: undefined,
            version: '2',
        };
        collectionDetailEtbPage.licenseSectionClicked(params);
        expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.LICENSE_CARD_EXPANDED,
            '',
            undefined,
            PageId.COLLECTION_DETAIL,
            telemetry,
            undefined,
            {},
            undefined,
            ID.LICENSE_CARD_CLICKED
        );
    });

    // it('#ionViewWillEnter should call registerDeviceBackButton()', () => {
    //     mockplatform.backButton  = {
    //         subscribeWithPriority: jest.fn((x, fn) => fn())
    //     };
    //     const data = jest.fn(() => {});
    //     mockProfileService.addContentAccess = jest.fn(() => Observable.create());
    //     mockheaderService.headerEventEmitted$ = {
    //         subscribe: data
    //     } as any;
    //     mockzone.run = jest.fn((fn) => fn());
    //     collectionDetailEtbPage.ionViewWillEnter();
    //     expect(collectionDetailEtbPage.ionViewWillEnter).toHaveBeenCalled();
    // });
});
