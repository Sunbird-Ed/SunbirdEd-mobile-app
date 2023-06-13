import { ChapterDetailsPage } from './chapter-details.page';
import { TranslateService } from '@ngx-translate/core';
import {
    AppHeaderService, CommonUtilService, LoginHandlerService,
    AppGlobalService, LocalCourseService
} from '../../../services';
import { Router } from '@angular/router';
import {
    ProfileService, SharedPreferences, AuthService,
    CourseService, DownloadService,
    EventsBusService, ContentService, TelemetryObject, ContentImportResponse, ContentImportStatus, DownloadEventType, ContentEventType
} from '@project-sunbird/sunbird-sdk';
import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../../util/events';
import { NgZone } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FileSizePipe } from '../../../pipes/file-size/file-size';
import { MimeType, EventTopics, RouterLinks, PreferenceKey } from '../../app.constant';
import { of, throwError } from 'rxjs';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '../../../services/telemetry-constants';
import { ContentPlayerHandler } from '../../../services/content/player/content-player-handler';
import { CategoryKeyTranslator } from '../../../pipes/category-key-translator/category-key-translator-pipe';
import {
    TncUpdateHandlerService,
} from '../../../services/handlers/tnc-update-handler.service';
import { mockProfileData } from '../../profile/profile.page.spec.data';
import { mockCourseCardData, mockGetChildDataResponse } from '../../enrolled-course-details-page/enrolled-course-details-page.spec.data';

