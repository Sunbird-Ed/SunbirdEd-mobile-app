import { CollectionDetailEtbPage } from './collection-detail-etb.page';
import {
    ContentService, EventsBusService, ProfileService, TelemetryErrorCode,
    StorageService, ContentImportResponse, ContentImportStatus, TelemetryObject,
    DownloadService
} from 'sunbird-sdk';
import { Events, PopoverController, Platform, IonContent } from '@ionic/angular';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import {
    AppGlobalService, CommonUtilService,
    TelemetryGeneratorService, AppHeaderService,
    InteractSubtype, Environment, ImpressionType
} from '../../services';
import {
    InteractType, PageId, ID, Mode, ErrorType
} from '../../services/telemetry-constants';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { Router } from '@angular/router';
import { TextbookTocService } from './textbook-toc-service';
import { Location } from '@angular/common';
import {
    contentDetailsMcokResponse1,
    contentDetailsMcokResponse2,
    contentDetailsMcokResponse3,
    mockcollectionData,
    mockContentData,
    mockContentInfo
} from './collection-detail-etb-page.spec.data';
import { of, Subscription, throwError } from 'rxjs';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ContentUtil } from '@app/util/content-util';
import { EventTopics } from '@app/app/app.constant';
import { ShareItemType, ContentType } from '../app.constant';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { isObject } from 'util';
import { MimeType } from '../../app/app.constant';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { NavigationService } from '../../services/navigation-handler.service';

