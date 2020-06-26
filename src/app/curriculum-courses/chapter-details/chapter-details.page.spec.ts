import { ChapterDetailsPage } from './chapter-details.page';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService, LocalCourseService } from '@app/services';
import { Router } from '@angular/router';
import {
    SharedPreferences, AuthService, CourseService, DownloadService,
    EventsBusService, ContentService, TelemetryObject
} from '@project-sunbird/sunbird-sdk';
import { PopoverController, Events, Platform } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { FileService } from '@project-sunbird/sunbird-sdk/util/file/def/file-service';
import { MimeType, EventTopics, RouterLinks, PreferenceKey } from '../../app.constant';
import { of, throwError } from 'rxjs';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '../../../services/telemetry-constants';

describe('ChapterDetailsPage', () => {
    let chapterDetailsPage: ChapterDetailsPage;
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
                        contentData: { name: 'sample-content-data', identifier: 'do-12345' }
                    },
                    isFromDeeplink: true
                }
            }
        })) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
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
    const mockFileSizePipe: Partial<FileService> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(() => of())
    };
    const mockZone: Partial<NgZone> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        chapterDetailsPage = new ChapterDetailsPage(
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockCourseService as CourseService,
            mockDownloadService as DownloadService,
            mockEventsBusService as EventsBusService,
            mockContentService as ContentService,
            mockAppHeaderService as AppHeaderService,
            mockTranslate as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockLoginHandlerService as LoginHandlerService,
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
            mockPlatform as Platform
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
                {}
            );

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
            mockAppHeaderService.headerEventEmitted$ = of(mockConfig);
            chapterDetailsPage.guestUser = false;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([
                {
                    batchId: 'sample-batch-id',
                    courseId: 'sample-course-id',
                    batch: {status: 1}
                }
            ]));
            jest.spyOn(chapterDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
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
            jest.spyOn(chapterDetailsPage, 'getContentsSize').mockImplementation(() => {
                return;
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
            chapterDetailsPage.guestUser = false;
            mockCourseService.getEnrolledCourses = jest.fn(() => of([]));
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
            jest.spyOn(chapterDetailsPage, 'getContentsSize').mockImplementation(() => {
                return;
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
        // act
        chapterDetailsPage.ionViewWillLeave();
        // assert
        expect(mockEvents.publish).toHaveBeenCalledWith('header:setzIndexToNormal');
    });

    it('ngOnDestroy', () => {
        mockEvents.unsubscribe = jest.fn();
        chapterDetailsPage.ngOnDestroy();
        expect(mockEvents.unsubscribe).toHaveBeenCalledWith(EventTopics.ENROL_COURSE_SUCCESS);
    });

    describe('getAllBatches', () => {

        beforeAll(() => {
            chapterDetailsPage = new ChapterDetailsPage(
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockTranslate as TranslateService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockLoginHandlerService as LoginHandlerService,
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
                mockPlatform as Platform
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
                batchId: 'sample-batch-id'
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
                batchId: 'sample-batch-id'
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
        it('should return courseStartDate if status is 0', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of({
                status: 0,
                startDate: '2020-06-02'
            })) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: chapterDetailsPage.courseContent.batchId });
                expect(mockZone.run).toHaveBeenCalled();
                expect(chapterDetailsPage.batchDetails).toStrictEqual({
                    status: 0,
                    startDate: '2020-06-02'
                });
                expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
                expect(chapterDetailsPage.courseStartDate.batchId).toBe(chapterDetailsPage.batchDetails.batchId);
                done();
            }, 0);
        });

        it('should return batch Expire date if status is 2', (done) => {
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
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: chapterDetailsPage.courseContent.batchId });
                expect(mockZone.run).toHaveBeenCalled();
                expect(chapterDetailsPage.batchDetails).toStrictEqual({
                    status: 2,
                    startDate: '2020-06-02'
                });
                expect(chapterDetailsPage.batchExp).toBeTruthy();
                done();
            }, 0);
        });

        it('should return null if response is undefined', (done) => {
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
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: chapterDetailsPage.courseContent.batchId });
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return null if status is > 2', (done) => {
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
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: chapterDetailsPage.courseContent.batchId });
                expect(mockZone.run).toHaveBeenCalled();
                expect(chapterDetailsPage.batchDetails).toStrictEqual({
                    status: 3,
                    startDate: '2020-06-02'
                });
                done();
            }, 0);
        });

        it('should handel error for catch part', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: 'sample-batch-id',
                batch: {staus: 1}
            };
            mockCourseService.getBatchDetails = jest.fn(() => throwError({ error: 'error' }));
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent).toBeTruthy();
                expect(chapterDetailsPage.courseContent.batchId).toBeTruthy();
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: chapterDetailsPage.courseContent.batchId });
                done();
            }, 0);
        });

        it('should return null if curseCard is undefined', (done) => {
            // arrange
            chapterDetailsPage.courseContent = {
                batchId: undefined
            };
            // act
            chapterDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(chapterDetailsPage.courseContent.batchId).toBeFalsy();
                done();
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
            expect(chapterDetailsPage.childContents).toStrictEqual([
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
                    {
                        id: 'do-123',
                        contentId: 'sample-content-id',
                        status: 2
                    }
                ]
            };

            chapterDetailsPage.childContents = [{
                identifier: 'sample-content-id'
            }];
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
                    {
                        id: 'do-123',
                        contentId: 'sample-content-id',
                        status: 2
                    }
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
                    {
                        id: 'do-123',
                        contentId: 'sample-content-id',
                        status: 2
                    }
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
        it('should return enrolled courses', (done) => {
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
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(chapterDetailsPage.isAlreadyEnrolled).toBeTruthy();
                expect(chapterDetailsPage.updatedCourseCardData).toStrictEqual(
                    {
                        courseId: 'sample-course-id'
                    }
                );
                expect(chapterDetailsPage.updatedCourseCardData.courseId).toEqual(chapterDetailsPage.courseContentData.identifier);
                expect(chapterDetailsPage.courseContent.batchId).toBe(mockData.batchId);
                done();
            }, 0);
        });
    });

    describe('startLearning', () => {
        it('should load FirstChildren', () => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [{ identifier: 'do-123' }];
            chapterDetailsPage.isBatchNotStarted = false;
            jest.spyOn(chapterDetailsPage, 'loadFirstChildren').mockImplementation(() => {
                return;
            });
            jest.spyOn(chapterDetailsPage, 'navigateToChildrenDetailsPage').mockImplementation(() => {
                return;
            });
            // act
            chapterDetailsPage.startLearning();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.START_CLICKED,
                Environment.HOME,
                PageId.CHAPTER_DETAILS,
                new TelemetryObject(chapterDetailsPage.childContents[0].identifier,
                    undefined, 'sample-pkg-ver'), undefined, undefined);
            expect(chapterDetailsPage.childContents.length).toBeGreaterThan(0);
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
        });

        it('should show toast message like COURSE_WILL_BE_AVAILABLE', () => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [{ identifier: 'do-123' }];
            chapterDetailsPage.isBatchNotStarted = true;
            mockDatePipe.transform = jest.fn(() => '2020-06-02');
            mockCommonUtilService.translateMessage = jest.fn(() => 'The batch is available from sunbird');
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.startLearning();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.START_CLICKED,
                Environment.HOME,
                PageId.CHAPTER_DETAILS,
                new TelemetryObject(chapterDetailsPage.childContents[0].identifier,
                    undefined, 'sample-pkg-ver'), undefined, undefined);
            expect(chapterDetailsPage.childContents.length).toBeGreaterThan(0);
            expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-02');
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('The batch is available from sunbird');
            expect(mockDatePipe.transform).toHaveBeenCalled();
        });

        it('should show toast message like COURSE_WILL_BE_AVAILABLE', () => {
            // arrnge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            chapterDetailsPage.childContents = [];
            chapterDetailsPage.isBatchNotStarted = true;
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.startLearning();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.START_CLICKED,
                Environment.HOME,
                PageId.CHAPTER_DETAILS,
                new TelemetryObject('do-123',
                    undefined, 'sample-pkg-ver'), undefined, undefined);
            expect(chapterDetailsPage.childContents.length).toBe(0);
            expect(chapterDetailsPage.isBatchNotStarted).toBeTruthy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_CONTENT_AVAILABLE_IN_MODULE');
        });
    });

    describe('continueLearning', () => {
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
            expect(chapterDetailsPage.nextContent).toStrictEqual({
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
            expect(chapterDetailsPage.nextContent).toStrictEqual(chapterDetailsPage.chapter);
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
            expect(chapterDetailsPage.nextContent).toStrictEqual(chapterDetailsPage.chapter.children[1]);
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
            expect(chapterDetailsPage.nextContent).toStrictEqual({
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
        it('should invoked joinTraining()', () => {
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
            jest.spyOn(chapterDetailsPage, 'joinTraining').mockImplementation(() => {
                return Promise.resolve();
            });
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
            // act
            chapterDetailsPage.openContentDetails(event);
            // assert
            expect(Object.keys(event.event).length).toBeGreaterThan(0);
            expect(chapterDetailsPage.courseContentData.contentData.createdBy).not.toEqual(chapterDetailsPage.userId);
            expect(chapterDetailsPage.isAlreadyEnrolled).toBeTruthy();
            expect(chapterDetailsPage.isBatchNotStarted).toBeFalsy();
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
    });

    describe('navigateToBatchListPage', () => {
        it('should invoked enrollIntoBatch', (done) => {
            // arrnge
            mockCommonUtilService.getLoader = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            chapterDetailsPage.batches = [{
                batchId: 'sample-batch-id'
            }];
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
                            upcommingBatches: [{ batchId: 'sample-batch-id', status: 2 }]
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
            mockCommonUtilService.showToast = jest.fn();
            // act
            chapterDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(chapterDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
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
    });

    describe('enrollIntoBatch', () => {
        beforeAll(() => {
            chapterDetailsPage = new ChapterDetailsPage(
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockTranslate as TranslateService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockLoginHandlerService as LoginHandlerService,
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
                mockPlatform as Platform
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
                expect(dismissFn).toHaveBeenCalled();
                expect(chapterDetailsPage.courseContent.batchId).toBe(items.id);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course enrolled');
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
                mockPreferences as SharedPreferences,
                mockAuthService as AuthService,
                mockCourseService as CourseService,
                mockDownloadService as DownloadService,
                mockEventsBusService as EventsBusService,
                mockContentService as ContentService,
                mockAppHeaderService as AppHeaderService,
                mockTranslate as TranslateService,
                mockCommonUtilService as CommonUtilService,
                mockRouter as Router,
                mockLoginHandlerService as LoginHandlerService,
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
                mockPlatform as Platform
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
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: true } }));
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
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockLoginHandlerService.signIn = jest.fn(() => Promise.resolve());
            // act
            chapterDetailsPage.promptToLogin(batchdetail);
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        sbPopoverMainTitle: 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL',
                        metaInfo: 'TRAININGS_ONLY_REGISTERED_USERS',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color'
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
                expect(mockLoginHandlerService.signIn).toHaveBeenCalled();
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
            const onDidDismissFn = jest.fn(() => Promise.resolve({ data: { canDelete: false } }));
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
                        sbPopoverMainTitle: 'YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL',
                        metaInfo: 'TRAININGS_ONLY_REGISTERED_USERS',
                        sbPopoverHeading: 'OVERLAY_SIGN_IN',
                        isNotShowCloseIcon: true,
                        actionsButtons: expect.arrayContaining([
                            expect.objectContaining({
                                btntext: 'OVERLAY_SIGN_IN',
                                btnClass: 'popover-color'
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
});
