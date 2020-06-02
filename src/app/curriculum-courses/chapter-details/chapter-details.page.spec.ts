import { ChapterDetailsPage } from './chapter-details.page';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService, LocalCourseService } from '@app/services';
import { Router } from '@angular/router';
import {
    SharedPreferences, AuthService, CourseService, DownloadService,
    EventsBusService, ContentService
} from '@project-sunbird/sunbird-sdk';
import { PopoverController, Events } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { FileService } from '@project-sunbird/sunbird-sdk/util/file/def/file-service';
import { MimeType, EventTopics } from '../../app.constant';
import { of, throwError } from 'rxjs';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';

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
                        { identifier: 'd0-13', mimeType: MimeType.VIDEO[0] }]
                    },
                    courseContent: {
                        name: 'course-content', identifier: 'do-123',
                        contentData: { name: 'sample-content-data', identifier: 'do-12345' }
                    },
                    isFromDeeplink: true,
                    courseCardData: {
                        batchId: 'sample-batch-id',
                        identifier: 'sample-course-id'
                    }
                }
            }
        })) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockDatePipe: Partial<DatePipe> = {};
    const mockDownloadService: Partial<DownloadService> = {};
    const mockEvents: Partial<Events> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockFileSizePipe: Partial<FileService> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockZone: Partial<NgZone> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

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
            mockSbProgressLoader as SbProgressLoader
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
            // act
            chapterDetailsPage.ngOnInit();
            // assert
            expect(mockDownloadService.trackDownloads).toHaveBeenCalled();
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
            chapterDetailsPage.guestUser = false;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([
                {
                    batchId: 'sample-batch-id',
                    courseId: 'sample-course-id'
                }
            ]));
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
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
            chapterDetailsPage.guestUser = false;
            mockCourseService.getEnrolledCourses = jest.fn(() => of([]));
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
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
            chapterDetailsPage.isFromDeeplink = false;
            chapterDetailsPage.guestUser = true;
            // act
            chapterDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
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
                mockFileSizePipe as FileSizePipe
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
            mockAuthService.getSession = jest.fn(() => of({userToken: 'sample-user-token'})) as any;
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
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getContentState = jest.fn(() => of({})) as any;
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(mockCourseService.getContentState).toHaveBeenCalled();
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return contentState for catch part', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getContentState = jest.fn(() => throwError({error: 'error'}));
            mockZone.run = jest.fn((fn) => fn());
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(mockCourseService.getContentState).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return contentState for catch part', (done) => {
            // arrange
            chapterDetailsPage.courseCardData = undefined;
            // act
            chapterDetailsPage.getContentState(true);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });
});
