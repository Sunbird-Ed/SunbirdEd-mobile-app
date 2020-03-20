import {CollectionDetailEtbPage} from './collection-detail-etb.page';
import {
    ContentService, EventsBusService, ProfileService,
    StorageService, ContentImportResponse, ContentImportStatus, TelemetryObject
} from 'sunbird-sdk';
import {NavController, Events, PopoverController, Platform, IonContent} from '@ionic/angular';
import {NgZone, ChangeDetectorRef} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {
    AppGlobalService, CommonUtilService, TelemetryGeneratorService, CourseUtilService, UtilityService, AppHeaderService,
    ComingSoonMessageService, InteractSubtype, Environment
} from '../../services';
import {
    InteractType, PageId, ID
} from '../../services/telemetry-constants';
import {FileSizePipe} from '../../pipes/file-size/file-size';
import {ActivatedRoute, Router} from '@angular/router';
import {TextbookTocService} from './textbook-toc-service';
import {Location} from '@angular/common';
import {
    contentDetailsMcokResponse1,
    contentDetailsMcokResponse2,
    contentDetailsMcokResponse3,
    mockcollectionData,
    mockContentData,
    mockContentInfo
} from './collection-detail-etb-page.spec.data';
import {of, Subscription, Observable} from 'rxjs';
import {ContentPlayerHandler} from '@app/services/content/player/content-player-handler';
import {RatingHandler} from '@app/services/rating/rating-handler';
import {ContentUtil} from '@app/util/content-util';
import {EventTopics} from '@app/app/app.constant';

