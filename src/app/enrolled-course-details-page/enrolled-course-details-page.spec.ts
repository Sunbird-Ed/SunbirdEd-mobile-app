import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';
import {
    ProfileService, ContentService, EventsBusService, CourseService, SharedPreferences,
    AuthService, CorrelationData, TelemetryObject,
    ProfileType, UnenrollCourseRequest, ContentDetailRequest,
    ServerProfileDetailsRequest, ServerProfile,
    NetworkError, DownloadService
} from '@project-sunbird/sunbird-sdk';
import {
    CourseUtilService, AppGlobalService, TelemetryGeneratorService,
    CommonUtilService, UtilityService, AppHeaderService,
    LocalCourseService, PageId, InteractType
} from '../../services';
import { NgZone } from '@angular/core';
import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { Location } from '@angular/common';
import {
    mockEnrolledData, contentDetailsResponse, mockCourseCardData,
    mockGetChildDataResponse, mockImportContentResponse,
    mockEnrolledCourses, mockExpiredBatchEnrolledCourses,
    mockCourseCardData_2, mockcontentHirerachyResponse
} from './enrolled-course-details-page.spec.data';
import { of, Subject, throwError } from 'rxjs';
import { ContentInfo } from '../../services/content/content-info';
import {PreferenceKey, ProfileConstants, EventTopics, BatchConstants, RouterLinks} from '../app.constant';
import { isObject } from 'util';
import { SbPopoverComponent } from '../components/popups';
import { Mode, Environment, ImpressionType, InteractSubtype, ErrorType } from '../../services/telemetry-constants';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { MimeType } from '../app.constant';
import { Consent, ConsentStatus, UserConsent } from '@project-sunbird/client-services/models';
import { CategoryKeyTranslator } from '../../pipes/category-key-translator/category-key-translator-pipe';
import { ConsentService } from '../../services/consent-service';
import {
    TncUpdateHandlerService,
} from '../../services/handlers/tnc-update-handler.service';
import { mockProfileData } from '../profile/profile.page.spec.data';
import { DiscussionService } from '@project-sunbird/sunbird-sdk';

