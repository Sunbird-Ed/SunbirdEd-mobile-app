import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';
import {
    ProfileService, ContentService, EventsBusService, CourseService, SharedPreferences,
    AuthService, CorrelationData, TelemetryObject, FetchEnrolledCourseRequest,
    ProfileType, UnenrollCourseRequest, ContentDetailRequest, ServerProfileDetailsRequest, ServerProfile,
} from 'sunbird-sdk';
import {
    LoginHandlerService, CourseUtilService, AppGlobalService, TelemetryGeneratorService,
    CommonUtilService, UtilityService, AppHeaderService, ContentShareHandlerService,
    LocalCourseService, PageId, ID, InteractType
} from '../../services';
import { NgZone } from '@angular/core';
import { Events, PopoverController, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { Location } from '@angular/common';
import {
    mockEnrolledData, contentDetailsResponse, mockCourseCardData,
    mockGetChildDataResponse, mockImportContentResponse
} from './enrolled-course-details-page.spec.data';
import { of, Subject, throwError } from 'rxjs';
import { ContentInfo } from '../../services/content/content-info';
import { PreferenceKey, ProfileConstants } from '../app.constant';
import { isObject } from 'util';
import dayjs from 'dayjs';
import { SbPopoverComponent } from '../components/popups';
import { EnrollmentDetailsComponent } from '../components/enrollment-details/enrollment-details.component';

describe('EnrolledCourseDetailsPage', () => {
    let enrolledCourseDetailsPage: EnrolledCourseDetailsPage;
    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {
        importContent: jest.fn(() => of(mockImportContentResponse))
    };
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockCourseService: Partial<CourseService> = {
        getContentState: jest.fn(() => of('success'))
    };
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {
        signIn: jest.fn()
    };
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'SAMPLE_USER'),
        isUserLoggedIn: jest.fn(() => false),
        getGuestUserInfo: jest.fn(() => Promise.resolve('SAMPLE_GUEST_USER')),
        resetSavedQuizContent: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        deDupe: jest.fn(),
    };
    const mockDatePipe: Partial<DatePipe> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {};
    const mockLocation: Partial<Location> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockEnrolledData)
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockAppVersion: Partial<AppVersion> = {};

    beforeAll(() => {
        enrolledCourseDetailsPage = new EnrolledCourseDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventsBusService as EventsBusService,
            mockCourseService as CourseService,
            mockPreferences as SharedPreferences,
            mockLoginHandlerService as LoginHandlerService,
            mockZone as NgZone,
            mockEvents as Events,
            mockFileSizePipe as FileSizePipe,
            mockPopoverCtrl as PopoverController,
            mockCourseUtilService as CourseUtilService,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockDatePipe as DatePipe,
            mockUtilityService as UtilityService,
            mockHeaderService as AppHeaderService,
            mockContentShareHandler as ContentShareHandlerService,
            mockLocation as Location,
            mockRouter as Router,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockLocalCourseService as LocalCourseService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('enrolledCourseDetailsPage', () => {
        it('should create a instance of enrolledCourseDetailsPage', () => {
            expect(enrolledCourseDetailsPage).toBeTruthy();
        });
    });

    describe('ngOnInit()', () => {
        it('should get App name and subscribe utility service by invoked ngOnInit()', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('DIKSHA'));
            spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').and.returnValue('BASE_URL');
            // act
            enrolledCourseDetailsPage.ngOnInit();
            // assert
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.subscribeUtilityEvents).toHaveBeenCalled();
        });
    });

    describe('showDeletePopup()', () => {
        it('should show delete popup by invoked showDeletePopup()', () => {
            //  
            const contentDelete = new Subject<any>();
            mockContentDeleteHandler.contentDeleteCompleted$ = contentDelete.asObservable();
            mockContentDeleteHandler.showContentDeletePopup = jest.fn();
            const telemetry: TelemetryObject = {
                id: 'SAMPLE_ID',
                type: 'SAMPLE_TYPE',
                version: 'SAMPLE_VERSION',
                setRollup: jest.fn()
            };
            const data: CorrelationData[] = [{
                id: 'SAMPLE_ID',
                type: 'SAMPLE_TYPE'
            }];
            const contentInfo: ContentInfo = {
                telemetryObject: telemetry,
                rollUp: {},
                correlationList: data,
                hierachyInfo: undefined
            };
            // act
            enrolledCourseDetailsPage.showDeletePopup();
            // assert
            expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
        });
    });

    describe('subscribeUtilityEvents()', ()=> {
        it('#subscribeUtilityEvents should handle error condition', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.reject(true));
            mockEvents.subscribe = jest.fn(() => ({ batchId: 'SAMPLE_BATCH_ID', courseId: 'SAMPLE_COURSE_ID' }));
            spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseList').and.stub();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // assert
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // act
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.baseUrl).toBe('');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    
        it('should update courseCard data and return base url by invoked subscribeUtilityEvents()', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ batchId: 'SAMPLE_BATCH_ID', courseId: 'SAMPLE_COURSE_ID' }));
            spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseList').and.stub();
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR' };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement: {
                    classList: { remove: jest.fn(), add: jest.fn() }
                }
            };
            mockCommonUtilService.getLoader = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
            spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.updateEnrolledCourseList).toBeCalled();
                expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.joinTraining).toBeCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('updateEnrolledCourseList', () => {
        it('should update enroll details list by invoked updateEnrolledCourseList()', () => {
            // arrange
            const userDetails = mockAppGlobalService.getUserId = jest.fn(() => 'SAMPLE_USER_ID');
            const fetchEnrolledCourseRequest: FetchEnrolledCourseRequest = {
                userId: 'SAMPLE_USER_ID'
            };
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{}]));
            mockZone.run = jest.fn((fn) => fn());
            // act
            enrolledCourseDetailsPage.updateEnrolledCourseList(mockEnrolledData.extras.state.content);
            // assert
            expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
            expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
        });
    });

    describe('extractApiResponse()', () => {
        it('should return last played content and license', () => {
            // assert
            const response = contentDetailsResponse;
            spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
            spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
            spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
            spyOn(enrolledCourseDetailsPage, 'setChildContents');
            enrolledCourseDetailsPage.courseCardData = { lastReadContentId: 'SAMPLE_LAST_READ_CONTENT' };
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.extractApiResponse(response);
            // assert
            expect(enrolledCourseDetailsPage.generateImpressionEvent).toBeCalled();
            expect(enrolledCourseDetailsPage.generateStartEvent).toBeCalled();
            expect(response.contentData.status).not.toBe('Live');
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
            expect(response.contentData.me_totalRatingsCount).toBe(4);
            expect(mockLocation.back).toHaveBeenCalled();
        });
    
        it('should return import content if data is not available for extractApiResponse', () => {
            // assert
            const response = mockEnrolledData.extras.state.content;
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
            enrolledCourseDetailsPage.didViewLoad = true;
            mockHeaderService.hideHeader = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'importContent').and.stub();
            spyOn(enrolledCourseDetailsPage, 'setCourseStructure').and.stub();
            // act
            enrolledCourseDetailsPage.extractApiResponse(response);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
            expect(mockLocation.back).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.didViewLoad).toBeTruthy();
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        });
    });
    describe('checkCurrentUserType', () => {
        it('should checked current user type for cath part by invoked checkCurrentUserType()', () => {
            // arrange
            mockAppGlobalService.getGuestUserInfo = jest.fn(() => Promise.reject('SAMPLE_USER'));
            // act
            enrolledCourseDetailsPage.checkCurrentUserType();
            // assert
            expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
        });
    });

    describe('joinTraining()', () => {
        it('should be joined training for logged in user', async (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ canDelete: '' }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').and.stub();
            // act
            enrolledCourseDetailsPage.joinTraining();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('rateContent()', () => {
        it('should show user rating for content if not guest user', () => {
            // arrange
            enrolledCourseDetailsPage.guestUser = false;
            contentDetailsResponse.contentData['isAvailableLocally'] = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            expect(contentDetailsResponse.contentData['isAvailableLocally']).toBeTruthy();
            expect(enrolledCourseDetailsPage.guestUser).toBeFalsy();
        });
    
        it('should show user rating for content if content is not available locally', () => {
            // arrange
            enrolledCourseDetailsPage.guestUser = false;
            contentDetailsResponse.contentData['isAvailableLocally'] = false;
            mockCommonUtilService.showToast = jest.fn(() => 'try before rating');
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            expect(contentDetailsResponse.contentData['isAvailableLocally']).toBeFalsy();
            expect(enrolledCourseDetailsPage.guestUser).toBeFalsy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('TRY_BEFORE_RATING');
        });
    
        it('should show user rating for content for guest user', () => {
            // arrange
            enrolledCourseDetailsPage.guestUser = true;
            enrolledCourseDetailsPage.profileType = ProfileType.TEACHER;
            mockCommonUtilService.showToast = jest.fn(() => 'signin to use feature');
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            expect(enrolledCourseDetailsPage.guestUser).toBeTruthy();
            expect(enrolledCourseDetailsPage.profileType).toBe(ProfileType.TEACHER);
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SIGNIN_TO_USE_FEATURE');
        });
    });

    describe('showOverflowMenu()', () => {
        it('should show traning leave popover by invoked showOverflowMenu()', (done) => {
            // arrange
            const event = {};
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            // act
            enrolledCourseDetailsPage.showOverflowMenu(event);
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(onDidDismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('handleUnenrollment()', () => {
        it('should handle unenrolled for enrolled course', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.batchDetails = {
                id: '',
                courseId: ''
            };
            mockZone.run = jest.fn((fn) => fn());
            const unenrolCourseRequest: UnenrollCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                courseId: enrolledCourseDetailsPage.batchDetails.courseId,
                batchId: enrolledCourseDetailsPage.batchDetails.id
            };
            mockCourseService.unenrollCourse = jest.fn(() => of(true));
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.handleUnenrollment(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCourseService.unenrollCourse).toHaveBeenCalledWith(unenrolCourseRequest);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle unenrolled for enrolled course for error part of UNENROL_COURSE_SUCCESS', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.batchDetails = {
                id: '',
                courseId: ''
            };
            mockZone.run = jest.fn((fn) => fn());
            const unenrolCourseRequest: UnenrollCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                courseId: enrolledCourseDetailsPage.batchDetails.courseId,
                batchId: enrolledCourseDetailsPage.batchDetails.id
            };
            mockCourseService.unenrollCourse = jest.fn(() => throwError(''));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            // act
            enrolledCourseDetailsPage.handleUnenrollment(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCourseService.unenrollCourse).toHaveBeenCalledWith(unenrolCourseRequest);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('UNENROL_COURSE_SUCCESS', {});
                done();
            }, 0);
        });
    
        it('should handle unenrolled for enrolled course for error part of ERROR_NO_INTERNET_MESSAGE', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.batchDetails = {
                id: '',
                courseId: ''
            };
            mockZone.run = jest.fn((fn) => fn());
            const unenrolCourseRequest: UnenrollCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                courseId: enrolledCourseDetailsPage.batchDetails.courseId,
                batchId: enrolledCourseDetailsPage.batchDetails.id
            };
            mockCourseService.unenrollCourse = jest.fn(() => throwError({ error: 'CONNECTION_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.handleUnenrollment(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCourseService.unenrollCourse).toHaveBeenCalledWith(unenrolCourseRequest);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('');
                done();
            }, 0);
        });
    });

    describe('setContentDetails()', () => {
        it('should return content details for extractApiResponse by called setContentDetails()', (done) => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockZone.run = jest.fn((fn) => fn());
            spyOn(enrolledCourseDetailsPage, 'extractApiResponse').and.stub();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
                done();
            }, 0);
        });
    
        it('should not return content details for networkError  by called setContentDetails()', (done) => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            mockContentService.getContentDetails = jest.fn(() => throwError(contentDetailsResponse));
            mockCommonUtilService.showToast = jest.fn(() => 'Error fetching data');
            mockLocation.back = jest.fn();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getBatchDetails()', () => {
        it('should return course batch details of expire date start date by invoked getBatchDetails() for identifier', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.COURSE_IDENTIFIER,
                status: 2
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').and.stub();
            spyOn(enrolledCourseDetailsPage, 'saveContentContext').and.stub();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith(enrolledCourseDetailsPage.courseCardData);
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.COURSE_IDENTIFIER);
                done();
            }, 0);
        });
    
        it('should return course batch details of expire date start date by invoked getBatchDetails() for status 2', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.DEPLOYMENT_KEY,
                status: 2
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').and.stub();
            spyOn(enrolledCourseDetailsPage, 'saveContentContext').and.stub();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith(enrolledCourseDetailsPage.courseCardData);
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.COURSE_IDENTIFIER);
                done();
            }, 0);
        });
    
        it('should return course batch details of expire date start date by invoked getBatchDetails() for status zero', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.DEPLOYMENT_KEY,
                status: 0
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').and.stub();
            spyOn(enrolledCourseDetailsPage, 'saveContentContext').and.stub();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith(enrolledCourseDetailsPage.courseCardData);
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.COURSE_IDENTIFIER);
                done();
            }, 0);
        });
    
        it('should saved content context by invoked getBatchDetails() for catch part', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.COURSE_IDENTIFIER,
                status: 2
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id',
                batch: 'SAMPLE_BATCH'
            };
            mockCourseService.getBatchDetails = jest.fn(() => throwError(enrolledCourseDetailsPage.batchDetails));
            spyOn(enrolledCourseDetailsPage, 'saveContentContext').and.stub();
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith({ batchId: enrolledCourseDetailsPage.courseCardData.batchId });
                done();
            }, 0);
        });
    });

    describe('openBrowser()', () => {
        it('should open a url in Browser by invoked()', () => {
            // arrange
            mockCommonUtilService.openUrlInBrowser = jest.fn();
            // act
            enrolledCourseDetailsPage.openBrowser('url');
            // assert
            expect(mockCommonUtilService.openUrlInBrowser).toHaveBeenCalled();
        });
    });

    describe('saveContentContext()', () => {
        it('should saved context of content by invoked saveContentContext()', () => {
            // arrange
            const userId = 'sample-user-id';
            const courseId = 'course-card';
            const batchId = 'sample-batch-id';
            const batchStatus = 2;
            mockPreferences.putString = jest.fn(() => of());
            // act
            enrolledCourseDetailsPage.saveContentContext(userId, courseId, batchId, batchStatus);
            // assert
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.CONTENT_CONTEXT, expect.any(String));
            expect(Boolean(batchStatus)).toBeTruthy();
        });
    });

    describe('getBatchCreatorName()', () => {
        it('should return batch creator name by invoked getBatchCreatorName()', () => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                createdBy: 'sample-creator',
                creatorFirstName: '',
                creatorLastName: ''
            };
            const req: ServerProfileDetailsRequest = {
                userId: enrolledCourseDetailsPage.batchDetails.createdBy,
                requiredFields: ProfileConstants.REQUIRED_FIELDS
            };
            const respones: Partial<ServerProfile> = {
                firstName: 'F_NAME',
                lastName: 'L_NAME'
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(respones));
            // act
            enrolledCourseDetailsPage.getBatchCreatorName();
            // assert
            expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(req);
        });
    });

    describe('setCourseStructure()', () => {
        it('should be set course structure if contentTypesCount is not object for course', () => {
            // arrange
            enrolledCourseDetailsPage.course = {
                contentTypesCount: 'course'
            };
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return enrolledCourseDetailsPage.course.contentTypesCount;
            });
            // act
            enrolledCourseDetailsPage.setCourseStructure();
            // assert
            expect(isObject(enrolledCourseDetailsPage.course.contentTypesCount)).toBeFalsy();
        });
    
        it('should be set course structure if contentTypesCount is object for course', () => {
            // arrange
            enrolledCourseDetailsPage.course = {
                contentTypesCount: {}
            };
            // act
            enrolledCourseDetailsPage.setCourseStructure();
            // assert
            expect(isObject(enrolledCourseDetailsPage.course.contentTypesCount)).toBeTruthy();
        });
    
        it('should be set course structure if contentTypesCount is not object for courseCard', () => {
            // arrange
            enrolledCourseDetailsPage.course = {
            };
            enrolledCourseDetailsPage.courseCardData = {
                contentTypesCount: 'sample-content-count'
            };
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return enrolledCourseDetailsPage.courseCardData.contentTypesCount;
            });
            // act
            enrolledCourseDetailsPage.setCourseStructure();
            // assert
            expect(isObject(enrolledCourseDetailsPage.course.contentTypesCount)).toBeFalsy();
        });
    });

    describe('getImportContentRequestBody()', () => {
        it('should get import content body by invoked getImportContentRequestBody()', () => {
            // arrange
            const identifiers = ['do_101', 'do_102', 'do_103'];
            // act
            enrolledCourseDetailsPage.getImportContentRequestBody(identifiers, true);
            // asert
            expect(identifiers.length).toBeGreaterThan(0);
        });
    });

    describe('refreshHeader()',() => {
        it('should refreshed header for refreshHeader()', () => {
            // arrange
            mockEvents.publish = jest.fn();
            // act
            enrolledCourseDetailsPage.refreshHeader();
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith('header:setzIndexToNormal');
        });
    });

    // it('should be imported all contents', (done) => {
    //     // arrange
    //     const identifiers = ['do_101'];
    //     const isChild = true;
    //     const isDownloadAllClicked = true;
    //     const contentImportedData = [{
    //         isChildContent: true,
    //         destinationFolder: 'sampke-destination-folder',
    //         contentId: 'do_101'
    //     }];
    //     const option: ContentImportRequest = {
    //         contentImportArray: contentImportedData,
    //         contentStatusArray: ['Live'],
    //         fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    //       };
    //     mockContentService.importContent = jest.fn(() => of([]));
    //     // act
    //     enrolledCourseDetailsPage.importContent(identifiers, isChild, isDownloadAllClicked);
    //     // assert
    //     setTimeout(() => {
    //         expect(mockContentService.importContent).toHaveBeenCalledWith(option);
    //         done();
    //     }, 0);
    // });

    describe('showDownloadConfirmationAlert()', () => {
        it('should show DownloadConfirmation Popup', () => {
            // arrange
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockFileSizePipe.transform = jest.fn();
            mockDatePipe.transform = jest.fn();
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            enrolledCourseDetailsPage.downloadIdentifiers = new Set(['do_12345']);
            // act
            enrolledCourseDetailsPage.showDownloadConfirmationAlert();
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
        });
    });

    describe('getContentsSize()', () => {
        it('should populate downloadIdentifiers', () => {
            // arrange
            // act
            enrolledCourseDetailsPage.getContentsSize(mockGetChildDataResponse);
            // assert
            expect(enrolledCourseDetailsPage.downloadIdentifiers.size).toEqual(4);
        });
    });

    describe('importContent()', () => {
        it('should populate queuedIdentifiers', () => {
            // arrange
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, true);
            // assert
            expect(enrolledCourseDetailsPage.queuedIdentifiers).toEqual(['do_21274246255366963214046', 'do_21274246302428364814048']);
        });
    });


    describe('promptToLogin()', () => {
        it('should show the Login Popup', () => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ canDelete: '' }))
            } as any)));
            // act
            enrolledCourseDetailsPage.promptToLogin({});
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith(
                {
                    component: SbPopoverComponent,
                    componentProps: {
                        actionsButtons: [
                            {
                                btnClass: 'popover-color',
                                btntext: '',
    
                            },
    
                        ],
                        isNotShowCloseIcon: true,
                        metaInfo: '',
                        sbPopoverHeading: '',
                        sbPopoverMainTitle: '',
    
                    },
                    cssClass: 'sb-popover info',
                });
        });
    
        it('should invoke LoginHandler signin method', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            jest.spyOn(mockLoginHandlerService, 'signIn');
            // act
            enrolledCourseDetailsPage.promptToLogin({ batchId: '0123456' });
            // assert
    
            setTimeout(() => {
                expect(mockLoginHandlerService.signIn).toHaveBeenCalled();
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                done();
            }, 0);
    
        });
    });

    describe('populateCorRelationData()', () => {
        it('should populate correlationData', () => {
            // arrange
            enrolledCourseDetailsPage.corRelationList = undefined;
            jest.spyOn(mockCommonUtilService, 'deDupe').mockReturnValue([{ id: '', type: 'CourseBatch'}]);
            // act
            enrolledCourseDetailsPage.populateCorRelationData(undefined);
            // assert
            expect(enrolledCourseDetailsPage.corRelationList).toEqual([{ id: '', type: 'CourseBatch'}]);
    
        });
    });

    describe('showLicensce()', () => {
        it('should show license true when user clicked on credits and license', () => {
            // arrange
            enrolledCourseDetailsPage.showCredits = false;
            jest.spyOn(enrolledCourseDetailsPage, 'licenseSectionClicked').mockImplementation();
            // act
            enrolledCourseDetailsPage.showLicensce();
            // assert
            expect(enrolledCourseDetailsPage.licenseSectionClicked).toHaveBeenCalledWith('expanded');
        });
    
        it('should not show license when user clicked on license and credits', () => {
            // arrange
            enrolledCourseDetailsPage.showCredits = true;
            jest.spyOn(enrolledCourseDetailsPage, 'licenseSectionClicked').mockImplementation();
            // act
            enrolledCourseDetailsPage.showLicensce();
            // assert
            expect(enrolledCourseDetailsPage.licenseSectionClicked).toHaveBeenCalledWith('collapsed');
        });
    });

    describe('licenseSectionClicked()', () => {
        it('should generate telemetry license expanded when licenseSectionClicked()', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.licenseSectionClicked('expanded');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.LICENSE_CARD_EXPANDED,
                '',
                undefined,
                PageId.COURSE_DETAIL,
                {id: 'do_21281258639073280011490', type: 'Course', version: '2'},
                undefined,
                enrolledCourseDetailsPage.objRollup,
                [{id: '', type: 'CourseBatch'}],
                ID.LICENSE_CARD_CLICKED
            );
        });

        it('should generate telemetry license collapsed when licenseSectionClicked()', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.licenseSectionClicked('collapsed');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.LICENSE_CARD_COLLAPSED,
                '',
                undefined,
                PageId.COURSE_DETAIL,
                {id: 'do_21281258639073280011490', type: 'Course', version: '2'},
                undefined,
                enrolledCourseDetailsPage.objRollup,
                [{id: '', type: 'CourseBatch'}],
                ID.LICENSE_CARD_CLICKED
            );
        });
    });

    describe('getContentState()', () => {
        it('check', (done) => {
            //arrange
            const contentState = {
                contentList: [
                    {
                        status: 1
                    }, {
                        status: 2
                    }
                ]
            };
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            jest.spyOn(mockCourseService, 'getContentState').mockReturnValue(of(contentState));
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.courseCardData.progress).toEqual(1);
                done();
            }, 0);
        });
    });
});