describe('collectionDetailEtbPage', () => {
    let collectionDetailEtbPage: CollectionDetailEtbPage;
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockProfileService: Partial<ProfileService> = {
        addContentAccess: jest.fn()
    };
    const mockStorageService: Partial<StorageService> = {};
    const mockNavCtrl: Partial<NavController> = {};
    const mockzone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockevents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockpopoverCtrl: Partial<PopoverController> = {};
    const mockplatform: Partial<Platform> = {};
    const mocktranslate: Partial<TranslateService> = {};
    const mocksocial: Partial<SocialSharing> = {};
    const mockappGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn()
    };
    const mockcommonUtilService: Partial<CommonUtilService> = {
        networkInfo: {}
    };
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateBackClickedTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockcourseUtilService: Partial<CourseUtilService> = {};
    const mockutilityService: Partial<UtilityService> = {};
    const mockfileSizePipe: Partial<FileSizePipe> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        getDefaultPageConfig: jest.fn(),
        updatePageConfig: jest.fn(),
        hideHeader: jest.fn()
    };
    const mockcomingSoonMessageService: Partial<ComingSoonMessageService> = {};
    const mocklocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockroute: Partial<ActivatedRoute> = {};
    const mockrouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockcollectionData),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mocktextbookTocService: Partial<TextbookTocService> = {};
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {
        getLastPlayedContentId: jest.fn(),
        setContentPlayerLaunchStatus: jest.fn(),
        setLastPlayedContentId: jest.fn(),
        launchContentPlayer: jest.fn()
    };
    const mockRatingHandler: Partial<RatingHandler> = {
        showRatingPopup: jest.fn()
    };
    const mockIonContent: Partial<IonContent> = {
        ionScroll: {}
    };
    beforeEach(() => {
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
            mockHeaderService as AppHeaderService,
            mockcomingSoonMessageService as ComingSoonMessageService,
            mocklocation as Location,
            mockroute as ActivatedRoute,
            mockrouter as Router,
            mockchangeDetectionRef as ChangeDetectorRef,
            mocktextbookTocService as TextbookTocService,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockRatingHandler as RatingHandler
        );

        collectionDetailEtbPage.ionContent = mockIonContent;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
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
        mockcommonUtilService.networkInfo = {isNetworkAvailable: true};
        mocktelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
        mockHeaderService.hideHeader = jest.fn();
        mockStorageService.getStorageDestinationDirectoryPath = jest.fn();
        const importData: ContentImportResponse[] = [{
            identifier: 'do_123456789',
            status: ContentImportStatus.ALREADY_EXIST
        }];
        mockContentService.importContent = jest.fn(() => of(importData));
        mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
            showHeader: true,
            showBurgerMenu: true,
            pageTitle: 'string',
            actionButtons: ['true'],
        }));
        mockHeaderService.updatePageConfig = jest.fn();
        mockevents.publish = jest.fn();
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.extractApiResponse(data);
        expect(mocktelemetryGeneratorService.generateSpineLoadingTelemetry).toHaveBeenCalled();
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
        expect(mockContentService.importContent).toHaveBeenCalled();
        expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
        expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
        expect(mockevents.publish).toHaveBeenCalled();
    });

    it('should call setchildcontents when isUpdateAvailable is falsy', (done) => {
        const data = contentDetailsMcokResponse2;
        collectionDetailEtbPage.isUpdateAvailable = false;
        jest.spyOn(collectionDetailEtbPage, 'registerDeviceBackButton').mockImplementation();
        jest.spyOn(mockzone, 'run').mockImplementation();
        mockIonContent.ionScroll.subscribe = jest.fn((fn) => {
            fn({});
        });
        jest.spyOn(mockHeaderService, 'getDefaultPageConfig').mockReturnValue({
            showHeader: false,
            showBurgerMenu: false,
            actionButtons: ['download']
        });
        mockcommonUtilService.networkInfo = {isNetworkAvailable: false};
        spyOn(collectionDetailEtbPage, 'setChildContents').and.stub();
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.ionViewWillEnter();
        collectionDetailEtbPage.extractApiResponse(data);
        // assert
        setTimeout(() => {

            expect(collectionDetailEtbPage.isUpdateAvailable).toBeFalsy();
            expect(collectionDetailEtbPage.setChildContents).toHaveBeenCalled();
            expect(collectionDetailEtbPage.setCollectionStructure).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call setCollectionStructure when content is not available locally', (done) => {
        const data = contentDetailsMcokResponse3;
        mockcommonUtilService.networkInfo.isNetworkAvailable = true;
        mocktelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
        mockHeaderService.hideHeader = jest.fn();
        mockStorageService.getStorageDestinationDirectoryPath = jest.fn();
        mockContentService.importContent = jest.fn(() => of());
        spyOn(collectionDetailEtbPage, 'setCollectionStructure').and.stub();
        collectionDetailEtbPage.extractApiResponse(data);
        setTimeout(() => {
            expect(collectionDetailEtbPage.setCollectionStructure).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should generate license section telemetry', () => {
        const params = 'expanded';
        collectionDetailEtbPage.objId = 'sampleId';
        collectionDetailEtbPage.objType = undefined;
        collectionDetailEtbPage.objVer = 2;
        mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        collectionDetailEtbPage.licenseSectionClicked(params);
        expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.LICENSE_CARD_EXPANDED,
            '',
            undefined,
            PageId.COLLECTION_DETAIL,
            {
                id: collectionDetailEtbPage.objId,
                type: collectionDetailEtbPage.objType,
                version: collectionDetailEtbPage.objVer
            },
            undefined,
            {},
            undefined,
            ID.LICENSE_CARD_CLICKED
        );
    });

    describe('IonViewWillEnter', () => {

        it('should set headerConfig, headerObservable, setContentDetails, and subscribeEvents', () => {
            // arrange
            jest.spyOn(collectionDetailEtbPage, 'registerDeviceBackButton').mockImplementation();
            mockzone.run = jest.fn((fn) => fn());
            const mockHeaderEventsSubscription = {unsubscribe: jest.fn()} as Partial<Subscription>;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn(() => mockHeaderEventsSubscription)
            };
            jest.spyOn(collectionDetailEtbPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(mockHeaderService, 'getDefaultPageConfig').mockReturnValue({
                showHeader: false,
                showBurgerMenu: false,
                actionButtons: ['download']
            });
            jest.spyOn(collectionDetailEtbPage, 'markContent').mockImplementation();
            jest.spyOn(collectionDetailEtbPage, 'resetVariables').mockImplementation();

            jest.spyOn(collectionDetailEtbPage, 'playContent').mockImplementation();
            jest.spyOn(collectionDetailEtbPage, 'subscribeSdkEvent').mockImplementation();
            mockIonContent.ionScroll.subscribe = jest.fn((fn) => {
                fn({});
            });

            mockevents.subscribe = jest.fn((topic, fn) => {
                if (topic === EventTopics.CONTENT_TO_PLAY) {
                    fn(mockContentData);
                }
            });

            jest.spyOn(collectionDetailEtbPage, 'setContentDetails').mockImplementation();
            // act
            collectionDetailEtbPage.ionViewWillEnter();
            // assert
            expect(collectionDetailEtbPage.registerDeviceBackButton).toHaveBeenCalled();
            expect(collectionDetailEtbPage.markContent).toHaveBeenCalled();
            expect(collectionDetailEtbPage.resetVariables).toHaveBeenCalled();
            expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
            expect(collectionDetailEtbPage.playContent).toHaveBeenCalledWith(mockContentData);
            expect(collectionDetailEtbPage.subscribeSdkEvent).toHaveBeenCalled();
        });
    });
    it('should show license true when user clicked on credits and license', () => {
        // arrange
        collectionDetailEtbPage.showCredits = false;
        jest.spyOn(collectionDetailEtbPage, 'licenseSectionClicked').mockImplementation();
        // act
        collectionDetailEtbPage.showLicensce();
        // assert
        expect(collectionDetailEtbPage.licenseSectionClicked).toHaveBeenCalledWith('expanded');
    });

    it('should not show license when user clicked on license and credits', () => {
        // arrange
        collectionDetailEtbPage.showCredits = true;
        jest.spyOn(collectionDetailEtbPage, 'licenseSectionClicked').mockImplementation();
        // act
        collectionDetailEtbPage.showLicensce();
        // assert
        expect(collectionDetailEtbPage.licenseSectionClicked).toHaveBeenCalledWith('collapsed');
    });

    it('should start playingContent after organising content metaData', (done) => {
        // arrange
        jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnValue(
            new TelemetryObject(mockContentData.content.identifier,
                mockContentData.content.contentData.contentType, mockContentData.content.contentData.pkgVersion));
        mockContentPlayerHandler.launchContentPlayer = jest.fn();
        // act
        collectionDetailEtbPage.playContent(mockContentData);
        // assert
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockContentPlayerHandler.launchContentPlayer).toHaveBeenCalledWith(
                mockContentData.content,
                true,
                false,
                mockContentInfo,
                false,
                true
            );
            done();
        }, 0);
    });


    it('should generate Interact Telemetry when playContentClicked and streaming true', () => {
        // arrange
        // act
        collectionDetailEtbPage.generateInteractTelemetry(true, mockContentInfo.telemetryObject, mockContentInfo.rollUp, undefined);
        // assert
        expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.PLAY_ONLINE,
            Environment.HOME,
            PageId.COLLECTION_DETAIL,
            mockContentInfo.telemetryObject,
            undefined,
            mockContentInfo.rollUp,
            undefined
        );

    });

    it('should generate Interact Telemetry when playContentClicked and streaming false', () => {
        // act
        collectionDetailEtbPage.generateInteractTelemetry(false, mockContentInfo.telemetryObject, mockContentInfo.rollUp, undefined);
        // assert
        expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.PLAY_FROM_DEVICE,
            Environment.HOME,
            PageId.COLLECTION_DETAIL,
            mockContentInfo.telemetryObject,
            undefined,
            mockContentInfo.rollUp,
            undefined
        );

    });

});
