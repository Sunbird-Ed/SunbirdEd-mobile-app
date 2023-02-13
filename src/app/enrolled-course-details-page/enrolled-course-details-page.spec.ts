import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';
import {
    ProfileService, ContentService, EventsBusService, CourseService, SharedPreferences,
    AuthService, CorrelationData, TelemetryObject,
    ProfileType, UnenrollCourseRequest, ContentDetailRequest,
    ServerProfileDetailsRequest, ServerProfile,
    NetworkError, DownloadService
} from 'sunbird-sdk';
import {
    CourseUtilService, AppGlobalService, TelemetryGeneratorService,
    CommonUtilService, UtilityService, AppHeaderService,
    LocalCourseService, PageId, InteractType
} from '../../services';
import { NgZone } from '@angular/core';
import { PopoverController, Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { DatePipe } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { Location } from '@angular/common';
import {
    mockEnrolledData, contentDetailsResponse, mockCourseCardData,
    mockGetChildDataResponse, mockImportContentResponse,
    mockEnrolledCourses,
    mockCourseCardData_2, mockcontentHirerachyResponse, mockExpiredBatchEnrolledCourses
} from './enrolled-course-details-page.spec.data';
import { of, Subject, throwError } from 'rxjs';
import { ContentInfo } from '../../services/content/content-info';
import {PreferenceKey, ProfileConstants, EventTopics, BatchConstants, RouterLinks, ContentCard} from '../app.constant';
import { isObject } from 'util';
import { SbPopoverComponent } from '../components/popups';
import { Mode, Environment, ImpressionType, InteractSubtype, ErrorType } from '../../services/telemetry-constants';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { MimeType } from '../app.constant';
import { Consent, ConsentStatus, UserConsent } from '@project-sunbird/client-services/models';
import { CategoryKeyTranslator } from '@app/pipes/category-key-translator/category-key-translator-pipe';
import { ConsentService } from '../../services/consent-service';
import {
    TncUpdateHandlerService,
} from '../../services/handlers/tnc-update-handler.service';
import { mockProfileData } from '../profile/profile.page.spec.data';
import { CourseBatchStatus, CourseEnrollmentType, DiscussionService, LogLevel, SortOrder } from '@project-sunbird/sunbird-sdk';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';

const mockContentData = {
    content: {
        identifier: 'do_21280756435836108811838',
        contentData: {
            mimeType: 'application/vnd.ekstep.ecml-archive',
            contentType: 'Resource',
            identifier: 'do_21280756435836108811838',
            version: 2,
            size: 6194293,
            streamingUrl: 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_21280756435836108811838-latest',
            totalScore: 1,
            pkgVersion: 8,
        },
        isUpdateAvailable: false,
        mimeType: 'application/vnd.ekstep.ecml-archive',
        contentType: 'resource',
        isAvailableLocally: false,
        hierarchyInfo: [
            {
                identifier: 'do_212810592322265088178',
                contentType: 'textbook'
            },
            {
                identifier: 'do_212810592541261824179',
                contentType: 'textbookunit'
            },
            {
                identifier: 'do_2128084096298352641378',
                contentType: 'lessonplan'
            },
            {
                identifier: 'do_2128084109778042881381',
                contentType: 'lessonplanunit'
            }
        ]
    }
};

describe('EnrolledCourseDetailsPage', () => {
    let enrolledCourseDetailsPage: EnrolledCourseDetailsPage;
    const mockProfileService: Partial<ProfileService> = {
        getServerProfilesDetails: jest.fn(() => of()),
        updateConsent: jest.fn(() => of()),
        getConsent: jest.fn(() => of()),
        addContentAccess: jest.fn(() => of()),
        getActiveSessionProfile: jest.fn(() => of({serverProfile: {userName: ''}})) as any,
    };
    const mockContentService: Partial<ContentService> = {
        getContentDetails: jest.fn(() => of()),
        importContent: jest.fn(() => of(mockImportContentResponse)),
        getChildContents: jest.fn(),
        cancelDownload: jest.fn(),
        getContentHeirarchy: jest.fn(() => of()),
        setContentMarker: jest.fn(() => of())
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        events: jest.fn(() => of())
    };
    const mockCourseService: Partial<CourseService> = {
        getEnrolledCourses: jest.fn(() => of()),
        syncCourseProgress: jest.fn(),
        unenrollCourse: jest.fn(),
        getBatchDetails: jest.fn(),
        getContentState: jest.fn(() => of('success')),
        getCourseBatches: jest.fn(() => of({}))
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of()),
        putString: jest.fn(() => of()),
        getBoolean: jest.fn(() => of()),
    };
    const mockDownloadService: Partial<DownloadService> = {
        trackDownloads: jest.fn()
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({}))
    };
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn((topic, fn) => {
            if (topic === EventTopics.DEEPLINK_COURSE_PAGE_OPEN) {
                fn({content: {}});
            }
        }),
        unsubscribe: jest.fn()
    };
    const mockFileSizePipe: Partial<FileSizePipe> = {
        transform: jest.fn()
    };
    const mockPopoverCtrl: Partial<PopoverController> = {
    };
    const mockCourseUtilService: Partial<CourseUtilService> = {
        showCredits: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn((_, fn) => fn())
        } as any,
        is: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'SAMPLE_USER'),
        isUserLoggedIn: jest.fn(() => false),
        getGuestUserInfo: jest.fn(() => Promise.resolve('SAMPLE_GUEST_USER')),
        resetSavedQuizContent: jest.fn(),
        setEnrolledCourseList: jest.fn(),
        getEnrolledCourseList: jest.fn(() => mockEnrolledCourses),
        getCurrentUser: jest.fn(),
        getActiveProfileUid: jest.fn(() => Promise.resolve('')),
        generateCourseCompleteTelemetry: jest.fn(() => true) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateCancelDownloadTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn(),
        generatefastLoadingTelemetry: jest.fn(),
        generateLogEvent: jest.fn(),
        generateSpineLoadingTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird')),
        deDupe: jest.fn(),
        translateMessage: jest.fn(),
        networkInfo: {isNetworkAvailable: true},
        appendTypeToPrimaryCategory: jest.fn(() => 'sample-details'),
        getGuestUserConfig: jest.fn(() =>  Promise.resolve({
            board: ['sample-board'],
            medium: ['sample-medium'],
            grade: ['sample-grade'],
            syllabus: ['sample-board']
        })),
        getLoader: jest.fn(() => Promise.resolve({
            dismiss: jest.fn(() => Promise.resolve())
        }))
    };
    const mockDatePipe: Partial<DatePipe> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve(''))
    };
    const mockHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn(),
        headerEventEmitted$: {
            subscribe: jest.fn()
        } as any
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => ({extras:{state: ''}})) as any
    };
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {
        showContentDeletePopup: jest.fn()
    };
    const mockLocalCourseService: Partial<LocalCourseService> = {
        isConsentPopupVisible: jest.fn(),
        setConsentPopupVisibility: jest.fn(),
        prepareEnrollCourseRequest: jest.fn(),
        enrollIntoBatch: jest.fn(),
        prepareRequestValue: jest.fn(),
        isEnrollable: jest.fn()
    };
    const mockConsentService: Partial<ConsentService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };
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

    global.window.segmentation = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            getTags: jest.fn(() => undefined),
            restoreTags: jest.fn()
        }
    };
    window.console.error = jest.fn()

    beforeAll(() => {
        enrolledCourseDetailsPage = new EnrolledCourseDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventsBusService as EventsBusService,
            mockCourseService as CourseService,
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockDownloadService as DownloadService,
            mockDiscussionService as DiscussionService,
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
        mockRouter.getCurrentNavigation = jest.fn(() => mockEnrolledData) as any;
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.DEEPLINK_COURSE_PAGE_OPEN) {
                fn({content: ''});
            }
        })
        jest.spyOn(CsGroupAddableBloc.instance, 'initialised', 'get').mockReturnValue(false);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
        jest.spyOn(CsGroupAddableBloc.instance, 'initialised', 'get').mockReturnValue(true);
        mockRouter.getCurrentNavigation = jest.fn(() => mockEnrolledData) as any;
        mockCommonUtilService.networkInfo = {
            isNetworkAvailable: true
        };
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.DEEPLINK_COURSE_PAGE_OPEN) {
                fn({content: ''});
            }
        })
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
        it('should get App name and subscribe utility service by invoked ngOnInit()', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('SUNBIRD'));
            mockDownloadService.trackDownloads = jest.fn(() => Promise.resolve({
                pipe: jest.fn(() => ({
                    share: jest.fn()
                }))
            }));
            spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').and.returnValue('BASE_URL');
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'SAMPLE_BATCH'
            }
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
            expect(enrolledCourseDetailsPage.subscribeUtilityEvents).toHaveBeenCalled();
        });
        it('should get App name and subscribe utility service by invoked ngOnInit() and check either case', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('SUNBIRD'));
            mockDownloadService.trackDownloads = jest.fn(() => of());
            enrolledCourseDetailsPage.courseCardData = mockEnrolledData.extras?.state?.content;
            enrolledCourseDetailsPage.courseCardData.batchId = "";
            spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').and.returnValue('BASE_URL');
            const mockProfileRes = {
                serverProfile: {
                    userName: 'some_user'
                }
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileRes));
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('id'));
             // act
             enrolledCourseDetailsPage.ngOnInit();
             // assert
        })

        it('should handle else case if no bacth id', () => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('SUNBIRD'));
            mockDownloadService.trackDownloads = jest.fn(() => of());
            enrolledCourseDetailsPage.courseCardData = {}
            spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').and.returnValue('BASE_URL');
            const mockProfileRes = {
                serverProfile: {
                    userName: ''
                },
                handle: 'handle'
            };

            mockProfileService.getActiveSessionProfile = jest.fn(() => of(mockProfileRes) as any);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            enrolledCourseDetailsPage.ngOnInit();
            // assert
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.subscribeUtilityEvents).toHaveBeenCalled();
        });
    });

    describe('showDeletePopup()', () => {
        it('should navigate back on content deleted', () => {
            // arrange
            mockContentDeleteHandler.contentDeleteCompleted$ = of({});
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
            mockLocation.back = jest.fn();
            // act
            enrolledCourseDetailsPage.showDeletePopup();
            // assert
            setTimeout(() => {
            }, 0);
        });
        it('should navigate back on content deleted on skipped back action false', () => {
            // arrange
            mockContentDeleteHandler.contentDeleteCompleted$ = of({});
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
            mockLocation.back = jest.fn();
            // act
            enrolledCourseDetailsPage.showDeletePopup();
            // assert
            setTimeout(() => {
            }, 0);
        });
        it('should show delete popup by invoked showDeletePopup()', () => {
            // arrange
            mockContentDeleteHandler.contentDeleteCompleted$ = {
                subscribe: jest.fn((fn) => fn({}))
            } as any
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
        it('should show delete popup by invoked showDeletePopup onboardingSkippedBackAction true', () => {
            // arrange
            mockContentDeleteHandler.contentDeleteCompleted$ = {
                subscribe: jest.fn((fn) => fn({}))
            } as any
            enrolledCourseDetailsPage['isOnboardingSkipped'] = true;
            mockAuthService.getSession = jest.fn(() => of(false));
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
        it('check getContentState resposne is undefined', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            enrolledCourseDetailsPage.courseCardData = {
                progress: 30,
                batchId: '1234567890'
            }
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            mockCourseService.getContentState = jest.fn(() => of(undefined));
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{ identifier: 'do-123' }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check getContentState, if no course heirarchy childer length', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 1
                    }, {
                        contentId: 'id-123',
                        status: 2
                    }
                ]
            };
            enrolledCourseDetailsPage.courseCardData = {
                progress: 30,
                batchId: '1234567890'
            }
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: '',
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = false;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check getContentState', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 1
                    }, {
                        contentId: 'id-123',
                        status: 2
                    }
                ]
            };
            enrolledCourseDetailsPage.courseCardData = {
                progress: 30,
                batchId: '1234567890'
            }
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{ identifier: 'do-123' }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check, course herirarcy mimetype equal to collection', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [{contentId: 'do-123', status: 1}]
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            mockZone.run = jest.fn((fn) => fn()) as any;
            enrolledCourseDetailsPage.courseHeirarchy = {
                mimeType: MimeType.COLLECTION,
                children: [{ identifier: 'do-123', children: [{identifier: 'do-123', children: [{identifier: 'do-123'}]}] }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check, course herirarcy mimetype equal to collection, if no contentlist', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: []
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            mockZone.run = jest.fn((fn) => fn()) as any;
            enrolledCourseDetailsPage.courseHeirarchy = {
                mimeType: MimeType.COLLECTION,
                children: [{ identifier: 'do-123', children: [{identifier: 'do-123', children: [{identifier: 'do-123'}]}] }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check, course herirarcy mimetype not equal to collection', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [
                    {
                        contentId: 'do-123',
                        status: 3
                    }, {
                        contentId: 'do-123',
                        status: 2
                    }
                ]
            };
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            mockZone.run = jest.fn((fn) => fn()) as any;
            enrolledCourseDetailsPage.courseHeirarchy = {
                mimeType: MimeType.VIDEO,
                children: [{ identifier: 'do-123' }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check, course herirarcy mimetype not equal to collection, and isNextContentFound true', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [
                    {
                        contentId: '',
                        status: 3
                    }, {
                        status: 2
                    }
                ]
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockCourseService.getContentState = jest.fn(() => of(contentState));
            enrolledCourseDetailsPage.courseHeirarchy = {
                mimeType: MimeType.COLLECTION,
                children: [{ identifier: 'do-123', children: [{identifier: 'do-123'}] }],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            mockPlatform.is = jest.fn(platform => platform == 'ios');
            enrolledCourseDetailsPage.isNextContentFound = true;
            enrolledCourseDetailsPage.resumeCourseFlag = false;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check, check error on get content state', (done) => {
            // arrange
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            const contentState = {
                contentList: [
                    {
                        contentId: '',
                        status: 3
                    }, {
                        status: 2
                    }
                ]
            };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            enrolledCourseDetailsPage.courseCardData.batchId = '1234567890';
            mockCourseService.getContentState = jest.fn(() => throwError(contentState));
            enrolledCourseDetailsPage.courseHeirarchy = {
                mimeType: MimeType.COLLECTION,
                children: [{ identifier: 'do-123', children: [{identifier: 'do-123'}]}],
                contentData: { leafNodes: ['do_1', 'do_12', 'do_123'] }
            };
            mockZone.run = jest.fn((fn) => fn()) as any;
            enrolledCourseDetailsPage.isNextContentFound = true;
            enrolledCourseDetailsPage.resumeCourseFlag = true;
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.resumeCourseFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('check getContentState, if no batch id', (done) => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                progress: 30,
                batchId: ''
            }
            // act
            enrolledCourseDetailsPage.getContentState(false);
            // assert
            setTimeout(() => {
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
                progress: 80
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

        it('should set showUnenrollButton to true', () => {
            // arrange
            enrolledCourseDetailsPage.updatedCourseCardData = '';
            enrolledCourseDetailsPage.batchDetails = {
                status: 1,
                enrollmentType: ''
            };
            enrolledCourseDetailsPage.course = {
                progress: 80
            };
            // act
            enrolledCourseDetailsPage.handleUnenrollButton();
            // assert
            expect(enrolledCourseDetailsPage.showUnenrollButton).toEqual(true);
        });
    });

    describe('saveContentContext()', () => {
        it('should saved context of content by invoked saveContentContext()', () => {
            // arrange
            const userId = 'sample-user-id';
            const courseId = 'course-card';
            const batchId = 'sample-batch-id';
            const batchStatus = 2;
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

        it('should saved context of content by invoked saveContentContext()', () => {
            // arrange
            const userId = 'sample-user-id';
            const courseId = 'course-card';
            const batchId = 'sample-batch-id';
            const batchStatus = 0;
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
            expect(Boolean(batchStatus)).toBeFalsy();
        });
    });

    describe('getBatchDetails()', () => {
        it('should return on no batch id, course card data', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = "";
            // act
            enrolledCourseDetailsPage.getBatchDetails();
        });
        it('should return if batch id is present ', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.getBatchDetails('')
            // assert
        })

        it('should return if data not present for get batch details', () => {
            // aarange
            enrolledCourseDetailsPage.batchDetails = '';
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            // act
            enrolledCourseDetailsPage.getBatchDetails();
            // assert
        })
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
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
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
                status: 2,
                endDate: '3-2-2022',
                enrollmentEndDate: '7-3-2022',
                cert_templates: [{description: 'des'}]
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            enrolledCourseDetailsPage['batchRemaningTimingIntervalRef'] = true;
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockLocalCourseService.getTimeRemaining = jest.fn();
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

        it('should return course batch details of expire date start date by invoked getBatchDetails() for status 3', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.DEPLOYMENT_KEY,
                status: 3,
                endDate: '3-2-2022',
                enrollmentEndDate: '7-3-2022',
                cert_templates: {}
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            enrolledCourseDetailsPage['batchRemaningTimingIntervalRef'] = true;
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockLocalCourseService.getTimeRemaining = jest.fn();
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

        it('should return course batch details of expire date start date by invoked getBatchDetails() for status 2, if no description', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.DEPLOYMENT_KEY,
                status: 1,
                endDate: '',
                enrollmentEndDate: '7-3-2022',
                cert_templates: [{description: ''}]
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            enrolledCourseDetailsPage.batchEndDate = '3-4-2022';
            enrolledCourseDetailsPage['batchRemaningTimingIntervalRef'] = true;
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockLocalCourseService.getTimeRemaining = jest.fn();
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
                status: 0,
                cert_templates: ''
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id'
            };
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getUserId = jest.fn(() => 'sample-user-id');
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
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
                status: 1
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

        it('should saved content context by invoked getBatchDetails() for catch part, on batch end date', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.COURSE_IDENTIFIER,
                status: 1
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id',
                batch: {
                    endDate: '3-2-2022',
                    enrollmentEndDate: '7-3-2022',
                }
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

        it('should saved content context by invoked getBatchDetails() for catch part on batch enrollment end date', (done) => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                identifier: PreferenceKey.COURSE_IDENTIFIER,
                status: 1
            };
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample_batch_id',
                batch: {
                    endDate: '',
                    enrollmentEndDate: '7-3-2022',
                }
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
        it('should fetch all batch list, if no data on get course batches', (done) => {
            // arrange
            const data = ''
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(false);
                expect(enrolledCourseDetailsPage.batches).toEqual([]);
                done();
            }, 0);
        });

        it('should fetch all batch list, if certificate template available', (done) => {
            // arrange
            const data = [
                {
                    enrollmentEndDate: '01/01/2020',
                    cert_templates: {}
                },
                {
                    enrollmentEndDate: '01/01/2020',
                    cert_templates: {}
                }
            ];
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showOfflineSection).toEqual(false);
                expect(enrolledCourseDetailsPage.batchCount).toEqual(data.length);
                expect(enrolledCourseDetailsPage.batches).toEqual(data);
                done();
            }, 0);
        });

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
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
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
            jest.spyOn(enrolledCourseDetailsPage, 'getBatchDetails').mockImplementation();
            // act
            enrolledCourseDetailsPage.getAllBatches();
            // assert
            setTimeout(() => {
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
        it('should update enroll details list by invoked updateEnrolledCourseData(), handle else case', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => of());
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
        it('should update enroll details list by invoked updateEnrolledCourseData(), handle else case', (done) => {
            // arrange
            enrolledCourseDetailsPage.identifier = "sample-course-id";
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{
                batchId: 'sample-batch-id',
                courseId: 'sample-course-id'
            }]));
            enrolledCourseDetailsPage.courseCardData = {
                batchId: ''
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
        it('should update enroll details list by invoked updateEnrolledCourseData() for error case', (done) => {
            // arrange
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError({error: 'err'}));
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'sample-batch-id'
            };
            // act
            enrolledCourseDetailsPage.updateEnrolledCourseData();
            // assert
            setTimeout(() => {
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
                    contentId: 'sample-course-id',
                    contentType: 'sample-type',
                    status: 1
                });
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.LAST_ACCESS_ON, true);
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'sample-course-id',
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
            }
            enrolledCourseDetailsPage.content = {
                contentType: ''
            }
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
                    contentId: 'sample-course-id',
                    contentType: 'sample-type',
                    status: 1
                });
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'sample-course-id',
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

        it('should be joined training for logged in user, navigate to batch list page on delete', async (done) => {
            // arrange
            const ondiddmiss =  jest.fn(() => Promise.resolve({ data: {canDelete: true }}))
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: ondiddmiss
            } as any)));
            mockCourseService.getBatchDetails = jest.fn(() => of(enrolledCourseDetailsPage.batchDetails));
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').and.stub();
            spyOn(mockCourseService, 'getBatchDetails').and.stub();
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
            mockEvents.subscribe = jest.fn((_, fn) => fn({ batchId: 'SAMPLE_BATCH_ID', courseId: 'sample-course-id' }));
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            mockCourseService.getCourseBatches = jest.fn(() => of({}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            })) as any
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR', progress: 100 };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement: {
                    classList: { remove: jest.fn(), add: jest.fn() }
                }
            };
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 0, mimeType: 'application/pdf', children: [{ identifier: 'id-123' }]}, {progressPercentage: 0, mimeType: 'application/pdf', children: [{}], identifier: 'id-123'}],
                contentData: {
                    leafNodes: []
                },
                mimeType: 'application/pdf',
                identifier: 'id-123'
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
            spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                // expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.updateEnrolledCourseData).toBeCalled();
                expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.joinTraining).toBeCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                // done();
            }, 0);
        });

        it('should update courseCard data and return base url by invoked subscribeUtilityEvents(), for else case', () => {
            // arrange
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
            mockEvents.subscribe = jest.fn((_, fn) => { 
                if(_ == EventTopics.ENROL_COURSE_SUCCESS){
                    fn({})
                }
                fn({ isEnrolled: true, isBatchNotStarted: true, batchId: '', courseId: '' })});
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            enrolledCourseDetailsPage.courseCardData = {
                batchId: ''
            }
            mockCourseService.getCourseBatches = jest.fn(() => of({}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            })) as any
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR', progress: 100 };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement:''
            };
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 0, identifier: 'id-123', mimeType: 'application/pdf'}],
                contentData: {
                    leafNodes: []
                }
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
            spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                expect(enrolledCourseDetailsPage.updateEnrolledCourseData).toBeCalled();
                expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                // done();
            }, 0);
        });

        it('should update courseCard data and return base url by invoked subscribeUtilityEvents(), for else case isBatchNotStarted false', () => {
            // arrange
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
            mockEvents.subscribe = jest.fn((_, fn) => { 
                if(_ == EventTopics.ENROL_COURSE_SUCCESS){
                    fn('')
                }
                fn({ isEnrolled: true, isBatchNotStarted: false, batchId: '', courseId: 'SAMPLE_COURSE_ID' })});
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            enrolledCourseDetailsPage.courseCardData = ''
            mockCourseService.getCourseBatches = jest.fn(() => of({}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            })) as any
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR', progress: 100 };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement:''
            };
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 0}],
                contentData: {
                    leafNodes: []
                }
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
            spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                expect(enrolledCourseDetailsPage.updateEnrolledCourseData).toBeCalled();
                expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
            }, 0);
        });

        it('should update courseCard data and return base url by invoked subscribeUtilityEvents(), for else case isBatchNotStarted false', () => {
            // arrange
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
            enrolledCourseDetailsPage.courseCardData = {
                batchId: ''
            }
            mockEvents.subscribe = jest.fn((_, fn) => {
                fn({ isEnrolled: true, isBatchNotStarted: false, batchId: 'SAMPLE_BATCHID', courseId: 'SAMPLE_COURSE_ID' })});
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            enrolledCourseDetailsPage.userId = 'SAMPLE_CREATOR';
            enrolledCourseDetailsPage.identifier = 'SAMPLE_COURSE_ID';
            mockCourseService.getCourseBatches = jest.fn(() => of({}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            })) as any
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }));
            enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR', progress: 100 };
            enrolledCourseDetailsPage.stickyPillsRef = {
                nativeElement:''
            };
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 0, contentData: {size: 2}}],
                contentData: {
                    leafNodes: []
                }
            }
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
            spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
            mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'getContentState').mockImplementation(() => {
                return;
            });
            // act
            enrolledCourseDetailsPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
                expect(enrolledCourseDetailsPage.updateEnrolledCourseData).toBeCalled();
                expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
                expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('extractApiResponse()', () => {
        it('should return last played content and license', async() => {
            // assert
            const response = contentDetailsResponse;
            spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
            spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
            spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
            enrolledCourseDetailsPage.courseCardData = { lastReadContentId: 'SAMPLE_LAST_READ_CONTENT', contentTypesCount: 3 };
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            mockCommonUtilService.appendTypeToPrimaryCategory = jest.fn(() => 'course-detail');
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

        it('should return last played content and license, userid is same as course id', () => {
            // assert
            enrolledCourseDetailsPage.didViewLoad = false;
            const response = {
                identifier: 'do_21281258639073280011490',
                contentData: {licenseDetails: '', isAvailableLocally: true, status: 'Live', gradeLevel: '', attributions: '', createdBy: enrolledCourseDetailsPage.userId},
                isUpdateAvailable: false,
                mimeType: 'application / vnd.ekstep.content - collection',
                basePath: '',
                contentType: 'course',
                isAvailableLocally: false,
                referenceCount: 0,
                sizeOnDevice: 0,
                lastUsedTime: 0,
                lastUpdatedTime: 0,
                contentAccess: [],
                contentFeedback: '',
            };
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
            spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
            spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
            enrolledCourseDetailsPage.courseCardData = { lastReadContentId: 'SAMPLE_LAST_READ_CONTENT' };
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            mockCommonUtilService.appendTypeToPrimaryCategory = jest.fn(() => 'course-detail');
            mockProfileService.getConsent = jest.fn(() => of())
            // act
            enrolledCourseDetailsPage.extractApiResponse(response);
            // assert
            expect(response.contentData.status).toBe('Live');
        });

        it('should return last played content and license else case', () => {
            // assert
            enrolledCourseDetailsPage.didViewLoad = true;
            const response = {
                identifier: 'do_21281258639073280011490',
                contentData: {licenseDetails: '', isAvailableLocally: true, status: 'Live', gradeLevel: ['class4'], attributions: '', createdBy: enrolledCourseDetailsPage.userId},
                isUpdateAvailable: false,
                mimeType: 'application / vnd.ekstep.content - collection',
                basePath: '',
                contentType: 'course',
                isAvailableLocally: false,
                referenceCount: 0,
                sizeOnDevice: 0,
                lastUsedTime: 0,
                lastUpdatedTime: 0,
                contentAccess: [],
                contentFeedback: '',
            };
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
            spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
            spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
            enrolledCourseDetailsPage.courseCardData = { lastReadContentId: 'SAMPLE_LAST_READ_CONTENT' };
            mockHeaderService.showHeaderWithBackButton = jest.fn(() => { });
            mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
            mockLocation.back = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            mockCommonUtilService.appendTypeToPrimaryCategory = jest.fn(() => 'course-detail');
            mockProfileService.getConsent = jest.fn(() => of())
            // act
            enrolledCourseDetailsPage.extractApiResponse(response);
            // assert
            expect(response.contentData.status).toBe('Live');
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

        it('should checked current user type for cath part by invoked checkCurrentUserType()', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = true;
            mockAppGlobalService.getGuestUserInfo = jest.fn(() => Promise.resolve('SAMPLE_USER'));
            // act
            enrolledCourseDetailsPage.checkCurrentUserType();
            // assert
            expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
        });

        it('should handle else case is no guest user', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            // act
            enrolledCourseDetailsPage.checkCurrentUserType();
            // assert
        });
    });

    describe('rateContent()', () => {
        it('should not show user rating for content if guest user, is not AccessibleForNonStudentRole', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => (true));
            enrolledCourseDetailsPage.isGuestUser = true;
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            enrolledCourseDetailsPage.profileType = ProfileType.STUDENT;
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeFalsy();
                expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalledWith(ProfileType.TEACHER);
            }, 0);
        });

        it('should not show user rating for content if guest user', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => (true));
            enrolledCourseDetailsPage.isGuestUser = true;
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            enrolledCourseDetailsPage.profileType = ProfileType.TEACHER;
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeFalsy();
                expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalledWith(ProfileType.TEACHER);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SIGNIN_TO_USE_FEATURE');
            }, 0);
        });

        it('should not show user rating for content if content is not available locally and user in not a guest user', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => (false));
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
            }, 0);
        });

        it('should show user rating for content for loggedin user', () => {
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
            }, 0);
        });

        it('should show user rating for content for loggedin user, on dismiss message is not success', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            enrolledCourseDetailsPage.course = {
                isAvailableLocally: true
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { message: 'rating.failure', rating: 2, comment: 'some_comment' } }))
            } as any)));
            // act
            enrolledCourseDetailsPage.rateContent('');
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.isGuestUser).toBeFalsy();
                expect(mockPopoverCtrl.create).not.toBeUndefined();
                expect(enrolledCourseDetailsPage.userRating).toBe(2);
                expect(enrolledCourseDetailsPage.ratingComment).toBe('some_comment');
            }, 0);
        });
    });

    describe('showOverflowMenu()', () => {
        it('should show traning leave popover by invoked showOverflowMenu()', () => {
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
            }, 0);
        });

        it('should show traning leave popover by invoked showOverflowMenu(), and sync progress', () => {
            // arrange
            const event = {};
            const presentFn = jest.fn(() => ({}));
            enrolledCourseDetailsPage.batchDetails = {
                id: 'id'
            }
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: false, syncProgress: true } }));
            mockPopoverCtrl.create = jest.fn(() => ({
                present: presentFn,
                onDidDismiss: onDidDismissFn
            }) as any);
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockTelemetryGeneratorService.generateLogEvent = jest.fn();
            mockCourseService.syncCourseProgress = jest.fn(() => of());
            // act
            enrolledCourseDetailsPage.showOverflowMenu(event);
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
            }, 0);
        });

        it('should show traning leave popover by invoked showOverflowMenu(), and handle else case', () => {
            // arrange
            const event = {};
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: { unenroll: false, syncProgress: false } }));
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
            }, 0);
        });
    });

    describe('handleUnenrollment()', () => {
        it('should handle unenrolled for enrolled course', () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
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
                    { id: 'do_21281258639073280011490', type: undefined, version: '' },
                    undefined,
                    {"l1": "do_212810592322265088178",
                    "l2": "do_212810592541261824179",
                    "l3": "do_2128084096298352641378",
                    "l4": "do_2128084109778042881381"},
                    undefined
                );
                expect(mockEvents.publish).toHaveBeenCalled();
            }, 0);
        });

        it('should handle unenrolled for enrolled course for error part of UNENROL_COURSE_SUCCESS', () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.batchDetails = {
                id: '',
                courseId: ''
            };
            mockZone.run = jest.fn((fn) => fn()) as any;
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
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('FRMELEMNTS_MSG_UNABLE_TO_ENROLL'));
            }, 0);
        });

        it('should handle unenrolled for enrolled course for error part of ERROR_NO_INTERNET_MESSAGE', () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
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
            }, 0);
        });

        it('should handle unenroll false', () => {
            // act
            enrolledCourseDetailsPage.handleUnenrollment(false);
        })
    });

    describe('setContentDetails()', () => {
        it('should return content details for extractApiResponse by called setContentDetails()', () => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = false, 
            contentDetailsResponse.contentData = {progress: 100}
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockPlatform.is = jest.fn(platform => platform == 'ios');
            jest.spyOn(mockContentService, 'getContentHeirarchy').mockReturnValue(of(mockcontentHirerachyResponse));
            mockZone.run = jest.fn((fn) => fn()) as any;
            spyOn(enrolledCourseDetailsPage, 'getContentState').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toBeCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
            }, 0);
        });

        it('should return content details for extractApiResponse by called setContentDetails(), for platfrom android', () => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = false;
            contentDetailsResponse.contentData = {progress: 100}
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockPlatform.is = jest.fn(platform => platform == 'android');
            jest.spyOn(mockContentService, 'getContentHeirarchy').mockReturnValue(of(mockcontentHirerachyResponse));
            mockZone.run = jest.fn((fn) => fn());
            spyOn(enrolledCourseDetailsPage, 'getContentState').and.stub();
            jest.spyOn(enrolledCourseDetailsPage, 'markContent').mockImplementation();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).toBeCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
            }, 0);
        });

        it('should fail getContentHeirarchy() response', () => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = false;
            contentDetailsResponse.contentData = {progress: 100}
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockPlatform.is = jest.fn(platform => platform == 'android');
            mockZone.run = jest.fn((fn) => fn()) as any;
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
            }, 0);
        });

        it('should fail getContentHeirarchy() response', () => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            contentDetailsResponse.isAvailableLocally = true;
            contentDetailsResponse.contentData = {progress: 100}
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockZone.run = jest.fn((fn) => fn());
            jest.spyOn(mockContentService, 'getContentHeirarchy');
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockContentService.getContentHeirarchy).not.toBeCalled();
                expect(enrolledCourseDetailsPage.extractApiResponse).toHaveBeenCalled();
            }, 0);
        });

        it('should not return content details for networkError  by called setContentDetails()', () => {
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
            }, 0);
        });

        it('should not return content details for ERROR_NO_INTERNET_MESSAGE  by called setContentDetails()', () => {
            // arrange
            const option: ContentDetailRequest = {
                contentId: 'do_21281258639073280011490',
                attachFeedback: true,
                emitUpdateIfAny: true,
                attachContentAccess: true
            };
            mockContentService.getContentDetails = jest.fn(() => throwError(new NetworkError('ERROR_NO_INTERNET_MESSAGE')));
            mockCommonUtilService.showToast = jest.fn(() => 'Error fetching data');
            mockLocation.back = jest.fn();
            // act
            enrolledCourseDetailsPage.setContentDetails('do_21281258639073280011490');
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalledWith(option);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(mockLocation.back).toHaveBeenCalled();
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
            expect(enrolledCourseDetailsPage.downloadSize).toEqual(57901356);
        });

        it('should populate downloadIdentifiers, condtn for mimetype', () => {
            // arrange
            const mockGetChildDataResponse = [
                {
                  identifier: 'do_2127509912525127681407',
                  contentData: {
                    identifier: 'do_2127509912525127681407',
                    pkgVersion: 1,
                    name: 'Unit 1',
                    lastUpdatedOn: '2019-04-29T05:59:21.903+0000',
                    contentType: 'CourseUnit',
                    status: 'Live',
                  },
                  isUpdateAvailable: false,
                  mimeType: 'application/vnd.sunbird.questionset',
                  contentType: 'courseunit',
                  isAvailableLocally: true,
                  referenceCount: 1,
                  sizeOnDevice: 0,
                  hierarchyInfo: [
                    {
                      identifier: 'do_2127509908237926401406',
                      contentType: 'course'
                    },
                    {
                      identifier: 'do_2127509912525127681407',
                      contentType: 'courseunit'
                    }
                  ],
                  children: [
                    {
                      identifier: 'do_21274246255366963214046',
                      contentData: {
                        size: 2466640,
                        name: 'Sachin Mp4_1101',
                        downloadUrl: 'sample-download-url'
                      },
                      isUpdateAvailable: false,
                      mimeType: 'video/mp4',
                      basePath: '/storage/emulated/0/Android/data/org.sunbird.app.staging/files/content/do_21274246255366963214046/',
                      contentType: 'resource',
                      isAvailableLocally: false,
                      referenceCount: 1,
                      sizeOnDevice: 2737,
                      hierarchyInfo: [
                        {
                          identifier: 'do_2127509908237926401406',
                          contentType: 'course'
                        },
                        {
                          identifier: 'do_2127509912525127681407',
                          contentType: 'courseunit'
                        }
                      ]
                    }
                  ]
            }]
            enrolledCourseDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            // act
            enrolledCourseDetailsPage.getContentsSize(mockGetChildDataResponse);
            // assert
            expect(enrolledCourseDetailsPage.downloadSize).toEqual(60367996);
        });

        it('should populate downloadIdentifiers, if no data', () => {
            // arrange
            enrolledCourseDetailsPage.downloadIdentifiers = {
                add: jest.fn()
            } as any;
            // act
            enrolledCourseDetailsPage.getContentsSize('');
            // assert
            expect(enrolledCourseDetailsPage.downloadSize).toEqual(60367996);
        });
    });

    describe('setChildContents()', () => {
        it('should fetch child contents ', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: '123123123'
            };
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            enrolledCourseDetailsPage.skipCheckRetiredOpenBatch = false;
            mockContentService.getChildContents = jest.fn(() => of({
                id: 'do-123',
                children: [{ id: 'do-1-123' }]
            }));
            mockZone.run = jest.fn((fn) => fn()) as any;
            window.setTimeout = jest.fn((fn) => fn(), 1000) as any;
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
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                     "children": [
                          {
                            "children": [
                              {
                                "identifier": "do_135241341148",
                              },
                              {
                                "identifier": "do_135241345727",
                              }
                            ]
                          },
                          {
                            "children": [
                              {
                                "identifier": "do_135241341784",
                              },
                              {
                                "identifier": "do_135521312312",
                              }
                            ]
                          }
                        ]
                });
            }, 0);
        });

        it('should fetch child contents, else case ', () => {
            // arrange
            enrolledCourseDetailsPage.stickyPillsRef = {} as any;
            mockContentService.getChildContents = jest.fn(() => of({
                id: 'do-123',
                children: [{ id: 'do-1-123' }]
            }));
            enrolledCourseDetailsPage['hasInit'] = true;
            mockZone.run = jest.fn((fn) => fn()) as any;
            window.setTimeout = jest.fn((fn) => fn(), 1000) as any;
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
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                    id: 'do-123',
                    children: [{ id: 'do-1-123' }]
                });
            }, 0);
        });

        it('should fetch child contents and check stickypills', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: '123123123'
            };
            enrolledCourseDetailsPage.stickyPillsRef = {
                navtiveElement: {
                    classList: ""
                }
            } as any;
            mockContentService.getChildContents = jest.fn(() => of({
                id: 'do-123',
                children: [{ id: 'do-1-123' }]
            }));
            mockZone.run = jest.fn((fn) => fn()) as any;
            window.setTimeout = jest.fn((fn) => fn(), 1000) as any;
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
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                    id: 'do-123',
                    children: [{ id: 'do-1-123' }]
                });
            }, 0);
        });

        it('should fetch child contents, else case if no data ', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: ''
            };
            mockContentService.getChildContents = jest.fn(() => of({
                id: 'do-123',
                children: ''
            }));
            enrolledCourseDetailsPage['hasInit'] = true;
            mockZone.run = jest.fn((fn) => fn()) as any;
            window.setTimeout = jest.fn((fn) => fn(), 1000) as any;
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
                expect(enrolledCourseDetailsPage.courseHeirarchy).toStrictEqual({
                    id: 'do-123',
                    children: [{ id: 'do-1-123' }]
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
                expect(enrolledCourseDetailsPage.showChildrenLoader).toEqual(false);
                expect(mockContentService.getChildContents).toHaveBeenCalled();
                expect(mockZone.run).toHaveBeenCalled();
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(respones));
            // act
            enrolledCourseDetailsPage.getBatchCreatorName();
            // assert
            expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(req);
        });

        it('should return batch creator name by invoked getBatchCreatorName(), if no creatorDetails', () => {
            // arrange
            enrolledCourseDetailsPage.batchDetails = {
                courseId: 'sample_course_id',
                createdBy: 'sample-creator',
                creatorDetails: ''
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

        it('should return batch creator name by invoked getBatchCreatorName(), if no first and last name', () => {
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
                firstName: '',
                lastName: ''
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(respones));
            // act
            enrolledCourseDetailsPage.getBatchCreatorName();
            // assert
            expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalledWith(req);
        });

        it('should return batch creator name by invoked getBatchCreatorName(), if no data', () => {
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
            mockProfileService.getServerProfilesDetails = jest.fn(() => of(''));
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

        it('should be set course structure if contentTypesCount is not present in course and also in course card data', () => {
            // arrange
            enrolledCourseDetailsPage.course = {};
            enrolledCourseDetailsPage.courseCardData = {}
            // act
            enrolledCourseDetailsPage.setCourseStructure();
            // assert
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

        it('should get import content body by invoked getImportContentRequestBody(), for ios platform', () => {
            // arrange
            const identifiers = ['do_101', 'do_102', 'do_103'];
            enrolledCourseDetailsPage.corRelationList = [];
            mockPlatform.is = jest.fn(platform => platform == 'ios');
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
                expect(enrolledCourseDetailsPage.showLoading).toBeFalsy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateDownloadAllClickTelemetry).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.HOME,
                    'ERR_DOWNLOAD_FAILED',
                    ErrorType.SYSTEM,
                    PageId.COURSE_DETAIL,
                    expect.any(String)
                );
            }, 0);
        });

        it('should populate queuedIdentifiers for status 2', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => of([{
                status: 2,
                identifier: 'do-123'
            }, {
                identifier: 'do-234',
                status: 3
            }]));
            mockZone.run = jest.fn((fn) => fn());
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            enrolledCourseDetailsPage.isDownloadStarted = true;
            enrolledCourseDetailsPage['isDownloadAllClicked'] = false;
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
                expect(enrolledCourseDetailsPage.showLoading).toBeFalsy();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateDownloadAllClickTelemetry).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.HOME,
                    'ERR_DOWNLOAD_FAILED',
                    ErrorType.SYSTEM,
                    PageId.COURSE_DETAIL,
                    expect.any(String)
                );
            }, 0);
        });

        it('should populate queuedIdentifiers has length', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => of([{
                status: 2,
                identifier: 'do-123'
            }, {
                identifier: 'do-234',
                status: 0
            }]));
            mockZone.run = jest.fn((fn) => fn());
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            enrolledCourseDetailsPage.isDownloadStarted = false;
            enrolledCourseDetailsPage.queuedIdentifiers = [''];
            enrolledCourseDetailsPage.faultyIdentifiers = [];
            enrolledCourseDetailsPage.course = {
                identifier: 'do-123'
            };
            mockTelemetryGeneratorService.generateDownloadAllClickTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, false);
            // assert
            setTimeout(() => {
                expect(enrolledCourseDetailsPage.showLoading).toBeFalsy();
                expect(mockZone.run).toHaveBeenCalled();
            }, 0);
        });

        it('should return toast for catch part', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => throwError({ error: 'NETWORK_ERROR' }));
            mockZone.run = jest.fn((fn) => fn()) as any;
            enrolledCourseDetailsPage.isDownloadStarted = true;
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, false);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toBeCalled();
                expect(mockCommonUtilService.showToast).toBeCalledWith('NEED_INTERNET_TO_CHANGE');
            }, 0);
        });

        it('should return toast for catch part, isDownloadStarted false', () => {
            // arrange
            mockContentService.importContent = jest.fn(() => throwError({ error: '' }));
            mockZone.run = jest.fn((fn) => fn());
            enrolledCourseDetailsPage.isDownloadStarted = false;
            jest.spyOn(enrolledCourseDetailsPage, 'restoreDownloadState').mockImplementation();
            // act
            enrolledCourseDetailsPage.importContent(['do_21274246255366963214046', 'do_21274246302428364814048'], true, false);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toBeCalled();
                expect(mockCommonUtilService.showToast).toBeCalledWith('UNABLE_TO_FETCH_CONTENT');
            }, 0);
        });
    });

    describe('showDownloadConfirmationAlert()', () => {
        it('should show toast if network not available', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.showDownloadConfirmationAlert()
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
            }, 0);
        })
        it('should show DownloadConfirmation Popup', () => {
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
            }, 0);
        });

        it('should show DownloadConfirmation Popup, else cases if network available', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            enrolledCourseDetailsPage.downloadIdentifiers = {
                size: 0
            } as any;
            enrolledCourseDetailsPage.course = {
                name: 'sample-course-name'
            };
            enrolledCourseDetailsPage.isBatchNotStarted = false;
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockCommonUtilService.showToast = jest.fn();
            const presentFn = jest.fn(() => ({}));
            const onDidDismissFn = jest.fn(() => ({ data: '' }));
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
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'DOWNLOAD');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'DOWNLOAD');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'ITEMS', '');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'ITEMS', '');
                // expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                // expect(mockDatePipe.transform).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    'download-all-button-clicked',
                    Environment.HOME,
                    PageId.COURSE_DETAIL
                );
                expect(mockEvents.publish).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('promptToLogin()', () => {
        it('should invoke LoginHandler signin method', () => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-message');
            mockCategoryKeyTranslator.transform = jest.fn(() => 'sample-message');
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
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
                    {"l1": "do_212810592322265088178",
                    "l2": "do_212810592541261824179",
                    "l3": "do_2128084096298352641378",
                    "l4": "do_2128084109778042881381",}, []
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
                    PreferenceKey.CDATA_KEY, JSON.stringify([]));
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
                    {"l1": "do_212810592322265088178",
                     "l2": "do_212810592541261824179",
                     "l3": "do_2128084096298352641378",
                     "l4": "do_2128084109778042881381",},
                    []
                );
                expect(mockAppGlobalService.resetSavedQuizContent).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
            }, 0);
        });

        it('should return popup for else part', () => {
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
                    {"l1": "do_212810592322265088178",
                    "l2": "do_212810592541261824179",
                    "l3": "do_2128084096298352641378",
                    "l4": "do_2128084109778042881381",}, []
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
        it('should call promptToLogin()', () => {
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
            }, 0);
        });

        it('should should successfuly enroll', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.prepareRequestValue = jest.fn(() => new Map());
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => of({}));
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled corses');
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            mockDownloadService.trackDownloads = jest.fn(() => of({}))
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
            }, 0);
        });

        it('should should successfuly enroll, if no loader', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.reject({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const batch = {
                id: '121232312'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.prepareRequestValue = jest.fn(() => new Map());
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => of({}));
            mockZone.run = jest.fn((fn) => fn()) as any;
            mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled corses');
            mockCommonUtilService.showToast = jest.fn();
            mockEvents.publish = jest.fn(() => []);
            mockDownloadService.trackDownloads = jest.fn(() => of({}))
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
            }, 0);
        });

        it('should should fail', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
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
            }, 0);
        });

        it('should should fail, and no loader', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockLocalCourseService.prepareEnrollCourseRequest = jest.fn(() => ({ id: 'sample-id' }));
            mockCommonUtilService.getLoader = jest.fn(() => '');
            const batch = {
                id: '121232312'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockLocalCourseService.prepareRequestValue = jest.fn(() => new Map());
            mockLocalCourseService.enrollIntoBatch = jest.fn(() => throwError({}));
            mockZone.run = jest.fn((fn) => fn()) as any;
            // act
            enrolledCourseDetailsPage.enrollIntoBatch(batch);
            // assert
            expect(mockLocalCourseService.prepareEnrollCourseRequest).toBeCalled();
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
                expect(mockZone.run).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('handleHeaderEvents()', () => {
        it('should call share()', () => {
            // arrange
            const event = {
                name: 'share'
            };
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            })) as any
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
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
            mockAuthService.getSession = jest.fn(() => of(true));
            enrolledCourseDetailsPage['isOnboardingSkipped'] = true;
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['', 'sample-syllabus']
            }));
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
        });

        it('should call handleNavBackButton() and goBack()', () => {
            // arrange
            const event = {
                name: 'back'
            };
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['', 'sample-syllabus']
            }));
            // act
            enrolledCourseDetailsPage.handleHeaderEvents(event);
            // assert
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

        it('should call generateInteractTelemetry(), if event value is modules', () => {
            // act
            enrolledCourseDetailsPage.onSegmentChange({
                detail: {
                    value: 'modules'
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
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toBeCalledWith(
                PageId.COURSE_DETAIL,
                telemetryObject,
                {},
                undefined
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
               undefined
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
            // arrange
            enrolledCourseDetailsPage.isQrCodeLinkToContent = false;
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['sample-board']
            }));
            // act
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
        });
        it('should go 2 page back', () => {
            // arrange
            enrolledCourseDetailsPage.isQrCodeLinkToContent = true;
            jest.spyOn(window.history, 'go');
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['sample-board']
            }));
            // act
            enrolledCourseDetailsPage.goBack();
            // assert
            expect(mockEvents.publish).toBeCalledWith('event:update_course_data');
        });
        it('shoould naviagte to profile page if no guset user ', () => {
            //arrange
            enrolledCourseDetailsPage.isQrCodeLinkToContent = undefined;
            mockEvents.publish = jest.fn();
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['', 'sample-syllabus']
            }));
             // act
             enrolledCourseDetailsPage.goBack();
             // assert
        })
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
            mockAppGlobalService.getEnrolledCourseList = jest.fn(() => [{courseId: 'do_091231312312'}])
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {
                batch: {
                    identifier: ''
                }
            };
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({batch: {identifier: ''}});
        });

        it('else condition check ""', () => {
            // arrange
            mockAppGlobalService.getEnrolledCourseList = jest.fn(() => [{courseId: 'do_091231312312'}])
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {};
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(false);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({courseId: 'do_091231312312'});
        });

        it('else condition check "course.courseId === identifier"', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockAppGlobalService.getEnrolledCourseList = jest.fn(() => [{courseId: 'do_091231312312', batchId: 'batch_id'}])
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = {
                batch: {
                    identifier: 'batch_id'
                }
            };
            mockDownloadService.trackDownloads = jest.fn(() => of({
            }))
            // act
            enrolledCourseDetailsPage.isCourseEnrolled('do_091231312312');
            // assert
            expect(enrolledCourseDetailsPage.isAlreadyEnrolled).toEqual(true);
            expect(enrolledCourseDetailsPage.courseCardData).toEqual({batchId: "batch_id", courseId: 'do_091231312312'});
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
        it('should return false, not call navigate', async (done) => {
            // arrange
            mockLocalCourseService.isEnrollable = jest.fn(() => true);
            enrolledCourseDetailsPage.isCourseMentor = true;
            spyOn(mockRouter, 'navigate').and.stub();
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
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
            done();
        });

        it('should show toast message for internet error', () => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            enrolledCourseDetailsPage.isCourseMentor = false;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            enrolledCourseDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(enrolledCourseDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
            }, 0);
        });

        it('should show toast message for internet error, and if network available', () => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            enrolledCourseDetailsPage.isCourseMentor = false;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            enrolledCourseDetailsPage.batches = [];
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(enrolledCourseDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
            }, 0);
        });

        it('should show toast message for internet error, and if network available, and navigate to COURSE_BATCHES', () => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            enrolledCourseDetailsPage.isCourseMentor = false;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockLocalCourseService.isEnrollable = jest.fn(() => true);
            enrolledCourseDetailsPage.batches = [{}];
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(enrolledCourseDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
            }, 0);
        });

        it('should show toast message for internet error, and if network available, and navigate to COURSE_BATCHES, and batches length is > 1', () => {
            // arrnge
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            enrolledCourseDetailsPage.isCourseMentor = false;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockLocalCourseService.isEnrollable = jest.fn(() => true);
            enrolledCourseDetailsPage.batches = [{status: 1}, {}];
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.navigateToBatchListPage();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                expect(enrolledCourseDetailsPage.batches.length).toBe(0);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(dismissFn).toBeTruthy();
            }, 0);
        });
    });

    describe('startLearning()', () => {
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
                    {"l1": "do_212810592322265088178",
                   "l2": "do_212810592541261824179",
                   "l3": "do_2128084096298352641378",
                   "l4": "do_2128084109778042881381",},
                   undefined
                );
                expect(enrolledCourseDetailsPage.courseHeirarchy).toBeTruthy();
                expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBeGreaterThan(0);
                expect(enrolledCourseDetailsPage.isBatchNotStarted).toBeFalsy();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            }, 0);
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
                    {"l1": "do_212810592322265088178",
                    "l2": "do_212810592541261824179",
                    "l3": "do_2128084096298352641378",
                    "l4": "do_2128084109778042881381",},
                    undefined
                );
                expect(enrolledCourseDetailsPage.courseHeirarchy.children.length).toBe(0);
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            }, 0);
        });

        it('should show profile name confirmation popup', () => {
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
                    {"l1": "do_212810592322265088178",
                     "l2": "do_212810592541261824179",
                     "l3": "do_2128084096298352641378",
                     "l4": "do_2128084109778042881381",},
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
            }, 0);
        });
        it('should show profile name confirmation popup on undefined data dismiss', () => {
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
                onDidDismiss: jest.fn(() => Promise.resolve({ }))
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
                // expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                // expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            }, 0);
        });

        it('should show profile name confirmation popup on undefined data dismiss', () => {
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
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { buttonClicked: false } }))
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
                // expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_WILL_BE_AVAILABLE', '2020-06-04');
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('course will be available');
                // expect(mockDatePipe.transform).toBeCalled();
                expect(mockPreferences.getBoolean).toHaveBeenCalledWith(
                    PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-some_uid');
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            }, 0);
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
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.downloadProgress).toBe(100);
            expect(enrolledCourseDetailsPage.getBatchDetails).toBeCalled();
            expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();

        });

        it('should be PROGRESS event, progress -1', () => {
            // arrange
            const event = {
                type: 'PROGRESS',
                payload: {
                    identifier: 'do_83424628349',
                    progress: -1
                }
            };
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb()) as any;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.downloadProgress).toBe(0);
        });

        it('should be PROGRESS event, without identifier, and progress < 100', () => {
            // arrange
            const event = {
                type: 'PROGRESS',
                payload: {
                    identifier: 'do_83424628346',
                    progress: -1
                }
            };
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb()) as any;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
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

        it('should be IMPORT_COMPLETED event, else case', () => {
            // arrange
            const event = {
                type: 'IMPORT_COMPLETED',
                payload: {
                    contentId: 'do_83424628349',
                    progress: 100
                }
            };
            const queuedIdentifiers = [
                'do_8342462834'
            ];
            enrolledCourseDetailsPage.courseCardData = {
                hierarchyInfo: [{}]
            }
            enrolledCourseDetailsPage.queuedIdentifiers = queuedIdentifiers;
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            enrolledCourseDetailsPage.isDownloadStarted = true;
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(enrolledCourseDetailsPage.isDownloadStarted).toBe(true);
            expect(enrolledCourseDetailsPage.queuedIdentifiers.length).toBe(1);
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
            enrolledCourseDetailsPage.courseCardData = {}
            enrolledCourseDetailsPage.queuedIdentifiers = queuedIdentifiers;
            enrolledCourseDetailsPage.identifier = 'do_83424628349';
            enrolledCourseDetailsPage.isDownloadStarted = false;
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb());
            spyOn(enrolledCourseDetailsPage, 'setContentDetails').and.stub();
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert
            expect(mockZone.run).toHaveBeenCalled();
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

        it('should be SERVER_CONTENT_DATA event, if no size', () => {
            // arrange
            const event = {
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do_83424628349',
                    progress: 100,
                    licenseDetails: 'SAMPLE_LICENSE',
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
            mockZone.run = jest.fn((cb) => cb()) as any;
            window.setInterval = jest.fn(fn => fn(), 1000)as any;
            // act
            enrolledCourseDetailsPage.subscribeSdkEvent();
            // assert

        });

        it('should be IMPORT_PROGRESS event, current and total count are not same', () => {
            // arrange
            const event = {
                type: 'IMPORT_PROGRESS',
                payload: {
                    contentId: 'do_83424628349',
                    currentCount: 10,
                    totalCount: 14
                }
            };
            mockEventsBusService.events = jest.fn(() => of(event));
            mockZone.run = jest.fn((cb) => cb()) as any;
            window.setInterval = jest.fn(fn => fn(), 1000)as any;
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
            expect(mockEventsBusService.events).toBeCalled();
            expect(mockZone.run).toBeCalled();
        });
    });

    describe('checkDataSharingStatus', () => {
        it('should check data sharing status if minor', () => {
            // arrange
            enrolledCourseDetailsPage.isMinor = true;
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus();
            // assert
        })
        it('should return conset details', () => {
            // arrange
            enrolledCourseDetailsPage.isMinor = false;
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
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
            }, 0);
        });
        it('should return empty conset details', () => {
            // arrange
            enrolledCourseDetailsPage.isMinor = false;
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
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
                consents: []}));
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
            }, 0);
        }); 

        it('should return conset popup if consent data not found for catch part', async () => {
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
            mockProfileService.getConsent = jest.fn(() => throwError({response: {body: {
                params: {
                    err: 'USER_CONSENT_NOT_FOUND'
                }
            },}}))
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(throwError({error: {response: {
                body: {
                    params: {
                        err: 'USER_CONSENT_NOT_FOUND'
                    }
                },
                responseCode: 500
                },
                code: 'NETWORK_ERROR'
            }}))

            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            mockLocalCourseService.setConsentPopupVisibility = jest.fn();
            // act
            await enrolledCourseDetailsPage.checkDataSharingStatus().catch();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                expect(enrolledCourseDetailsPage.isConsentPopUp).toBeTruthy();
                expect(mockLocalCourseService.showConsentPopup).toHaveBeenCalled();
            }, 0);
        });

        it('should return conset popup if consent data not found for catch part', async () => {
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
            mockProfileService.getConsent = jest.fn(() => of())
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(throwError({error: {response: {
                body: {
                    params: {
                        err: 'USER_CONSENT_NOT_FOUND'
                    }
                },
                responseCode: 500
                },
                code: 'NETWORK_ERROR'
            }}))

            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            mockLocalCourseService.setConsentPopupVisibility = jest.fn();
            // act
            await enrolledCourseDetailsPage.checkDataSharingStatus().catch();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                expect(enrolledCourseDetailsPage.isConsentPopUp).toBeTruthy();
                expect(mockLocalCourseService.showConsentPopup).toHaveBeenCalled();
            }, 0);
        });

        it('should return conset popup if consent data not found for catch part', () => {
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
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.course = {
                userConsent: UserConsent.YES
            };
            enrolledCourseDetailsPage.isConsentPopUp = false;
            jest.spyOn(mockCourseService, 'getCourseBatches').mockReturnValue(throwError({error: {      
                code: 'NETWORK_ERROR'}
            }));
            mockProfileService.getConsent = jest.fn(() => of({
                code: 'NETWORK_ERROR'
            }));
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.checkDataSharingStatus();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
                expect(enrolledCourseDetailsPage.isConsentPopUp).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
            }, 0);
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should be a guest user, ', () => {
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            enrolledCourseDetailsPage.courseCardData = {
                progress: 20,
                completionPercentage: 50
            }
            window['segmentation'].SBTagService = {
                getTags: jest.fn(() => true)
            }
            enrolledCourseDetailsPage.isGuestUser = true;
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').and.stub();
            spyOn(enrolledCourseDetailsPage, 'populateCorRelationData');
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
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
                expect(enrolledCourseDetailsPage.populateCorRelationData).toBeCalled();
                expect(enrolledCourseDetailsPage.handleBackButton).toBeCalled();
            });
        });

        it('should be a guest user, ', () => {
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            enrolledCourseDetailsPage.courseCardData = {
                progress: 20,
                completionPercentage: 50
            }
            window['segmentation'].SBTagService = {
                getTags: jest.fn(() => false)
            }
            enrolledCourseDetailsPage.isGuestUser = true;
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').and.stub();
            spyOn(enrolledCourseDetailsPage, 'populateCorRelationData');
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
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
                expect(enrolledCourseDetailsPage.populateCorRelationData).toBeCalled();
            });
        });

        it('should be a guest user, ', () => {
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            // act
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            enrolledCourseDetailsPage.courseCardData = {
                progress: 20,
                completionPercentage: 100
            }
            window['segmentation'].SBTagService = {
                getTags: jest.fn(() => false)
            }
            enrolledCourseDetailsPage.isGuestUser = true;
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').and.stub();
            spyOn(enrolledCourseDetailsPage, 'populateCorRelationData');
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({serverProfile: {roles: [{role: 'COURSE_MENTOR'}]}}));
            // assert
            enrolledCourseDetailsPage.ionViewWillEnter().then(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.checkCurrentUserType).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.isGuestUser).toEqual(true);
                expect(mockHeaderService.showHeaderWithBackButton).toBeCalled();
                expect(enrolledCourseDetailsPage.isCourseEnrolled).toBeCalled();
                expect(enrolledCourseDetailsPage.populateCorRelationData).toBeCalled();
            });
        });

        it('should not be a guest user, ', () => {
            // act
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            enrolledCourseDetailsPage.isGuestUser = false;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.courseCardData = mockCourseCardData_2;
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn(() => { })
            });
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({}))
            });
            mockDiscussionService.getForumIds = jest.fn(() => throwError('some_err'));
            jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'populateCorRelationData').mockImplementation();
            jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                return Promise.resolve();
            });
            mockCourseService.getEnrolledCourses = jest.fn(() => of(mockEnrolledCourses));
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({serverProfile: {roles: [{role: 'COURSE_MENTOR'}]}}));
            // act
            enrolledCourseDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            }, 0);
        });

        it('should show expired batch popup for logged in user and enrolled into course if already enrolled batch is expired, ',
            () => {
                // act
                mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('some_uid'));
                mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
                enrolledCourseDetailsPage.isGuestUser = false;
                enrolledCourseDetailsPage.isAlreadyEnrolled = true;
                enrolledCourseDetailsPage.courseCardData = mockCourseCardData_2;
                enrolledCourseDetailsPage.courseCardData = {progress: 20};
                enrolledCourseDetailsPage.courseHeirarchy = mockCourseCardData_2;
                mockHeaderService.headerEventEmitted$ = {
                    subscribe: jest.fn(() => { })
                };
                mockHeaderService.headerEventEmitted$ = of({
                    subscribe: jest.fn((fn) => fn({}))
                });
                jest.spyOn(enrolledCourseDetailsPage, 'checkCurrentUserType').mockImplementation();
                jest.spyOn(enrolledCourseDetailsPage, 'isCourseEnrolled').mockImplementation();
                jest.spyOn(enrolledCourseDetailsPage, 'setContentDetails').mockImplementation();
                jest.spyOn(enrolledCourseDetailsPage, 'populateCorRelationData').mockImplementation();
                jest.spyOn(enrolledCourseDetailsPage, 'getAllBatches').mockImplementation(() => {
                    return Promise.resolve();
                });
                jest.spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseData').mockImplementation(() => {
                    return Promise.resolve();
                });
                mockCourseService.getEnrolledCourses = jest.fn(() => of(mockExpiredBatchEnrolledCourses));
                mockAppGlobalService.getEnrolledCourseList = jest.fn(() => mockExpiredBatchEnrolledCourses);
                mockHeaderService.showHeaderWithBackButton = jest.fn();
                const batches = [
                    {
                        enrollmentEndDate: '01/01/2020',
                        endDate: '05/01/2020',
                        identifier: 'do-123',
                        status: 1
                    },
                    {
                        enrollmentEndDate: '01/01/2020',
                        endDate: '05/01/2020',
                        identifier: 'do-1234',
                        status: 0
                    }
                ];
                global['window'].segmentation = {
                    SBTagService: {
                        getTags: jest.fn(() => true)
                    }
                }
                mockCourseService.getCourseBatches = jest.fn(() => of(batches));
                mockZone.run = jest.fn((fn) => fn());
                mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
                } as any)));

                // act
                enrolledCourseDetailsPage.ionViewWillEnter();
                // assert
                setTimeout(() => {
                    expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                    expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                    expect(mockCourseService.getCourseBatches).toBeCalledWith({
                        filters: {
                            courseId: enrolledCourseDetailsPage.courseHeirarchy.identifier,
                            enrollmentType: CourseEnrollmentType.OPEN,
                            status: [CourseBatchStatus.IN_PROGRESS]
                        },
                        sort_by: { createdDate: SortOrder.DESC },
                        fields: BatchConstants.REQUIRED_FIELDS
                    });
                    expect(mockZone.run).toHaveBeenCalled();
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                }, 0);
        });
    });

    it('should hide deeplink progress loader', () => {
        // arrange
        mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
        enrolledCourseDetailsPage.identifier = 'sample_doId';
        if (!enrolledCourseDetailsPage.resumeCourseFlag) {
            enrolledCourseDetailsPage.resumeCourseFlag = true;
        }
        // act
        enrolledCourseDetailsPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'sample_doId' });
        expect(enrolledCourseDetailsPage.resumeCourseFlag).toBe(true);
    });

    describe('isCourseModifiedAfterEnrolment', () => {
        it('should return false if course lastUpdatedOn date is less than course enrolledDate', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                enrolledDate: '2018-11-12T10:57:02.000+0000'
            };
            enrolledCourseDetailsPage.course = {
                lastUpdatedOn: '2018-11-11T10:57:02.000+0000'
            };
            // act
            enrolledCourseDetailsPage.isCourseModifiedAfterEnrolment();
            // assert
        });

        it('should return true if course lastUpdatedOn date is greater than course enrolledDate', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                enrolledDate: '2018-11-12T10:57:02.000+0000'
            };
            enrolledCourseDetailsPage.course = {
                lastUpdatedOn: '2018-11-13T10:57:02.000+0000',
                lastPublishedOn: '2018-11-14T10:57:02.000+0000'
            };
            // act
            enrolledCourseDetailsPage.isCourseModifiedAfterEnrolment();
            // assert
        });
    });

    it('should dismiss consentPii popup', () => {
        // arrange
        const dismissFn = jest.fn(() => Promise.resolve(true));
        enrolledCourseDetailsPage.loader = { data: '', dismiss: dismissFn } as any;
        mockLocalCourseService.setConsentPopupVisibility = jest.fn();
        // act
        enrolledCourseDetailsPage.onConsentPopoverShow();
        // assert
        expect(enrolledCourseDetailsPage.loader).toBeUndefined();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockLocalCourseService.setConsentPopupVisibility).toHaveBeenCalledWith(true);
    });

    it('should dismiss consentPii popup, else case if no loader', () => {
        // arrange
        enrolledCourseDetailsPage.loader = '' as any;
        mockLocalCourseService.setConsentPopupVisibility = jest.fn();
        // act
        enrolledCourseDetailsPage.onConsentPopoverShow();
        // assert
        expect(mockLocalCourseService.setConsentPopupVisibility).toHaveBeenCalledWith(true);
    });

    it('shoule invoked after consentPii popup dismissed', () => {
        mockProfileService.getConsent = jest.fn(() => of())
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
        it('should update userConsent for active status', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
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
            mockProfileService.getConsent = jest.fn(() => of());
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FRMELEMNTS_MSG_DATA_SETTINGS_SUBMITED_SUCCESSFULLY');
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
            }, 0);
        });

        it('should not update userConsent for active status catch part', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.ACTIVE;
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: {
                    channel: ''
                },
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                status: ConsentStatus.REVOKED,
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.course.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId,
                objectType: 'Collection',
            };
            mockProfileService.updateConsent = jest.fn(() => throwError({ code: 'NETWORK_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
            }, 0);
        });

        it('should not update userConsent for active status catch part, else case', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.ACTIVE;
            enrolledCourseDetailsPage.courseCardData = {
                userId: 'sample-userId',
                content: '',
                courseId: 'sample-courseId'
            };
            const request: Consent = {
                status: ConsentStatus.REVOKED,
                userId: enrolledCourseDetailsPage.courseCardData.userId,
                consumerId: enrolledCourseDetailsPage.course.channel,
                objectId: enrolledCourseDetailsPage.courseCardData.courseId,
                objectType: 'Collection',
            };
            mockProfileService.updateConsent = jest.fn(() => throwError({ code: '' }));
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
            }, 0);
        });

        it('should return consent popup for revoked status', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = ConsentStatus.REVOKED;
            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            mockProfileService.getConsent = jest.fn(() => of())
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockConsentService.showConsentPopup).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
            }, 0);
        });

        it('should return consent popup for revoked status, else case', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            enrolledCourseDetailsPage.dataSharingStatus = '';
            mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
            mockProfileService.getConsent = jest.fn(() => of())
            // act
            enrolledCourseDetailsPage.saveChanges();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockConsentService.showConsentPopup).toHaveBeenCalled();
                expect(enrolledCourseDetailsPage.showShareData).toBeFalsy();
            }, 0);
        });
    });

    describe('handleBackButton()', () => {
        it('should handleBackButton ', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'goBack');
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['', 'sample-syllabus']
            }));
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({}))
            } as any)));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((x, callback) => callback()),
                is: jest.fn()
            };
            mockLocalCourseService.isConsentPopupVisible = jest.fn(() => true);
            enrolledCourseDetailsPage.isConsentPopUp = true;
            // act
            enrolledCourseDetailsPage.handleBackButton();
            // assert
            expect(enrolledCourseDetailsPage.goBack).not.toBeCalled();

        });

        it('should handleBackButton ', () => {
            // arrange
            jest.spyOn(enrolledCourseDetailsPage, 'generateEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'generateQRSessionEndEvent');
            jest.spyOn(enrolledCourseDetailsPage, 'goBack');
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['', 'sample-syllabus']
            }));
            mockLocalCourseService.isConsentPopupVisible = jest.fn(() => true);
            enrolledCourseDetailsPage.shouldGenerateEndTelemetry = true;
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                dismiss: jest.fn(() => Promise.resolve({}))
            } as any)));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((x, callback) => callback()),
                is: jest.fn()
            };
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

    describe('subscribeTrackDownloads', () => {
        it('should subscribeTrackDownloads ', () => {
            // arrange
            mockDownloadService.trackDownloads = jest.fn(() => of({
            }))
            // act
            enrolledCourseDetailsPage.subscribeTrackDownloads()
            // assert
        })
    })

    describe('syncProgress ', () => {
        it('should sync Progress', () => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve())
            }))
            mockTelemetryGeneratorService.generateLogEvent = jest.fn();
            mockCourseService.syncCourseProgress = jest.fn(() => of());
            mockCommonUtilService.showToast = jest.fn()
            // act
            enrolledCourseDetailsPage.syncProgress();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalled();
                expect(mockCourseService.syncCourseProgress).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled()
            }, 0);
        })

        it('should handle error sync Progress', () => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockTelemetryGeneratorService.generateLogEvent = jest.fn();
            mockCourseService.syncCourseProgress = jest.fn(() => throwError({error: 'err'}));
            mockCommonUtilService.showToast = jest.fn()
            // act
            enrolledCourseDetailsPage.syncProgress();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalled();
                expect(mockCourseService.syncCourseProgress).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalled()
            }, 0);
        })
    })

    describe('onboardingSkippedBackAction', () => {
        it('should handle onboardingSkippedBackAction, navigate to TABS_COURSE', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(true));
            enrolledCourseDetailsPage['isOnboardingSkipped'] = true;
            enrolledCourseDetailsPage['isFromChannelDeeplink'] = true;
            const navigationExtras: NavigationExtras = { replaceUrl: true };
            mockRouter.navigate = jest.fn();
            // act
            enrolledCourseDetailsPage.onboardingSkippedBackAction();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS_COURSE}`], navigationExtras)
            }, 0);
        })

        it('should handle onboardingSkippedBackAction, navigate to TABS_COURSE', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(true));
            enrolledCourseDetailsPage['isOnboardingSkipped'] = true;
            enrolledCourseDetailsPage['isFromChannelDeeplink'] = true;
            const navigationExtras: NavigationExtras = { replaceUrl: true };
            mockRouter.navigate = jest.fn();
            // act
            enrolledCourseDetailsPage.onboardingSkippedBackAction();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS_COURSE}`], navigationExtras)
            }, 0);
        })

        it('should handle onboardingSkippedBackAction, navigate to PROFILE_SETTINGS', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(false));
            enrolledCourseDetailsPage['isFromChannelDeeplink'] = false;
            enrolledCourseDetailsPage['isOnboardingSkipped'] = true;
            mockRouter.navigate = jest.fn();
            const navigationExtras: NavigationExtras = { queryParams: { reOnboard: true }, replaceUrl: true };
            // act
            enrolledCourseDetailsPage.onboardingSkippedBackAction();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS_COURSE}`], navigationExtras)
            }, 0);
        })

        it('should handle onboardingSkippedBackAction, else case', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(false));
            enrolledCourseDetailsPage['isFromChannelDeeplink'] = false;
            enrolledCourseDetailsPage['isOnboardingSkipped'] = false;
            mockRouter.navigate = jest.fn();
            const navigationExtras: NavigationExtras = { queryParams: { reOnboard: true }, replaceUrl: true };
            // act
            enrolledCourseDetailsPage.onboardingSkippedBackAction();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS_COURSE}`], navigationExtras)
            }, 0);
        })
    });

    describe('onTocCardClick', () => {
        it('should onTocCardClick, else case if no mimetype ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage.course.createdBy = ''
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should onTocCardClick, else case if no mimetype ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage.course.createdBy = ''
            enrolledCourseDetailsPage.isCourseMentor = true;
            enrolledCourseDetailsPage.isBatchNotStarted = false;
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should onTocCardClick, else case if no mimetype, join training return false ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage.course.createdBy = ''
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.isCourseMentor = false;
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should onTocCardClick, else case if no mimetype, else case ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage.course.createdBy = ''
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            enrolledCourseDetailsPage.isCourseMentor = false;
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should onTocCardClick, else case if no mimetype, return false if no batch id ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage['batchId'] = false;
            enrolledCourseDetailsPage.course.createdBy = enrolledCourseDetailsPage.userId;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.isCourseMentor = false;
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should onTocCardClick, else case if no mimetype, navigateToContentDetails ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: ''
            }};
            enrolledCourseDetailsPage['batchId'] = true;
            enrolledCourseDetailsPage.course.createdBy = enrolledCourseDetailsPage.userId;
            enrolledCourseDetailsPage.isAlreadyEnrolled = false;
            enrolledCourseDetailsPage.isCourseMentor = false;
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })
        it('should return on isFromGroupFlow ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = true;
            const event = {item: {
                mimeType: ''
            }};
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should return on isGuestUser ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = true;
            const event = {item: {
                mimeType: ''
            }};
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
        })

        it('should return true if course created by not same as user id, and enrolled ', () => {
            // arrange
            enrolledCourseDetailsPage.isFromGroupFlow = false;
            enrolledCourseDetailsPage.isGuestUser = false;
            const event = {item: {
                mimeType: 'application/vnd.ekstep.content-collection',
                identifier: 'abc'
            }};
            mockRouter.navigate = jest.fn();
            const chapterParams = {
                state: {
                  chapterData: event.item,
                  batches: enrolledCourseDetailsPage.batches,
                  isAlreadyEnrolled: enrolledCourseDetailsPage.isAlreadyEnrolled,
                  courseCardData: enrolledCourseDetailsPage.courseCardData,
                  batchExp: enrolledCourseDetailsPage.batchExp,
                  isChapterCompleted: enrolledCourseDetailsPage.courseCompletionData[event.item.identifier],
                  contentStatusData: enrolledCourseDetailsPage.contentStatusData,
                  courseContent: enrolledCourseDetailsPage.content,
                  corRelation: enrolledCourseDetailsPage.corRelationList,
                  courseHeirarchy: enrolledCourseDetailsPage.courseHeirarchy
                }
              };
            // act
            enrolledCourseDetailsPage.onTocCardClick(event);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.CURRICULUM_COURSES}/${RouterLinks.CHAPTER_DETAILS}`],
                chapterParams)
            }, 0);
        })
    });

    describe('navigateToBatchListPopup', () => {
        it('should return if isGuestUser true', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = true;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
        })

        it('should return if isNetworkAvailable false', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
        })

        it('should navigate to batch list and getCourseBatches', async () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            mockCourseService.getCourseBatches = jest.fn(() => of([{status: 1}]));
            mockZone.run = jest.fn(fn => fn()) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve({data:{isEnrolled: true, batchId: 'id-35'}}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: present,
                onDidDismiss: dismiss
            })) as any;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            })) as any;
            mockProfileService.getConsent = jest.fn(() => of());
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
                // done();
            }, 0);
        });

        it('should navigate to batch list and getCourseBatches, enrolled false', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            mockCourseService.getCourseBatches = jest.fn(() => of([{status: 2}]));
            mockZone.run = jest.fn(fn => fn()) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve({data:{isEnrolled: false}}));
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: present,
                onDidDismiss: dismiss
            })) as any;
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
            }, 0);
        });

        it('should navigate to batch list and getCourseBatches, enrolled is a function', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            mockCourseService.getCourseBatches = jest.fn(() => of([{status: 2}]));
            mockZone.run = jest.fn(fn => fn()) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve({data:{isEnrolled: function(){call: jest.fn()}, batchId: 'id-35', courseId: 'sample_doId'}}));
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('id-34223'))
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: present,
                onDidDismiss: dismiss
            })) as any;
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content, 'InProgress');
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
            }, 0);
        });
        

        it('should navigate to batch list and getCourseBatches, if no course batches', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            mockCourseService.getCourseBatches = jest.fn(() => of([]));
            mockZone.run = jest.fn(fn => fn()) as any;
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
            }, 0);
        });

        it('should handle error on getCourseBatches', () => {
            // arrange
            enrolledCourseDetailsPage.isGuestUser = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const content = {
                contentId: 'cont-123',
                identifier: 'id-123' 
            }
            mockCommonUtilService.getLoader = jest.fn(() => {Promise.resolve({
                dismiss: jest.fn(() => Promise.resolve())
            })})
            mockCourseService.getCourseBatches = jest.fn(() => throwError({error: 'error'}));
            mockZone.run = jest.fn(fn => fn()) as any
            // act
            enrolledCourseDetailsPage.navigateToBatchListPopup(content);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalled();
            }, 0);
        })
    });

    describe('batchEndDateStatus', () => {
        it('should batchEndDateStatus ', () => {
            // arrange
            mockLocalCourseService.getTimeRemaining = jest.fn();
            window.setInterval = jest.fn((fn) => fn({}), 1000 * 60) as any;
            // act
            enrolledCourseDetailsPage.batchEndDateStatus('');
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.getTimeRemaining).toHaveBeenCalled();
            }, 0);
        })
    });

    describe('showConfirmAlert', () => {
        it('should show confirm alert ', () => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const ondidDismiss = jest.fn(() => Promise.resolve({data: {isLeftButtonClicked: false}}))
            mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present: present,
                onDidDismiss: ondidDismiss
            }))
            // act
            enrolledCourseDetailsPage.showConfirmAlert();
            // assert
        });
    });

    describe('resumeContent', () => {
        it('should resumeContent ', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            enrolledCourseDetailsPage.resumeContent();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            }, 0);
        })
    })

    describe('getLocalCourseAndUnitProgress', () => {
        it('should get LocalCourse And UnitProgress', () => {
            // arrange
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 100, identifier: 'id-123', mimeType: 'application/pdf'}],
                identifier: 'id-123'
            };
            enrolledCourseDetailsPage.contentStatusData = {
                contentList: [{contentId: 'id-123', status: 2}]
            }
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            enrolledCourseDetailsPage.course = {
                progress: 100
            }
            contentDetailsResponse.contentData = {progress: 100}
            mockContentService.getContentDetails = jest.fn(() => of(contentDetailsResponse));
            mockAppGlobalService.generateCourseCompleteTelemetry = jest.fn(() => true) as any;
            enrolledCourseDetailsPage['getLeafNodeIdsWithoutDuplicates'] = jest.fn(() => Promise.resolve([{contentId:'do-123', mimeType: 'application/vnd.sunbird.questionset', children: [{progressPercentage: 0, mimeType: 'application/vnd.sunbird.questionset', identifier: 'id-123'}]}])) as any
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn()
            // act
            enrolledCourseDetailsPage.getLocalCourseAndUnitProgress();
            // assert
        })

        it('should get LocalCourse And UnitProgress', () => {
            // arrange
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 100, identifer: 'id-567', mimeType: 'application/vnd.ekstep.content-collection'}],
                contentData: {leafNodes: '', progress: 100},
                identifier: 'id-123'
            };
            enrolledCourseDetailsPage.course = {
                progress: 20
            }
            enrolledCourseDetailsPage.isAlreadyEnrolled = true;
            mockAppGlobalService.generateCourseCompleteTelemetry = jest.fn(() => true) as any;
            enrolledCourseDetailsPage['getLeafNodeIdsWithoutDuplicates'] = jest.fn(() => Promise.resolve([''])) as any
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn()
            // act
            enrolledCourseDetailsPage.getLocalCourseAndUnitProgress();
            // assert
        })

        it('should get LocalCourse And UnitProgress for progress 100', () => {
            // arrange
            mockAppGlobalService.generateCourseCompleteTelemetry = true;
            enrolledCourseDetailsPage.course.progress = 100;
            enrolledCourseDetailsPage.courseHeirarchy = {
                children: [{progressPercentage: 100, identifier: 'id-123'}],
                identifier: 'id-123'
            };
            mockAppGlobalService.generateCourseCompleteTelemetry = jest.fn(() => true) as any;
            enrolledCourseDetailsPage['getLeafNodeIdsWithoutDuplicates'] = jest.fn(() => Promise.resolve(['id1234'])) as any
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn()
            // act
            enrolledCourseDetailsPage.getLocalCourseAndUnitProgress();
            // assert
        })
    });

    describe('refreshCourseDetails ', () => {
        it('should refreshCourseDetails ', () => {
            // arrange
            mockRouter.getCurrentNavigation = jest.fn(() => Promise.resolve(mockEnrolledData)) as any;
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve(''));
            mockEvents.subscribe = jest.fn(() => ({content: {contentData: {}}}))
            mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
            const data = {content: {contentData: {}}}
            jest.spyOn(CsGroupAddableBloc.instance, 'initialised', 'get').mockReturnValue(true);
            jest.spyOn(enrolledCourseDetailsPage, 'ngOnDestroy').mockImplementation()
            // act
            enrolledCourseDetailsPage.refreshCourseDetails(data);
            // assert
        })

        it('should refreshCourseDetails ', () => {
            // arrange
            mockRouter.getCurrentNavigation = jest.fn(() => Promise.resolve(mockEnrolledData)) as any;
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve(''));
            mockEvents.subscribe = jest.fn(() => ({content: {contentData: {}}}))
            mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
            const data = {content: {contentData: {}}}
            jest.spyOn(CsGroupAddableBloc.instance, 'initialised', 'get').mockReturnValue(true);
            // jest.spyOn(enrolledCourseDetailsPage, 'ionViewWillEnter').mockImplementation()
            // jest.spyOn(enrolledCourseDetailsPage, 'ionViewDidEnter').mockImplementation()
            // act
            enrolledCourseDetailsPage.refreshCourseDetails(data);
            // assert
        })
    })

    describe('getCourseProgress', () => {
        it('should getCourseProgress, if no batch id', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: ''
            }
            enrolledCourseDetailsPage.updatedCourseCardData = {
                completionPercentage: 20
            };
            // act
            enrolledCourseDetailsPage.getCourseProgress();
            // assert
        })
        it('should getCourseProgress', () => {
            // arrange
            enrolledCourseDetailsPage.courseCardData = {
                batchId: 'id'
            }
            enrolledCourseDetailsPage.updatedCourseCardData = {
                completionPercentage: 20
            };
            // act
            enrolledCourseDetailsPage.getCourseProgress();
            // assert
        })
    });
    
    describe('isCourseMentorValidation', () => {
        it('should handle CourseMentor Validation, if role is COURSE_MENTOR', () => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({serverProfile: {roles: [{role: 'COURSE_MENTOR'}]}}))
            // act
            enrolledCourseDetailsPage.isCourseMentorValidation()
            // assert
        })

        it('should handle CourseMentor Validation, if role is not COURSE_MENTOR', () => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({serverProfile: {roles: [{role: ''}]}}))
            window['segmentation'].SBTagService = {
                getTags: jest.fn()
            }
            // act
            enrolledCourseDetailsPage.isCourseMentorValidation()
            // assert
        })

        describe('checkRetiredOpenBatch', () => {
            it('should checkRetiredOpenBatch, if LAYOUT is INPROGRESS', async() => {
                // arrange
                enrolledCourseDetailsPage.isAlreadyEnrolled = true;
                enrolledCourseDetailsPage.skipCheckRetiredOpenBatch = false;
                mockAppGlobalService.getEnrolledCourseList = jest.fn(() => Promise.resolve([])) as any
                // act
                enrolledCourseDetailsPage.checkRetiredOpenBatch({identifier: 'd-123'}, ContentCard.LAYOUT_INPROGRESS);
                // assert
            })

            it('should checkRetiredOpenBatch, error block', async() => {
                // arrange
                enrolledCourseDetailsPage.isAlreadyEnrolled = true;
                enrolledCourseDetailsPage.skipCheckRetiredOpenBatch = false;
                mockAppGlobalService.getEnrolledCourseList = jest.fn(() => Promise.resolve([])) as any
                // act
                enrolledCourseDetailsPage.checkRetiredOpenBatch({identifier: 'd-123'}, ContentCard.LAYOUT_POPULAR);
                // assert
            })

            it('should checkRetiredOpenBatch, status 1', async() => {
                // arrange
                enrolledCourseDetailsPage.isAlreadyEnrolled = true;
                enrolledCourseDetailsPage.skipCheckRetiredOpenBatch = false;
                mockAppGlobalService.getEnrolledCourseList = jest.fn(() => [{contentId: 'd-123', batch: {status: 1}, cProgress: 80}]) as any
                // act
                enrolledCourseDetailsPage.checkRetiredOpenBatch({identifier: 'd-123'}, ContentCard.LAYOUT_POPULAR);
                // assert
            })

            it('should checkRetiredOpenBatch, status 2', async() => {
                // arrange
                enrolledCourseDetailsPage.isAlreadyEnrolled = true;
                enrolledCourseDetailsPage.skipCheckRetiredOpenBatch = false;
                mockAppGlobalService.getEnrolledCourseList = jest.fn(() => [{contentId: 'd-123', batch: {status: 2}, cProgress: 80}]) as any
                // act
                enrolledCourseDetailsPage.checkRetiredOpenBatch({identifier: 'd-123'}, ContentCard.LAYOUT_POPULAR);
                // assert
            })
        })
    })
});
