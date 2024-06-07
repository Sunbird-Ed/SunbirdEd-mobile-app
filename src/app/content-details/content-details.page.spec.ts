import { ContentDetailsPage } from '../content-details/content-details.page';
import {
    ContentService,
    EventsBusService,
    DownloadService,
    ProfileService,
    SharedPreferences,
    StorageService,
    TelemetryObject,
    Content,
    GetAllProfileRequest,
    SunbirdSdk,
    TelemetryService,
} from '@project-sunbird/sunbird-sdk';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { NgZone } from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    CourseUtilService, FormAndFrameworkUtilService,
    TelemetryGeneratorService,
    UtilityService,
} from '../../services';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileSwitchHandler } from '../../services/user-groups/profile-switch-handler';
import { RatingHandler } from '../../services/rating/rating-handler';
import { ContentPlayerHandler } from '../../services/content/player/content-player-handler';
import { ChildContentHandler } from '../../services/content/child-content-handler';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { of, throwError, EMPTY, Subscription, Observable } from 'rxjs';
import { mockContentData } from '../../app/content-details/content-details.page.spec.data';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    Mode,
    PageId,
} from '../../services/telemetry-constants';
import { ContentUtil } from '../../util/content-util';
import { MimeType, PreferenceKey, RouterLinks } from '../app.constant';
import { EventTopics, ShareItemType, ContentFilterConfig } from '../app.constant';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { LocalCourseService } from '../../services';
import { ContentEventType, PlayerService } from '@project-sunbird/sunbird-sdk';
import { CourseService } from '@project-sunbird/sunbird-sdk';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { DomSanitizer } from '@angular/platform-browser';
import { Network } from '@capacitor/network';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { App } from '@capacitor/app';

jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})

jest.mock('@capacitor/network', () => {
    return {
      ...jest.requireActual('@capacitor/network'),
        Network: {
            getStatus: jest.fn(() => Promise.resolve({connected: true, connectionType: 'wifi'}))
        }
    }
})

jest.mock('@capacitor/screen-orientation', () => {
    return {
      ...jest.requireActual('@capacitor/screen-orientation'),
        ScreenOrientation: {
            orientation: jest.fn(() => Promise.resolve({type: 'landscape'})),
            lock: jest.fn(() => Promise.resolve()),
            unlock: jest.fn(() => Promise.resolve())
        }
    }
})

jest.mock('@capacitor/status-bar', () => {
    return {
      ...jest.requireActual('@capacitor/status-bar'),
        StatusBar: {
            hide: jest.fn(() => Promise.resolve()),
            setStyle: jest.fn(() => Promise.resolve()),
            setBackgroundColor: jest.fn(() => Promise.resolve())
        }
    }
})