describe('collectionDetailEtbPage', () => {
    let collectionDetailEtbPage: CollectionDetailEtbPage;
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockDownloadService: Partial<DownloadService> = {};
    const mockProfileService: Partial<ProfileService> = {
        addContentAccess: jest.fn()
    };
    const mockStorageService: Partial<StorageService> = {};
    const mockzone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockevents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockplatform: Partial<Platform> = {};

    const mockappGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        networkInfo: {} as any,
        showToast: jest.fn()
    };
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateBackClickedTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockfileSizePipe: Partial<FileSizePipe> = {
        transform: jest.fn()
    };
    const mockHeaderService: Partial<AppHeaderService> = {
        getDefaultPageConfig: jest.fn(),
        updatePageConfig: jest.fn(),
        hideHeader: jest.fn()
    };
    const mocklocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockrouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockcollectionData as any),
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

    const mockIonContent: Partial<IonContent> = {
        ionScroll: {} as any
    };

    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {
        showContentDeletePopup: jest.fn()
    };

    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockNavigationService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToContent: jest.fn(),
        navigateTo: jest.fn(),
        navigateToCollection: jest.fn()
    };

    beforeEach(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        window['scrollWindow'] = { getScrollElement: () => Promise.resolve({ scrollTo: jest.fn() }) };
        collectionDetailEtbPage = new CollectionDetailEtbPage(
            mockContentService as ContentService,
            mockEventBusService as EventsBusService,
            mockProfileService as ProfileService,
            mockStorageService as StorageService,
            mockDownloadService as DownloadService,
            mockzone as NgZone,
            mockevents as Events,
            mockPopoverController as PopoverController,
            mockplatform as Platform,
            mockappGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockNavigationService as NavigationService,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
            mockfileSizePipe as FileSizePipe,
            mockHeaderService as AppHeaderService,
            mocklocation as Location,
            mockrouter as Router,
            mockchangeDetectionRef as ChangeDetectorRef,
            mocktextbookTocService as TextbookTocService,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockSbProgressLoader as SbProgressLoader
        );

        collectionDetailEtbPage.ionContent = mockIonContent as any;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a instance of collectionDetailEtbPage', () => {
        expect(collectionDetailEtbPage).toBeTruthy();
    });

    it('should get the appName', () => {
        // arrange
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('diksha'));
        mockDownloadService.trackDownloads = jest.fn(() => of());
        // act
        collectionDetailEtbPage.ngOnInit();
        // assert
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        expect(mockDownloadService.trackDownloads).toHaveBeenCalled();
    });

    it('should extract content data', () => {
        const data = contentDetailsMcokResponse1;
        collectionDetailEtbPage.isUpdateAvailable = false;
        collectionDetailEtbPage.showLoading = true;
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
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
        } as any);
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
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
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
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
            const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn) => fn(mockHeaderEventsSubscription) as any)
            } as any;
            jest.spyOn(collectionDetailEtbPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(mockHeaderService, 'getDefaultPageConfig').mockReturnValue({
                showHeader: false,
                showBurgerMenu: false,
                actionButtons: ['download']
            } as any);
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
                } else if (EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN) {
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

        it('should set headerConfig, headerObservable, setContentDetails, and subscribeEvents for else part', () => {
            // arrange
            jest.spyOn(collectionDetailEtbPage, 'registerDeviceBackButton').mockImplementation();
            mockzone.run = jest.fn((fn) => fn());
            const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn) => mockHeaderEventsSubscription as any)
            } as any;
            jest.spyOn(collectionDetailEtbPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(mockHeaderService, 'getDefaultPageConfig').mockReturnValue({
                showHeader: false,
                showBurgerMenu: false,
                actionButtons: ['download']
            } as any);
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
                } else if (EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN) {
                    fn({});
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

    it('should prepare the telemetry details and NavigationExtras then call playContent()', () => {
        // arrange
        mockContentPlayerHandler.playContent = jest.fn();
        // act
        collectionDetailEtbPage.playContent(mockContentData);
        // assert
        expect(mockContentPlayerHandler.playContent).toHaveBeenCalled();
    });

    describe('share()', () => {
        describe('shouldn create share popover', () => {
            it('shareItemType should be root-content', (done) => {
                // arrange
                mockCommonUtilService.translateMessage = jest.fn(() => '');
                mockPopoverController.create = jest.fn(() => (Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
                } as any)));
                // act
                collectionDetailEtbPage.share().then(() => {
                    // assert
                    expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                    expect(mockPopoverController.create).toHaveBeenCalledWith(expect.objectContaining({
                        componentProps: expect.objectContaining({
                            shareItemType: ShareItemType.ROOT_COLECTION
                        })
                    }));
                    done();
                });
            });
        });
    });

    describe('showDeletePopOver()', () => {
        const mockTelemetryObject = new TelemetryObject('do_12345', ContentType.TEXTBOOK, '1');
        const mockCorRelationList = [];
        const mockObjRollup = { l1: 'do_12345' };
        mockContentDeleteHandler.contentDeleteCompleted$ = of({});
        it('should invoke showContentDeletePopup method', () => {
            // arrange
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.corRelationList = mockCorRelationList;
            collectionDetailEtbPage.objRollup = mockObjRollup;
            // act
            collectionDetailEtbPage.showDeletePopOver();
            // assert
            expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalledWith(undefined, false, {
                telemetryObject: mockTelemetryObject,
                rollUp: mockObjRollup,
                correlationList: mockCorRelationList,
                hierachyInfo: undefined,
            }, PageId.COLLECTION_DETAIL);
        });

        it('should navigate back if deletion is complete', () => {
            // arrange
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.corRelationList = mockCorRelationList;
            collectionDetailEtbPage.objRollup = mockObjRollup;
            // act
            collectionDetailEtbPage.showDeletePopOver();
            // assert
            expect(mocklocation.back).toHaveBeenCalled();
        });
    });

    describe('showDownloadConfirmationAlert()', () => {
        const mockTelemetryObject = new TelemetryObject('do_12345', ContentType.TEXTBOOK, '1');
        const mockCorRelationList = [];
        const mockObjRollup = { l1: 'do_12345' };
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
        } as any)));
        it('should show error toast if network is not available', () => {
            // arrange
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.corRelationList = mockCorRelationList;
            collectionDetailEtbPage.objRollup = mockObjRollup;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            // act
            collectionDetailEtbPage.showDownloadConfirmationAlert();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.DOWNLOAD_CLICKED,
                Environment.HOME,
                PageId.COLLECTION_DETAIL,
                mockTelemetryObject,
                undefined,
                mockObjRollup,
                mockCorRelationList);
        });

        it('should show download all confirmation pop up if network is available', (done) => {
            // arrange
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.corRelationList = mockCorRelationList;
            collectionDetailEtbPage.objRollup = mockObjRollup;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            collectionDetailEtbPage.contentDetail = contentDetailsMcokResponse1;
            // act
            collectionDetailEtbPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, '',
                    PageId.DOWNLOAD_ALL_CONFIRMATION_POPUP,
                    Environment.HOME,
                    contentDetailsMcokResponse1.identifier,
                    contentDetailsMcokResponse1.contentData.contentType,
                    contentDetailsMcokResponse1.contentData.pkgVersion,
                    mockObjRollup,
                    mockCorRelationList);
                done();
            }, 0);
        });
    });

    it('should open url in browser', () => {
        mockCommonUtilService.openUrlInBrowser = jest.fn();
        collectionDetailEtbPage.openBrowser('sample-url');
        expect(mockCommonUtilService.openUrlInBrowser).toHaveBeenCalledWith('sample-url');
    });

    describe('licenseDetails', () => {
        it('should get and set licenseDetails', () => {
            collectionDetailEtbPage.licenseDetails = true;
            expect(collectionDetailEtbPage.licenseDetails).toBeTruthy();
        });

        it('should get and set licenseDetails for else part', () => {
            collectionDetailEtbPage.licenseDetails = false;
            expect(collectionDetailEtbPage.licenseDetails).toBeFalsy();
        });
    });

    it('should return content marker', () => {
        // arrange
        mockappGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
        mockProfileService.addContentAccess = jest.fn(() => of(true));
        mockContentService.setContentMarker = jest.fn(() => of(true));
        // act
        collectionDetailEtbPage.markContent();
        // assert
        expect(mockappGlobalService.getCurrentUser).toHaveBeenCalled();
        expect(mockProfileService.addContentAccess).toHaveBeenCalled();
        expect(mockContentService.setContentMarker).toHaveBeenCalled();
    });

    describe('toggleGroup', () => {
        const mockTelemetryObject = new TelemetryObject('do_12345', ContentType.TEXTBOOK, '1');
        it('should scroll the page', () => {
            // arrange
            const group = {}, content = {}, openCarousel = false;
            jest.spyOn(collectionDetailEtbPage, 'isGroupShown').mockReturnValue(true);
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            const values = new Map();
            values['isCollapsed'] = false;
            // act
            collectionDetailEtbPage.toggleGroup(group, content, openCarousel);
            // assert
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenLastCalledWith(
                InteractType.TOUCH,
                InteractSubtype.UNIT_CLICKED,
                Environment.HOME,
                PageId.COLLECTION_DETAIL,
                mockTelemetryObject,
                values,
                {},
                undefined
            );
        });

        it('should scroll the page', (done) => {
            // arrange
            const group = {}, content = { identifier: 'identifier' }, openCarousel = true;
            jest.spyOn(collectionDetailEtbPage, 'isGroupShown').mockReturnValue(true);
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            const values = new Map();
            values['isCollapsed'] = false;
            // act
            collectionDetailEtbPage.toggleGroup(group, content, openCarousel);
            // assert
            setTimeout(() => {
                // document.body.innerHTML =
                // '<div>' +
                // '  <span identifier="identifier" />' +
                // '  <button id="button" />' +
                // '</div>';
                // document.createElement = { identifier: 'd0-123' } as any;
                done();
            }, 100);

            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenLastCalledWith(
                InteractType.TOUCH,
                InteractSubtype.UNIT_CLICKED,
                Environment.HOME,
                PageId.COLLECTION_DETAIL,
                mockTelemetryObject,
                values,
                {},
                undefined
            );
        });
    });

    it('should return true or false for isGroupShown()', () => {
        const group = { gid: 'gid-123' };
        collectionDetailEtbPage.shownGroup = group;
        collectionDetailEtbPage.isGroupShown(group);
        expect(collectionDetailEtbPage.shownGroup).toBeTruthy();
    });

    describe('changeValue', () => {
        it('should not change value if is selected', () => {
            // arrange
            const text = 'sample-text';
            // act
            collectionDetailEtbPage.changeValue(text);
            // assert
            expect(collectionDetailEtbPage.isSelected).toBeTruthy();
        });

        it('should change value if is not text', () => {
            // arrange
            const text = '';
            // act
            collectionDetailEtbPage.changeValue(text);
            // assert
            expect(collectionDetailEtbPage.isSelected).toBeFalsy();
        });
    });

    describe('handleBackButton', () => {
        const mockTelemetryObject = new TelemetryObject('do_12345', ContentType.TEXTBOOK, '1');
        it('should be handle device back button', () => {
            // arrange
            collectionDetailEtbPage.objId = 'do_12345';
            collectionDetailEtbPage.objType = ContentType.TEXTBOOK;
            collectionDetailEtbPage.objVer = '1';
            mocktelemetryGeneratorService.generateEndTelemetry = jest.fn();
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.shouldGenerateEndTelemetry = true;
            collectionDetailEtbPage.source = 'collection-detail';
            collectionDetailEtbPage.cardData = {
                identifier: 'do-123'
            };
            // act
            collectionDetailEtbPage.handleBackButton();
            // assert
            expect(mocktelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                ContentType.TEXTBOOK,
                Mode.PLAY,
                PageId.COLLECTION_DETAIL,
                Environment.HOME,
                mockTelemetryObject,
                {},
                undefined
            );
            expect(mocktelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                'qr',
                Mode.PLAY,
                collectionDetailEtbPage.source,
                Environment.HOME,
                { id: 'do-123', type: 'qr', version: '' },
                undefined,
                undefined
            );
        });

        it('should be handle device back button for undefined pageId', () => {
            // arrange
            collectionDetailEtbPage.objId = 'do_12345';
            collectionDetailEtbPage.objType = undefined;
            collectionDetailEtbPage.objVer = '1';
            mocktelemetryGeneratorService.generateEndTelemetry = jest.fn();
            collectionDetailEtbPage.shouldGenerateEndTelemetry = true;
            collectionDetailEtbPage.source = undefined;
            collectionDetailEtbPage.cardData = {
                identifier: 'do-123'
            };
            // act
            collectionDetailEtbPage.handleBackButton();
            // assert
            expect(mocktelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                ContentType.TEXTBOOK,
                Mode.PLAY,
                PageId.COLLECTION_DETAIL,
                Environment.HOME,
                { id: 'do_12345', type: undefined, version: '1' },
                {},
                undefined
            );
        });

        it('should be handle device back button if shouldGenerateEndTelemetry is false', () => {
            // arrange
            collectionDetailEtbPage.objId = 'do_12345';
            collectionDetailEtbPage.objType = ContentType.TEXTBOOK;
            collectionDetailEtbPage.objVer = '1';
            mocktelemetryGeneratorService.generateEndTelemetry = jest.fn();
            collectionDetailEtbPage.telemetryObject = mockTelemetryObject;
            collectionDetailEtbPage.shouldGenerateEndTelemetry = false;
            // act
            collectionDetailEtbPage.handleBackButton();
            // assert
            expect(mocktelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                ContentType.TEXTBOOK,
                Mode.PLAY,
                PageId.COLLECTION_DETAIL,
                Environment.HOME,
                mockTelemetryObject,
                {},
                undefined
            );
        });
    });

    it('should generate back Clicked Telemetry', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockplatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        mocktelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        // act
        collectionDetailEtbPage.registerDeviceBackButton();
        // assert
        expect(subscribeWithPriorityData).toBeTruthy();
        expect(mocktelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.COLLECTION_DETAIL,
            Environment.HOME,
            false,
            'do_212911645382959104165',
            undefined
        );
    });

    describe('setContentDetails', () => {
        it('should return content details and is not available localy', (done) => {
            // arrange
            const content = {
                identifier: 'do_212911645382959104165',
                primaryCategory: 'Digital Textbook',
                contentData: { primaryCategory: 'Digital Textbook', licenseDetails: undefined, attributions: ['sample-3', 'sample-1'] },
                isAvailableLocally: false,
                children: { identifier: 'do_212911645382959104166' }
            };
            mockContentService.getContentDetails = jest.fn(() => of(content));
            mocktelemetryGeneratorService.generatefastLoadingTelemetry = jest.fn();
            mockContentService.getContentHeirarchy = jest.fn(() => of(content));
            jest.spyOn(collectionDetailEtbPage, 'importContentInBackground').mockReturnValue();
            const mockTelemetryObject = new TelemetryObject('do_212911645382959104165', 'Digital Textbook', undefined);
            // act
            collectionDetailEtbPage.setContentDetails('do_212911645382959104165', true).then(() => {
                // assert
                expect(collectionDetailEtbPage.contentDetail.contentData.attributions).toBe('sample-1, sample-3');
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toHaveBeenCalled();
                done();
            });
        });

        it('should return content details and is available localy', (done) => {
            // arrange
            const content = {
                identifier: 'do_212911645382959104165',
                contentData: { licenseDetails: 'sample-license' },
                isAvailableLocally: true,
                children: { identifier: 'do_212911645382959104166' }
            };
            mockContentService.getContentDetails = jest.fn(() => of(content));
            // act
            collectionDetailEtbPage.setContentDetails('do_212911645382959104165', true).then(() => {
                // assert
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            });
        });

        it('should not return content details if data is undefined', (done) => {
            // arrange
            mockContentService.getContentDetails = jest.fn(() => of(undefined));
            // act
            collectionDetailEtbPage.setContentDetails('do_212911645382959104165', true).then(() => {
                // assert
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            });
        });

        it('should return content details for getContentHeirarchy catch part', (done) => {
            // arrange
            const content = {
                identifier: 'do_212911645382959104165',
                contentData: { licenseDetails: 'sample-license' },
                isAvailableLocally: false,
                children: { identifier: 'do_212911645382959104166' }
            };
            mockContentService.getContentDetails = jest.fn(() => of(content));
            mocktelemetryGeneratorService.generatefastLoadingTelemetry = jest.fn();
            mockContentService.getContentHeirarchy = jest.fn(() => throwError({ erroe: 'sample-error' }));
            // act
            collectionDetailEtbPage.setContentDetails('do_212911645382959104165', true).then(() => {
                // assert
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mocktelemetryGeneratorService.generatefastLoadingTelemetry).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toHaveBeenCalled();
                done();
            });
        });

        it('should not return content for getContentDetails catch part', (done) => {
            // arrange
            mockContentService.getContentDetails = jest.fn(() => throwError(undefined));
            // act
            collectionDetailEtbPage.setContentDetails('do_212911645382959104165', true).then(() => {
                // assert
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('setCollectionStructure', () => {
        it('should return contentTypesCount if isObject', () => {
            // arrange
            collectionDetailEtbPage.contentDetail = {
                contentData: {
                    contentTypesCount: { id: 'do-123' }
                }
            };
            // act
            collectionDetailEtbPage.setCollectionStructure();
            // assert
            expect(isObject(collectionDetailEtbPage.contentDetail.contentData.contentTypesCount)).toBeTruthy();
        });

        it('should return contentTypesCount if is not object', () => {
            // arrange
            collectionDetailEtbPage.contentDetail = {
                contentData: {
                    contentTypesCount: '{"identifier": "do-123"}'
                }
            };
            // act
            collectionDetailEtbPage.setCollectionStructure();
            // assert
            expect(isObject(collectionDetailEtbPage.contentDetail.contentData.contentTypesCount)).toBeFalsy();
        });

        it('should return contentTypesCount if is not object for card data', () => {
            // arrange
            collectionDetailEtbPage.cardData = {
                contentTypesCount: '{"identifier": "do-123"}'
            };
            collectionDetailEtbPage.contentDetail = {
                contentData: {
                    contentTypesCount: undefined
                }
            };
            // act
            collectionDetailEtbPage.setCollectionStructure();
            // assert
            expect(isObject(collectionDetailEtbPage.cardData.contentTypesCount)).toBeFalsy();
        });

        it('should not return contentTypesCount if not object for card data', () => {
            // arrange
            collectionDetailEtbPage.cardData = {
                contentTypesCount: { id: 'do-123' }
            };
            collectionDetailEtbPage.contentDetail = {
                contentData: {
                    contentTypesCount: undefined
                }
            };
            // act
            collectionDetailEtbPage.setCollectionStructure();
            // assert
            expect(isObject(collectionDetailEtbPage.cardData.contentTypesCount)).toBeTruthy();
        });

        it('should not return anything if contentTypesCount is undefined', () => {
            // arrange
            collectionDetailEtbPage.cardData = {
                contentTypesCount: undefined
            };
            collectionDetailEtbPage.contentDetail = {
                contentData: {
                    contentTypesCount: undefined
                }
            };
            // act
            collectionDetailEtbPage.setCollectionStructure();
            // assert
            expect(isObject(collectionDetailEtbPage.cardData.contentTypesCount)).toBeFalsy();
            expect(isObject(collectionDetailEtbPage.contentDetail.contentData.contentTypesCount)).toBeFalsy();
        });
    });

    describe('importContent', () => {
        it('should DownloadStarted for queuedIdentifiers empty', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'], isChild = true, isDownloadAllClicked = false;
            collectionDetailEtbPage.isDownloadStarted = true;
            collectionDetailEtbPage.queuedIdentifiers = [];
            mockContentService.importContent = jest.fn(() => of([{
                identifier: 'do-123',
                status: ContentImportStatus.DOWNLOAD_STARTED
            }, {
                identifier: 'do-234',
                status: ContentImportStatus.DOWNLOAD_FAILED
            }]));
            jest.spyOn(collectionDetailEtbPage, 'getImportContentRequestBody').mockReturnValue([{
                isChildContent: true,
                destinationFolder: 'sample-dest-folder',
                contentId: 'do-123'
            }]);
            mockzone.run = jest.fn((fn) => fn());
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            // act
            collectionDetailEtbPage.importContent(identifiers, isChild, isDownloadAllClicked);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(mockzone.run).toHaveBeenCalled();
                expect(collectionDetailEtbPage.showDownloadBtn).toBeTruthy();
                expect(collectionDetailEtbPage.isDownloadStarted).toBeFalsy();
                expect(collectionDetailEtbPage.showLoading).toBeFalsy();
                done();
            }, 0);
        });

        it('should import all downloaded content for ENQUEUED_FOR_DOWNLOAD', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'], isChild = true, isDownloadAllClicked = true;
            collectionDetailEtbPage.isDownloadStarted = true;
            mockContentService.importContent = jest.fn(() => of([{
                identifier: 'do-123',
                status: ContentImportStatus.ENQUEUED_FOR_DOWNLOAD
            }, {
                identifier: 'do-234',
                status: ContentImportStatus.NOT_FOUND
            }]));
            jest.spyOn(collectionDetailEtbPage, 'getImportContentRequestBody').mockReturnValue([{
                isChildContent: true,
                destinationFolder: 'sample-dest-folder',
                contentId: 'do-123'
            }]);
            mockzone.run = jest.fn((fn) => fn());
            mocktelemetryGeneratorService.generateDownloadAllClickTelemetry = jest.fn();
            mocktelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockCommonUtilService.showToast = jest.fn();
            // act
            collectionDetailEtbPage.importContent(identifiers, isChild, isDownloadAllClicked);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(mockzone.run).toHaveBeenCalled();
                expect(mocktelemetryGeneratorService.generateDownloadAllClickTelemetry).toHaveBeenCalledWith(
                    'collection-detail',
                    undefined,
                    ['do-123'],
                    2
                );
                expect(mocktelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.HOME,
                    TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                    ErrorType.SYSTEM,
                    PageId.COLLECTION_DETAIL,
                    '{"parentIdentifier":"do_212911645382959104165","faultyIdentifiers":["do-234"]}'
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('UNABLE_TO_FETCH_CONTENT');
                done();
            }, 0);
        });

        it('should import all downloaded content for ENQUEUED_FOR_DOWNLOAD', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'], isChild = true, isDownloadAllClicked = true;
            collectionDetailEtbPage.isDownloadStarted = false;
            mockContentService.importContent = jest.fn(() => of([
                {
                    identifier: 'do-234',
                    status: ContentImportStatus.NOT_FOUND
                }]));
            jest.spyOn(collectionDetailEtbPage, 'getImportContentRequestBody').mockReturnValue([{
                isChildContent: true,
                destinationFolder: 'sample-dest-folder',
                contentId: 'do-123'
            }]);
            mockzone.run = jest.fn((fn) => fn());
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            // act
            collectionDetailEtbPage.importContent(identifiers, isChild, isDownloadAllClicked);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(mockzone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not start download for NETWORK_ERROR cath part', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'], isChild = true, isDownloadAllClicked = true;
            collectionDetailEtbPage.isDownloadStarted = false;
            mockContentService.importContent = jest.fn(() => throwError({ error: 'NETWORK_ERROR' }));
            jest.spyOn(collectionDetailEtbPage, 'getImportContentRequestBody').mockReturnValue([{
                isChildContent: true,
                destinationFolder: 'sample-dest-folder',
                contentId: 'do-123'
            }]);
            mockzone.run = jest.fn((fn) => fn());
            mockCommonUtilService.showToast = jest.fn();
            // act
            collectionDetailEtbPage.importContent(identifiers, isChild, isDownloadAllClicked);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(mockzone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should update if update is available for catch part', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'], isChild = true, isDownloadAllClicked = true;
            collectionDetailEtbPage.isDownloadStarted = false;
            mockContentService.importContent = jest.fn(() => throwError({ error: 'NETWORK_ERROR' }));
            jest.spyOn(collectionDetailEtbPage, 'getImportContentRequestBody').mockReturnValue([{
                isChildContent: true,
                destinationFolder: 'sample-dest-folder',
                contentId: 'do-123'
            }]);
            mockzone.run = jest.fn((fn) => fn());
            mockCommonUtilService.showToast = jest.fn();
            collectionDetailEtbPage.isUpdateAvailable = true;
            jest.spyOn(collectionDetailEtbPage, 'setChildContents').mockReturnValue();
            // act
            collectionDetailEtbPage.importContent(identifiers, isChild, isDownloadAllClicked);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(mockzone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('setChildContents', () => {
        it('should loading textbook faster', (done) => {
            // arrange
            const content = {
                identifier: 'do-123',
                contentData: { name: 'test',  primaryCategory: 'Digital Textbook' },
                children: [{ identifier: 'sample-id' }]
            };
            collectionDetailEtbPage.cardData = {
                hierarchyInfo: { identifier: 'do-345' }
            };
            mocktextbookTocService.textbookIds = {
                contentId: 'sample-content-id',
                rootUnitId: 'sample-id',
                unit: undefined
            };
            mockContentService.getChildContents = jest.fn(() => of(content));
            collectionDetailEtbPage.activeMimeTypeFilter = ['some'];
            jest.spyOn(collectionDetailEtbPage, 'onFilterMimeTypeChange').mockImplementation(() => {
                return Promise.resolve();
            });
            mockchangeDetectionRef.detectChanges = jest.fn();
            collectionDetailEtbPage.isDepthChild = false;
            jest.spyOn(collectionDetailEtbPage, 'getContentsSize').mockReturnValue();
            collectionDetailEtbPage.filteredItemsQueryList = [{
                nativeElement: {
                    id: 'sample-id'
                }
            }] as any;
            const clases = new Set();
            jest.spyOn(collectionDetailEtbPage, 'toggleGroup').mockReturnValue();
            collectionDetailEtbPage.stickyPillsRef = {
                nativeElement: {
                    id: 'sample-id',
                    classList: clases
                }
            };
            window['scrollWindow'] = { getScrollElement: () => Promise.resolve({ scrollTo: jest.fn() }) };
            document.getElementById = jest.fn(() => ({ scrollIntoView: jest.fn() })) as any;
            mocktextbookTocService.resetTextbookIds = jest.fn();
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const mockTelemetryObject = new TelemetryObject('do_212911645382959104165', 'Digital Textbook', undefined);
            // act
            collectionDetailEtbPage.setChildContents();
            // assert
            expect(mockContentService.getChildContents).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockchangeDetectionRef.detectChanges).toHaveBeenCalled();
                expect(collectionDetailEtbPage.childrenData).toBeTruthy();
                // expect(mocktextbookTocService.resetTextbookIds).toHaveBeenCalled();
                done();
            }, 10);
        });

        it('should loading textbook faster for else part of rootUnitId is undefined', (done) => {
            // arrange
            const content = {
                identifier: 'do-123',
                contentData: { name: 'test' },
                children: [{ identifier: 'sample-id' }]
            };
            collectionDetailEtbPage.cardData = {
                hierarchyInfo: { identifier: 'do-345' }
            };
            mocktextbookTocService.textbookIds = {
                contentId: undefined,
                rootUnitId: undefined,
                unit: undefined
            };
            mockContentService.getChildContents = jest.fn(() => of(content));
            collectionDetailEtbPage.activeMimeTypeFilter = ['all'];
            mockchangeDetectionRef.detectChanges = jest.fn();
            collectionDetailEtbPage.isDepthChild = true;
            collectionDetailEtbPage.filteredItemsQueryList = [{
                nativeElement: {
                    id: 'sample-id'
                }
            }] as any;
            jest.spyOn(collectionDetailEtbPage, 'toggleGroup').mockReturnValue();
            // act
            collectionDetailEtbPage.setChildContents();
            // assert
            expect(mockContentService.getChildContents).toHaveBeenCalled();
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should loading textbook faster for else part of children is undefined', () => {
            // arrange
            const content = {
                identifier: 'do-123',
                contentData: { name: 'test' }
            };
            collectionDetailEtbPage.cardData = {
                hierarchyInfo: { identifier: 'do-345' }
            };
            mocktextbookTocService.textbookIds = {
                contentId: undefined,
                rootUnitId: undefined,
                unit: undefined
            };
            mockContentService.getChildContents = jest.fn(() => of(content));
            collectionDetailEtbPage.activeMimeTypeFilter = ['all'];
            mockchangeDetectionRef.detectChanges = jest.fn();
            collectionDetailEtbPage.isDepthChild = false;
            jest.spyOn(collectionDetailEtbPage, 'getContentsSize').mockReturnValue();
            collectionDetailEtbPage.filteredItemsQueryList = [{
                nativeElement: {
                    id: 'sample-id'
                }
            }] as any;
            jest.spyOn(collectionDetailEtbPage, 'toggleGroup').mockReturnValue();
            // act
            collectionDetailEtbPage.setChildContents();
            // assert
            expect(mockContentService.getChildContents).toHaveBeenCalled();
        });
    });

    describe('getContentsSize', () => {
        it('should return content children Size', () => {
            // arrange
            const data = [{
                identifier: 'do-123',
                contentData: {
                    name: 'test',
                    identifier: 'do-234',
                    downloadUrl: 'sample-dowload-url'
                },
                children: [{
                    contentData: {
                        name: 'test',
                        identifier: 'do-234',
                        downloadUrl: 'sample-dowload-url'
                    }
                }],
                isAvailableLocally: false,
                hierarchyInfo: [{ identifier: 'do-234' }],
            }] as any;
            collectionDetailEtbPage.isDownloadCompleted = false;
            // act
            collectionDetailEtbPage.getContentsSize(data);
            // assert
            expect(collectionDetailEtbPage.downloadIdentifiers).toBeTruthy();
            expect(collectionDetailEtbPage.showDownloadBtn).toBeTruthy();
        });

        it('should return content downloadSize', () => {
            // arrange
            const data = [{
                identifier: 'do-123',
                contentData: {
                    name: 'test',
                    size: 32,
                    identifier: 'do-234'
                },
                isAvailableLocally: true,
                hierarchyInfo: [{ identifier: 'do-234' }]
            }];
            collectionDetailEtbPage.breadCrumb = new Map();
            collectionDetailEtbPage.breadCrumb.set(data[0].identifier, data[0].contentData.name);
            // act
            collectionDetailEtbPage.getContentsSize(data);
            // assert
            expect(collectionDetailEtbPage.downloadSize).toBe(32);
        });
    });

    describe('navigateToDetailsPage', () => {
        it('should go to enroll-course-details page if contentType is course', () => {
            // arrange
            const content = { identifier: 'do-123', contentType: ContentType.COURSE }, depth = 2;
            mockzone.run = jest.fn((fn) => fn());
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            collectionDetailEtbPage.navigateToDetailsPage(content, depth);
            // assert
            expect(mockzone.run).toHaveBeenCalled();
            expect(mockNavigationService.navigateToTrackableCollection).toHaveBeenCalled();
        });


        it('should go to content-details page', () => {
            // arrange
            const content = { identifier: 'do-123' }, depth = 2;
            mockzone.run = jest.fn((fn) => fn());
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            collectionDetailEtbPage.navigateToDetailsPage(content, depth);
            // assert
            expect(mockzone.run).toHaveBeenCalled();
            expect(mockNavigationService.navigateToContent).toHaveBeenCalled();
        });
    });

    it('should reset all properties', () => {
        // arrange
        jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
        // act
        collectionDetailEtbPage.resetVariables();
        // assert
        expect(collectionDetailEtbPage.isDownloadStarted).toBeFalsy();
        expect(collectionDetailEtbPage.showLoading).toBeFalsy();
        expect(collectionDetailEtbPage.downloadProgress).toBe(0);
        expect(collectionDetailEtbPage.cardData).toBe('');
        expect(collectionDetailEtbPage.contentDetail).toBeUndefined();
        expect(collectionDetailEtbPage.showDownload).toBeFalsy();
        expect(collectionDetailEtbPage.showDownloadBtn).toBeFalsy();
        expect(collectionDetailEtbPage.isDownloadCompleted).toBeFalsy();
        expect(collectionDetailEtbPage.currentCount).toBe(0);
        expect(collectionDetailEtbPage.downloadPercentage).toBe(0);
        expect(collectionDetailEtbPage.isUpdateAvailable).toBeFalsy();
    });

    describe('subscribeSdkEvent', () => {
        it('should refresh header for progress is 100', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-123'
            };
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.showLoading).toBeFalsy();
        });

        it('should not refresh header if progress is not 100', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: -1
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-123'
            };

            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should not refresh header if contentDetails id is not matched for else part', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 80
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };

            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should return licenseDetais', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    identifier: 'do-123',
                    progress: 80
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };

            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should refresh header and set child content', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };
            collectionDetailEtbPage.isDownloadStarted = true;
            collectionDetailEtbPage.queuedIdentifiers = ['do-123456'];
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'updateSavedResources').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'setChildContents').mockReturnValue();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.currentCount).toBe(1);
            expect(collectionDetailEtbPage.downloadPercentage).toBe(0);
            expect(collectionDetailEtbPage.showLoading).toBeFalsy();
            expect(collectionDetailEtbPage.isDownloadStarted).toBeFalsy();
            expect(collectionDetailEtbPage.showDownloadBtn).toBeFalsy();
            expect(collectionDetailEtbPage.isDownloadCompleted).toBeTruthy();
            expect(collectionDetailEtbPage.showDownload).toBeFalsy();
        });

        it('should calculate download progress only for else part', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };
            collectionDetailEtbPage.isDownloadStarted = true;
            collectionDetailEtbPage.queuedIdentifiers = ['do-123456', 'sample', 'test'];
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.currentCount).toBe(1);
            expect(collectionDetailEtbPage.downloadPercentage).toBe(33);
        });

        it('should started download else part', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };
            collectionDetailEtbPage.isDownloadStarted = true;
            collectionDetailEtbPage.queuedIdentifiers = ['sample', 'test'];
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should download else part for isDownloadStarted is false', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-223'
            };
            collectionDetailEtbPage.isDownloadStarted = true;
            collectionDetailEtbPage.queuedIdentifiers = ['sample', 'test'];
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should set content details for parentContent', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-123456'
            };
            collectionDetailEtbPage.parentContent = true;
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.showLoading).toBeFalsy();
        });

        it('should set content details for isUpdateAvailable', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-123456'
            };
            collectionDetailEtbPage.parentContent = false;
            collectionDetailEtbPage.isUpdateAvailable = true;
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.showLoading).toBeFalsy();
        });

        it('should set content details for isUpdateAvailable else part', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-123456'
            };
            collectionDetailEtbPage.parentContent = false;
            collectionDetailEtbPage.isUpdateAvailable = false;
            jest.spyOn(collectionDetailEtbPage, 'refreshHeader').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'updateSavedResources').mockReturnValue();
            jest.spyOn(collectionDetailEtbPage, 'setChildContents').mockReturnValue();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(collectionDetailEtbPage.showLoading).toBeFalsy();
        });

        it('should set content details for isUpdateAvailable else part of else if contentId is not match', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'CONTENT_EXTRACT_COMPLETED',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456'
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-12'
            };
            collectionDetailEtbPage.parentContent = false;
            collectionDetailEtbPage.isUpdateAvailable = false;
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should show importProgressMessage is ready if timer is 0', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 10,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-12'
            };
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should not ready importProgressMessage if totalCount and currentCount are different ', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 5,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.contentDetail = {
                identifier: 'do-12'
            };
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should import content for update event type of parentContent identifier', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 10,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.parentContent = {
                contentId: 'do-123456'
            };
            mocktelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
            jest.spyOn(collectionDetailEtbPage, 'importContent').mockReturnValue();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateSpineLoadingTelemetry).toHaveBeenCalled();
        });

        it('should import content for update event type of parentContent contentId', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 10,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.parentContent = {
                identifier: 'do-123456'
            };
            mocktelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
            jest.spyOn(collectionDetailEtbPage, 'importContent').mockReturnValue();
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateSpineLoadingTelemetry).toHaveBeenCalled();
        });

        it('should return content details if parentContent is null', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 5,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.parentContent = undefined;
            mockCommonUtilService.translateMessage = jest.fn();
            jest.spyOn(collectionDetailEtbPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });

        it('should return content details if hierarchyInfo is not null', () => {
            // arrange
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 80,
                    contentId: 'do-123456',
                    currentCount: 5,
                    totalCount: 10
                }
            }));
            mockzone.run = jest.fn((fn) => fn());
            collectionDetailEtbPage.cardData = {
                hierarchyInfo: [{ identifier: 'do-1234' }]
            };
            // act
            collectionDetailEtbPage.subscribeSdkEvent();
            // assert
            expect(mockEventBusService.events).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
        });
    });


    it('should hide deeplink progress loader', () => {
        // arrange
        collectionDetailEtbPage.identifier = 'sample_doId';
        mockSbProgressLoader.hide = jest.fn();
        // act
        collectionDetailEtbPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'sample_doId' });
    });

});
