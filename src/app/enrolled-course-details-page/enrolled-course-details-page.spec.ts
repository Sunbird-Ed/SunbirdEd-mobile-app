import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';
import {
    ProfileService, ContentService, EventsBusService, CourseService, SharedPreferences,
    AuthService, CorrelationData, TelemetryObject, FetchEnrolledCourseRequest,
    ProfileType, UnenrollCourseRequest, ContentDetailRequest, ServerProfileDetailsRequest, ServerProfile,
    NetworkError, DownloadService
} from 'sunbird-sdk';
import {
    LoginHandlerService, CourseUtilService, AppGlobalService, TelemetryGeneratorService,
    CommonUtilService, UtilityService, AppHeaderService,
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
    mockGetChildDataResponse, mockImportContentResponse, mockEnrolledCourses,
    mockCourseCardData_2, mockcontentHirerachyResponse
} from './enrolled-course-details-page.spec.data';
import { of, Subject, throwError } from 'rxjs';
import { ContentInfo } from '../../services/content/content-info';
import { PreferenceKey, ProfileConstants, EventTopics } from '../app.constant';
import { isObject } from 'util';
import { SbPopoverComponent } from '../components/popups';
import { Mode, Environment, ImpressionType, InteractSubtype } from '../../services/telemetry-constants';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { MimeType } from '../app.constant';
import { GroupService } from '@project-sunbird/sunbird-sdk';