describe('EnrolledCourseDetailsPage', () => {
    let enrolledCourseDetailsPage: EnrolledCourseDetailsPage;
    const mockProfileService: Partial<ProfileService> = {
        getServerProfilesDetails: jest.fn(() => of({})) as any
    };
    const mockContentService: Partial<ContentService> = {
        importContent: jest.fn(() => of(mockImportContentResponse)),
        getChildContents: jest.fn(() => of()),
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
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({}))
    };
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {
    };
    const mockCourseUtilService: Partial<CourseUtilService> = {
        showCredits: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };
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
        },
        getGuestUserConfig: jest.fn(() => Promise.resolve({syllabus: ['']})),
        appendTypeToPrimaryCategory: jest.fn(() => 'sample-details')
    };
    const mockDatePipe: Partial<DatePipe> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockRouter: Partial<Router> = {
        // getCurrentNavigation: jest.fn(() => mockEnrolledData),
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => mockEnrolledData) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {
        prepareEnrollCourseRequest: jest.fn(),
        enrollIntoBatch: jest.fn(),
        prepareRequestValue: jest.fn(),
        isEnrollable: jest.fn()
    };
    const mockConsentService: Partial<ConsentService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockCategoryKeyTranslator: Partial<CategoryKeyTranslator> = {
        transform: jest.fn(() => 'sample-message')
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        dismissTncPage: jest.fn(),
        isSSOUser: jest.fn()
    };
    const mockDiscussionService: Partial<DiscussionService> = {
        getForumIds: jest.fn()
    };

    global.window['segmentation'] = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            getTags: jest.fn(() => undefined),
            restoreTags: jest.fn()
        }
    };


    beforeAll(() => {
        enrolledCourseDetailsPage = new EnrolledCourseDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventsBusService as EventsBusService,
            mockCourseService as CourseService,
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockDownloadService as DownloadService,
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
            mockSbProgressLoader as SbProgressLoader,
            mockCategoryKeyTranslator as CategoryKeyTranslator,
            mockConsentService as ConsentService,
            mockTncUpdateHandlerService as TncUpdateHandlerService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
        enrolledCourseDetailsPage.accessDiscussionComponent = {
            fetchForumIds: jest.fn()
        };
    });

    describe('enrolledCourseDetailsPage', () => {
        it('should create a instance of enrolledCourseDetailsPage', () => {
            expect(enrolledCourseDetailsPage).toBeTruthy();
        });
    });

    describe('ngOnInit()', () => {
        it('should get App name and subscribe utility service by invoked ngOnInit()', (done) => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('SUNBIRD'));
            mockDownloadService.trackDownloads = jest.fn(() => of());
           jest.spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').mockReturnValue('BASE_URL');
            const mockProfileRes = {
                serverProfile: {
                    userName: 'some_user'
                }
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileRes) as any);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            enrolledCourseDetailsPage.ngOnInit();
            // assert
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.subscribeUtilityEvents).toHaveBeenCalled();
                done()
            }, 0);
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

    describe('getContentState()', () => {
        it('check', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
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
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            jest.spyOn(enrolledCourseDetailsPage, 'getLocalCourseAndUnitProgress').mockImplementation();
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{ identifier: 'do-123' }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            jest.spyOn(enrolledCourseDetailsPage, 'resumeContent').mockImplementation();
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(mockCourseService.getContentState).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
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
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(false);
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
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(false);
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

    describe('saveContentContext()', () => {
        it('should saved context of content by invoked saveContentContext()', () => {
            // arrange
            const userId = 'sample-user-id';
            const courseId = 'course-card';
            const batchId = 'sample-batch-id';
            const batchStatus = 2;
            // enrolledCourseDetailsPage.courseHeirarchy = {
            //     children: [{ identifier: 'do-123' }]
            // };
            enrolledCourseDetailsPage.courseHeirarchy = {
                contentData: {
                    leafNodes: ['node1']
                }
            };
            mockPreferences.putString = jest.fn(() => of(undefined));
            // act
            enrolledCourseDetailsPage.saveContentContext(userId, courseId, batchId, batchStatus);
            // assert
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.CONTENT_CONTEXT, expect.any(String));
            expect(Boolean(batchStatus)).toBeTruthy();
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of())
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            jest.spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'saveContentContext').mockImplementation();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalledWith(enrolledCourseDetailsPage.courseCardData);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of())
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            jest.spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'saveContentContext').mockImplementation();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of())
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            jest.spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'saveContentContext').mockImplementation();
            mockPreferences.getString = jest.fn(() => of(PreferenceKey.COURSE_IDENTIFIER));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
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
            jest.spyOn(enrolledCourseDetailsPage, 'saveContentContext').mockImplementation();
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
            jest.spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').mockImplementation();
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
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
                    endDate: '05/01/2020',
                    identifier: 'do-123'
                }
            ];
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            jest.spyOn(enrolledCourseDetailsPage, 'handleUnenrollButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
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
            enrolledCourseDetailsPage.courseCardData = undefined;
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

    describe('cancelDownload()', () => {
        it('should display header', (done) => {
            // arrange
            mockZone.run = jest.fn((fn) => fn());
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateCancelDownloadTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            // act
            enrolledCourseDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(mockLocation.back).toBeCalled();
                expect(mockTelemetryGeneratorService.generateCancelDownloadTelemetry).toHaveBeenCalled();
                expect(mockContentService.cancelDownload).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should display header even api fails', (done) => {
            // arrange
            mockZone.run = jest.fn((fn) => fn());
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateCancelDownloadTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => throwError({ error: 'error' }));
            // act
            enrolledCourseDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(mockLocation.back).toBeCalled();
                expect(mockTelemetryGeneratorService.generateCancelDownloadTelemetry).toHaveBeenCalled();
                expect(mockContentService.cancelDownload).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('updateEnrolledCourseData', () => {
        it('should update enroll details list by invoked updateEnrolledCourseData()', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{
                batchId: 'sample-batch-id',
                courseId: 'sample-course-id'
            }]));
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample-batch-id'
            };
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            // act
            enrolledCourseDetailsPage.updateEnrolledCourseData();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('markContent', () => {
        it('should update content last access time', (done) => {
            // arrange
            enrolledCourseDetailsPage.content = {
                contentType: 'sample-type'
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid'
            }));
            mockProfileService.addContentAccess = jest.fn(() => of(true));
            mockEvents.publish = jest.fn();
            mockContentService.setContentMarker = jest.fn(() => of(true));
            // act
            enrolledCourseDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'do_212911645382959104165',
                    contentType: 'sample-type',
                    status: 1
                });
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.LAST_ACCESS_ON, true);
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'do_212911645382959104165',
                        data: undefined,
                        extraInfo: {},
                        isMarked: true,
                        marker: 1,
                        uid: 'sample-uid'
                    }
                );
                done();
            }, 0);
        });

        it('should not update content last access time for else part', (done) => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                content: {
                    contentType: 'sample-type'
                }
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid'
            }));
            mockProfileService.addContentAccess = jest.fn(() => of(false));
            mockContentService.setContentMarker = jest.fn(() => of(true));
            // act
            enrolledCourseDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'do_212911645382959104165',
                    contentType: 'sample-type',
                    status: 1
                });
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'do_212911645382959104165',
                        data: JSON.stringify({contentType: 'sample-type'}),
                        extraInfo: {},
                        isMarked: true,
                        marker: 1,
                        uid: 'sample-uid'
                    }
                );
                done();
            }, 0);
        });
    });

    describe('joinTraining()', () => {
        it('should show error toast if no batches available', (done) => {
            // arrange
            enrolledCourseDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.joinTraining();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
            done();
        });

        it('should show error toast if single enrolment expired batch', (done) => {
            // arrange
            enrolledCourseDetailsPage.batches = [{
                enrollmentEndDate: '2020-04-23'
            }];
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn((v) => v);
            // act
            enrolledCourseDetailsPage.joinTraining();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ENROLLMENT_ENDED_ON', null, null, null, null, '2020-04-23');
            done();
        });

        it('should be joined training for logged in user', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { canDelete: false }}))
            } as any)));
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            jest.spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').mockImplementation();
            jest.spyOn(mockCourseService, 'getBatchDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
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

        it('should be joined training for logged in user on dismiss canDelete true', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data:{ canDelete: true, btn: '' }}))
            } as any)));
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
           jest.spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').mockImplementation();
           jest.spyOn(mockCourseService, 'getBatchDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
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

        it('should be joined training for logged in user on dismiss canDelete true, and return if no network and has btn info', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} }}))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn();
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
           jest.spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').mockImplementation();
           jest.spyOn(mockCourseService, 'getBatchDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
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

        it('should be joined training for logged in user on dismiss canDelete true, and return if netwrok available', (done) => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} }}))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            mockCommonUtilService.showToast = jest.fn();
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
           jest.spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').mockImplementation();
           jest.spyOn(mockCourseService, 'getBatchDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
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

    describe('subscribeUtilityEvents()', () => {

        it('should update courseCard data and return base url by invoked subscribeUtilityEvents()', () => {
            // arrange
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ batchId: 'SAMPLE_BATCH_ID', courseId: 'SAMPLE_COURSE_ID' }));
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR' };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement: {
                    classList: { remove: jest.fn(), add: jest.fn() }
                }
            };
            mockCommonUtilService.getLoader = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
           jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
           jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'joinTraining').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                // expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                // expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.baseUrl).toBe('');
                // expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                // expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                // expect(enrolledCourseDetailsPage.updateEnrolledCourseData).toBeCalled();
                // expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                // expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                // expect(enrolledCourseDetailsPage.joinTraining).toBeCalled();
                // expect(mockEvents.subscribe).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('extractApiResponse()', () => {
        it('should return last played content and license', () => {
            // assert
            const response = contentDetailsResponse;
           jest.spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
           jest.spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
           jest.spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
           jest.spyOn(enrolledCourseDetailsPage, 'setChildContents');
            enrolledCourseDetailsPage.courseCardData = { lastReadContentId: 'SAMPLE_LAST_READ_CONTENT' };
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
           jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
            mockCommonUtilService.appendTypeToPrimaryCategory = jest.fn(() => 'course-detail');
            mockContentService.getChildContents = jest.fn(() => of());
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
           jest.spyOn(enrolledCourseDetailsPage, 'importContent').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'setCourseStructure').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
            mockCommonUtilService.appendTypeToPrimaryCategory = jest.fn(() => 'course-detail');
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
            enrolledCourseDetailsPage.isGuestUser = true;
            mockAppGlobalService.getGuestUserInfo = jest.fn(() => Promise.reject('SAMPLE_USER'));
            // act
            enrolledCourseDetailsPage.checkCurrentUserType();
            // assert
            expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
        });
    });

    describe('rateContent()', () => {
        it('should not show user rating for content if guest user', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = true;
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            enrolledCourseDetailsPage.profileType = ProfileType.TEACHER;
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeTruthy();
                expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalledWith(ProfileType.TEACHER);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SIGNIN_TO_USE_FEATURE');
                done();
            }, 0);
        });

        it('should not show user rating for content if content is not available locally and user in not a guest user', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            enrolledCourseDetailsPage.course = {
                isAvailableLocally: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('TRY_BEFORE_RATING');
                done();
            }, 0);
        });

        it('should show user rating for content for loggedin user', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            enrolledCourseDetailsPage.course = {
                isAvailableLocally: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { message: 'rating.success', rating: 2, comment: 'some_comment' } }))
            } as any)));
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeFalsy();
                expect(mockPopoverCtrl.create).not.toBeUndefined();
                expect(enrolledCourseDetailsPage.userRating).toBe(2);
                expect(enrolledCourseDetailsPage.ratingComment).toBe('some_comment');
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
            jest.spyOn(enrolledCourseDetailsPage, 'showConfirmAlert').mockImplementation(() => {
                return Promise.resolve();
            });
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
            mockAppGlobalService.getUserId = jest.fn(() => 'sample_user_id');
            enrolledCourseDetailsPage.batchDetails = {
                id: 'some_id',
                courseId: 'course_id'
            };
            mockZone.run = jest.fn((fn) => fn());
            mockCourseService.unenrollCourse = jest.fn(() => of(true));
            mockCommonUtilService.translateMessage = jest.fn(() => 'COURSE_UNENROLLED');
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.handleUnenrollment(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCourseService.unenrollCourse).toHaveBeenCalledWith({
                    userId: 'sample_user_id',
                    courseId: 'course_id',
                    batchId: 'some_id'
                });
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.UNENROL_SUCCESS,
                    Environment.HOME,
                    PageId.COURSE_DETAIL,
                    { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                    undefined,
                    {},
                    undefined
                );
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
            mockAppGlobalService.getUserId = jest.fn(() => 'SAMPLE_USER_ID');
            const unenrolCourseRequest: UnenrollCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                courseId: enrolledCourseDetailsPage.batchDetails.courseId,
                batchId: enrolledCourseDetailsPage.batchDetails.id
            };
            mockCourseService.unenrollCourse = jest.fn(() => throwError(''));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            enrolledCourseDetailsPage.handleUnenrollment(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCourseService.unenrollCourse).toHaveBeenCalledWith(unenrolCourseRequest);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
                    expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('FRMELEMNTS_MSG_UNABLE_TO_ENROLL', undefined));
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
            mockAppGlobalService.getUserId = jest.fn(() => 'SAMPLE_USER_ID');
            const unenrolCourseRequest: UnenrollCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                courseId: enrolledCourseDetailsPage.batchDetails.courseId,
                batchId: enrolledCourseDetailsPage.batchDetails.id
            };
            mockCourseService.unenrollCourse = jest.fn(() => throwError({ error: 'CONNECTION_ERROR' }));
            mockCommonUtilService.translateMessage = jest.fn(() => 'course unenrolled');
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
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course unenrolled');
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
           jest.spyOn(enrolledCourseDetailsPage, 'extractApiResponse').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toBeCalled();
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
           jest.spyOn(enrolledCourseDetailsPage, 'extractApiResponse').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation();
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
           jest.spyOn(enrolledCourseDetailsPage, 'extractApiResponse').mockImplementation();
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

    describe('getContentsSize()', () => {
        it('should populate downloadIdentifiers', () => {
            // arrange
            enrolledCourseDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            // act
            enrolledCourseDetailsPage.getContentsSize(mockGetChildDataResponse);
            // assert
            expect(enrolledCourseDetailsPage.downloadSize).toEqual(57901354);
        });
    });

    describe('setChildContents()', () => {
        it('should fetch child contents ', () => {
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
                // expect(mockContentService.getChildContents).toHaveBeenCalled();
                // expect(enrolledCourseDetailsPage.getContentState).toBeCalledWith(true);
                // expect(enrolledCourseDetailsPage.getContentsSize).toBeCalledWith([{ id: 'do-1-123' }]);
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                    children: [{ children:[{"identifier": "do_135241341148", }, {"identifier": "do_135241345727",}]}, 
                    {children: [{ "identifier": "do_135241341784", }, {"identifier": "do_135521312312",}]}]
                });
            }, 0);
        });

        it('should setshowChildrenLoader to false', () => {
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
                expect(enrolledCourseDetailsPage.showChildrenLoader).toEqual(true);
                // expect(mockContentService.getChildContents).toHaveBeenCalled();
                // expect(mockZone.run).toHaveBeenCalled();
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(respones)) as any;
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
                contentTypesCount: '{\"CourseUnit\":1,\"Resource\":5}'
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
                contentTypesCount: '{\'CourseUnit\:1,\'Resource\:5}'
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

    describe('importContent()', () => {
        it('should populate queuedIdentifiers', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => of([{
                status: -1,
                identifier: 'do-123'
            }, {
                identifier: 'do-234',
                status: 0
            }]));
            mockZone.run = jest.fn((fn) => fn());
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            enrolledCourseDetailsPage.isDownloadStarted = true;
            enrolledCourseDetailsPage.queuedIdentifiers = [];
            enrolledCourseDetailsPage.faultyIdentifiers = [
                {}
            ];
            enrolledCourseDetailsPage.course = {
                identifier: 'do-123'
            };
            mockTelemetryGeneratorService.generateDownloadAllClickTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, true);
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showLoading).toBeTruthy();
                // expect(mockZone.run).toHaveBeenCalled();
                // expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                // expect(mockTelemetryGeneratorService.generateDownloadAllClickTelemetry).toHaveBeenCalled();
                // expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                //     Environment.HOME,
                //     'ERR_DOWNLOAD_FAILED',
                //     ErrorType.SYSTEM,
                //     PageId.COURSE_DETAIL,
                //     expect.any(String)
                // );
            }, 0);
        });

        it('should return toast for catch part', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => throwError({ error: 'NETWORK_ERROR' }));
            mockZone.run = jest.fn((fn) => fn());
            enrolledCourseDetailsPage.isDownloadStarted = true;
            jest.spyOn(enrolledCourseDetailsPage, 'restoreDownloadState').mockImplementation();
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, false);
            // assert
            setTimeout(() => {
                // expect(mockContentService.importContent).toBeCalled();
                // expect(mockCommonUtilService.showToast).toBeCalledWith('NEED_INTERNET_TO_CHANGE');
            }, 0);
        });
    });

    describe('showDownloadConfirmationAlert()', () => {
        it('should show DownloadConfirmation Popup', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            enrolledCourseDetailsPage.downloadIdentifiers = {
                size: 24
            } as any;
            enrolledCourseDetailsPage.course = {
                name: 'sample-course-name'
            };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.showToast = jest.fn();
            enrolledCourseDetailsPage.isBatchNotStarted = true;
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: true } }));
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockFileSizePipe.transform = jest.fn();
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData;
            mockDatePipe.transform = jest.fn(() => 'sample-data');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(enrolledCourseDetailsPage, 'importContent').mockImplementation();
            // act
            enrolledCourseDetailsPage.showDownloadConfirmationAlert();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'COURSE_WILL_BE_AVAILABLE', 'sample-data');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DOWNLOAD');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'DOWNLOAD');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'ITEMS', 24);
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                expect(mockDatePipe.transform).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    'download-all-button-clicked',
                    Environment.HOME,
                    PageId.COURSE_DETAIL
                );
                expect(mockEvents.publish).toHaveBeenCalled();
                done();
            }, 0);
        });
    });


    describe('promptToLogin()', () => {
        it('should invoke LoginHandler signin method', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
            mockCategoryKeyTranslator.transform = jest.fn(() => 'sample-message');
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {} } }))
            } as any)));
            enrolledCourseDetailsPage.telemetryObject = {
                id: 'do_21281258639073280011490',
                type: 'Course',
                version: '2',
            };
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            enrolledCourseDetailsPage.promptToLogin({});
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'do_21281258639073280011490',
                    'Course',
                    '2',
                    {}, undefined
                );
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(
                    {
                        component: SbPopoverComponent,
                        componentProps: {
                            actionsButtons: [
                                {
                                    btnClass: 'popover-color label-uppercase label-bold-font',
                                    btntext: 'sample-message',

                                },

                            ],
                            isNotShowCloseIcon: true,
                            metaInfo: 'sample-message',
                            sbPopoverHeading: 'sample-message',
                            sbPopoverMainTitle: 'sample-message',

                        },
                        cssClass: 'sb-popover info',
                    });
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'OVERLAY_SIGN_IN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'OVERLAY_SIGN_IN');
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(1,
                    PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify({}));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(2,
                    PreferenceKey.COURSE_DATA_KEY, JSON.stringify({ name: 'sample-course-name' }));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(3,
                    PreferenceKey.CDATA_KEY, JSON.stringify(undefined));
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    {
                        id: 'do_21281258639073280011490',
                        type: 'Course',
                        version: '2',
                    },
                    undefined,
                    {},
                    undefined
                );
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
                done();
            }, 0);
        });

        it('should invoke LoginHandler signin method, if no network and has btn network msg', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
            mockCategoryKeyTranslator.transform = jest.fn(() => 'sample-message');
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network needed'} } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn(() => Promise.resolve())
            enrolledCourseDetailsPage.telemetryObject = {
                id: 'do_21281258639073280011490',
                type: 'Course',
                version: '2',
            };
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            enrolledCourseDetailsPage.promptToLogin({});
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'do_21281258639073280011490',
                    'Course',
                    '2',
                    {}, undefined
                );
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(
                    {
                        component: SbPopoverComponent,
                        componentProps: {
                            actionsButtons: [
                                {
                                    btnClass: 'popover-color label-uppercase label-bold-font',
                                    btntext: 'sample-message',

                                },

                            ],
                            isNotShowCloseIcon: true,
                            metaInfo: 'sample-message',
                            sbPopoverHeading: 'sample-message',
                            sbPopoverMainTitle: 'sample-message',

                        },
                        cssClass: 'sb-popover info',
                    });
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'OVERLAY_SIGN_IN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'OVERLAY_SIGN_IN');
                done();
            }, 0);
        });

        it('should invoke LoginHandler signin method, if no network and has btn network msg', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
            mockCategoryKeyTranslator.transform = jest.fn(() => 'sample-message');
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn(() => Promise.resolve())
            enrolledCourseDetailsPage.telemetryObject = {
                id: 'do_21281258639073280011490',
                type: 'Course',
                version: '2',
            };
            mockPreferences.putString = jest.fn(() => of(undefined));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppGlobalService.resetSavedQuizContent = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            enrolledCourseDetailsPage.promptToLogin({});
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'do_21281258639073280011490',
                    'Course',
                    '2',
                    {}, undefined
                );
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(
                    {
                        component: SbPopoverComponent,
                        componentProps: {
                            actionsButtons: [
                                {
                                    btnClass: 'popover-color label-uppercase label-bold-font',
                                    btntext: 'sample-message',

                                },

                            ],
                            isNotShowCloseIcon: true,
                            metaInfo: 'sample-message',
                            sbPopoverHeading: 'sample-message',
                            sbPopoverMainTitle: 'sample-message',

                        },
                        cssClass: 'sb-popover info',
                    });
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'OVERLAY_SIGN_IN');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'OVERLAY_SIGN_IN');
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(1,
                    PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify({}));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(2,
                    PreferenceKey.COURSE_DATA_KEY, JSON.stringify({ name: 'sample-course-name' }));
                expect(mockPreferences.putString).toHaveBeenNthCalledWith(3,
                    PreferenceKey.CDATA_KEY, JSON.stringify(undefined));
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    {
                        id: 'do_21281258639073280011490',
                        type: 'Course',
                        version: '2',
                    },
                    undefined,
                    {},
                    undefined
                );
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
                done();
            }, 0);
        });

        it('should return popup for else part', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
            mockCategoryKeyTranslator.transform = jest.fn(() => 'sample-message');
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false } }))
            } as any)));
            enrolledCourseDetailsPage.telemetryObject = {
                id: 'do_21281258639073280011490',
                type: 'Course',
                version: '2',
            };
            // act
            enrolledCourseDetailsPage.promptToLogin({});
            // assert

            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'do_21281258639073280011490',
                    'Course',
                    '2',
                    {}, undefined
                );
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith(
                    {
                        component: SbPopoverComponent,
                        componentProps: {
                            actionsButtons: [
                                {
                                    btnClass: 'popover-color label-uppercase label-bold-font',
                                    btntext: 'sample-message',

                                },

                            ],
                            isNotShowCloseIcon: true,
                            metaInfo: 'sample-message',
                            sbPopoverHeading: 'sample-message',
                            sbPopoverMainTitle: 'sample-message',

                        },
                        cssClass: 'sb-popover info',
                    });
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

    describe('enrollIntoBatch()', () => {
        it('should call promptToLogin()', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = true;
            const batch = {
                id: '121232312'
            };
            jest.spyOn(enrolledCourseDetailsPage, 'promptToLogin').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.promptToLogin).toBeCalled();
                done();
            }, 0);
        });

        it('should should successfuly enroll', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.prepareRequestValue = jest.fn(() => new Map());
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => of({}));
            mockZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled corses');
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(enrolledCourseDetailsPage, 'subscribeTrackDownloads').mockImplementation();
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.prepareEnrollCourseRequest).toBeCalled();
                expect(presentFn).toBeCalled();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
                expect(mockCategoryKeyTranslator.transform).toBeCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                expect(mockEvents.publish).toBeCalled();
                expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(true);
                done();
            }, 0);
        });

        it('should should fail', (done) => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.prepareRequestValue = jest.fn(() => new Map());
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => throwError({}));
            mockZone.run = jest.fn((fn) => fn());
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            expect(mockLocalCourseService.prepareEnrollCourseRequest).toBeCalled();
            setTimeout(() => {
                expect(presentFn).toBeCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
                expect(dismissFn).toBeCalled();
                expect(mockZone.run).toHaveBeenCalled();
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
            jest.spyOn(enrolledCourseDetailsPage, 'share').mockImplementation();
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
            jest.spyOn(enrolledCourseDetailsPage, 'showOverflowMenu').mockImplementation();
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
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['']}));
           jest.spyOn(enrolledCourseDetailsPage, 'handleNavBackButton').mockImplementation();
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
            expect(enrolledCourseDetailsPage.handleNavBackButton).toBeCalled();
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
                undefined
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
            // expect(mockTelemetryGeneratorService.generateStartTelemetry).toBeCalledWith(
            //     PageId.COURSE_DETAIL,
            //     telemetryObject,
            //     {},
            //     undefined
            // );
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
            // expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toBeCalledWith(
            //     ImpressionType.DETAIL,
            //     '',
            //     PageId.COURSE_DETAIL,
            //     Environment.HOME,
            //     objectId,
            //     objectType,
            //     objectVersion,
            //     {},
            //     undefined
            // );
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
                undefined
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
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['']}));
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
        });
        it('should go 2 page back', () => {
            // arrange
            enrolledCourseDetailsPage.isQrCodeLinkToContent = true;
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['']}));
            jest.spyOn(window.history, 'go');
            // act
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
        });
    });

    describe('handleNavBackButton()', () => {
        it('should generate end event', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            // act
            enrolledCourseDetailsPage.handleNavBackButton();
            // assert
            // expect(enrolledCourseDetailsPage.generateEndEvent).toBeCalled();
        });
        it('should generate QR session end event', () => {
            // arrange
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            // act
            enrolledCourseDetailsPage.handleNavBackButton();
            // assert
            // expect(enrolledCourseDetailsPage.generateEndEvent).toBeCalled();
            // expect(enrolledCourseDetailsPage.generateQRSessionEndEvent).toBeCalled();
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
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({});
        });

        it('else condition check ""', () => {
            // arrange
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({});
        });

        it('else condition check "course.courseId === identifier"', () => {
            // arrange
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({});
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
        it('should return false, not call navigate', (done) => {
            // arrange
            mockLocalCourseService.isEnrollable = jest.fn(() => true);
           jest.spyOn(enrolledCourseDetailsPage, 'enrollIntoBatch').mockImplementation();
           jest.spyOn(mockRouter, 'navigate').mockImplementation();
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
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            // expect(mockRouter.navigate).toBeCalled();
            done();
        });

        it('should show toast message for internet error', () => {
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
            enrolledCourseDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['']}));
            // act
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                // expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                // expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(enrolledCourseDetailsPage.batches.length).toBe(0);
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
            }, 0);
        });

        // it('should show toast message if batches is empty', (done) => {
        //     // arrnge
        //     const dismissFn = jest.fn(() => Promise.resolve());
        //     const presentFn = jest.fn(() => Promise.resolve());
        //     mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
        //         present: presentFn,
        //         dismiss: dismissFn
        //     }));
        //     mockCommonUtilService.networkInfo = {
        //         isNetworkAvailable: true
        //     };
        //     enrolledCourseDetailsPage.batches = [];
        //     // mockCommonUtilService.showToast = jest.fn();
        //     // act
        //     enrolledCourseDetailsPage.navigateToBatchListPage();
        //     // assert
        //     setTimeout(() => {
        //         expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        //         expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
        //         expect(enrolledCourseDetailsPage.batches.length).toBe(0);
        //         // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
        //         expect(dismissFn).toBeTruthy();
        //         done();
        //     }, 0);
        // });
    });

    describe('startLearning()', () => {
        it('should find next content which status is 0 or 1', (done) => {
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
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
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
            mockPreferences.getBoolean = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }));
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => Promise.resolve(false));
            // act
            enrolledCourseDetailsPage.startLearning();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.COURSE_DETAIL,
                    { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                   undefined,
                    {},
                    undefined,
                );
                expect(enrolledCourseDetailsPage.courseHeirarchy).toBeTruthy();
                expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBeGreaterThan(0);
                expect(enrolledCourseDetailsPage.isBatchNotStarted).toBeFalsy();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show toast message', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: []
            };
            enrolledCourseDetailsPage.isBatchNotStarted = true;
            mockCommonUtilService.translateMessage = jest.fn(() => 'course will be available');
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => '2020-06-04');
            mockPreferences.getBoolean = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));

            // act
            enrolledCourseDetailsPage.startLearning();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.COURSE_DETAIL,
                    { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                    undefined,
                    {},
                    undefined,
                );
                expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBe(0);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show profile name confirmation popup', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: []
            };
            enrolledCourseDetailsPage.isBatchNotStarted = true;
            enrolledCourseDetailsPage.isCertifiedCourse = true;
            mockCommonUtilService.translateMessage = jest.fn(() => 'course will be available');
            mockCommonUtilService.showToast = jest.fn();
            mockDatePipe.transform = jest.fn(() => '2020-06-04');
            mockPreferences.getBoolean = jest.fn(() => of(false));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { buttonClicked: true } }))
            } as any)));

            // act
            enrolledCourseDetailsPage.startLearning();

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.START_CLICKED,
                    Environment.HOME,
                    PageId.COURSE_DETAIL,
                    { id: 'do_21281258639073280011490', type: 'Course', version: '2' },
                    undefined,
                    {},
                    undefined,
                );
                expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBe(0);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('subscribeSdkEvent()', () => {
        it('should be PROGRESS event', (done) => {
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
            mockHeaderService.showHeaderWithBackButton = jest.fn();
           jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.downloadProgress).toBe(100);
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.getBatchDetails).toBeCalled();
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                done()
            }, 0);

        });

        it('should be IMPORT_COMPLETED event', (done) => {
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
           jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isDownloadStarted).toBe(false);
                expect(enrolledCourseDetailsPage.queuedIdentifiers.length).toBe(0);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                done()
            }, 0);
        });

        it('should be IMPORT_COMPLETED event download not started', (done) => {
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
           jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
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
           jest.spyOn(enrolledCourseDetailsPage, 'importContent').mockImplementation();
            mockZone.run = jest.fn((cb) => cb());
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(mockEventsBusService.events).toBeCalled();
            expect(mockZone.run).toBeCalled();
        });
    });

    describe('checkDataSharingStatus', () => {
        it('should return conset details', (done) => {
            // arrange
            enrolledCourseDetailsPage.isMinor = false;
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: 'sample-channel'
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.courseCardData.content.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId
            };
            mockProfileService.getConsent = jest.fn(() => of({
                consents: [{
                    status: ConsentStatus.ACTIVE,
                    lastUpdatedOn: 'dd/mm/yy'
                }]
            }));
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                expect(enrolledCourseDetailsPage.dataSharingStatus).toBe(ConsentStatus.ACTIVE);
                expect(enrolledCourseDetailsPage.lastUpdateOn).toBe('dd/mm/yy');
                done();
            }, 0);
        });

        it('should return conset popup if consent data not found for catch part', (done) => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: 'sample-channel'
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.courseCardData.content.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId
            };
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            enrolledCourseDetailsPage.course = {
                userConsent: UserConsent.YES
            };
            enrolledCourseDetailsPage.isConsentPopUp = false;
            mockProfileService.getConsent = jest.fn(() => throwError({
                response: {
                    body: {
                        params: {
                            err: 'USER_CONSENT_NOT_FOUND'
                        }
                    }
                }
            }));
            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            jest.spyOn(enrolledCourseDetailsPage, 'checkDataSharingStatus').mockImplementation(() => {
                return (Promise.resolve());
            });
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus().catch();
            // assert
            setTimeout(() => {
                // expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                // expect(enrolledCourseDetailsPage.isConsentPopUp).toBeTruthy();
                // expect(mockLocalCourseService.showConsentPopup).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return conset popup if consent data not found for catch part', (done) => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: 'sample-channel'
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.courseCardData.content.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId,
            };
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            enrolledCourseDetailsPage.course = {
                userConsent: UserConsent.YES
            };
            enrolledCourseDetailsPage.isConsentPopUp = false;
            mockProfileService.getConsent = jest.fn(() => throwError({
                code: 'NETWORK_ERROR'
            }));
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus();
            // assert
            setTimeout(() => {
                // expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                // expect(enrolledCourseDetailsPage.isConsentPopUp).toBeFalsy();
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should be a guest user, ', (done) => {
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn(() => { })
            };
            enrolledCourseDetailsPage.isGuestUser = true;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'subscribeSdkEvent').mockImplementation();
           jest.spyOn(enrolledCourseDetailsPage, 'populateCorRelationData');
           jest.spyOn(enrolledCourseDetailsPage, 'handleBackButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(enrolledCourseDetailsPage, 'handleHeaderEvents').mockImplementation(() => {
                return Promise.resolve();
            });
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            // assert
            enrolledCourseDetailsPage.ionViewWillEnter().then(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.checkCurrentUserType).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.isGuestUser).toEqual(true);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(enrolledCourseDetailsPage.isCourseEnrolled).toBeCalled();
                expect(enrolledCourseDetailsPage.subscribeSdkEvent).toBeCalled();
                expect(enrolledCourseDetailsPage.populateCorRelationData).toBeCalled();
                expect(enrolledCourseDetailsPage.handleBackButton).toBeCalled();
                done();
            });
        });

        it('should not be a guest user, ', (done) => {
            // act
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            enrolledCourseDetailsPage.isGuestUser = false;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData_2;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn(() => { })
            };
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({}))
            });
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            // jest.spyOn(enrolledCourseDetailsPage, 'fetchForumIds').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'handleHeaderEvents').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'populateCorRelationData').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'handleBackButton').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'subscribeSdkEvent').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            mockCourseService.getEnrolledCourses = jest.fn(() => of(mockEnrolledCourses));
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileData));
            // act
            enrolledCourseDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 0);
        });

        //     it('should show expired batch popup for logged in user and enrolled into course if already enrolled batch is expired, ',
        //         (done) => {
        //             // act
        //             mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
        //             mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        //             enrolledCourseDetailsPage.isGuestUser = false;
        //             enrolledCourseDetailsPage.isAlreadyEnrolled = true;
        //             enrolledCourseDetailsPage.courseCardData = mockCourseCardData_2;
        //             enrolledCourseDetailsPage.courseHeirarchy = mockCourseCardData_2;
        //             mockHeaderService.headerEventEmitted$ = {
        //                 subscribe: jest.fn(() => { })
        //             };
        //             mockHeaderService.headerEventEmitted$ = of({
        //                 subscribe: jest.fn((fn) => fn({}))
        //             });
        //             jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'handleHeaderEvents').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'populateCorRelationData').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'handleBackButton').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'subscribeSdkEvent').mockImplementation();
        //             jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
        //                 return Promise.resolve();
        //             });
        //             jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
        //                 return Promise.resolve();
        //             });
        //             mockCourseService.getEnrolledCourses = jest.fn(() => of(mockExpiredBatchEnrolledCourses));
        //             mockAppGlobalService.getEnrolledCourseList = jest.fn(() => mockExpiredBatchEnrolledCourses);
        //             mockHeaderService.showHeaderWithBackButton = jest.fn();
        //             const batches = [
        //                 {
        //                     enrollmentEndDate: '01/01/2020',
        //                     endDate: '05/01/2020',
        //                     identifier: 'do-123',
        //                     status: 1
        //                 },
        //                 {
        //                     enrollmentEndDate: '01/01/2020',
        //                     endDate: '05/01/2020',
        //                     identifier: 'do-1234',
        //                     status: 0
        //                 }
        //             ];
        //             mockCourseService.getCourseBatches = jest.fn(() => of(batches));
        //             mockZone.run = jest.fn((fn) => fn());
        //             mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
        //                 present: jest.fn(() => Promise.resolve({})),
        //                 onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
        //             } as any)));

        //             // act
        //             enrolledCourseDetailsPage.ionViewWillEnter();
        //             // assert
        //             setTimeout(() => {
        //                 expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        //                 expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        //                 expect(mockCourseService.getCourseBatches).toBeCalledWith({
        //                     filters: {
        //                         courseId: enrolledCourseDetailsPage.courseHeirarchy.identifier,
        //                         enrollmentType: CourseEnrollmentType.OPEN,
        //                         status: [CourseBatchStatus.IN_PROGRESS]
        //                     },
        //                     sort_by: { createdDate: SortOrder.DESC },
        //                     fields: BatchConstants.REQUIRED_FIELDS
        //                 });
        //                 expect(mockZone.run).toHaveBeenCalled();
        //                 expect(mockPopoverCtrl.create).toHaveBeenCalled();
        //                 done();
        //             }, 0);
        //         });
    });

    it('should hide deeplink progress loader', () => {
        // arrange
        mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
        enrolledCourseDetailsPage.identifier = 'login';
        if (!enrolledCourseDetailsPage.resumeCourseFlag) {
            enrolledCourseDetailsPage.resumeCourseFlag = true;
        }
        jest.spyOn(enrolledCourseDetailsPage, 'resumeContent').mockImplementation(() => {
            return;
        });
        // act
        enrolledCourseDetailsPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        expect(enrolledCourseDetailsPage.resumeCourseFlag).toBe(true);
    });

    describe('isCourseModifiedAfterEnrolment', () => {
        it('should return false if course lastUpdatedOn date is less than course enrolledDate', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                enrolledDate: '2018-11-12T10:57:02.000+0000'
            };
            enrolledCourseDetailsPage.course = {
                lastPublishedOn: '2018-11-11T10:57:02.000+0000'
            };
            // act
            const isModified = enrolledCourseDetailsPage.isCourseModifiedAfterEnrolment();
            // assert
            expect(isModified).toBe(false);
        });

        it('should return true if course lastUpdatedOn date is greater than course enrolledDate', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                enrolledDate: '2018-11-12T10:57:02.000+0000'
            };
            enrolledCourseDetailsPage.course = {
                lastPublishedOn: '2018-11-13T10:57:02.000+0000'
            };
            // act
            const isModified = enrolledCourseDetailsPage.isCourseModifiedAfterEnrolment();
            // assert
            expect(isModified).toBe(true);
        });
    });

    it('should dismiss consentPii popup', (done) => {
        // arrange
        const dismissFn = jest.fn(() => Promise.resolve(true));
        enrolledCourseDetailsPage.loader = { data: '', dismiss: dismissFn } as any;
        mockLocalCourseService.setConsentPopupVisibility = jest.fn();
        // act
        enrolledCourseDetailsPage.onConsentPopoverShow();
        // assert
        setTimeout(() => {
            expect(enrolledCourseDetailsPage.loader).toBeUndefined();
            expect(dismissFn).toHaveBeenCalled();
            expect(mockLocalCourseService.setConsentPopupVisibility).toHaveBeenCalledWith(true);
            done()
        }, 0);
    });

    it('shoule invoked after consentPii popup dismissed', () => {
        jest.spyOn(enrolledCourseDetailsPage, 'checkDataSharingStatus').mockImplementation(() => {
            return;
        });
        mockLocalCourseService.setConsentPopupVisibility = jest.fn();
        enrolledCourseDetailsPage.onConsentPopoverDismiss();
        expect(mockLocalCourseService.setConsentPopupVisibility).toHaveBeenCalledWith(false);
    });

    it('should fetch consent PII data', () => {
        // arrange
        enrolledCourseDetailsPage.courseCardData = {
            userId: 'sample-user-id',
            content: { channel: 'sample-channel' },
            courseId: 'sample-do-id'
        };
        mockProfileService.getConsent = jest.fn(() => of([{
            status: ConsentStatus.ACTIVE,
            lastUpdatedOn: '02/02/2020'
        }]));
        // act
        enrolledCourseDetailsPage.checkDataSharingStatus();
    });

    it('should fetch consent PII data for catch part', () => {
        // arrange
        enrolledCourseDetailsPage.courseCardData = {
            userId: 'sample-user-id',
            content: { channel: 'sample-channel', userConsent: 'Yes' },
            courseId: 'sample-do-id'
        };
        enrolledCourseDetailsPage.isAlreadyEnrolled = true;
        mockProfileService.getConsent = jest.fn(() => throwError({ code: 'NETWORK_ERROR' }));
        mockCommonUtilService.showToast = jest.fn();
        // act
        enrolledCourseDetailsPage.checkDataSharingStatus();
    });

    it('should retrun checked for shareData', () => {
        // arrange
        enrolledCourseDetailsPage.showShareData = false;
        // act
        enrolledCourseDetailsPage.editDataSettings();
        // assert
        expect(enrolledCourseDetailsPage.showShareData).toBeTruthy();
    });

    it('should extend data settings for user click', () => {
        // arrange
        enrolledCourseDetailsPage.isDataShare = false;
        // act
        enrolledCourseDetailsPage.expandDataSettings();
        // assert
        expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
        expect(enrolledCourseDetailsPage.isDataShare).toBeTruthy();
    });

    describe('saveChanges', () => {
        it('should update userConsent for active status', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.ACTIVE;
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: 'sample-channel'
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                status: ConsentStatus.REVOKED,
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.courseCardData.content.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId,
                objectType: 'Collection',
            };
            mockProfileService.updateConsent = jest.fn(() => of({ message: 'successfull' }));
            mockCommonUtilService.showToast = jest.fn();
            jest.spyOn(enrolledCourseDetailsPage, 'checkDataSharingStatus').mockImplementation(() => {
                return (Promise.resolve());
            });
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FRMELEMNTS_MSG_DATA_SETTINGS_SUBMITED_SUCCESSFULLY');
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
                done();
            }, 0);
        });

        it('should not update userConsent for active status catch part', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.ACTIVE;
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: 'sample-channel'
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                status: ConsentStatus.REVOKED,
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.courseCardData.content.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId,
                objectType: 'Collection',
            };
            mockProfileService.updateConsent = jest.fn(() => throwError({ code: 'NETWORK_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            jest.spyOn(enrolledCourseDetailsPage, 'checkDataSharingStatus').mockImplementation(() => {
                return (Promise.resolve());
            });
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
                done();
            }, 0);
        });

        it('should return consent popup for revoked status', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.REVOKED;
            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            jest.spyOn(enrolledCourseDetailsPage, 'checkDataSharingStatus').mockImplementation(() => {
                return (Promise.resolve());
            });
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockConsentService.showConsentPopup).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('handleBackButton()', () => {
        it('should ', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'goBack');
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({}))
            } as any)));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((x, callback) => callback()),
                is: jest.fn()
            };
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({syllabus: ['']}));
            enrolledCourseDetailsPage.isConsentPopUp = true;
            // act
            enrolledCourseDetailsPage.handleBackButton();
            // assert
            expect(enrolledCourseDetailsPage.goBack).not.toBeCalled();

        });
    });

    describe('navigateToDashboard', () => {
        it('should navigate to dashboard', () => {
            // arrange
            enrolledCourseDetailsPage.courseHeirarchy = {
                identifier: 'some-id'
            } as any
            enrolledCourseDetailsPage.activityData = {
                activity: {
                    name: 'some-name'
                },
                group: {
                    id: 'some-id'
                }
            }as any
            // act
            enrolledCourseDetailsPage.navigateToDashboard()
            // assert
            expect(mockRouter.navigate).toHaveBeenCalled()
        });
    });
});