describe('ChapterDetailsPage', () => {
    let chapterDetailsPage: ChapterDetailsPage;

    const mockProfileService: Partial<ProfileService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    courseName: 'sample-course',
                    chapterData: {
                        chapterName: 'sample-chapter',
                        children: [{ identifier: 'd0-12', mimeType: MimeType.COLLECTION },
                        { identifier: 'd0-13', mimeType: MimeType.VIDEO[0] }],
                        contentData: { pkgVersion: 'sample-pkg-ver' },
                        hierarchyInfo: [],
                        identifier: 'do-123'
                    },
                    courseContent: {
                        name: 'course-content', identifier: 'do-123',
                        batchId: 'sample-batch-id',
                        contentData: { name: 'sample-content-data', identifier: 'do-12345', leafNodes: 'sample-leafNodes' }
                    },
                    isFromDeeplink: true
                }
            }
        })) as any
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'SAMPLE_USER')
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {
        getBatchDetails: jest.fn(() => of('batch' as any))
    };
    const mockDatePipe: Partial<DatePipe> = {};
    const mockDownloadService: Partial<DownloadService> = {};
    const mockEvents: Partial<Events> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {
        isEnrollable: jest.fn(() => true)
    };
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of())
    };
    const mockZone: Partial<NgZone> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = { is: jest.fn(platform => platform === 'ios') };
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {};
    const mockCategoryKeyTranslator: Partial<CategoryKeyTranslator> = {
        transform: jest.fn(() => 'sample-message')
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        dismissTncPage: jest.fn(),
        isSSOUser: jest.fn()
    };

    beforeAll(() => {
        chapterDetailsPage = new ChapterDetailsPage(
            mockProfileService as ProfileService,
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockCourseService as CourseService,
            mockDownloadService as DownloadService,
            mockEventsBusService as EventsBusService,
            mockContentService as ContentService,
            mockAppHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockAppGlobalService as AppGlobalService,
            mockPopoverCtrl as PopoverController,
            mockLocalCourseService as LocalCourseService,
            mockEvents as Events,
            mockZone as NgZone,
            mockDatePipe as DatePipe,
            mockFileSizePipe as FileSizePipe,
            mockSbProgressLoader as SbProgressLoader,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
            mockPlatform as Platform,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockCategoryKeyTranslator as CategoryKeyTranslator,
            mockTncUpdateHandlerService as TncUpdateHandlerService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of chapterDetailsPage', () => {
        expect(chapterDetailsPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should return all leave chapters of collection mimeType', () => {
            // arrange
            mockDownloadService.trackDownloads = jest.fn(() => of({ completed: 'yes' })) as any;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            chapterDetailsPage.ngOnInit();
            // assert
            expect(mockDownloadService.trackDownloads).toHaveBeenCalled();
            expect(chapterDetailsPage.chapter.hierarchyInfo).toBeTruthy();
            expect(chapterDetailsPage.chapter.contentData.pkgVersion).toBe('sample-pkg-ver');
            expect(chapterDetailsPage.chapter.identifier).toBe('do-123');
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.DETAIL,
                '', PageId.CHAPTER_DETAILS,
                Environment.HOME,
                chapterDetailsPage.chapter.identifier,
                undefined,
                chapterDetailsPage.chapter.contentData.pkgVersion,
                {},
                undefined
            );

        });
    });
    describe('getContentsSize()', () => {
        it('should populate downloadIdentifiers', () => {
            // arrange
            chapterDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            // act
            chapterDetailsPage.getContentsSize(mockGetChildDataResponse);
            // assert
            expect(chapterDetailsPage.downloadSize).toEqual(57901354);
        });

        it('should populate downloadIdentifiers, if no data', () => {
            // arrange
            chapterDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            const mockGetChildDataResponse = [{isAvailableLocally: true, children: [], contentData: {size: {}}}]
            // act
            chapterDetailsPage.getContentsSize(mockGetChildDataResponse);
            // assert
        });

        it('should populate downloadIdentifiers, if no data', () => {
            // arrange
            chapterDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            // act
            chapterDetailsPage.getContentsSize();
            // assert
        });
    });

    describe('showDownloadConfirmationAlert()', () => {
        it('should show DownloadConfirmation Popup', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            chapterDetailsPage.downloadIdentifiers = new Set(['do_2127509912525127681407', 'do_2127509912525127681408']);
            chapterDetailsPage.isBatchNotStarted = true;
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => 'sample-data');
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            chapterDetailsPage.isDownloadStarted = true;
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockZone.run = jest.fn((fn) => fn());
            const importData: ContentImportResponse[] = [
                { identifier: 'do_123456789', status: ContentImportStatus.NOT_FOUND },];
            mockContentService.importContent = jest.fn(() => of(importData));
            mockFileSizePipe.transform = jest.fn();
            chapterDetailsPage.courseCardData = mockCourseCardData;
            mockPlatform.is = jest.fn(() => true);
            // act
            chapterDetailsPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalled();
                expect(mockContentService.importContent).toHaveBeenCalled();
                // expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                done()
            }, 0);
        });
        it('should show DownloadConfirmation Popup with ContentImportStatus.ENQUEUED_FOR_DOWNLOAD', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            chapterDetailsPage.downloadIdentifiers = new Set(['do_2127509912525127681407', 'do_2127509912525127681408']);
            chapterDetailsPage.isBatchNotStarted = true;
            mockDatePipe.transform = jest.fn(() => 'sample-data');
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            chapterDetailsPage.isDownloadStarted = true;
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockZone.run = jest.fn((fn) => fn());
            const importData: ContentImportResponse[] = [
                { identifier: 'do_1234567880', status: ContentImportStatus.ENQUEUED_FOR_DOWNLOAD }];
            mockContentService.importContent = jest.fn(() => of(importData));
            mockFileSizePipe.transform = jest.fn();
            chapterDetailsPage.courseCardData = mockCourseCardData;
            mockPlatform.is = jest.fn(() => true);
            // act
            chapterDetailsPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalled();
                expect(mockContentService.importContent).toHaveBeenCalled();
                done()
            }, 0);
        });
        it('should show toast message when network is not available', (done) => {
            //arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCommonUtilService.showToast = jest.fn();
            //act
            chapterDetailsPage.showDownloadConfirmationAlert();
            //assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
            done()
        });

        it('should show DownloadConfirmation Popup and catch NETWORK_ERROR error in importContent', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            chapterDetailsPage.downloadIdentifiers = ['do_2127509912525127681407', 'do_2127509912525127681408'] as any;
            chapterDetailsPage.isBatchNotStarted = false;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            chapterDetailsPage.isDownloadStarted = true;
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockZone.run = jest.fn((fn) => fn());
            mockContentService.importContent = jest.fn(() => throwError({ error: 'NETWORK_ERROR' }));
            mockFileSizePipe.transform = jest.fn();
            chapterDetailsPage.courseCardData = mockCourseCardData;
            mockPlatform.is = jest.fn(jest.fn(platform => platform === 'android'));
            // act
            chapterDetailsPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalled();
                expect(mockContentService.importContent).toHaveBeenCalled();
                done()
            }, 0);
        });

        it('should show DownloadConfirmation Popup and catch UNABLE_TO_FETCH_CONTENT error in importContent', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            chapterDetailsPage.downloadIdentifiers = ['do_2127509912525127681407', 'do_2127509912525127681408'] as any;
            chapterDetailsPage.isBatchNotStarted = false;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            chapterDetailsPage.isDownloadStarted = true;
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockZone.run = jest.fn((fn) => fn());
            mockContentService.importContent = jest.fn(() => throwError({ error: 'UNABLE_TO_FETCH_CONTENT' }));
            mockFileSizePipe.transform = jest.fn();
            chapterDetailsPage.courseCardData = mockCourseCardData;
            mockPlatform.is = jest.fn(jest.fn(platform => platform === 'android'));
            // act
            chapterDetailsPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPlatform.is).toHaveBeenCalled();
                expect(mockContentService.importContent).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('ionViewWillEnter', () => {
        it('should handle header back button', (done) => {
            // arrange
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            jest.spyOn(chapterDetailsPage, 'subscribeUtilityEvents').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'subscribeSdkEvent').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkLoggedInOrGuestUser').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllContents').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkChapterCompletion').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getContentsSize').mockImplementation(() => {
                return;
            });
            const mockConfig = {
                subscribe: jest.fn(() => { })
            };
            mockAppHeaderService.headerEventEmitted$ = of({ name: 'back' });
            chapterDetailsPage.guestUser = false;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            chapterDetailsPage.courseCardData = {
                identifier: 'sample-course-id',
                batchId: 'sample-batch-id'
            }
            mockCourseService.getEnrolledCourses = jest.fn(() => of([
                {
                    batchId: 'sample-batch-id',
                    courseId: 'sample-course-id',
                    batch: { status: 1 }
                }
            ]));
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            mockZone.run = jest.fn();
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CHAPTER_DETAILS,
                    Environment.HOME,
                    false
                );
                expect(mockLocation.back).toHaveBeenCalled();
                expect(chapterDetailsPage.guestUser).toBeFalsy();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle header back button if response is empty', (done) => {
            // arrange
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            jest.spyOn(chapterDetailsPage, 'subscribeUtilityEvents').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'subscribeSdkEvent').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkLoggedInOrGuestUser').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllContents').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkChapterCompletion').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            const mockConfig = {
                subscribe: jest.fn(() => { })
            };
            mockCourseService.getEnrolledCourses = jest.fn(() => of([
                {
                    batchId: 'sample-batch-id',
                    courseId: 'sample-course-id',
                    batch: { status: 1 }
                }
            ]));
            chapterDetailsPage.courseCardData = {
                identifier: 'sample-course-id'
            };
            mockAppHeaderService.headerEventEmitted$ = of(mockConfig);
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            chapterDetailsPage.guestUser = false;
            mockZone.run = jest.fn();
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CHAPTER_DETAILS,
                    Environment.HOME,
                    false
                );
                expect(chapterDetailsPage.guestUser).toBeFalsy();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle header back button for catch part', (done) => {
            // arrange
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            jest.spyOn(chapterDetailsPage, 'subscribeUtilityEvents').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'subscribeSdkEvent').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkLoggedInOrGuestUser').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllContents').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkChapterCompletion').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            const mockConfig = {
                subscribe: jest.fn(() => { })
            };
            mockAppHeaderService.headerEventEmitted$ = of(mockConfig);
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            chapterDetailsPage.isFromDeeplink = false;
            chapterDetailsPage.guestUser = false;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError([
                {
                    error: 'error'
                }
            ]));
            mockZone.run = jest.fn();
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CHAPTER_DETAILS,
                    Environment.HOME,
                    false
                );
                expect(chapterDetailsPage.guestUser).toBeFalsy();
                expect(chapterDetailsPage.isFromDeeplink).toBeFalsy();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                expect(mockAppGlobalService.setEnrolledCourseList).not.toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle header back button for guest user', (done) => {
            // arrange
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            jest.spyOn(chapterDetailsPage, 'subscribeUtilityEvents').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'checkLoggedInOrGuestUser').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getAllContents').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'checkChapterCompletion').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            const mockConfig = {
                subscribe: jest.fn(() => { })
            };
            mockAppHeaderService.headerEventEmitted$ = of(mockConfig);
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            chapterDetailsPage.isFromDeeplink = false;
            chapterDetailsPage.guestUser = true;
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CHAPTER_DETAILS,
                    Environment.HOME,
                    false
                );
                expect(chapterDetailsPage.guestUser).toBeTruthy();
                expect(chapterDetailsPage.isFromDeeplink).toBeFalsy();
                done();
            }, 0);
        });
    });

    it('should unsubscribe eventSubscription', () => {
        // arrange
        mockEvents.publish = jest.fn(() => []);
        chapterDetailsPage['eventSubscription'] = {
            unsubscribe: jest.fn(() => true)
        } as any;
        chapterDetailsPage.headerObservable = {
            unsubscribe: jest.fn(() => true)
        } as any;
        chapterDetailsPage.backButtonFunc = {
            unsubscribe: jest.fn(() => true)
        } as any;
        // act
        chapterDetailsPage.ionViewWillLeave();
        // assert
        expect(mockEvents.publish).toHaveBeenCalledWith('header:setzIndexToNormal');
        expect(chapterDetailsPage.headerObservable.unsubscribe).toHaveBeenCalled();
        expect(chapterDetailsPage.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should not unsubscribe if no eventSubscription', () => {
        // arrange
        mockEvents.publish = jest.fn(() => []);
        chapterDetailsPage['eventSubscription'] = undefined as any;
        chapterDetailsPage.headerObservable = undefined as any;
        chapterDetailsPage.backButtonFunc = undefined as any;
        // act
        chapterDetailsPage.ionViewWillLeave();
        // assert
        expect(mockEvents.publish).toHaveBeenCalledWith('header:setzIndexToNormal');
    });

    it('ionViewDidEnter', () => {
        // arrange
        mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
        chapterDetailsPage.courseContent = { identifier: 'login' }
        // act
        chapterDetailsPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' })
    });

    it('ngOnDestroy', () => {
        mockEvents.unsubscribe = jest.fn();
        chapterDetailsPage.ngOnDestroy();
        expect(mockEvents.unsubscribe).toHaveBeenCalledWith(EventTopics.ENROL_COURSE_SUCCESS);
    });

    describe('getAllBatches', () => {

        beforeAll(() => {
            chapterDetailsPage = new ChapterDetailsPage(
                mockProfileService as ProfileService,
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockAppGlobalService as AppGlobalService,
                mockPopoverCtrl as PopoverController,
                mockLocalCourseService as LocalCourseService,
                mockEvents as Events,
                mockZone as NgZone,
                mockDatePipe as DatePipe,
                mockFileSizePipe as FileSizePipe,
                mockSbProgressLoader as SbProgressLoader,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockLocation as Location,
                mockPlatform as Platform,
                mockContentPlayerHandler as ContentPlayerHandler,
                mockCategoryKeyTranslator as CategoryKeyTranslator,
                mockTncUpdateHandlerService as TncUpdateHandlerService
            );
        });
        it('should return all batches', (done) => {
            // arrange
            mockCourseService.getCourseBatches = jest.fn(() => of([]));
            chapterDetailsPage.getAllBatches();
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return all batches for error part', (done) => {
            // arrange
            mockCourseService.getCourseBatches = jest.fn(() => throwError({ error: 'error' }));
            chapterDetailsPage.getAllBatches();
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('checkLoggedInOrGuestUser', () => {
        it('should checked LoggedIn user Or GuestUser', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({ userToken: 'sample-user-token' })) as any;
            // act
            chapterDetailsPage.checkLoggedInOrGuestUser();
            // assert
            setTimeout(() => {
                expect(mockAuthService.getSession).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should checked GuestUser', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined)) as any;
            // act
            chapterDetailsPage.checkLoggedInOrGuestUser();
            // assert
            setTimeout(() => {
                expect(mockAuthService.getSession).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getContentState', () => {
        it('should return contentState', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id',
                contentData: {
                    leafNodes: [
                        'do_1', 'do_12', 'do_123'
                    ]
                }
            };
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getContentState = jest.fn(() => of({})) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(mockCourseService.getContentState).toHaveBeenCalled();
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return contentState for catch part', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id',
                contentData: {
                    leafNodes: [
                        'do_1', 'do_12', 'do_123'
                    ]
                }
            };
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getContentState = jest.fn(() => throwError({ error: 'error' }));
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(mockCourseService.getContentState).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return contentState for else part', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: undefined
            };
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent.batchId).toBeUndefined();
                done();
            }, 0);
        });
    });

    describe('getBatchDetails', () => {
        it('should return courseStartDate if status is 0', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of({
                status: 0,
                startDate: '2020-06-02',
                cert_templates: 'sample'
            })) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            expect(chapterDetailsPage.courseContent).toBeTruthy();
            expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
            expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: "sample-batch-id" });
            expect(mockZone.run).toHaveBeenCalled();
            setTimeout(() => {
                // expect(chapterDetailsPage.batchDetails).toEqual({
                //     status: 0,
                //     startDate: '2020-06-02',
                //     cert_templates: 'sample'
                // });
                expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
                // expect(chapterDetailsPage.courseStartDate.batchId).toBe(chapterDetailsPage.batchDetails.batchId);
            }, 0);
        });

        it('should return batch Expire date if status is 2', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of({
                status: 2,
                startDate: '2020-06-02'
            })) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            expect(chapterDetailsPage.courseContent).toBeTruthy();
            expect(chapterDetailsPage.courseContent.batchId).toBe("sample-batch-id");
            expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: "sample-batch-id" });
            expect(mockZone.run).toHaveBeenCalled();
            setTimeout(() => {
                // expect(chapterDetailsPage.batchDetails).toEqual({
                //     status: 2,
                //     startDate: '2020-06-02'
                // });
                expect(chapterDetailsPage.batchExp).toBeFalsy();
            }, 0);
        });

        it('should return null if response is undefined', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of(undefined));
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBe("sample-batch-id");
                // expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: "sample-batch-id" });
                // expect(mockZone.run).toHaveBeenCalled();
            }, 0);
        });

        it('should return null if status is > 2', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of({
                status: 3,
                startDate: '2020-06-02'
            })) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBe("sample-batch-id");
                // expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: "sample-batch-id" });
                // expect(mockZone.run).toHaveBeenCalled();
                // expect(chapterDetailsPage.batchDetails).toEqual({
                //     status: 3,
                //     startDate: '2020-06-02'
                // });
            }, 0);
        });

        it('should handel error for catch part', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id',
                batch: { staus: 1 }
            };
            mockCourseService.getBatchDetails = jest.fn(() => throwError({ error: 'error' }));
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBe("sample-batch-id");
            }, 0);
            expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: "sample-batch-id" });
        });

        it('should return null if curseCard is undefined', () => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: undefined
            };
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent.batchId).toBe("sample-batch-id");
            }, 0);
        });
    });

    describe('getAllContents', () => {
        it('should return all leaves contents which mimeType is not collection', () => {
            // arrange
            const collection = {
                children: [{
                    id: 'do-123',
                    mimeType: MimeType.AUDIO[0],
                    children: [{
                        id: 'do-0-123',
                        mimeType: MimeType.DOCS[0]
                    }]
                }, {
                    id: '234',
                    mimeType: MimeType.COLLECTION
                }, {
                    id: '345',
                    mimeType: MimeType.INTERACTION[0],
                    children: [
                        {
                            id: 'do-0-345',
                            mimeType: MimeType.DOCS[1]
                        }, {
                            id: 'do-1-345',
                            mimeType: MimeType.COLLECTION
                        }
                    ]
                }]
            };
            // act
            chapterDetailsPage.getAllContents(collection);
            // assert
            expect(chapterDetailsPage.childContents).toEqual([
                { id: 'do-0-123', mimeType: 'application/pdf' },
                { id: 'do-0-345', mimeType: 'application/epub' }
            ]);
        });
    });

    describe('checkChapterCompletion', () => {
        it('should return progress for chapter complition if isChapterCompleted', () => {
            // arrange
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    { id: 'do-123', contentId: 'sample-content-id', status: 2 }
                ]
            };

            chapterDetailsPage.childContents = [{
                identifier: 'sample-content-id'
            }];
            mockAppGlobalService.generateCourseUnitCompleteTelemetry = jest.fn(() => true);
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
            // act
            chapterDetailsPage.checkChapterCompletion();
            // arrange
            expect(chapterDetailsPage.contentStatusData).toBeTruthy();
            expect(chapterDetailsPage.contentStatusData.contentList.length).toBeGreaterThan(0);
            expect(chapterDetailsPage.isChapterCompleted).toBeTruthy();
            expect(chapterDetailsPage.chapterProgress).toBe(100);
        });

        it('should return progress for chapter complition if isChapterStarted', () => {
            // arrange
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    { id: 'do-123', contentId: 'sample-content-id', status: 2 }
                ]
            };

            chapterDetailsPage.childContents = [{
                identifier: 'sample-content-id'
            }, {
                identifier: 'sample-id-2'
            }];
            // act
            chapterDetailsPage.checkChapterCompletion();
            // arrange
            expect(chapterDetailsPage.contentStatusData).toBeTruthy();
            expect(chapterDetailsPage.contentStatusData.contentList.length).toBeGreaterThan(0);
            expect(chapterDetailsPage.isChapterCompleted).toBeTruthy();
            expect(chapterDetailsPage.chapterProgress).toBe(50);
        });

        it('should return progress for chapter complition if isChapterStarted is false', () => {
            // arrange
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    { id: 'do-123', contentId: 'sample-content-id', status: 2 }
                ]
            };

            chapterDetailsPage.childContents = [];
            // act
            chapterDetailsPage.checkChapterCompletion();
            // arrange
            expect(chapterDetailsPage.contentStatusData).toBeTruthy();
            expect(chapterDetailsPage.contentStatusData.contentList.length).toBeGreaterThan(0);
            expect(chapterDetailsPage.isChapterCompleted).toBeTruthy();
        });

        it('should return nothing for else part', () => {
            // arrange
            chapterDetailsPage.contentStatusData = {
                contentList: []
            };

            // act
            chapterDetailsPage.checkChapterCompletion();
            // arrange
            expect(chapterDetailsPage.contentStatusData).toBeTruthy();
            expect(chapterDetailsPage.contentStatusData.contentList.length).toBe(0);
        });
    });

    describe('subscribeUtilityEvents', () => {
        it('should return enrolled courses', () => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn();
            const mockData = {
                batchId: 'sample-batch-id'
            };
            mockEvents.subscribe = jest.fn((topic, fn) => {
                switch (topic) {
                    case EventTopics.ENROL_COURSE_SUCCESS:
                        return fn(mockData);
                }
            });
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getEnrolledCourses = jest.fn(() => of([
                {
                    courseId: 'sample-course-id'
                }
            ]));
            chapterDetailsPage.courseContentData = {
                identifier: 'sample-course-id'
            };
            jest.spyOn(chapterDetailsPage, 'getBatchDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(chapterDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.subscribeUtilityEvents();
            // assert
            expect(mockEvents.subscribe).toHaveBeenCalled();
            setTimeout(() => {
                expect(chapterDetailsPage.isAlreadyEnrolled).toBeTruthy();
                expect(chapterDetailsPage.updatedCourseCardData).toEqual(
                    {
                        courseId: 'sample-course-id'
                    }
                );
                expect(chapterDetailsPage.updatedCourseCardData.courseId).toEqual(chapterDetailsPage.courseContentData.identifier);
                expect(chapterDetailsPage.courseContent.batchId).toBe(mockData.batchId);
            }, 0);
        });
    });

    describe('startLearning', () => {
        it('should load FirstChildren', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [{ identifier: 'do-123' }];
            chapterDetailsPage.isBatchNotStarted = false;
            chapterDetailsPage.userId = 'sample-user-token';
            jest.spyOn(chapterDetailsPage, 'loadFirstChildren').mockImplementation(() => {
                return { identifier: 'do-123' };
            });
            mockContentPlayerHandler.playContent = jest.fn();
            mockPreferences.getBoolean = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve(false));

            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(chapterDetailsPage.childContents.length).toBeGreaterThan(0);
                expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                expect(mockContentPlayerHandler.playContent).toHaveBeenCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return nothing when close button clicked or exceed the limit', (done) => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [{ identifier: 'do-123' }] as any;
            chapterDetailsPage.isBatchNotStarted = false;
            chapterDetailsPage.userId = 'sample-user-token';
            jest.spyOn(chapterDetailsPage, 'loadFirstChildren').mockImplementation(() => {
                return { identifier: 'do-123' };
            });
            mockContentPlayerHandler.playContent = jest.fn();
            mockPreferences.getBoolean = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false })) as any
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve({ isCloseButtonClicked: true, limitExceeded: true })) as any;
            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(chapterDetailsPage.childContents.length).toBeGreaterThan(0);
                expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should skip the naviation flow and show toast message like NO_CONTENT_AVAILABLE_IN_MODULE', (done) => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [];
            chapterDetailsPage.isBatchNotStarted = false;
            chapterDetailsPage.userId = 'sample-user-token';
            mockCommonUtilService.showToast = jest.fn();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;
            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(chapterDetailsPage.childContents.length).toEqual(0);
                expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_CONTENT_AVAILABLE_IN_MODULE');
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should skip the naviation flow and show toast message like COURSE_WILL_BE_AVAILABLE', (done) => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [{ identifier: 'do-123' }] as any;
            chapterDetailsPage.isBatchNotStarted = true;
            chapterDetailsPage.userId = 'sample-user-token';
            mockCommonUtilService.translateMessage = jest.fn(() => 'COURSE_WILL_BE_AVAILABLE');
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => '2020-06-02') as any;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;

            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(chapterDetailsPage.childContents.length).toBe(1);
                expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-02');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE');
                expect(mockDatePipe.transform).toHaveBeenCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show profile name confirmation popup', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.isBatchNotStarted = true;
            chapterDetailsPage.isCertifiedCourse = true;
            chapterDetailsPage.userId = 'sample-user-token';
            mockCommonUtilService.translateMessage = jest.fn(() => 'course will be available');
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => '2020-06-04');
            mockPreferences.getBoolean = jest.fn(() => of(false));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { buttonClicked: true } }))
            } as any)));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;

            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });


        it('should not call start content', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.isBatchNotStarted = true;
            chapterDetailsPage.isCertifiedCourse = true;
            chapterDetailsPage.userId = 'sample-user-token';
            mockPreferences.getBoolean = jest.fn(() => of(false));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
            } as any)));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData)) as any;

            // act
            chapterDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined, undefined);
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-sample-user-token');
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('continueLearning', () => {
        it('should execute play content', (done) => {
            //arrange
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    { contentId: 'do-123', status: 2 },
                    { contentId: 'do-1-123', status: 1 },
                    { contentId: 'do-2-123', status: 0 }
                ]
            };
            chapterDetailsPage.childContents = [
                { identifier: 'do-123' }, { identifier: 'sample-id-2' }
            ];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({
                isLastAttempt: true,
                isContentDisabled: true,
                currentAttempt: 50,
                maxAttempts: 100,
            }));
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve(false));
            mockContentPlayerHandler.playContent = jest.fn();
            //act
            chapterDetailsPage.continueLearning();
            //assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.RESUME_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined);
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                expect(mockContentPlayerHandler.playContent).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should not return nothing when close button is clicked or limit is exceeded', (done) => {
            //arrange
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    { contentId: 'do-123', status: 2 },
                    { contentId: 'do-1-123', status: 1 },
                    { contentId: 'do-2-123', status: 0 }
                ]
            };
            chapterDetailsPage.childContents = [
                { identifier: 'do-123' }, { identifier: 'sample-id-2' }
            ];
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({
                isLastAttempt: true,
                isContentDisabled: true,
                currentAttempt: 50,
                maxAttempts: 100,
            }));
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve({ isCloseButtonClicked: true, limitExceeded: true }));
            mockContentPlayerHandler.playContent = jest.fn();
            //act
            chapterDetailsPage.continueLearning();
            //assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.RESUME_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS,
                    new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                    undefined, undefined);
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should navigate To ChildrenDetailsPage and return the content which is not played', () => {
            // arrange
            chapterDetailsPage.isNextContentFound = false;
            chapterDetailsPage.isFirstContent = false;
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.chapter = {
                identifier: 'do-123',
                mimeType: MimeType.DOCS[0],
                children: [
                    {
                        identifier: 'do-1-123',
                        mimeType: MimeType.COLLECTION
                    },
                    {
                        identifier: 'do-2-123',
                        mimeType: MimeType.DOCS[0]
                    }
                ]
            };
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 2
                    },
                    {
                        contentId: 'do-1-123',
                        status: 1
                    },
                    {
                        contentId: 'do-2-123',
                        status: 0
                    }
                ]
            };
            // act
            chapterDetailsPage.continueLearning();
            // asser
            expect(chapterDetailsPage.nextContent).toEqual({
                identifier: 'do-1-123',
                mimeType: 'application/vnd.ekstep.content-collection'
            });
            expect(chapterDetailsPage.isNextContentFound).toBeTruthy();
            expect(chapterDetailsPage.isFirstContent).toBeTruthy();
        });

        it('should navigate To ChildrenDetailsPage and return first content if every contents are played', () => {
            // arrange
            chapterDetailsPage.isNextContentFound = false;
            chapterDetailsPage.isFirstContent = false;
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.chapter = {
                identifier: 'do-123',
                mimeType: MimeType.DOCS[0],
                children: [
                    {
                        identifier: 'do-1-123',
                        mimeType: MimeType.COLLECTION
                    },
                    {
                        identifier: 'do-2-123',
                        mimeType: MimeType.DOCS[0]
                    }
                ]
            };
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 2
                    },
                    {
                        contentId: 'do-1-123',
                        status: 2
                    },
                    {
                        contentId: 'do-2-123',
                        status: 2
                    }
                ]
            };
            // act
            chapterDetailsPage.continueLearning();
            // asser
            expect(chapterDetailsPage.nextContent).toEqual(chapterDetailsPage.chapter);
            expect(chapterDetailsPage.isNextContentFound).toBeFalsy();
            expect(chapterDetailsPage.isFirstContent).toBeTruthy();
        });

        it('should navigate To ChildrenDetailsPage and return first content if every contents are played and root is collection', () => {
            // arrange
            chapterDetailsPage.isNextContentFound = false;
            chapterDetailsPage.isFirstContent = false;
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.chapter = {
                identifier: 'do-123',
                mimeType: MimeType.COLLECTION,
                children: [
                    {
                        identifier: 'do-1-123',
                        mimeType: MimeType.COLLECTION
                    },
                    {
                        identifier: 'do-2-123',
                        mimeType: MimeType.DOCS[0]
                    }
                ]
            };
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 2
                    },
                    {
                        contentId: 'do-1-123',
                        status: 2
                    },
                    {
                        contentId: 'do-2-123',
                        status: 2
                    }
                ]
            };
            // act
            chapterDetailsPage.continueLearning();
            // asser
            expect(chapterDetailsPage.nextContent).toEqual(chapterDetailsPage.chapter.children[1]);
            expect(chapterDetailsPage.isNextContentFound).toBeFalsy();
            expect(chapterDetailsPage.isFirstContent).toBeTruthy();
        });

        it('should navigate To ChildrenDetailsPage and return first content if children is undefined', () => {
            // arrange
            chapterDetailsPage.isNextContentFound = false;
            chapterDetailsPage.isFirstContent = false;
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.chapter = {
                identifier: 'do-123',
                mimeType: MimeType.DOCS[0]
            };
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 2
                    },
                    {
                        contentId: 'do-1-123',
                        status: 1
                    },
                    {
                        contentId: 'do-2-123',
                        status: 0
                    }
                ]
            };
            // act
            chapterDetailsPage.continueLearning();
            // asser
            expect(chapterDetailsPage.nextContent).toEqual({
                identifier: 'do-123',
                mimeType: MimeType.DOCS[0]
            });
            expect(chapterDetailsPage.isNextContentFound).toBeFalsy();
            expect(chapterDetailsPage.isFirstContent).toBeTruthy();
        });

        it('should called startLearning if nextContent is not available', () => {
            // arrange
            chapterDetailsPage.isNextContentFound = false;
            chapterDetailsPage.isFirstContent = false;
            chapterDetailsPage.nextContent = undefined;
            chapterDetailsPage.chapter = {
                identifier: 'do-123',
                mimeType: MimeType.COLLECTION
            };
            chapterDetailsPage.contentStatusData = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 2
                    }
                ]
            };
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve(false));
            // act
            chapterDetailsPage.continueLearning();
            // asser
            expect(chapterDetailsPage.nextContent).toBeUndefined();
            expect(chapterDetailsPage.isNextContentFound).toBeFalsy();
            expect(chapterDetailsPage.isFirstContent).toBeFalsy();
        });
    });

    describe('showOverflowMenu', () => {
        it('should invoked showOverflowMenu for download', (done) => {
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { download: true } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            jest.spyOn(chapterDetailsPage, 'showDownloadConfirmationAlert').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.showOverflowMenu({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showOverflowMenu for share', (done) => {
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { share: true } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            jest.spyOn(chapterDetailsPage, 'showDownloadConfirmationAlert').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.showOverflowMenu({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showOverflowMenu for unknown', (done) => {
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: {} }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            jest.spyOn(chapterDetailsPage, 'showDownloadConfirmationAlert').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.showOverflowMenu({});
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('openContentDetails', () => {
        it('should not return null when event is empty', () => {
            //arrange
            const event = undefined;
            //act
            chapterDetailsPage.openContentDetails(event);
            //assert
            expect(event).toBeUndefined();
        });
        it('should invoked joinTraining() and the batches should be undefined', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });
        it('should invoked joinTraining() and the batches should be defined', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.batches = [{ enrollmentEndDate: '05/05/2022' }]
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });
        it('should invoked joinTraining() and the batches started is greater than 1', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'inernet'} } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            mockCommonUtilService.showToast = jest.fn()
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            chapterDetailsPage.batches = [{ enrollmentEndDate: '05/05/2022' }, { enrollmentEndDate: '02/05/2022' }] as any
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });

        it('should invoked joinTraining() and the batches started is greater than 1, else case', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: false, btn: {isInternetNeededMessage: 'inernet'} } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            mockCommonUtilService.showToast = jest.fn()
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            chapterDetailsPage.batches = [{ enrollmentEndDate: '05/05/2022' }, { enrollmentEndDate: '02/05/2022' }] as any
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });

        it('should invoked joinTraining() and the batches started is greater than 1, if no btn object', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            mockCommonUtilService.showToast = jest.fn()
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            chapterDetailsPage.batches = [{ enrollmentEndDate: '05/05/2022' }, { enrollmentEndDate: '02/05/2022' }] as any
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });

        it('should invoked joinTraining() and the batches started is greater than 1, if network available', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'inernet'} } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true}
            mockCommonUtilService.showToast = jest.fn()
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            chapterDetailsPage.batches = [{ enrollmentEndDate: '05/05/2022' }, { enrollmentEndDate: '02/05/2022' }] as any
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = false;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });
        it('should not invoked joinTraining() if isBatchNotStarted', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = false;
            chapterDetailsPage.isBatchNotStarted = true;
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeFalsy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
        });
        it('should show a course available toast if isAlreadyEnrolled', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }]
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = true;
            chapterDetailsPage.isBatchNotStarted = true;
            mockDatePipe.transform = jest.fn(() => '2020-06-02');
            mockCommonUtilService.translateMessage = jest.fn(() => 'The batch is available from sunbird');
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeTruthy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-02');
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('The batch is available from sunbird');
            expect(mockDatePipe.transform).toHaveBeenCalled();
        });
        it('should navigate To ChildrenDetailsPage', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }],
                data: { name: 'data-name' }
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.userId = 'sample-user';
            chapterDetailsPage.isAlreadyEnrolled = true;
            chapterDetailsPage.isBatchNotStarted = false;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeTruthy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME,
                PageId.CHAPTER_DETAILS,
                { "id": "do-123", "type": undefined, "version": "sample-pkg-ver" },
                { "contentClicked": undefined },
                undefined,
                undefined
            );
        });

        it('should return null if userId matched', () => {
            // arrange
            const event = {
                event: [{ name: 'sample-name' }],
                data: { name: 'data-name' }
            };
            chapterDetailsPage.courseContentData = {
                contentData: {
                    createdBy: 'sample-creator'
                }
            };
            chapterDetailsPage.userId = 'sample-creator';
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).toEqual(chapterDetailsPage.userId);
        });

        it('should return null if userId if event size is 0', () => {
            // arrange
            const event = {
                event: [],
                data: { name: 'data-name' }
            };
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toEqual(0);
        });

        it('should not allow the user to consume ontent if number of attempts are exceeded', () => {
            // arrange
            const event = {
                event: {
                    isDisabled: true
                },
                data: { name: 'data-name' }
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FRMELMNTS_IMSG_LASTATTMPTEXCD');
        });

        it('should show a toast message to the user that this will be his last attempt', () => {
            // arrange
            const event = {
                event: { isLastAttempt: true },
                data: { name: 'data-name' }
            };
            mockCommonUtilService.showToast = jest.fn();
            // chapterDetailsPage.courseContentData = {
            //     contentData: {
            //         createdBy: 'sample-creator'
            //     }
            // };
            // chapterDetailsPage.userId = 'sample-creator';
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ASSESSMENT_LAST_ATTEMPT_MESSAGE');
        });
    });

    describe('navigateToBatchListPage', () => {
        it('should invoked enrollIntoBatch', (done) => {
            // arrnge
            mockCommonUtilService.getLoader = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            chapterDetailsPage.batches = [{ batchId: 'sample-batch-id' }];
            jest.spyOn(chapterDetailsPage, 'enrollIntoBatch').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toEqual(1);
                done();
            }, 0);
        });

        it('should navigate to course-batches page and return ongoing and upcoming batches', (done) => {
            // arrnge
            mockCommonUtilService.getLoader = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            chapterDetailsPage.batches = [{
                batchId: 'sample-batch-id',
                status: 1
            }, {
                batchId: 'sample-batch-id',
                status: 2
            }];
            jest.spyOn(chapterDetailsPage, 'enrollIntoBatch').mockImplementation(() => {
                return Promise.resolve();
            });
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            chapterDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toBeGreaterThan(0);
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.COURSE_BATCHES],
                    {
                        state: {
                            corRelationList: undefined,
                            course: {
                                contentData: {
                                    createdBy: 'sample-creator'
                                },
                            },
                            objRollup: undefined,
                            ongoingBatches: [
                                { batchId: 'sample-batch-id', status: 1 }
                            ],
                            telemetryObject: new TelemetryObject('do-123', undefined, 'sample-pkg-ver'),
                            upcommingBatches: []
                        }
                    });
                done();
            }, 0);
        });

        it('should show toast message if batches is empty', (done) => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            chapterDetailsPage.batches = [];
            // mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toBe(0);
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
                expect(dismissFn).toBeTruthy();
                done();
            }, 0);
        });

        it('should show toast message for internet error', (done) => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            chapterDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(chapterDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
                done();
            }, 0);
        });
        it('should return nothing for non enrollable course service', (done) => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockLocalCourseService.isEnrollable = jest.fn(() => false);
            // act
            chapterDetailsPage.navigateToBatchListPage();

            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockLocalCourseService.isEnrollable).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('enrollIntoBatch', () => {
        beforeAll(() => {
            chapterDetailsPage = new ChapterDetailsPage(
                mockProfileService as ProfileService,
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockAppGlobalService as AppGlobalService,
                mockPopoverCtrl as PopoverController,
                mockLocalCourseService as LocalCourseService,
                mockEvents as Events,
                mockZone as NgZone,
                mockDatePipe as DatePipe,
                mockFileSizePipe as FileSizePipe,
                mockSbProgressLoader as SbProgressLoader,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockLocation as Location,
                mockPlatform as Platform,
                mockContentPlayerHandler as ContentPlayerHandler,
                mockCategoryKeyTranslator as CategoryKeyTranslator,
                mockTncUpdateHandlerService as TncUpdateHandlerService
            );
        });
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should invoked promptToLogin() for guest user', (done) => {
            // arrange
            const items = {
                id: 'do-123',
                courseId: 'sample-course-id'
            };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            chapterDetailsPage.guestUser = true;
            jest.spyOn(chapterDetailsPage, 'promptToLogin').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            chapterDetailsPage.enrollIntoBatch(items);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(chapterDetailsPage.guestUser).toBeTruthy();
                done();
            }, 0);
        });

        it('should return enrolled batches for loggedIn user', (done) => {
            // arrange
            const items = {
                id: 'do-123',
                courseId: 'sample-course-id'
            };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            chapterDetailsPage.guestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => { });
            const prepareResponseValue = new Map();
            prepareResponseValue['enrollReq'] = { name: 'sample-name' };
            mockLocalCourseService.prepareRequestValue = jest.fn(() => prepareResponseValue);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => of({}));
            mockCommonUtilService.translateMessage = jest.fn(() => 'course enrolled');
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            // act
            chapterDetailsPage.enrollIntoBatch(items);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(chapterDetailsPage.guestUser).toBeFalsy();
                expect(mockLocalCourseService.prepareEnrollCourseRequest).toHaveBeenCalled();
                expect(mockLocalCourseService.prepareRequestValue).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ENROLL_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS, undefined, prepareResponseValue
                );
                expect(presentFn).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(chapterDetailsPage.courseContent.batchId).toBe(items.id);
                expect(mockCategoryKeyTranslator.transform).toHaveBeenCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample-message');
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.ENROL_COURSE_SUCCESS, {
                    batchId: items.id,
                    courseId: items.courseId
                });
                done();
            }, 0);
        });

        it('should handle service error part', (done) => {
            const items = {
                id: 'do-123',
                courseId: 'sample-course-id'
            };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            chapterDetailsPage.guestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => { });
            const prepareResponseValue = new Map();
            prepareResponseValue['enrollReq'] = { name: 'sample-name' };
            mockLocalCourseService.prepareRequestValue = jest.fn(() => prepareResponseValue);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => throwError({ error: 'error' }));
            // act
            chapterDetailsPage.enrollIntoBatch(items);
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(chapterDetailsPage.guestUser).toBeFalsy();
                expect(mockLocalCourseService.prepareEnrollCourseRequest).toHaveBeenCalled();
                expect(mockLocalCourseService.prepareRequestValue).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.ENROLL_CLICKED,
                    Environment.HOME,
                    PageId.CHAPTER_DETAILS, undefined, prepareResponseValue
                );
                expect(presentFn).toHaveBeenCalled();
                expect(mockLocalCourseService.enrollIntoBatch).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('promptToLogin', () => {
        beforeAll(() => {
            chapterDetailsPage = new ChapterDetailsPage(
                mockProfileService as ProfileService,
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockAppGlobalService as AppGlobalService,
                mockPopoverCtrl as PopoverController,
                mockLocalCourseService as LocalCourseService,
                mockEvents as Events,
                mockZone as NgZone,
                mockDatePipe as DatePipe,
                mockFileSizePipe as FileSizePipe,
                mockSbProgressLoader as SbProgressLoader,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockLocation as Location,
                mockPlatform as Platform,
                mockContentPlayerHandler as ContentPlayerHandler,
                mockCategoryKeyTranslator as CategoryKeyTranslator,
                mockTncUpdateHandlerService as TncUpdateHandlerService
            );
        });
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should handle user signIn', (done) => {
            // arrange
            const batchdetail = {
                id: 'sample-id',
                batchId: 'sample-batch-id',
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true,  btn: {isInternetNeededMessage: 'internet' } }}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                switch (key) {
                    case 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL':
                        return 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL';
                    case 'TRAININGS_ONLY_REGISTERED_USERS':
                        return 'TRAININGS_ONLY_REGISTERED_USERS';
                    case 'OVERLAY_SIGN_IN':
                        return 'OVERLAY_SIGN_IN';
                }
            });
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            chapterDetailsPage.promptToLogin(batchdetail);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        sbPopoverMainTitle: 'sample-message',
                        metaInfo: 'sample-message',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color label-uppercase label-bold-font'
                            })
                        ])
                    })
                }));
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle user signIn, else case of no btn message on dismiss', (done) => {
            // arrange
            const batchdetail = {
                id: 'sample-id',
                batchId: 'sample-batch-id',
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true,  btn: {isInternetNeededMessage: '' } }}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                switch (key) {
                    case 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL':
                        return 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL';
                    case 'TRAININGS_ONLY_REGISTERED_USERS':
                        return 'TRAININGS_ONLY_REGISTERED_USERS';
                    case 'OVERLAY_SIGN_IN':
                        return 'OVERLAY_SIGN_IN';
                }
            });
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            chapterDetailsPage.promptToLogin(batchdetail);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        sbPopoverMainTitle: 'sample-message',
                        metaInfo: 'sample-message',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color label-uppercase label-bold-font'
                            })
                        ])
                    })
                }));
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify(batchdetail));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(2,
                    PreferenceKey.COURSE_DATA_KEY, JSON.stringify(chapterDetailsPage.courseContentData));
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], { state: { navigateToCourse: true } });
                done();
            }, 0);
        });

        it('should handle user signIn, else case of no btn message on dismiss, if no btn message', (done) => {
            // arrange
            const batchdetail = {
                id: 'sample-id',
                batchId: 'sample-batch-id',
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true,  btn: ''}}));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true}
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                switch (key) {
                    case 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL':
                        return 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL';
                    case 'TRAININGS_ONLY_REGISTERED_USERS':
                        return 'TRAININGS_ONLY_REGISTERED_USERS';
                    case 'OVERLAY_SIGN_IN':
                        return 'OVERLAY_SIGN_IN';
                }
            });
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            chapterDetailsPage.promptToLogin(batchdetail);

            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        sbPopoverMainTitle: 'sample-message',
                        metaInfo: 'sample-message',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color label-uppercase label-bold-font'
                            })
                        ])
                    })
                }));
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(1, PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify(batchdetail));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(2,
                    PreferenceKey.COURSE_DATA_KEY, JSON.stringify(chapterDetailsPage.courseContentData));
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], { state: { navigateToCourse: true } });
                done();
            }, 0);
        });

        it('should not handle user signIn if user dismiss the popup', (done) => {
            // arrange
            const batchdetail = {
                id: 'sample-id',
                batchId: 'sample-batch-id',
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            const presentFn = jest.fn(() => Promise.resolve({}));
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: false,  btn: {isInternetNeededMessage: 'internet'} } }));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn((key) => {
                switch (key) {
                    case 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL':
                        return 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL';
                    case 'TRAININGS_ONLY_REGISTERED_USERS':
                        return 'TRAININGS_ONLY_REGISTERED_USERS';
                    case 'OVERLAY_SIGN_IN':
                        return 'OVERLAY_SIGN_IN';
                }
            });
            // act
            chapterDetailsPage.promptToLogin(batchdetail);
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        sbPopoverMainTitle: 'sample-message',
                        metaInfo: 'sample-message',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color label-uppercase label-bold-font'
                            })
                        ])
                    })
                }));
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('loadFirstChildren', () => {
        it('should load first children', () => {
            // arrange
            const data = {
                children: [{
                    id: 'do-123'
                }]
            };
            // act
            chapterDetailsPage.loadFirstChildren(data);
            // assert
            expect(data.children.length).toBeGreaterThan(0);
        });
    });

    describe('joinTraining', () => {
    });

    it('should dismiss consentPii popup', () => {
        // arrange
        const dismissFn = jest.fn(() => Promise.resolve(true));
        chapterDetailsPage.loader = { data: '', dismiss: dismissFn } as any;
        // act
        chapterDetailsPage.onConsentPopoverShow();
        // assert
        setTimeout(() => {
            expect(chapterDetailsPage.loader).toBeUndefined();
            expect(dismissFn).toHaveBeenCalled();
        }, 0);
    });

    it('should dismiss consentPii popup, if no loader', () => {
        // arrange
        chapterDetailsPage.loader = undefined as any;
        // act
        chapterDetailsPage.onConsentPopoverShow();
        // assert
        expect(chapterDetailsPage.loader).toBeUndefined();
    });

    it('shoule invoked after consentPii popup dismissed', () => {
        chapterDetailsPage.onConsentPopoverDismiss();
    });

    describe('subscribeSdkEvent', () => {
        it('should set downloadProgress to 0', () => {
            //arrange
            const event = {
                type: DownloadEventType.PROGRESS,
                payload: {
                    progress: -1, identifier: 'do-123'
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('PROGRESS');
            expect(event.payload.progress).toBe(-1);
        });
        it('should set downloadProgress to 100', () => {
            //arrange
            const event = {
                type: DownloadEventType.PROGRESS,
                payload: {
                    progress: 100, identifier: 'do-123'
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('PROGRESS');
            expect(event.payload.identifier).toBe(chapterDetailsPage.identifier);
            expect(event.payload.progress).toBe(100);
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toBeCalled();
            }, 0);
        });
        it('should do when the event type is IMPORT_COMPLETED and download is not started', () => {
            //arrange
            const event = {
                type: ContentEventType.IMPORT_COMPLETED,
                payload: {
                    progress: -1, identifier: 'do-123'
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('IMPORT_COMPLETED');
            expect(chapterDetailsPage.isDownloadStarted).toBeFalsy();
        });
        it('should do when the event type is IMPORT_COMPLETED and download is started', () => {
            //arrange
            const event = {
                type: ContentEventType.IMPORT_COMPLETED,
                payload: {
                    progress: -1, identifier: 'do-123', contentId: 'do-123456'
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            chapterDetailsPage.isDownloadStarted = true;
            chapterDetailsPage.queuedIdentifiers = ['do-123456'] as any;
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('IMPORT_COMPLETED');
        });
        it('should do when the event type is SERVER_CONTENT_DATA', () => {
            //arrange
            const event = {
                type: ContentEventType.SERVER_CONTENT_DATA,
                payload: {
                    size: 20
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('SERVER_CONTENT_DATA');
        });
        it('should do when the event type is UPDATE', () => {
            //arrange
            const event = {
                type: ContentEventType.UPDATE,
                payload: { contentId: 'do-123' }
            };
            mockEventsBusService.events = jest.fn(() => of(event as any));
            mockZone.run = jest.fn((fn) => fn()) as any;
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('UPDATE');
            expect(mockZone.run).toHaveBeenCalled();
        });
        it('should do when the event type is IMPORT_PROGRESS', () => {
            //arrange
            const event = { type: ContentEventType.IMPORT_PROGRESS };
            chapterDetailsPage.courseContent.hierarchyInfo = 'info';
            mockEventsBusService.events = jest.fn(() => of(event as any));
            //act
            chapterDetailsPage.subscribeSdkEvent();
            //assert
            expect(mockEventsBusService.events).toHaveBeenCalled();
            expect(event.type).toBe('IMPORT_PROGRESS');
        });
    });
});