describe('EnrolledCourseDetailsPage', () => {
    let enrolledCourseDetailsPage: EnrolledCourseDetailsPage;
    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {
        importContent: jest.fn(() => of(mockImportContentResponse)),
        getChildContents: jest.fn(),
        cancelDownload: jest.fn(),
        getContentHeirarchy: jest.fn()
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        events: jest.fn()
    };
    const mockCourseService: Partial<CourseService> = {
        getContentState: jest.fn(() => of('success')),
        getCourseBatches: jest.fn()
    };
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockDownloadService: Partial<DownloadService> = {};
    const mockGroupService: Partial<GroupService> = {};
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({}))
    };
    const mockLoginHandlerService: Partial<LoginHandlerService> = {
        signIn: jest.fn()
    };
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {
        showCredits: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'SAMPLE_USER'),
        isUserLoggedIn: jest.fn(() => false),
        getGuestUserInfo: jest.fn(() => Promise.resolve('SAMPLE_GUEST_USER')),
        resetSavedQuizContent: jest.fn(),
        setEnrolledCourseList: jest.fn(),
        getEnrolledCourseList: jest.fn(() => mockEnrolledCourses)
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateCancelDownloadTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn(),
        generatefastLoadingTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        deDupe: jest.fn(),
        translateMessage: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        }
    };
    const mockDatePipe: Partial<DatePipe> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockEnrolledData),
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => mockEnrolledData) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {
        prepareEnrollCourseRequest: jest.fn(),
        enrollIntoBatch: jest.fn(),
        prepareRequestValue: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        enrolledCourseDetailsPage = new EnrolledCourseDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventsBusService as EventsBusService,
            mockCourseService as CourseService,
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockDownloadService as DownloadService,
            mockGroupService as GroupService,
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
            mockLocation as Location,
            mockRouter as Router,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockLocalCourseService as LocalCourseService,
            mockSbProgressLoader as SbProgressLoader
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
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
            mockDownloadService.trackDownloads = jest.fn(() => of());
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
            // arrange
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

    describe('subscribeUtilityEvents()', () => {
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
            expect(response.contentData.me_averageRating).toBe(4);
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
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.extractApiResponse(response);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
            expect(mockLocation.back).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.didViewLoad).toBeTruthy();
        });
    });
    describe('checkCurrentUserType', () => {
        it('should checked current user type for cath part by invoked checkCurrentUserType()', () => {
            // arrange
            enrolledCourseDetailsPage.guestUser = true;
            mockAppGlobalService.getGuestUserInfo = jest.fn(() => Promise.reject('SAMPLE_USER'));
            // act
            enrolledCourseDetailsPage.checkCurrentUserType();
            // assert
            expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
        });
    });

    describe('joinTraining()', () => {
        it('should show error toast if no batches available', async (done) => {
            // arrange
            enrolledCourseDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            // act
            await enrolledCourseDetailsPage.joinTraining();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
            done();
        });

        it('should show error toast if single enrolment expired batch', async (done) => {
            // arrange
            enrolledCourseDetailsPage.batches = [{
                enrollmentEndDate: '2020-04-23'
            }];
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn((v) => v);
            // act
            await enrolledCourseDetailsPage.joinTraining();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ENROLLMENT_ENDED_ON', null, null, null, null, '2020-04-23');
            done();
        });

        it('should be joined training for logged in user', async (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ canDelete: '' }))
            } as any)));
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').and.stub();
            spyOn(mockCourseService, 'getBatchDetails').and.stub();
            enrolledCourseDetailsPage.batches = [{}, {}];
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

        it('should show user rating for content for guest user', (done) => {
            // arrange
            enrolledCourseDetailsPage.guestUser = true;
            enrolledCourseDetailsPage.profileType = ProfileType.TEACHER;
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            mockCommonUtilService.showToast = jest.fn(() => 'signin to use feature');
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.guestUser).toBeTruthy();
                expect(enrolledCourseDetailsPage.profileType).toBe(ProfileType.TEACHER);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SIGNIN_TO_USE_FEATURE');
                expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
                done();
            }, 0);
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
            contentDetailsResponse.isAvailableLocally = false;
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            jest.spyOn(mockContentService, 'getContentHeirarchy').mockReturnValue(of(mockcontentHirerachyResponse));
            mockZone.run = jest.fn((fn) => fn());
            spyOn(enrolledCourseDetailsPage, 'extractApiResponse').and.stub();
            spyOn(enrolledCourseDetailsPage, 'getContentState').and.stub();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toBeCalled();
                expect(enrolledCourseDetailsPage.getContentState).toBeCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should fail getContentHeirarchy() response', (done) => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = false;
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockZone.run = jest.fn((fn) => fn());
            spyOn(enrolledCourseDetailsPage, 'extractApiResponse').and.stub();
            spyOn(enrolledCourseDetailsPage, 'getContentState').and.stub();
            jest.spyOn(mockContentService, 'getContentHeirarchy').mockReturnValue(of(Promise.reject({})));
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toBeCalled();
                expect(enrolledCourseDetailsPage.getContentState).not.toBeCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should fail getContentHeirarchy() response', (done) => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = true;
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockZone.run = jest.fn((fn) => fn());
            spyOn(enrolledCourseDetailsPage, 'extractApiResponse').and.stub();
            jest.spyOn(mockContentService, 'getContentHeirarchy');
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).not.toBeCalled();
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
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith(
                    { batchId: enrolledCourseDetailsPage.courseCardData.batchId });
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
            enrolledCourseDetailsPage.courseHeirarchy = {
                contentData: {
                    leafNodes: ['node1']
                }
            };
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
                creatorDetails: {
                    firstName: '',
                    lastName: ''
                }
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

    describe('refreshHeader()', () => {
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

        it('should populate queuedIdentifiers', (done) => {
            // arrange
            const data = mockImportContentResponse;
            data[0].status = -1;
            mockContentService.importContent = jest.fn(() => of(data));
            enrolledCourseDetailsPage.isDownloadStarted = true;
            enrolledCourseDetailsPage.queuedIdentifiers = [];
            enrolledCourseDetailsPage.faultyIdentifiers = [
                {}
            ];
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, false);
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(mockCommonUtilService.showToast).toBeCalledWith('UNABLE_TO_FETCH_CONTENT');
                done();
            }, 0);
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
            jest.spyOn(mockCommonUtilService, 'deDupe').mockReturnValue([{ id: '', type: 'CourseBatch' }]);
            // act
            enrolledCourseDetailsPage.populateCorRelationData(undefined);
            // assert
            expect(enrolledCourseDetailsPage.corRelationList).toEqual([{ id: '', type: 'CourseBatch' }]);

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
                { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                undefined,
                enrolledCourseDetailsPage.objRollup,
                [{ id: '', type: 'CourseBatch' }],
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
                { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                undefined,
                enrolledCourseDetailsPage.objRollup,
                [{ id: '', type: 'CourseBatch' }],
                ID.LICENSE_CARD_CLICKED
            );
        });
    });

    describe('getContentState()', () => {
        it('check', (done) => {
            // arrange
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
                expect(enrolledCourseDetailsPage.courseCardData.progress).toBeUndefined();
                done();
            }, 0);
        });
    });

    describe('handleHeaderEvents()', () => {
        it('should call share()', () => {
            // arrange
            const event = {
                name: 'share'
            };
            jest.spyOn(enrolledCourseDetailsPage, 'share');
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
            expect(enrolledCourseDetailsPage.share).toBeCalled();
        });

        it('should call showOverflowMenu()', () => {
            // arrange
            const event = {
                name: 'more'
            };
            jest.spyOn(enrolledCourseDetailsPage, 'showOverflowMenu');
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
            expect(enrolledCourseDetailsPage.showOverflowMenu).toBeCalled();
        });

        it('should call handleNavBackButton() and goBack()', () => {
            // arrange
            const event = {
                name: 'back'
            };
            spyOn(enrolledCourseDetailsPage, 'handleNavBackButton').and.stub();
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
            expect(enrolledCourseDetailsPage.handleNavBackButton).toBeCalled();
        });
    });

    describe('enrollIntoBatch()', () => {
        it('should call promptToLogin()', () => {
            // arrange
            const batch = {
                id: '121232312'
            };
            jest.spyOn(enrolledCourseDetailsPage, 'promptToLogin');
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            expect(enrolledCourseDetailsPage.promptToLogin).toBeCalled();
        });

        it('should should successfuly enroll', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            enrolledCourseDetailsPage.guestUser = false;
            spyOn(mockLocalCourseService, 'prepareEnrollCourseRequest').and.stub();
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of({ value: 'asdasds' }));
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            expect(mockLocalCourseService.prepareEnrollCourseRequest).toBeCalled();
            setTimeout(() => {
                expect(presentFn).toBeCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
                expect(mockCommonUtilService.translateMessage).toBeCalledWith('COURSE_ENROLLED');
                expect(mockEvents.publish).toBeCalled();
                expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(true);
                done();
            }, 0);
        });

        it('should should fail', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            enrolledCourseDetailsPage.guestUser = false;
            spyOn(mockLocalCourseService, 'prepareEnrollCourseRequest').and.stub();
            jest.spyOn(mockLocalCourseService, 'enrollIntoBatch').mockReturnValue(of(Promise.reject()));
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            expect(mockLocalCourseService.prepareEnrollCourseRequest).toBeCalled();
            setTimeout(() => {
                expect(presentFn).toBeCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
                expect(dismissFn).toBeCalled();
                expect(enrolledCourseDetailsPage.loader).toBeUndefined();
                done();
            }, 0);
        });
    });

    describe('onSegmentChange()', () => {
        it('should call generateInteractTelemetry()', () => {
            // act
            enrolledCourseDetailsPage.onSegmentChange({
                detail: {
                    value: 'value'
                }
            });
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
        });
    });

    describe('handleUnenrollButton()', () => {
        it('should set showUnenrollButton to true', () => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                status: 1,
                enrollmentType: 'open'
            };
            enrolledCourseDetailsPage.courseCardData = {
                status: 0
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            };
            // act
            enrolledCourseDetailsPage.handleUnenrollButton();
            // assert
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(true);
        });

        it('should be set updatedCourseCardData and set showUnenrollButton to true', () => {
            // arrange
            enrolledCourseDetailsPage.updatedCourseCardData = {
                status: 0
            };
            enrolledCourseDetailsPage.batchDetails = {
                status: 1,
                enrollmentType: 'open'
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            };
            // act
            enrolledCourseDetailsPage.handleUnenrollButton();
            // assert
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(true);
        });

        it('should set showUnenrollButton to false', () => {
            // arrange
            enrolledCourseDetailsPage.updatedCourseCardData = {
                status: 0
            };
            enrolledCourseDetailsPage.batchDetails = {
                status: 1,
                enrollmentType: 'invite-only'
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            };
            // act
            enrolledCourseDetailsPage.handleUnenrollButton();
            // assert
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(false);
        });
    });

    describe('mergeProperties()', () => {
        it('should show all properties merged', () => {
            // arrange
            enrolledCourseDetailsPage.course = {
                prop1: 'prop1',
                prop2: 'prop2'
            };
            // act
            const returnVal = enrolledCourseDetailsPage.mergeProperties(['prop1', 'prop2']);
            // assert
            expect(returnVal).toEqual('prop1, prop2');
        });
    });

    describe('setChildContents()', () => {
        it('should fetch child contents ', (done) => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: '123123123'
            };
            mockContentService.getChildContents = jest.fn(() => of({
                id: 'do-123',
                children: [{ id: 'do-1-123' }]
            }));
            mockZone.run = jest.fn((fn) => fn());
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample-batch-id'
            };
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            jest.spyOn(enrolledCourseDetailsPage, 'getContentsSize').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.setChildContents();
            // assert
            setTimeout(() => {
                expect(mockContentService.getChildContents).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.getContentState).toBeCalledWith(true);
                expect(enrolledCourseDetailsPage.getContentsSize).toBeCalledWith([{ id: 'do-1-123' }]);
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                    id: 'do-123',
                    children: [{ id: 'do-1-123' }]
                });
                done();
            }, 0);
        });

        it('should setshowChildrenLoader to false', (done) => {
            // arrange
            const data = {
                mimeType: 'content',
                children: [],
                identifier: 'do_1212123123'
            };
            mockContentService.getChildContents = jest.fn(() => throwError({ error: 'error' }));
            mockZone.run = jest.fn((fn) => fn());
            // act
            enrolledCourseDetailsPage.setChildContents();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showChildrenLoader).toEqual(false);
                expect(mockContentService.getChildContents).toHaveBeenCalled();
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getAllBatches()', () => {
        it('should fetch all batch list', (done) => {
            // arrange
            const data = [
                {
                    enrollmentEndDate: '01/01/2020'
                },
                {
                    enrollmentEndDate: '01/01/2020'
                }
            ];
            spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton');
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(of(data));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.handleUnenrollButton).toBeCalled();
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(false);
                expect(enrolledCourseDetailsPage.batchCount).toEqual(data.length);
                expect(enrolledCourseDetailsPage.batches).toEqual(data);
                done();
            }, 0);
        });

        it('should contain only 1 batch', (done) => {
            // arrange
            const data = [
                {
                    enrollmentEndDate: '01/01/2020',
                    endDate: '05/01/2020'
                }
            ];
            spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton');
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(of(data));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.handleUnenrollButton).toBeCalled();
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(false);
                expect(enrolledCourseDetailsPage.batchEndDate).toEqual(data[0].endDate);
                expect(enrolledCourseDetailsPage.enrollmentEndDate).toEqual(data[0].enrollmentEndDate);
                done();
            }, 0);
        });

        it('should display offline mode', (done) => {
            // arrange
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(of(Promise.reject(new NetworkError())));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(true);
                done();
            }, 0);
        });
        it('should not display offline mode', (done) => {
            // arrange
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(of(Promise.reject({ error: 'SOME_ERROR' })));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(false);
                done();
            }, 0);
        });
    });

    describe('toggleGroup()', () => {
        it('should show group', () => {
            // arrange
            enrolledCourseDetailsPage.shownGroup = null;
            // act
            enrolledCourseDetailsPage.toggleGroup(0, {});
            // assert
            expect(enrolledCourseDetailsPage.shownGroup).toEqual(0);
        });
        it('should not show group', () => {
            // arrange
            enrolledCourseDetailsPage.shownGroup = 1;
            // act
            enrolledCourseDetailsPage.toggleGroup(1, {});
            // assert
            expect(enrolledCourseDetailsPage.shownGroup).toEqual(null);
        });
    });

    describe('cancelDownload()', () => {
        it('should display header', (done) => {
            // arrange
            jest.spyOn(mockContentService, 'cancelDownload').mockReturnValue(of());
            // act
            enrolledCourseDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showLoading).toEqual(false);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(mockLocation.back).toBeCalled();
                done();
            }, 0);
        });
        it('should display header even api fails', (done) => {
            // arrange
            jest.spyOn(mockContentService, 'cancelDownload').mockReturnValue(of(Promise.reject()));
            // act
            enrolledCourseDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showLoading).toEqual(false);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(mockLocation.back).toBeCalled();
                done();
            }, 0);
        });
    });

    describe('viewCredits()', () => {
        it('should show credits', () => {
            // act
            jest.spyOn(mockCourseUtilService, 'showCredits');
            enrolledCourseDetailsPage.viewCredits();
            // assert
            expect(mockCourseUtilService.showCredits).toBeCalled();
        });
    });

    describe('generateEndEvent()', () => {
        it('should generate end event', () => {
            // arrange
            const objectId = '123456';
            const objectType = 'Mode';
            const objectVersion = '14';
            const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
            // act
            enrolledCourseDetailsPage.generateEndEvent(objectId, objectType, objectVersion);
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toBeCalledWith(
                objectType,
                Mode.PLAY,
                PageId.COURSE_DETAIL,
                Environment.HOME,
                telemetryObject,
                {},
                [{ id: '', type: 'CourseBatch' }]
            );
        });
    });

    describe('generateStartEvent()', () => {
        it('should generate start event', () => {
            // arrange
            const objectId = '123456';
            const objectType = 'Mode';
            const objectVersion = '14';
            const telemetryObject = new TelemetryObject(objectId, objectType, objectVersion);
            // act
            enrolledCourseDetailsPage.generateStartEvent(objectId, objectType, objectVersion);
            // assert
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toBeCalledWith(
                PageId.COURSE_DETAIL,
                telemetryObject,
                {},
                [{ id: '', type: 'CourseBatch' }]
            );
        });
    });

    describe('generateImpressionEvent()', () => {
        it('should generate impression event', () => {
            // arrange
            const objectId = '123456';
            const objectType = 'Mode';
            const objectVersion = '14';
            // act
            enrolledCourseDetailsPage.generateImpressionEvent(objectId, objectType, objectVersion);
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toBeCalledWith(
                ImpressionType.DETAIL,
                '',
                PageId.COURSE_DETAIL,
                Environment.HOME,
                objectId,
                objectType,
                objectVersion,
                {},
                [{ id: '', type: 'CourseBatch' }]
            );
        });
    });

    describe('generateQRSessionEndEvent()', () => {
        it('should generate QR Session end event', () => {
            // arrange
            const pageId = 'Enrolled_Course_Detail';
            const qrData = '8198h128183h123u';
            const telemetryObject = new TelemetryObject(qrData, 'qr', undefined);
            // act
            enrolledCourseDetailsPage.generateQRSessionEndEvent(pageId, qrData);
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toBeCalledWith(
                'qr',
                Mode.PLAY,
                pageId,
                Environment.HOME,
                telemetryObject,
                {},
                [{ id: '', type: 'CourseBatch' }]
            );
        });

        it('should not generate telemetry event', () => {
            // act
            enrolledCourseDetailsPage.generateQRSessionEndEvent(undefined, '');
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).not.toBeCalled();
        });
    });

    describe('goBack()', () => {
        it('should go to previous page', () => {
            // act
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
            expect(mockLocation.back).toBeCalled();
        });
        it('should go 2 page back', () => {
            // arrange
            enrolledCourseDetailsPage.isQrCodeLinkToContent = true;
            jest.spyOn(window.history, 'go');
            // act
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
            expect(window.history.go).toBeCalledWith(-2);
        });
    });

    describe('handleNavBackButton()', () => {
        it('should generate end event', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            // act
            enrolledCourseDetailsPage.handleNavBackButton();
            // assert
            expect(enrolledCourseDetailsPage.generateEndEvent).toBeCalled();
        });
        it('should generate QR session end event', () => {
            // arrange
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            // act
            enrolledCourseDetailsPage.handleNavBackButton();
            // assert
            expect(enrolledCourseDetailsPage.generateEndEvent).toBeCalled();
            expect(enrolledCourseDetailsPage.generateQRSessionEndEvent).toBeCalled();
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should be aguest user, ', () => {
            mockAppGlobalService.getUserId = jest.fn(() => {
                return 'sample_user_id';
            });
            // act
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn(() => { })
            };
            enrolledCourseDetailsPage.guestUser = true;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            jest.spyOn(enrolledCourseDetailsPage, 'checkLoggedInOrGuestUser').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').and.stub();
            spyOn(enrolledCourseDetailsPage, 'subscribeSdkEvent').and.stub();
            spyOn(enrolledCourseDetailsPage, 'populateCorRelationData');
            spyOn(enrolledCourseDetailsPage, 'handleBackButton').and.stub();
            enrolledCourseDetailsPage.ionViewWillEnter().then(() => {
                expect(enrolledCourseDetailsPage.checkCurrentUserType).toHaveBeenCalled();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.guestUser).toEqual(true);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(enrolledCourseDetailsPage.isCourseEnrolled).toBeCalled();
                expect(enrolledCourseDetailsPage.subscribeSdkEvent).toBeCalled();
                expect(enrolledCourseDetailsPage.populateCorRelationData).toBeCalled();
                expect(enrolledCourseDetailsPage.handleBackButton).toBeCalled();
            });
            // assert
            expect(enrolledCourseDetailsPage.checkLoggedInOrGuestUser).toHaveBeenCalled();
        });

        it('should be a guest user, ', () => {
            // act
            const data = {

            };
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            enrolledCourseDetailsPage.guestUser = false;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData_2;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn(() => { })
            };
            mockCourseService.getEnrolledCourses = jest.fn(() => of(mockEnrolledCourses));
            // act
            enrolledCourseDetailsPage.ionViewWillEnter();
            // assert
            expect(enrolledCourseDetailsPage.courseCardData.batch).toEqual(enrolledCourseDetailsPage.updatedCourseCardData.batch);
        });
    });

    describe('isCourseEnrolled()', () => {
        it('should unenrolled course', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData;
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(true);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual(mockCourseCardData);
        });

        it('should course already enrolled', () => {
            // arrange
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual(mockEnrolledCourses[0]);
        });

        it('else condition check ""', () => {
            // arrange
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual(mockEnrolledCourses[0]);
        });

        it('else condition check "course.courseId === identifier"', () => {
            // arrange
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual(mockEnrolledCourses[0]);
        });
    });

    describe('handleBackButton()', () => {
        it('should ', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'goBack');
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((x, callback) => callback())
            };
            // act
            enrolledCourseDetailsPage.handleBackButton();
            // assert
            expect(enrolledCourseDetailsPage.generateEndEvent).toBeCalled();
            expect(enrolledCourseDetailsPage.generateQRSessionEndEvent).toBeCalled();
            expect(enrolledCourseDetailsPage.goBack).not.toBeCalled();

        });
    });

    describe('ionViewWillLeave()', () => {
        it('should unsubscribe events', () => {
            // arrange
            const unsubscribe = jest.fn();
            enrolledCourseDetailsPage.headerObservable = {
                unsubscribe
            };
            enrolledCourseDetailsPage.backButtonFunc = {
                unsubscribe
            };
            // act
            enrolledCourseDetailsPage.ionViewWillLeave();
            // assert
            expect(mockEvents.publish).toBeCalledWith('header:setzIndexToNormal');
            expect(unsubscribe).toBeCalled();
            expect(unsubscribe).toBeCalled();
        });
    });

    describe('ngOnDestroy()', () => {
        it('should unsubscribe events', () => {
            // arrange
            mockEvents.unsubscribe = jest.fn();
            // act
            enrolledCourseDetailsPage.ngOnDestroy();
            // assert
            expect(mockEvents.unsubscribe).toBeCalledWith(EventTopics.ENROL_COURSE_SUCCESS);
            expect(mockEvents.unsubscribe).toBeCalledWith('courseToc:content-clicked');
            expect(mockEvents.unsubscribe).toBeCalledWith(EventTopics.UNENROL_COURSE_SUCCESS);
            expect(mockEvents.unsubscribe).toBeCalledWith('header:setzIndexToNormal');
            expect(mockEvents.unsubscribe).toBeCalledWith('header:decreasezIndex');
        });
    });

    describe('navigateToBatchListPage()', () => {
        it('should', async (done) => {
            // arrange
            spyOn(enrolledCourseDetailsPage, 'enrollIntoBatch').and.stub();
            spyOn(mockRouter, 'navigate').and.stub();
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            // length 2
            const batches = [
                {
                    status: 1
                }, {
                    status: 0
                }
            ];
            enrolledCourseDetailsPage.batches = batches;
            // act
            await enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            expect(mockRouter.navigate).toBeCalled();
            done();
        });
    });

    describe('startContent()', () => {
        it('should find next content which status is 0 or 1', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            enrolledCourseDetailsPage.courseHeirarchy = {
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
            enrolledCourseDetailsPage.contentStatusData = {
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
            enrolledCourseDetailsPage.isBatchNotStarted = false;
            enrolledCourseDetailsPage.nextContent = false;
            // act
            enrolledCourseDetailsPage.startContent();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.START_CLICKED,
                Environment.HOME,
                PageId.COURSE_DETAIL,
                { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                undefined,
                { l1: 'do_091231312312' },
                [{ id: '', type: 'CourseBatch' }],
            );
            expect(enrolledCourseDetailsPage.courseHeirarchy).toBeTruthy();
            expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBeGreaterThan(0);
            expect(enrolledCourseDetailsPage.isBatchNotStarted).toBeFalsy();
        });

        it('should show toast message', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: []
            };
            enrolledCourseDetailsPage.isBatchNotStarted = true;
            mockCommonUtilService.translateMessage = jest.fn(() => 'course will be available');
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => '2020-06-04');
            // act
            enrolledCourseDetailsPage.startContent();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.START_CLICKED,
                Environment.HOME,
                PageId.COURSE_DETAIL,
                { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                undefined,
                { l1: 'do_091231312312' },
                [{ id: '', type: 'CourseBatch' }],
            );
            expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBe(0);
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
            expect(mockDatePipe.transform).toBeCalled();
        });
    });

    describe('subscribeSdkEvent()', () => {
        it('should be PROGRESS event', () => {
            // arrange
            const event = {
                type: 'PROGRESS',
                payload: {
                    identifier: 'do_83424628349',
                    progress: 100
                }
            };
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.downloadProgress).toBe(100);
            expect(enrolledCourseDetailsPage.getBatchDetails).toBeCalled();
            expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();

        });

        it('should be IMPORT_COMPLETED event', () => {
            // arrange
            const event = {
                type: 'IMPORT_COMPLETED',
                payload: {
                    contentId: 'do_83424628349',
                    progress: 100
                }
            };
            const queuedIdentifiers = [
                'do_83424628349'
            ];
            enrolledCourseDetailsPage.queuedIdentifiers = queuedIdentifiers;
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            enrolledCourseDetailsPage.isDownloadStarted = true;
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.isDownloadStarted).toBe(false);
            expect(enrolledCourseDetailsPage.queuedIdentifiers.length).toBe(0);
            expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
        });

        it('should be IMPORT_COMPLETED event download not started', () => {
            // arrange
            const event = {
                type: 'IMPORT_COMPLETED',
                payload: {
                    contentId: 'do_83424628349',
                    progress: 100
                }
            };
            const queuedIdentifiers = [
                'do_83424628349'
            ];
            enrolledCourseDetailsPage.queuedIdentifiers = queuedIdentifiers;
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            enrolledCourseDetailsPage.isDownloadStarted = false;
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            spyOn(enrolledCourseDetailsPage, 'setContentDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.setContentDetails).toBeCalled();
        });

        it('should be SERVER_CONTENT_DATA event', () => {
            // arrange
            const event = {
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do_83424628349',
                    progress: 100,
                    licenseDetails: 'SAMPLE_LICENSE',
                    size: '234'
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.content.contentData.size).toBe('234');
        });

        it('should be IMPORT_PROGRESS event', () => {
            // arrange
            const event = {
                type: 'IMPORT_PROGRESS',
                payload: {
                    contentId: 'do_83424628349',
                    currentCount: 14,
                    totalCount: 14
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert

        });

        it('should be UPDATE event', () => {
            // arrange
            const event = {
                type: 'UPDATE',
                payload: {
                    contentId: 'do_83424628349',
                    currentCount: 14,
                    totalCount: 14
                }
            };
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            mockEventsBusService.events = jest.fn(() => of(event));
            spyOn(enrolledCourseDetailsPage, 'importContent').and.stub();
            mockZone.run = jest.fn((cb) => cb());
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(mockHeaderService.hideHeader).toBeCalled();
            expect(enrolledCourseDetailsPage.importContent).toBeCalled();
        });
    });

    it('should hide deeplink progress loader', () => {
        // arrange
        mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
        enrolledCourseDetailsPage.identifier = 'sample_doId';
        if (!enrolledCourseDetailsPage.resumeCourseFlag) {
            enrolledCourseDetailsPage.resumeCourseFlag = true;
        }
        jest.spyOn(enrolledCourseDetailsPage, 'resumeContent').mockImplementation(() => {
            return;
        });
        // act
        enrolledCourseDetailsPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'sample_doId' });
        expect(enrolledCourseDetailsPage.resumeCourseFlag).toBe(true);
    });
});
