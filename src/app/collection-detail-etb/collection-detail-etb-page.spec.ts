import { CollectionDetailEtbPage } from './collection-detail-etb.page';
import {
    ContentService, EventsBusService, ProfileService,
    StorageService, ContentImportResponse, ContentImportStatus, TelemetryObject
} from 'sunbird-sdk';
import { Events, PopoverController, Platform, IonContent } from '@ionic/angular';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import {
    AppGlobalService, CommonUtilService, TelemetryGeneratorService, AppHeaderService,
    ComingSoonMessageService, InteractSubtype, Environment, ImpressionType
} from '../../services';
import {
    InteractType, PageId, ID, Mode
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
import { of, Subscription } from 'rxjs';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ContentUtil } from '@app/util/content-util';
import { EventTopics } from '@app/app/app.constant';
import { ShareItemType, ContentType } from '../app.constant';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler'
import { connect } from 'http2';

describe('collectionDetailEtbPage', () => {
    let collectionDetailEtbPage: CollectionDetailEtbPage;
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
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

    beforeEach(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        collectionDetailEtbPage = new CollectionDetailEtbPage(
            mockContentService as ContentService,
            mockEventBusService as EventsBusService,
            mockProfileService as ProfileService,
            mockStorageService as StorageService,
            mockzone as NgZone,
            mockevents as Events,
            mockPopoverController as PopoverController,
            mockplatform as Platform,
            mockappGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
            mockfileSizePipe as FileSizePipe,
            mockHeaderService as AppHeaderService,
            mocklocation as Location,
            mockrouter as Router,
            mockchangeDetectionRef as ChangeDetectorRef,
            mocktextbookTocService as TextbookTocService,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockContentDeleteHandler as ContentDeleteHandler
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
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('diksha'));
        collectionDetailEtbPage.ngOnInit();
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
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

    it('should play the content and content is locally available', (done) => {
        // arrange
        jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnValue(
            new TelemetryObject(mockContentData.content.identifier,
                mockContentData.content.contentData.contentType, mockContentData.content.contentData.pkgVersion));
        mockContentPlayerHandler.launchContentPlayer = jest.fn();
        mockContentData.content.isAvailableLocally = true;
        mockContentData.content.mimeType = 'application/vnd.ekstep.h5p-archive';
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
        // act
        collectionDetailEtbPage.playContent(mockContentData);
        // assert
        setTimeout(() => {
            expect(mockContentPlayerHandler.launchContentPlayer).toHaveBeenCalledWith(
                mockContentData.content,
                false,
                true,
                mockContentInfo,
                false,
                true
            );
            done();
        }, 0);
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
                {id: 'do-123', type: 'qr', version: ''},
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
                {id: 'do_12345', type: undefined, version: '1'},
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
});