describe('ContentDetailsPage', () => {
    let contentDetailsPage: ContentDetailsPage;

    const mockProfileService: Partial<ProfileService> = {
        addContentAccess: jest.fn(() => of())
    };
    const mockContentService: Partial<ContentService> = {
        getContentDetails: jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } })),
        setContentMarker: jest.fn(() => of()),
        nextContent: jest.fn()
    } as any;
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockDownloadService: Partial<DownloadService> = {
        getActiveDownloadRequests: jest.fn(() => of([{identifier: 'sample-id'}]))
    } as any;
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => ({uid: 'user_id', handle: 'handle'})),
        getCachedFrameworkCategory: jest.fn()
    } as any;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn(),
        generatePageLoadedTelemetry: jest.fn(),
        generateStartTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(() => ({
            present: jest.fn(() => Promise.resolve()),
            dismiss: jest.fn(() => Promise.resolve()),
        })),
        showToast: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        },
        convertFileSrc: jest.fn()
    };
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getDeviceAPILevel: jest.fn(() => Promise.resolve('sample')),
        checkAppAvailability: jest.fn(() => Promise.resolve('sample_check'))
    };
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn(() => true)
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockContentData) as any
    };
    const mockRoute: Partial<ActivatedRoute> = {
        queryParams: of({})
    };
    const mockProfileSwitchHandler: Partial<ProfileSwitchHandler> = {};
    const mockRatingHandler: Partial<RatingHandler> = {
        resetRating: jest.fn()
    };
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {
        launchContentPlayer: jest.fn(),
        getLastPlayedContentId: jest.fn(),
        isContentPlayerLaunched: jest.fn()
    };
    const mockChildContentHandler: Partial<ChildContentHandler> = {
        contentHierarchyInfo: [{ id: 'do-123' }]
    };
    const contentDeleteCompleted = { subscribe: jest.fn((fn) => fn({ closed: false })) };
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = { contentDeleteCompleted$: of(contentDeleteCompleted) };
    const mockFileTransfer: Partial<FileTransfer> = {};
    const telemetryObject = new TelemetryObject('do_12345', 'Resource', '1');
    const rollUp = { l1: 'do_123', l2: 'do_123', l3: 'do_1' };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockFormFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        invokedGetFrameworkCategoryList: jest.fn(() => Promise.resolve())
    };
    const mockSunbirdSdk: Partial<SunbirdSdk> = {};
    SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;
    

    global['window']['segmentation'] = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            getTags: jest.fn(() => undefined),
            restoreTags: jest.fn()
        }
    };
    const mockPlayerService: Partial<PlayerService> = {};
    const mockSantizer: Partial<DomSanitizer> = {};

    beforeAll(() => {
        contentDetailsPage = new ContentDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventBusService as EventsBusService,
            mockStorageService as StorageService,
            mockDownloadService as DownloadService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockPlayerService as PlayerService,
            mockNgZone as NgZone,
            mockEvents as Events,
            mockPopoverController as PopoverController,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockCourseUtilService as CourseUtilService,
            mockUtilityService as UtilityService,
            mockFileSizePipe as FileSizePipe,
            mockHeaderService as AppHeaderService,
            mockLocation as Location,
            mockRouter as Router,
            mockRoute as ActivatedRoute,
            mockProfileSwitchHandler as ProfileSwitchHandler,
            mockRatingHandler as RatingHandler,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockChildContentHandler as ChildContentHandler,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockFileTransfer as FileTransfer,
            mockSbProgressLoader as SbProgressLoader,
            mockLocalCourseService as LocalCourseService,
            mockFormFrameworkUtilService as FormAndFrameworkUtilService,
            mockSantizer as DomSanitizer
        );
        ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of contentDetailsPage', () => {
        expect(contentDetailsPage).toBeTruthy();
    });

    describe('subscribePlayEvent', () => {
        it('should subscribe play content', () => {
            mockEvents.subscribe = jest.fn((_, fn) => {
                fn({ selectedUser: 'user-1', streaming: true });
            });
            mockAppGlobalService.setSelectedUser = jest.fn();
            const presentf = jest.fn(() => Promise.resolve());
            mockPopoverController.create = jest.fn(() => Promise.resolve({
                present: presentf
            }) as any);
            contentDetailsPage.subscribePlayEvent();
            expect(mockAppGlobalService.setSelectedUser).toHaveBeenCalledWith('user-1');
        });
    })

    describe('check app availablity and device API level ', () => {
        it('should check the app availablity and device api level', () => {
            // arrange
            mockUtilityService.checkAppAvailability = jest.fn(() => Promise.resolve(''))
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.resolve(''))
            // act
            contentDetailsPage.checkappAvailability();
            contentDetailsPage.checkDeviceAPILevel();
            // assert
        })

        it('should handle error case, on app availablity and device api level', () => {
            // arrange
            mockUtilityService.checkAppAvailability = jest.fn(() => Promise.reject({error: ''}))
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.reject({error: ''}))
            // act
            contentDetailsPage.checkappAvailability();
            contentDetailsPage.checkDeviceAPILevel();
            // assert
        })
    })

    describe('getNavParams', () => {
        it('should check the active download list', (done) => {
            // arrange
            contentDetailsPage.content = {
                content: {
                    contentData: {},
                    identifier: 'do_212911645382959104165'
                },
                contentData: {},
                identifier: 'do_212911645382959104165'
            };
            mockPlatform.is = jest.fn((fn) => fn =='android')
            mockRouter.getCurrentNavigation = jest.fn(() => ({extras: {
                state: {
                    content: {},
                    corRelation: [{id: 'do-123', type: 'Content'}],
                    resumedCourseCardData: {
                        contentId: 'do-123'
                    },
                    autoPlayQuizContent: true,
                    source: PageId.GROUP_DETAIL,
                    groupId: 'g1',
                    activityList: []
                }
            }})) as any;
            const resp = [{ identifier: 'do_212911645382959104165' }, { identifier: 'sample_id2' }];
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => of(resp)) as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of())
            // act
            contentDetailsPage.getNavParams();
            // assert
            setTimeout(() => {
                expect(mockDownloadService.getActiveDownloadRequests).toHaveBeenCalled();
                contentDetailsPage.isContentDownloading$.subscribe((res) => {
                    expect(res).toBeTruthy();
                    done();
                });
            }, 0);
        });
        it('should get extras from content || navigation when getExtras() called', (done) => {
            // arrange
            const mockData = {extras: {state: {
                corRelation: [{id: 'do-123', type: 'Content'}],
                resumedCourseCardData: {
                    contentId: 'do-123'
                },
                autoPlayQuizContent: true,
                source: PageId.GROUP_DETAIL,
                groupId: 'g1',
                activityList: []
            }}}
            mockPlatform.is = jest.fn((fn) => fn =='ios')
            mockRouter.getCurrentNavigation = jest.fn(() => mockData) as any;
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => of([{identifier: 'sample-id'}]));
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));            
            mockContentService.getContentDetails = jest.fn(() => of())
            // act
            contentDetailsPage.getNavParams();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    describe('iosCheck', () => {
        it('should check for ios and questionset and return true', () => {
            // arrange 
            contentDetailsPage.content.mimeType = 'application/vnd.sunbird.questionset'
            mockPlatform.is = jest.fn((fn) => fn == 'ios')
            // act
            contentDetailsPage.iosCheck()
            // assert
        })
        it('should check for ios or questionset and return false', () => {
            // arrange 
            contentDetailsPage.content.mimeType = 'application/vnd.sunbird.questionset'
            mockPlatform.is = jest.fn((fn) => fn == 'android')
            // act
            contentDetailsPage.iosCheck()
            // assert
        })
    })

    describe('promptToLogin', () => {
        it('should be logged in before play the content by invoked promptToLogin() if user loggedin', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, and network available', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockCommonUtilService.translateMessage = jest.fn()
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            mockCommonUtilService.showToast = jest.fn()
            mockRouter.navigate = jest.fn()
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT')
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('QUIZ_CONTENTS_ONLY_REGISTERED_USERS')
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('OVERLAY_SIGN_IN')
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, on dismiss can delete is false or empty string', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false} }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, can delete true on dismiss', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'sample-id', undefined, undefined,
                    undefined, undefined
                );
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'QUIZ_CONTENTS_ONLY_REGISTERED_USERS');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'OVERLAY_SIGN_IN');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    { id: 'sample-id' }, undefined,
                    undefined, undefined
                );
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'sample-id', undefined, undefined,
                    undefined, undefined
                );
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'QUIZ_CONTENTS_ONLY_REGISTERED_USERS');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'OVERLAY_SIGN_IN');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    { id: 'sample-id' }, undefined,
                    undefined, undefined
                );
                done();
            }, 0);
        });
    });

    describe('checkLimitedContentSharingFlag', () => {
        it('should check limitedShareContentFlag', () => {
            // arrange
            const request = {
                contentData: {
                    status: ContentFilterConfig.CONTENT_STATUS_UNLISTED
                },
                contentId: 'sample-content-id'
            };
            // contentDetailsPage.limitedShareContentFlag = true;
            // act
            contentDetailsPage.checkLimitedContentSharingFlag(request);
            // assert
            expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
            expect(contentDetailsPage.content).not.toBeUndefined();
            expect(contentDetailsPage.playingContent).not.toBeUndefined();
            expect(contentDetailsPage.identifier).toBe('sample-content-id');
        });

        it('should check limitedShareContentFlag', () => {
            // arrange
            const request = {
                contentData: {
                    status: undefined
                }
            };
            // act
            contentDetailsPage.checkLimitedContentSharingFlag(request);
            // assert
            expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
        });
    });

    describe('getContentState', () => {
        it('should not show course complete popup', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = false;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const contenxt = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1","id2"],"batchStatus":1}';
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(contenxt);
                }
            });
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve(10));
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            // act
            contentDetailsPage.getContentState().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                    expect(mockAppGlobalService.showCourseCompletePopup).toBeTruthy();
                    done();
                });
            });
        });
        it('should show course complete popup', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({ progress: 100, contentStatusData: contentStatusData }));
            // act
            contentDetailsPage.getContentState().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                    expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                    expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                    done();
                });
            })
        });

        it('should show course complete popup, make isLastAttempt as true', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}, {}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({progress: 100, contentStatusData: contentStatusData}));
            // act
            contentDetailsPage.getContentState().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                    expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                    expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                    done();
                });
            })
        });

        it('should show course complete popup, make isContentDisabled as true', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}, {}, {}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({progress: 100, contentStatusData: contentStatusData}));
            // act
            contentDetailsPage.getContentState().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                    expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                    expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                    done();
                });
            })
        });
    });

    describe('setContentDetails', () => {
        it('should return content data by invoked setContentDetails', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } })) as any;
            const content = { hierachyInfo: [ { id: 'do-123' } ], mimeType: 'application/pdf', primaryCategory: [''] };
            mockCommonUtilService.showToast = jest.fn();
            mockPopoverController.create = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                onDidDismiss: jest.fn()
            })) as any
            contentDetailsPage.cardData = content;
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails if size and status are null', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = true;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: {} })) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                // expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                // expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for empty content', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of('')) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for showRating', (done) => {
            // arrange
            const content = { hierachyInfo: [ { id: 'do-123' } ], mimeType: 'application/pdf', primaryCategory: [''] };
            contentDetailsPage.cardData = content;
            const identifier = 'do_123', refreshContentDetails = true, showRating = true;
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } })) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            contentDetailsPage.navigateBackFlag = false; 
            mockContentPlayerHandler.setContentPlayerLaunchStatus = jest.fn();
            mockRatingHandler.showRatingPopup = jest.fn(() => Promise.resolve({})) as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for ERROR_CONTENT_NOT_AVAILABLE', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => of({Error: 'error'})) as any;
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = false;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for CONNECTION_ERROR', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => throwError({ CONNECTION_ERROR: 'CONNECTION_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for SERVER_ERROR', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => throwError({ SERVER_ERROR: 'CONNECTION_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ngOnInit', () => {
        it('should call subscribeEvents when ngOnInit() invoked', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockFormFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
                target: {
                    mimeType: [
                        'application/pdf'
                    ],
                    primaryCategory: [
                        'LearningResource'
                    ]
                }
            }]));
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }])) as any;
            // act
            contentDetailsPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockFormFrameworkUtilService.getFormFields).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should call subscribeEvents when ngOnInit() invoked, handle else case', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockFormFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
                target: {
                    mimeType: [''],
                    primaryCategory: ['']
                }
            }]));
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }])) as any;
            // act
            contentDetailsPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockFormFrameworkUtilService.getFormFields).toHaveBeenCalled();
                done();
            }, 0);
        });
    })

    describe('subscribeEvents', () => {
        it('should invoke appVersion() and other subscription() when invoked for else case if no data', (done) => {
            // arrange
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            const called:  { [topic: EventTopics]: boolean } = {};
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (called[topic]) {
                    return;
                }
                called[topic] = true;
                if (topic === EventTopics.DEEPLINK_CONTENT_PAGE_OPEN) {
                    fn({ });
                }
                if (topic === EventTopics.PLAYER_CLOSED) {
                    fn({ selectedUser: '' });
                }
                if (topic === EventTopics.NEXT_CONTENT) {
                    fn({ data: 'sample_data' });
                }
            });
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }])) as any;
            mockRatingHandler.resetRating = jest.fn();
            mockRouter.getCurrentNavigation = jest.fn(() => mockContentData) as any;
            mockProfileService.getActiveProfileSession = jest.fn(() =>
                of({ uid: 'sample_uid', sid: 'sample_session_id', createdTime: Date.now() }));
            mockProfileSwitchHandler.switchUser = jest.fn();
            mockEvents.unsubscribe = jest.fn((topic) => {
                console.log(topic);
                called[topic] = false;
            });
            mockContentService.getContentDetails = jest.fn(() => of({})) as any;
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => EMPTY);
            contentDetailsPage['course'] = {
                contentId: 'content_id'
            };
            mockEventBusService.events = jest.fn(() => of({
                payload: {
                    contentId: 'content_id'
                },
                type: ContentEventType.COURSE_STATE_UPDATED
            }));
            contentDetailsPage.shouldOpenPlayAsPopup = true;
            // act
            contentDetailsPage.subscribeEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(1, EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(2, EventTopics.PLAYER_CLOSED, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(3, EventTopics.NEXT_CONTENT, expect.anything());
                // expect(mockRatingHandler.resetRating).toHaveBeenCalled();
                // expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                // expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should invoke appVersion() and other subscription() when invoked', (done) => {
            // arrange
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            const called:  { [topic: EventTopics]: boolean } = {};
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (called[topic]) {
                    return;
                }
                called[topic] = true;
                if (topic === EventTopics.DEEPLINK_CONTENT_PAGE_OPEN) {
                    fn({ content: {} });
                }
                if (topic === EventTopics.PLAYER_CLOSED) {
                    fn({ selectedUser: 'sampleUser' });
                }
                if (topic === EventTopics.NEXT_CONTENT) {
                    fn({ data: 'sample_data' });
                }
            });
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }])) as any;
            mockRatingHandler.resetRating = jest.fn();
            mockRouter.getCurrentNavigation = jest.fn(() => mockContentData) as any;
            mockProfileService.getActiveProfileSession = jest.fn(() =>
                of({ uid: 'sample_uid', sid: 'sample_session_id', createdTime: Date.now() }));
            mockProfileSwitchHandler.switchUser = jest.fn();
            mockEvents.unsubscribe = jest.fn((topic) => {
                console.log(topic);
                called[topic] = false;
            });
            mockContentService.getContentDetails = jest.fn(() => of({})) as any;
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => EMPTY);
            contentDetailsPage['course'] = {
                contentId: 'content_id'
            };
            mockEventBusService.events = jest.fn(() => of({
                payload: {
                    contentId: 'content_id'
                },
                type: ContentEventType.COURSE_STATE_UPDATED
            }));
            contentDetailsPage.shouldOpenPlayAsPopup = true;
            // act
            contentDetailsPage.subscribeEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(1, EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(2, EventTopics.PLAYER_CLOSED, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(3, EventTopics.NEXT_CONTENT, expect.anything());
                expect(mockRatingHandler.resetRating).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should invoke appVersion() and other subscription() if data is false when invoked', (done) => {
            // arrange
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            const called: { [topic: EventTopics]: boolean } = {};
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (called[topic]) {
                    return;
                }
                called[topic] = true;
                if (topic === EventTopics.PLAYER_CLOSED) {
                    fn({ selectedUser: { profileType: 'Teacher' } });
                }
            });
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }])) as any;
            mockProfileSwitchHandler.switchUser = jest.fn();
            mockEvents.unsubscribe = jest.fn((topic) => {
                console.log(topic);
                called[topic] = false;
            });
            contentDetailsPage.course = {
                contentId: 'content_id'
            };
            mockEventBusService.events = jest.fn(() => of({
                payload: {
                    contentId: 'content_id'
                },
                type: ContentEventType.COURSE_STATE_UPDATED
            }));
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn()
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn()
            // act
            contentDetailsPage.subscribeEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalledWith({ profileType: 'Teacher' });
                done();
            }, 0);
        });
    });
    
    describe('getNextContent', () => {
        it('should return response with next content', () => {
            // arrange
            const hierarchyInfo = [{ id: 'sample-id' }];
            const identifier = 'do-123';
            mockContentService.nextContent = jest.fn(()=> of({
                hierarchyInfo: hierarchyInfo,
                    identifier: 'identifier'
               })) as any;  
            // act
            contentDetailsPage.getNextContent(hierarchyInfo, identifier);
            // assert
            setTimeout(() => {
            }, 0);
        });
    });
   
    describe('calculateAvailableUserCount', () => {
        it('should calculate loggedin user', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }]));
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn()
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(contentDetailsPage.userCount).toBe(2);
                done();
            }, 0);
        });

        it('should not increment users count for no active user', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(contentDetailsPage.userCount).toBe(0);
                done();
            }, 0);
        });

        it('should not calculate loggedin user for catch part', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => throwError({ error: 'server-error' }));
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(contentDetailsPage.userCount).toBe(0);
                done();
            }, 0);
        });
    });

    describe('generateEndEvent()', () => {
        it('should generate END Telemetry with given contentType', () => {
            // arrange
            contentDetailsPage.telemetryObject = telemetryObject;
            contentDetailsPage.objRollup = rollUp;
            // act
            contentDetailsPage.generateEndEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(CsContentType.RESOURCE,
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                telemetryObject,
                rollUp,
                [{ id: 'do-123', type: 'Content' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]);
        });

        it('should generate END Telemetry with  contentType if telemetryObject contentType is empty', () => {
            // arrange
            contentDetailsPage.telemetryObject = new TelemetryObject('do_12345', '', '1');
            contentDetailsPage.objRollup = rollUp;
            // act
            contentDetailsPage.generateEndEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith('Learning Resource',
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                contentDetailsPage.telemetryObject,
                rollUp,
                [{ id: 'do-123', type: 'Content' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]);
        });
    });

    describe('generateTelemetry', () => {
        it('should generate event for start event and impression event', () => {
            contentDetailsPage.didViewLoad = false;
            contentDetailsPage.isContentPlayed = false;
            contentDetailsPage.cardData = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3'
            };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            contentDetailsPage.generateTelemetry();
            // assert
            expect(contentDetailsPage.didViewLoad).toBeTruthy();
            expect(contentDetailsPage.isContentPlayed).toBeFalsy();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(1,
                ImpressionType.DETAIL, '',
                PageId.CONTENT_DETAIL,
                Environment.HOME, "do-123", undefined, "v-3", {"l1": undefined}, [{"id": "do-123", "type": "Content"}, {"id": "content-detail", "type": "ChildUi"}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]);
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
                ImpressionType.PAGE_REQUEST, '',
                PageId.CONTENT_DETAIL,
                Environment.HOME
            );
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                undefined,
                undefined,
                undefined,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, {id: 'content-detail', type: 'ChildUi'}, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                { id: 'do-123', type: undefined, version: 'v-3' },
                { l1: undefined }, [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
        });

        it('should return null for else part', () => {
            // arrange
            contentDetailsPage.didViewLoad = true;
            contentDetailsPage.isContentPlayed = true;
            // act
            contentDetailsPage.generateTelemetry();
            // assert
            expect(contentDetailsPage.didViewLoad).toBeTruthy();
            expect(contentDetailsPage.isContentPlayed).toBeTruthy();
        });
    });

    describe('ngOnDestroy()', () => {
        it('should unsubscribe events', () => {
            // arrange
            mockEvents.unsubscribe = jest.fn();
            mockEventBusService.events = jest.fn(() => of({
                unsubscribe: jest.fn()
            }))as any;
            contentDetailsPage['contentProgressSubscription'] = { unsubscribe: jest.fn() } as any;
            // act
            contentDetailsPage.ngOnDestroy();
            // assert
            expect(mockEvents.unsubscribe).toBeCalledTimes(3);
        });

        it('should handle else case if contentProgressSubscription is undefined', () => {
            // arrange
            mockEvents.unsubscribe = jest.fn();
            mockEventBusService.events = jest.fn(() => of({
                unsubscribe: jest.fn()
            }))as any;
            contentDetailsPage['contentProgressSubscription'] = '' as any;
            // act
            contentDetailsPage.ngOnDestroy();
            // assert
            expect(mockEvents.unsubscribe).toBeCalledTimes(3);
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should unsubscribe events', (done) => {
            // arrange
            contentDetailsPage.content = {contentData: {framework: 'some_id'}}
            contentDetailsPage.isResumedCourse = true;
            mockPreferences.getString = jest.fn(() => of(''))
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            contentDetailsPage.isUsrGrpAlrtOpen = true;
            contentDetailsPage.shouldOpenPlayAsPopup = true;
            mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({id: 'some_id'}))
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id') as any;
            mockHeaderService.hideStatusBar = jest.fn();
            mockContentService.getContentDetails = jest.fn(() => of({contentData: {size: '2kb', status: 'Retired'}})) as any
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type:'landscape-primary'})) as any
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isUsrGrpAlrtOpen).toBeFalsy();
                expect(mockHeaderService.hideStatusBar).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should unsubscribe events for else part of isUsrGrpAlrtOpen', (done) => {
            // arrange
            contentDetailsPage.content = {contentData: {framework: 'some_id'}}
            contentDetailsPage.isResumedCourse = true;
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            contentDetailsPage.isUsrGrpAlrtOpen = false;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({id: 'some_id'}))
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id');
            mockHeaderService.hideStatusBar = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({contentData: {size: '2kb', status: ''}})) as any
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type:'landscape-primary'})) as any
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isUsrGrpAlrtOpen).toBeFalsy();
                expect(mockHeaderService.hideStatusBar).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should unsubscribe events for else part of isUsrGrpAlrtOpen', (done) => {
            // arrange
            contentDetailsPage.content = {contentData: {framework: 'some_id'}}
            contentDetailsPage.isResumedCourse = true;
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({id: 'some_id'}))
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id');
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({contentData: {size: '2kb', status: ''}})) as any
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type:'landscape-primary'})) as any
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewDidEnter', () => {
        it('should hide deeplink progress loader', () => {
            // arrange
            contentDetailsPage.identifier = 'sample_doId';
            mockSbProgressLoader.hide = jest.fn();
            // act
            contentDetailsPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
            }, 0);
            expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        });
    })

    describe('ionViewWillLeave()', () => {
        it('should unsubscribe', () => {
            // arrange
            const unsubscribe = jest.fn();
            contentDetailsPage['eventSubscription'] = {
                unsubscribe
            };
            contentDetailsPage.contentDeleteObservable = {
                unsubscribe
            };
            contentDetailsPage.backButtonFunc = {
                unsubscribe
            };
            // act
            contentDetailsPage.ionViewWillLeave();
            // assert
            expect(unsubscribe).toBeCalledTimes(3);
        });

        it('should unsubscribe for else part', () => {
            // arrange
            contentDetailsPage['eventSubscription'] = undefined as any;
            contentDetailsPage.contentDeleteObservable = undefined;
            contentDetailsPage.backButtonFunc = undefined as any;
            // act
            contentDetailsPage.ionViewWillLeave();
            // assert
        });
    });

    describe('getContentCategories', () => {
        it('should handle the content categories ', () => {
            // arrange
            mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({value: ''}))
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            mockFormFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{}]))
            // act
            contentDetailsPage.getContentCategories('');
            // assert

        })
    })

    describe('subscribeSdkEvent', () => {
        it('should return progress of 100 for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.downloadProgress = 100;
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should should return progress of nan for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: {}
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            if (contentDetailsPage.downloadProgress === 100) {
                contentDetailsPage.downloadProgress = {};
            }
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should should return progress of nan for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-1234'
            };
            contentDetailsPage.downloadProgress = 'complete';
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return message for IMPORT_COMPLETED', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED'
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.isDownloadStarted = true;
            mockEvents.publish = jest.fn(() => []);
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({contetData: {size: '2kb'}})) as any
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                });
                done();
            }, 0);
        });

        it('should failed for file IMPORT_COMPLETED', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED'
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.isDownloadStarted = false;
            mockEvents.publish = jest.fn(() => []);
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should update', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    size: '64kb'
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not update for error part', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    size: undefined
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123',
                mimeType: 'sample-mimeType',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA if mimeType is matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: undefined
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            contentDetailsPage.content = {
                identifier: 'do-123',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA if identifier is not matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn())as any;
            contentDetailsPage.content = {
                identifier: 'do-1234',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return undefined if event type is not matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn())as any;
            contentDetailsPage.content = {
                identifier: 'do-1234',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('handleDeviceBackButton', () => {
        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockEvents.publish = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            mockPlatform.is = jest.fn(fn => fn == 'ios')
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-secondary'}))
            // act
            contentDetailsPage.handleDeviceBackButton();
        });

        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockPlatform.is = jest.fn(fn => fn ==="android")
            mockEvents.publish = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            contentDetailsPage.handleDeviceBackButton();
            // expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            //     PageId.CONTENT_DETAIL,
            //     Environment.HOME,
            //     false,
            //     undefined,
            //     [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
            //     { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
            //     { id: 'do_12345', type: '', version: '1' }
            // );
        });
    });

    describe('generateQRSessionEndEvent', () => {
        it('should return end event for qr code', () => {
            const pageId = 'sample-page-id', qrData = 'QR1234';
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            contentDetailsPage.generateQRSessionEndEvent(pageId, qrData);
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                'qr',
                Mode.PLAY,
                pageId,
                Environment.HOME,
                { id: 'QR1234', type: 'qr', version: '' }, undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
        });

        it('should not return end event for else part', () => {
            const pageId = '', qrData = 'QR1234';
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            contentDetailsPage.generateQRSessionEndEvent(pageId, qrData);
        });
    });

    describe('popToPreviousPage', () => {
        it('should navigate to profile-settings page', (done) => {
            mockAppGlobalService.showCourseCompletePopup = false;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))
            ScreenOrientation.lock = jest.fn()
            contentDetailsPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`],
                { state: { showFrameworkCategoriesMenu: true }, replaceUrl: true });
                done();
            }, 0);
        });

        it('should navigate to profile-settings page', (done) => {
            mockAppGlobalService.showCourseCompletePopup = false;
            mockAppGlobalService.isOnBoardingCompleted = true;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))
            ScreenOrientation.lock = jest.fn()
            contentDetailsPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.TABS}`]);
                done();
            }, 0);
        });

        it('should goback to 3steps for single content', (done) => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = true;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            window.history = {
                go: jest.fn()
            } as any;
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                done()
            }, 0);
        });

        it('should navigate to search page for multiple content', (done) => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = false;
            contentDetailsPage.resultLength = 1;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            window.history = {
                go: jest.fn()
            } as any;
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                done()
            }, 0);
        });

        it('should navigate to previous page for else part', (done) => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = false;
            contentDetailsPage.resultLength = 2;
            mockEvents.publish = jest.fn(() => []);
            mockLocation.back = jest.fn();
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(mockLocation.back).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('generateImpressionEvent', () => {
        it('should generate ImpressionEvent', () => {
            contentDetailsPage.downloadAndPlay = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            contentDetailsPage.generateImpressionEvent('download');
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.DOWNLOAD_COMPLETE,
                InteractType.DOWNLOAD_COMPLETE,
                PageId.QR_CONTENT_RESULT,
                Environment.HOME,
                undefined,
                undefined, undefined, undefined,
                [{id: 'do-123', type: 'Content'}, { id: 'content-detail', type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: 'content-detail', type: 'ChildUi' }, 
                { id: 'content-detail', type: 'ChildUi' }, {id: PageId.CONTENT_DETAIL, type: 'ChildUi'}]
            );
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
                ImpressionType.DETAIL, '',
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                undefined, undefined, undefined, { l1: undefined},
                [{"id": "do-123", "type": "Content"}, {"id": "content-detail", "type": "ChildUi"}, 
                {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, 
                {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}]
            );
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                undefined,
                undefined,
                undefined,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: 'content-detail', type: 'ChildUi' },
                { id: 'content-detail', type: 'ChildUi' }, {"id": "content-detail", "type": "ChildUi"}, { id: 'content-detail', type: 'ChildUi' }, {id: PageId.CONTENT_DETAIL, type: 'ChildUi'}]
            );
        });
    })

    describe('handleNavBackButton', () => {
        it('should handle nav backbutton by invoked handleNavBackButton for ios platform ', () => {
            // arrange
            mockPlatform.is = jest.fn(fn => fn =='ios')
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-secondary'}))
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CONTENT_DETAIL,
                    Environment.HOME,
                    true,
                    "do-123",
                    [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                    { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                    { l1: undefined},
                    { id: 'do-123', type: undefined, version: 'v-3' }
                );
            }, 0);
        });
        it('should handle nav backbutton by invoked handleNavBackButton', () => {
            // arrange
            mockPlatform.is = jest.fn(fn => fn =='android')
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-secondary'}))
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CONTENT_DETAIL,
                    Environment.HOME,
                    true,
                    "do-123",
                    [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                    { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                    { l1: undefined},
                    { id: 'do-123', type: undefined, version: 'v-3' }
                );
            }, 0);
        });

        it('should generate shouldGenerateEndTelemetry by invoked handleNavBackButton', (done) => {
            // arrange
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.shouldGenerateEndTelemetry = false;
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.CONTENT_DETAIL,
                    Environment.HOME,
                    true,
                    "do-123",
                    [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                    { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                    { l1: undefined},
                    { id: 'do-123', type: undefined, version: 'v-3' }
                );
                done()
            }, 0);
        });
    });

    describe('openCourseCompletionPopup', () => {
        it('should return, if isCourseCertificateShown is true', (done) => {
            // arrange
            contentDetailsPage['isCourseCertificateShown'] = true;
            // act
            contentDetailsPage.openCourseCompletionPopup().then(res => {
                done();
            });
        });

        it('should not open the course completion popup if the course is not completed', (done) => {
            // arrange
            contentDetailsPage['isCourseCertificateShown'] = false;
            contentDetailsPage['playerEndEventTriggered'] = true;
            contentDetailsPage['shouldOpenPlayAsPopup'] = true;
            contentDetailsPage.showCourseCompletePopup = false;
            mockPreferences.getString = jest.fn((key) => {
                switch(key) {
                    case PreferenceKey.CONTENT_CONTEXT: 
                    return of('')
                }
            }) as any
            contentDetailsPage.course = {contentId: 'do_123'}
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            mockEventBusService.events = jest.fn(() => of({
                type: 'COURSE_STATE_UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 100,
                    contentId: 'do_123'
                }
            }));
            // act
            contentDetailsPage.openCourseCompletionPopup().then(res => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                done();
            });
        });

        it('should open the course completion popup if the course is completed', (done) => {
            // arrange
            contentDetailsPage['playerEndEventTriggered'] = false;
            contentDetailsPage.courseContext = '{"userId":"userid","courseId":' +
                '"courseid","batchId":"batchid","isCertified":true,"leafNodeIds":["id1","id2"],"batchStatus":1}';
            contentDetailsPage.showCourseCompletePopup = true;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({})),
            } as any)));
            mockEventBusService.events = jest.fn(() => of({
                type: 'COURSE_STATE_UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockPreferences.getString = jest.fn((key) => {
                switch(key) {
                    case PreferenceKey.CONTENT_CONTEXT: 
                    return of('')
                }
            }) as any

            // act
            contentDetailsPage.openCourseCompletionPopup().then(res => {
                expect(mockPopoverController.create).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('extractApiResponse', () => {
        it('should be return player response', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: '123'}))
            mockProfileService.addContentAccess = jest.fn(() => of())
            const request: Content = {
                contentData: {
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    },
                    appIcon: 'sample-app-icon',
                    streamingUrl: 'streamingUrl',
                    me_totalDownloads: 'true',
                    attributions: ['sample-2', 'sample-1']
                },
                mimeType: 'application/vnd.ekstep.h5p',
                contentMarker: [{
                    extraInfoMap: { hierarchyInfo: [{ id: 'do-123' }] }
                }],
                isAvailableLocally: true,
                contentAccess: 'content-access',
                isUpdateAvailable: true
            };
            contentDetailsPage.isResumedCourse = true;
            contentDetailsPage.resumedCourseCardData = {
                contentId: 'sample-content-id',
                identifier: 'sample-id'
            };
            mockChildContentHandler.setChildContents = jest.fn();
            mockCommonUtilService.convertFileSrc = jest.fn();
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.resolve('sample'));
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.cardData = {
                hierarchyInfo: undefined
            };
            contentDetailsPage.isChildContent = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.playingContent = request;
            contentDetailsPage.downloadAndPlay = true;
            mockContentService.setContentMarker = jest.fn(() => of())
            // act
            contentDetailsPage.extractApiResponse(request);
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockChildContentHandler.setChildContents).toHaveBeenCalledWith(
                    contentDetailsPage.resumedCourseCardData.contentId, 0, 'sample_doId');
                expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('sample-app-icon');
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isChildContent).toBeTruthy();
                expect(contentDetailsPage.streamingUrl).toBe(request.contentData.streamingUrl);
                expect(contentDetailsPage.content.contentData.attributions).toBe('sample-1, sample-2');
                done();
            }, 0);
        });

        it('should not return api respone', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: '123', handle: 'handle'})) as any
            mockProfileService.addContentAccess = jest.fn(() => of())
            const request: Content = {
                contentData: {
                    licenseDetails: undefined,
                    appIcon: 'sample-app-icon',
                    streamingUrl: undefined,
                    me_totalDownloads: false
                },
                mimeType: 'application',
                contentMarker: [{
                    extraInfoMap: { hierarchyInfo: [{ id: 'do-123' }] }
                }],
                isAvailableLocally: false,
                contentAccess: 'content-access',
                isUpdateAvailable: true,
                me_totalDownloads: true,
                lastUpdatedTime: 0
            };
            contentDetailsPage.isResumedCourse = false;
            contentDetailsPage.resumedCourseCardData = {
                contentId: 'sample-content-id',
                identifier: 'sample-id'
            };
            mockChildContentHandler.setChildContents = jest.fn();
            mockCommonUtilService.convertFileSrc = jest.fn();
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.resolve('sample'));
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.cardData = {
                hierarchyInfo: [{ id: 'do-123' }]
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.playingContent = request;
            contentDetailsPage.downloadAndPlay = true;
            contentDetailsPage.shouldGenerateTelemetry = false;
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            mockContentService.setContentMarker = jest.fn(() => of())
            // act
            contentDetailsPage.extractApiResponse(request);
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeFalsy();
                expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('sample-app-icon');
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('markContent', () => {
        it('should update content last access time', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid',
                handle: 'handle'
            })) as any;
            mockProfileService.addContentAccess = jest.fn(() => of(true));
            mockEvents.publish = jest.fn();
            mockContentService.setContentMarker = jest.fn(() => of(true));
            // act
            contentDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'sample_doId',
                    contentType: undefined,
                    status: 1
                });
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.LAST_ACCESS_ON, true);
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'sample_doId',
                        data: JSON.stringify({ me_totalDownloads: false }),
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid', handle: 'handle'
            })) as any;
            mockProfileService.addContentAccess = jest.fn(() => throwError(false));
            mockContentService.setContentMarker = jest.fn(() => throwError(false));
            // act
            contentDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'sample_doId',
                    contentType: undefined,
                    status: 1
                });
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'sample_doId',
                        data: JSON.stringify({ me_totalDownloads: false }),
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

    describe('showSwitchUserAlert', () => {
        it('should return tost for offline', (done) => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false } as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo?.isNetworkAvailable).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
                done();
            }, 0);
        });

        it('should invoked openPlayAsPopup', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'none'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 3;
            contentDetailsPage.contentDownloadable['do_212911645382959104165']
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: null }))
            } as any)));
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    {l1: undefined},
                    [{ id: 'do-123', type: 'Content' }, {id: 'content-detail', type: 'ChildUi'},
                    {id: 'content-detail', type: 'ChildUi'}, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}
                    ]
                );
                expect(contentDetailsPage.userCount).toBe(1);
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
        });

        it('should return a popup if network is 2g and dismiss data is null', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: null }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    {l1: undefined},
                    [{ id: 'do-123', type: 'Content' }, {id: 'content-detail', type: 'ChildUi'}, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
            }, 0);
        });

        it('should return a popup if network is 2g, isLeftButtonClicked and userCount is 2 ', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'none'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 2;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: true }}))
            } as any)));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    { l1: undefined},
                    [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
            }, 0);
        });

        it('should return a popup if network is 2g, isLeftButtonClicked and userCount is 2 ', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'none'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 5;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: true }}))
            } as any)));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    { l1: undefined},
                    [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
            }, 0);
        });

        it('should return a popup if network is 2g, isLeftButtonClicked and player is launched ', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'none'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: true }}))
            } as any)));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    { l1: undefined},
                    [{ id: 'do-123', type: 'Content' },  {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
            }, 0);
        });

        it('should invoked downloadContent()', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'none'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: false }}))
            } as any)));
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'some_id', handle: 'handle'})) as any
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    { l1: undefined},
                    [{ id: 'do-123', type: 'Content' },  {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
                // expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
            }, 0);
        });

        it('should invoked playContent()', () => {
            // arrange
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { "networkType": 'cellular' },
                    { l1: undefined},
                    [{ id: 'do-123', type: 'Content' },  {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
        });

        it('should invoked playContent() for downloaded content', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'id', handle:'handle'})) as any
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: 'cellular' },
                    {'l1': undefined},
                    [{ id: 'do-123', type: 'Content' },  {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}, {id: 'content-detail', type: 'ChildUi'}]
                );
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    InteractType.PLAY,
                    InteractSubtype.DOWNLOAD,
                    PageId.QR_CONTENT_RESULT,
                    Environment.ONBOARDING
                );
                done();
            }, 0);
        });
    });

    describe('downloadContent', () => {
        it('should return event for download initiated', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'id', handle: 'handle'}))
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = {
                contentData: {
                    size: '64kb'
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = {
                'network-type': 'cellular',
                size: '64kb'
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn();
            mockContentService.importContent = jest.fn(() => of([{ status: -1 }])) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.downloadContent();
            // assert
            setTimeout(() => {
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_INITIATE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: undefined, version: '' },
                    values, { l1: undefined },
                    [{ id: 'do-123', type: 'Content' }, { id: 'content-detail', type: 'ChildUi' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }, { id: 'content-detail', type: 'ChildUi' }, { id: 'content-detail', type: 'ChildUi' }, { id: 'content-detail', type: 'ChildUi' }]
                );
                done();
            }, 0);
        });

        it('should return null for else part', (done) => {
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            contentDetailsPage.downloadContent();
            setTimeout(() => {
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('openPDFPreview()', () => {
        it('should download pdf if not available locally', (done) => {
            // arrange
            const content: Partial<Content> = {
                contentData: {
                    itemSetPreviewUrl: 'http://some_domain.com/som_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).toHaveBeenCalled();
                expect(mockDownload).toHaveBeenCalledWith(content.contentData.itemSetPreviewUrl, expect.any(String));
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith('SOME_TEMP_URL');
                done();
            });
        });

        it('should not download pdf if available locally', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: '/some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            });
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).not.toHaveBeenCalled();
                expect(mockDownload).not.toHaveBeenCalled();
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith(
                    'file:///some_local_path/some_local_path/some_path.some_extension'
                );
                done();
            });
        });

        it('should show error toast on file print failure', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: '/some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn(() => { throw new Error('UNEXPECTED_ERROR'); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith(
                    'file:///some_local_path/some_local_path/some_path.some_extension'
                );
                expect(mockDismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_COULD_NOT_OPEN_FILE');
                done();
            });
        });

        it('should show error toast on fileCanPrint() returns false', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: 'file://some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(false); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins['printer'].print).not.toHaveBeenCalledWith(
                    'file://some_local_path/some_local_path/some_path.some_extension'
                );
                expect(mockDismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_COULD_NOT_OPEN_FILE');
                done();
            });
        });
    });

    describe('share()', () => {
        it('shareItemType should be root-content', (done) => {
            // arrange
            contentDetailsPage.content = { identifier: 'do_1234', contentData: { size: undefined } };
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            // act
            contentDetailsPage.share().then(() => {
                // assert
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                expect(mockPopoverController.create).toHaveBeenCalled();
                done();
            });
        });
        it('shareItemType should be leaf-content', (done) => {
            // arrange
            contentDetailsPage.content = { identifier: 'do_1234', contentData: { size: '10.00KB' } };
            contentDetailsPage.isChildContent = true;
            mockCommonUtilService.translateMessage = jest.fn(() => '');
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            // act
            contentDetailsPage.share().then(() => {
                // assert
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                expect(mockPopoverController.create).toHaveBeenCalledWith(expect.objectContaining({
                    componentProps: expect.objectContaining({
                        shareItemType: ShareItemType.LEAF_CONTENT
                    })
                }));
                done();
            });
        });
    });

    describe('showDeletePopup', () => {
        it('should delete a content if content size is not available', () => {
            // arrange
            contentDetailsPage.content = { contentData: { size: undefined } };
            mockContentDeleteHandler.showContentDeletePopup = jest.fn();
            // act
            contentDetailsPage.showDeletePopup();
            // assert
            expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
        });

        it('should delete a content if content size available', () => {
            // arrange
            contentDetailsPage.content = { contentData: { size: '10KB' } };
            mockContentDeleteHandler.showContentDeletePopup = jest.fn();
            // act
            contentDetailsPage.showDeletePopup();
            // assert
            expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
        });
    });

    describe('openConfirmPopUp', () => {
        it('should return content not downloaded for undefined downloadUrl with no internet message', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 , downloadUrl: 'url'} };
            mockCommonUtilService.showToast = jest.fn();
            mockFileSizePipe.transform = jest.fn(() => '');
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            // act
            contentDetailsPage.openConfirmPopUp();
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                done();
            }, 0);
        });

        it('should open a content download popup for dismiss data', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 , downloadUrl: 'sample-url'} };
            mockFileSizePipe.transform = jest.fn(() => '10KB');
            const presentFN = jest.fn(() => Promise.resolve({}));
            const onDismissFN = jest.fn(() => Promise.resolve({ data: { canDelete: true } }));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: presentFN,
                onDidDismiss: onDismissFN
            } as any)));
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockFileSizePipe.transform).toHaveBeenLastCalledWith(101100, 2);
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                done();
            }, 0);
        });

        it('should open a content download popup for dismiss data is undefined', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100, downloadUrl: 'sample-url' } };
            mockFileSizePipe.transform = jest.fn(() => '10KB');
            const presentFN = jest.fn(() => Promise.resolve({}));
            const onDismissFN = jest.fn(() => Promise.resolve({ undefined }));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: presentFN,
                onDidDismiss: onDismissFN
            } as any)));
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockFileSizePipe.transform).toHaveBeenLastCalledWith(101100, 2);
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                expect(presentFN).toHaveBeenCalled();
                expect(onDismissFN).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not open a content download popup for offline ', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 } };
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });

        it('should open a content download popup for download not allow ', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = true;
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
                done();
            }, 0);
        });
    });

    describe('rateContent', () => {
        it('should return rateing for content', () => {
            // arrange
            const popUpType = 'manual';
            mockRatingHandler.showRatingPopup = jest.fn(() => Promise.resolve({}));
            // act
            contentDetailsPage.rateContent(popUpType);
            // assert
            expect(mockRatingHandler.showRatingPopup).toHaveBeenCalledWith(
                true,
                { contentData: { name: 'matrix', size: 101100 } },
                'manual',
                [{ id: 'do-123', type: 'Content' }, {id: PageId.CONTENT_DETAIL,type: 'ChildUi'},
                {id: PageId.CONTENT_DETAIL,type: 'ChildUi'}, {id: PageId.CONTENT_DETAIL,type: 'ChildUi'}, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                {id: PageId.CONTENT_DETAIL,type: 'ChildUi'}],
                { l1: undefined }
            );
        });
    })

    describe('cancelDownload', () => {
        it('should generate telemetry for cancel download', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            mockTelemetryGeneratorService.generateContentCancelClickedTelemetry = jest.fn();
            contentDetailsPage.isUpdateAvail = false;
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.ONBOARDING,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: 'Content', version: '' }, undefined, undefined,
                    [{ id: 'download-popup', type: 'ChildUi' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: undefined, version: '' },
                    undefined, {l1: undefined}, [{id: "do-123", type: "Content"}, {"id": "content-detail", "type": "ChildUi"}, {id: "content-detail", type: "ChildUi"}, {id: "content-detail", type: "ChildUi"}, {id: "content-detail", type: "ChildUi"}, {id: "content-detail", type: "ChildUi"}]
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateContentCancelClickedTelemetry).toHaveBeenCalled();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                done();
            }, 0);
        });

        it('should generate telemetry for update available', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            mockTelemetryGeneratorService.generateContentCancelClickedTelemetry = jest.fn();
            contentDetailsPage.isUpdateAvail = true;
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.ONBOARDING,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: "Content", version: '' },
                    undefined, undefined, [{id: "download-popup", type: "ChildUi"}]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: undefined, version: '' },
                    undefined, { l1: undefined }, [{"id": "do-123", "type": "Content"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}]
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateContentCancelClickedTelemetry).toHaveBeenCalled();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                done();
            }, 0);
        });

        it('should generate telemetry for cancel download for catch part', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => throwError({ error: 'error' }));
            mockNgZone.run = jest.fn((fn) => fn()) as any;
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.ONBOARDING,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: 'Content', version: '' }, undefined, undefined,
                    [{ id: 'download-popup', type: 'ChildUi' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: undefined, type: undefined, version: '' },
                    undefined, { l1: undefined }, [{"id": "do-123", "type": "Content"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}, {"id": "content-detail", "type": "ChildUi"}]
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('handleContentPlay', () => {
        it('should return null if content is undefined', (done) => {
            contentDetailsPage.limitedShareContentFlag = true;
            contentDetailsPage.content = {
                contentData: undefined
            };
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));
            contentDetailsPage.handleContentPlay('');
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked promotToLogIn page', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = true;
            contentDetailsPage.content = {
                contentData: {
                    streamingUrl: 'streamingUrl'
                }
            };
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            Network.getStatus = jest.fn(() => Promise.resolve({connectionType: 'cellular'})) as any
            // act
            contentDetailsPage.handleContentPlay('');
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showSwitchUserAlert page', (done) => {
            contentDetailsPage.limitedShareContentFlag = true;
            contentDetailsPage.content = {
                contentData: {
                    streamingUrl: 'streamingUrl'
                }
            };
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.handleContentPlay('');
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showSwitchUserAlert page', (done) => {
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));
            Network.getStatus = jest.fn(() => Promise.resolve({connected: true, connectionType: 'cellular'}))
            contentDetailsPage.handleContentPlay('');
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show a toast message with User has exceeded the number of atempts', (done) => {
            // arrange
            contentDetailsPage['isContentDisabled'] = true;
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: true, isCloseButtonClicked: true }));
            // act
            contentDetailsPage.handleContentPlay('');
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getImportContentRequestBody', () => {
        it('should return requestParams', () => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() => 'c:/files');
            // act
            contentDetailsPage.getImportContentRequestBody(identifiers, isChild);
            // assert
            expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
        });
    });

    describe('importContent', () => {
        it('should return a toast for content not available', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockContentService.importContent = jest.fn(() => of([{ status: -1 }])) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should not return a toast for status is not matched', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockContentService.importContent = jest.fn(() => of([{ status: 2 }])) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn()
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return a toast of somthing went wrong for catch part', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockContentService.importContent = jest.fn(() => throwError({ error: 'error' }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                id: true
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn()
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
        });

        it('should return a toast of somthing went wrong for catch part and download not started', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockContentService.importContent = jest.fn(() => throwError({ error: 'error' }));
            contentDetailsPage.isDownloadStarted = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                id: true
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn()

            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
        });
    });

    describe('openinBrowser', () => {
        it('should open a Url In Browser', () => {
            mockCommonUtilService.openUrlInBrowser = jest.fn();
            contentDetailsPage.openinBrowser('sample-url');
            expect(mockCommonUtilService.openUrlInBrowser).toHaveBeenCalled();
        });
    })

    describe('showDownloadTranscript', () => {
        it('should return a transcript download popup', (done) => {
            // arrange
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
            } as any)));
            contentDetailsPage.content = {
                contentData: {
                    transcripts: [{
                        identifier: 'sample-do_id',
                        artifactUrl: 'http//:sample-url/do_id',
                        language: 'english'
                      }, {
                        identifier: 'sample-do_id',
                        artifactUrl: 'http//:sample-url/do_id',
                        language: 'hindi'
                      }],
                      name: 'transcript-content'
                }
            };
            // act
            contentDetailsPage.showDownloadTranscript();
            // assert
            setTimeout(() => {
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(contentDetailsPage.content.contentData.transcripts).not.toBeUndefined();
                done();
            }, 0);
        });
    })

    describe('playWebVideoContent', () => {
        it ('should handle web video content ', () => {
            // arrange
            contentDetailsPage.playerType = 'sunbird-video-player'
            contentDetailsPage.config = {
                context: {},
                config: {},
                metadata: {}
            }
            document.createElement = jest.fn(() => ({
                setAttribute: jest.fn(),
                addEventListener: jest.fn()
            })) as any
            window.setTimeout = jest.fn((f) => f(() => {
                document.createElement = jest.fn(() => ({
                    setAttribute: jest.fn(),
                    addEventListener: jest.fn()
                })) as any
            }), 100) as any;
            // act
            contentDetailsPage.playWebVideoContent();
            // assert
        })
    })

    describe('playerEvents', () => {
        it('should check on edata type END', () => {
            // arrange
            const event = {edata:{type: 'END', metaData: {}}, type: ''};
            const saveState = JSON.stringify(event.edata.metaData);
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'}));
            if(event.edata['type'] === 'END') {
                mockPlayerService.savePlayerState = jest.fn(() => of());
                contentDetailsPage.isPlayerPlaying = false;
            }
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))
            ScreenOrientation.lock = jest.fn()
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockPlayerService.savePlayerState).toHaveBeenCalledWith('user_id', contentDetailsPage.content.rollUp.l1, contentId, saveState);
            }, 0);
        });
        it('should check on edata type EXIT', () => {
            // arrange
            const event = {edata:{type: 'EXIT'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'})) as any;
            ScreenOrientation.lock = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'})) as any;
            if(event.edata['type'] === 'EXIT') {
                mockPlayerService.deletePlayerSaveState = jest.fn(() => of());
                ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'})) as any;
                ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockPlayerService.deletePlayerSaveState).toHaveBeenCalledWith('user_id', contentDetailsPage.content.rollUp.l1, contentId)
            }, 0);
        });
        it('should check on edata type NEXT_CONTENT_PLAY', () => {
            // arrange
            const event = {edata:{type: 'NEXT_CONTENT_PLAY'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'})) as any;
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'})) as any;
            ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any;
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT, {
                    contentData:{
                        hierarchyInfo: [{ id: 'sample-id' }],
                        identifier: 'do-123',
                        pkgVersion: 'v-3',
                        rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
                    },
                    course: contentDetailsPage.course
                });
            }, 0);
        });
        it('should check on edata type compatibility-error', () => {
            // arrange
            const event = {edata:{type: 'compatibility-error'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            ScreenOrientation.orientation = jest.fn(type => type == 'portrait-primary') as any;
            ScreenOrientation.lock = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'}));
            cordova.plugins['InAppUpdateManager'].checkForImmediateUpdate = jest.fn(() => of()) as any;
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on edata type exdata', () => {
            // arrange
            const event = {edata:{type: 'exdata', currentattempt: true, maxLimitExceeded: 2, isLastAttempt: 'no'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const attemptInfo = {
                isContentDisabled: event.edata.maxLimitExceeded,
                isLastAttempt: event.edata.isLastAttempt
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'}));
            ScreenOrientation.orientation = jest.fn(type => type == 'portrait-primary') as any;
            ScreenOrientation.lock = jest.fn();
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => of());
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalledWith(attemptInfo);
            }, 0);
        });
        it('should check on edata type FULLSCREEN and screentype potrait', () => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'}));
            const event = {edata:{type: 'FULLSCREEN'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'})) as any
            ScreenOrientation.lock = jest.fn();
            if (ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait-primary'}))) {
                ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            } else if (ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))) {
                ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on edata type FULLSCREEN and screentype landscape', () => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'}));
            const event = {edata:{type: 'FULLSCREEN'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'})) as any
            ScreenOrientation.lock = jest.fn();
            if (ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))) {
                ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            } else if (ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape-primary'}))) {
                ScreenOrientation.lock = jest.fn(() => Promise.resolve());
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type ended and ratecontent', () => {
            // arrange
            const event = {edata: '', type: 'ended'};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type REPLAY', () => {
            // arrange
            const event = {edata: '', type: 'REPLAY'};
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type REPLAY', () => {
            // arrange
            const event = {edata: '', type: ''};
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
    });

    describe('generateStartEvent', () => {
        it('should generate start telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn()
            // act
            contentDetailsPage.generateStartEvent()
            // assert
        })
    });

    describe('getImageContent', () => {
        it('should getImageContent, if platform ios', () => {
            // arrange
            contentDetailsPage.content = {
                contentData: {
                    appIcon: ''
                }
            }
            mockPlatform.is = jest.fn(fn => fn === 'ios')
            mockSantizer.bypassSecurityTrustUrl = jest.fn()
            // act
            contentDetailsPage.getImageContent()
            // assert
        })

        it('should getImageContent, if platform android', () => {
            // arrange
            contentDetailsPage.content = {
                contentData: {
                    appIcon: ''
                }
            }
            mockPlatform.is = jest.fn(fn => fn === 'android')
            // act
            contentDetailsPage.getImageContent()
            // assert
        })
    });

    describe('openPlayAsPopup ', () => {
        it('should openPlayAsPopup', () => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'})) as any
            mockPopoverController.create = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            })) as any
            // act
            contentDetailsPage.openPlayAsPopup(true)
            // assert
        })

        it('should openPlayAsPopup, if isLeftButtonClicked', () => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id', handle: 'handle'})) as any
            mockPopoverController.create = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                onDidDismiss: jest.fn(() => Promise.resolve({data: {isLeftButtonClicked: true}}))
            })) as any
            // act
            contentDetailsPage.openPlayAsPopup(true)
            // assert
        })
    });
    describe('handlePlayer', () => {
        it('should handlePlayer', () => {
            // arrange
            mockFormFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({fields: [{name: 'videoPlayer', values:[{isEnabled: true}]}]}))
            contentDetailsPage.config = {
                metadata: {
                    isAvailableLocally: true,
                    hierarchyInfo: '',
                    contentData: {streamingUrl: ''},
                    mimeType: 'application/vnd.sunbird.questionset'
                },
                context: {
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                }
            }
            // act
            contentDetailsPage.handlePlayer({state: {config: {metadata: {mimeType: 'application/vnd.sunbird.questionset'}}}})
            // assert
        })
    })

    describe('getNewPlayerConfiguration', () => {
        it('should getNewPlayerConfiguration', () => {
            // arrange
            contentDetailsPage.config = {
                metadata: {
                    isAvailableLocally: true,
                    hierarchyInfo: '',
                    contentData: {streamingUrl: ''},
                    mimeType: 'application/vnd.sunbird.questionset',
                    instructions: '',
                    outcomeDeclaration: ''
                },
                context: {
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                }
            }
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({serverProfile: { firstName: ''}, handle: ''})) as any
            mockContentService.getQuestionSetRead = jest.fn(() => of())
            // act
            contentDetailsPage.getNewPlayerConfiguration();
            // assert
        })
    })

    describe('checkIsPlayerEnabled', () => {
        it('should checkIsPlayerEnabled', () => {
            // arrange
            // act
            contentDetailsPage.checkIsPlayerEnabled({fields: [{name: '', values: [{isEnabled: true}]}]}, '');
            // assert
        })
    })
    describe('playerTelemetryEvents', () => {
        it('should playerTelemetryEvents', () => {
            // arrange
            jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                telemetryService: {
                    saveTelemetry(request: string): Observable<boolean> {
                        return of(true);
                    }
                } as Partial<TelemetryService> as TelemetryService
            } as Partial<SunbirdSdk> as SunbirdSdk);
            // act
            contentDetailsPage.playerTelemetryEvents('{}');
            // assert
        })
    });

    describe('viewCredits', () => {
        it('should viewCredits', () => {
            // arrange
            // act
            contentDetailsPage.viewCredits();
            // assert
        })
        it('should viewCredits', () => {
            // arrange
            contentDetailsPage.content = {
                contentData: {
                    creator: {},
                    creators: {},
                    contributors: {},
                    owner: 'owner',
                    attributions: {}
                }
            }
            mockCourseUtilService.showCredits = jest.fn()
            // act
            contentDetailsPage.viewCredits();
            // assert
        })
    })

    describe('readLessorReadMore', () => {
        it('should readLessorReadMore, if read-more-clicked', () => {
            // arrange
            mockAppGlobalService.setAccessibilityFocus = jest.fn()
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            contentDetailsPage.readLessorReadMore('read-more-clicked', '');
            // assert
        })

        it('should readLessorReadMore, if read-more-clicked is not clicked', () => {
            // arrange
            mockAppGlobalService.setAccessibilityFocus = jest.fn()
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            contentDetailsPage.readLessorReadMore('read-less-clicked', '');
            // assert
        })
    });

    describe('mergeProperties', () => {
        it('should mergeProperties', () => {
            // arrange
            // act
            contentDetailsPage.mergeProperties([{}]);
            // assert
        })
    });

    describe('fetchCertificateDescription', () => {
        it('should return empty string if batchId is null', () => {
            // act
            contentDetailsPage.fetchCertificateDescription(null)
                // assert
        });

        it('should returncertificate message if batchId is present', () => {
            mockCourseService.getBatchDetails = jest.fn(() => of({
                cert_templates: { someKey: { description: 'some_description' } }
            })) as any;
            // act
            contentDetailsPage.fetchCertificateDescription('batch_id')
                // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalled();
            }, 0);
        });

        it('should return empty string if there is an error', () => {
            mockCourseService.getBatchDetails = jest.fn(() => throwError({error: 'some_error'})) as any;
            // act
            contentDetailsPage.fetchCertificateDescription('batch_id')
                // assert
            setTimeout(() => {
                expect(mockCourseService.getBatchDetails).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('openWithVendorApps', () => {
        it('should openWithVendorApps', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockPopoverController.create = jest.fn(() => Promise.resolve({
                present: jest.fn()
            })) as any
            // act
            contentDetailsPage.openWithVendorApps();
            // assert
        })
    })
});