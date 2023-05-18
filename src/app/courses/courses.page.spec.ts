import { CoursesPage } from './courses.page';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { NgZone } from '@angular/core';
import { SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { Events } from '../../util/events';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CourseUtilService } from '../../services/course-util.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import { Environment, InteractSubtype, InteractType, PageId } from '../../services/telemetry-constants';
import {
    Content,
    ContentService,
    Course,
    CourseBatchStatus,
    CourseEnrollmentType,
    CourseService,
    EventsBusService,
    FrameWorkService,
    PageAssembleCriteria,
    PageAssembleService,
    ProfileType,
    SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { of, throwError } from 'rxjs';
import { BatchConstants, ContentCard, PageName } from '../app.constant';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { CsNetworkError } from '@project-sunbird/client-services/core/http-service';
import { NavigationService } from '../../services/navigation-handler.service';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';
import { ProfileHandler } from '../../services/profile-handler';
import { ContentAggregatorRequest, ContentSearchCriteria, FrameworkCategoryCodesGroup, FrameworkUtilService, GetFrameworkCategoryTermsRequest, ProfileService } from '@project-sunbird/sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { mockCategoryTermsResponse } from '../../services/formandframeworkutil.service.spec.data';
import { mockFrameworkList } from '../faq-report-issue/faq-report-issue.page.spec.data';

describe('CoursesPage', () => {
    let coursesPage: CoursesPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(
            { profileType: 'Student', grade: ['g1', 'g2'], medium: ['m1', 'm2'], subject: 'Sunbject' } as any
        ))
    };
    const mockFrameworkService: Partial<FrameWorkService> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getCourseFilterConfig: jest.fn(() => Promise.resolve())
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockNetwork: Partial<Network> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
    const mockPageService: Partial<PageAssembleService> = {};
    const mockPopCtrl: Partial<PopoverController> = {
        create: jest.fn(() => Promise.resolve({
            present: jest.fn(),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: {} }))
        }) as any)
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('{"body": {"identifier": "do_123"}}'))
    };
    const mockQrScanner: Partial<SunbirdQRScanner> = {};
    const mockRouter: Partial<Router> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockToastController: Partial<ToastController> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
    const mockProfileHandler: Partial<ProfileHandler> = {
        getAudience: jest.fn(() => Promise.resolve(['Student']))
    };
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFrameworkCategoryTerms: jest.fn(() => of(mockFrameworkList)) as any
    };

    const mockTranslateService: Partial<TranslateService> = {
        currentLang: 'en'
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform !== 'ios')
    };

    beforeAll(() => {
        coursesPage = new CoursesPage(
            mockEventBusService as EventsBusService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockContentService as ContentService,
            mockFrameworkService as FrameWorkService,
            mockProfileService as ProfileService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockAppVersion as AppVersion,
            mockNgZone as NgZone,
            mockQrScanner as SunbirdQRScanner,
            mockPopCtrl as PopoverController,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockCourseUtilService as CourseUtilService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockNetwork as Network,
            mockRouter as Router,
            mockToastController as ToastController,
            mockHeaderService as AppHeaderService,
            mockSbProgressLoader as SbProgressLoader,
            mockNavService as NavigationService,
            mockContentAggregatorHandler as ContentAggregatorHandler,
            mockProfileHandler as ProfileHandler,
            mockTranslateService as TranslateService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of coursePage', () => {
        expect(coursesPage).toBeTruthy();
    });

    describe('getAggregatorResult', () => {
        it('should return course for loggedIn user', (done) => {
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(
                { profileType: 'Student', grade: ['g1', 'g2'], medium: ['m1', 'm2'], subject: 'Sunbject' } as any
            ));
            mockProfileHandler.getAudience = jest.fn(() => Promise.resolve(['Student']));
            mockContentAggregatorHandler.newAggregate = jest.fn(() => {
                Promise.resolve([{
                    orientation: 'horaizontal',
                    section: {
                        sections: [{ name: 'sample-name' }]
                    }
                }]);
            }) as any;
            
            // act
            coursesPage.getAggregatorResult();
            setTimeout(() => {
                expect(mockContentAggregatorHandler.newAggregate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return course for guest user', (done) => {
            jest.spyOn(coursesPage, 'spinner').mockImplementation();
            mockContentAggregatorHandler.newAggregate = jest.fn(() => {
                Promise.resolve([{
                    orientation: 'horaizontal',
                    section: {
                        sections: [{ name: 'sample-name' }]
                    }
                }]);
            }) as any;
            // act
            coursesPage.getAggregatorResult();
            setTimeout(() => {
                expect(mockContentAggregatorHandler.newAggregate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ngOnInit', () => {
        it('should return enrolledCourse data and course tab data by invoked ngOnIt', (done) => {
            // arrange
            const refresher = true;
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return enrolledCourse data if data is available by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return enrolledCourse data if enrolledCourses length is zero by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            const course: Course[] = [];
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getCourseTabData', () => {
        it('should be the refresher false', () => {
            //arrange
            const refresher = false;
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            //act
            coursesPage.getCourseTabData(refresher);
            //assert
        });
    });

    it('should generate telemetry and navigate to search page', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() => Promise.resolve(['sample1', 'sample2']));
        mockRouter.navigate = jest.fn();
        // act
        coursesPage.search();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
            InteractSubtype.SEARCH_BUTTON_CLICKED,
            Environment.HOME,
            PageId.COURSES);
        setTimeout(() => {
            expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalled();
            done();
        }, 0);
    });


    describe('handleHeaderEvents', () => {
        it('should trigger search() if event name receives search', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'search').mockImplementation();
            // act
            coursesPage.handleHeaderEvents({ name: 'search' });
            // assert
            setTimeout(() => {
                expect(coursesPage.search).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should trigger showFilter() if event name receives search', () => {
            // arrange
            let data = [{
                selected: [1, 2]
            }];
            jest.spyOn(coursesPage, 'showFilter');
            coursesPage.resetCourseFilter = true;
            mockFormAndFrameworkUtilService.getCourseFilterConfig = jest.fn(() => Promise.resolve(data))
            // act
            coursesPage.handleHeaderEvents({ name: 'filter' });
            // assert
            expect(coursesPage.showFilter).toHaveBeenCalled();
        });

        it('call showFilter method and set ifFilterOpen as true', () => {
            // arrange
            coursesPage['isFilterOpen'] = true
            jest.spyOn(coursesPage, 'showFilter');
            coursesPage.resetCourseFilter = true;
            // act
            coursesPage.handleHeaderEvents({ name: 'filter' });
            // assert
            expect(coursesPage.showFilter).toHaveBeenCalled();
        });

        it('should trigger redirectToActivedownloads() if event name receives search', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.handleHeaderEvents({ name: 'download' });
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
                Environment.HOME,
                PageId.COURSES
            );
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });


    it('should handle header service by invoked ionViewWillEnter', () => {
        // arrange
        coursesPage.refresher = {
            disabled: true
        } as any;
        mockEvents.subscribe = jest.fn((_, fn) => fn());
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        jest.spyOn(coursesPage, 'handleHeaderEvents').mockReturnValue();
        jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        coursesPage.ionViewWillEnter();
        // assert
        expect(mockEvents.subscribe).toHaveBeenCalled();
        expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
        expect(data).toHaveBeenCalled();
    });

    describe('ionViewDidEnter', () => {
        it('should start qrScanner if pageId is course', (done) => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = { pageName: 'courses' };
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockQrScanner.startScanner = jest.fn(() => Promise.resolve('start'));
            mockSbProgressLoader.hide = jest.fn();
            // act
            coursesPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockQrScanner.startScanner).toHaveBeenCalledWith(PageId.COURSES, false);
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                done()
            }, 0);
        });

        it('should not start qrScanner if pageId is not course', (done) => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = { pageName: 'library' };
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockSbProgressLoader.hide = jest.fn();
            // act
            coursesPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockSbProgressLoader.hide).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe eventservice and headerObservable by invoked ionViewWillLeave', () => {
            // arrange
            coursesPage.refresher = { disabled: true };
            coursesPage.headerObservable = true;
            coursesPage.headerObservable = {
                unsubscribe: jest.fn(() => true)
            };
            coursesPage['eventSubscription'] = {
                unsubscribe: jest.fn(() => true)
            } as any;
            mockEvents.unsubscribe = jest.fn((_) => true);
            mockNgZone.run = jest.fn((fn) => fn());
            // act
            coursesPage.ionViewWillLeave();
            // assert
            expect(coursesPage.headerObservable).toBeTruthy();
            expect(coursesPage.headerObservable.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
            expect(mockNgZone.run).toHaveBeenCalled();
        });

        it('should not unsubscribe eventservice and headerObservable for else part', () => {
            // arrange
            coursesPage.headerObservable = false;
            mockEvents.unsubscribe = jest.fn((_) => true);
            mockNgZone.run = jest.fn((fn) => fn('data'));
            // act
            coursesPage.ionViewWillLeave();
            // assert
            expect(coursesPage.headerObservable).toBeFalsy();
            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
            expect(mockNgZone.run).toHaveBeenCalled();
        });
    });

    it('should generate network type and generate telemetry', () => {
        // arrange
        const values = new Map();
        values['network-type'] = mockNetwork.type = '4g';
        mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
        // act
        coursesPage.generateNetworkType();
        // assert
        expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalledWith(values, PageId.LIBRARY);
    });

    describe('generateExtraInfoTelemetry', () => {
        it('should generate extra info telemetry and network is unavailable', () => {
            //arrange
            const sectionsCount = 1;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            const values = new Map();
            values['network-type'] = mockNetwork.type = '4g';
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            //act
            coursesPage.generateExtraInfoTelemetry(sectionsCount);
            //assert
            expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalledWith(values, PageId.COURSES);
        });
        it('should generate extra info telemetry and network is available', () => {
            //arrange
            const sectionsCount = 1;
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            const values = new Map();
            values['network-type'] = mockNetwork.type = '4g';
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            //act
            coursesPage.generateExtraInfoTelemetry(sectionsCount);
            //assert
            expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalledWith(values, PageId.COURSES);
        });
    });

    describe('getContentDetails', () => {
        it('should call contentService getContentDetails check if available locally or not', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{ id: 'do123', type: 'resource' }],
                rollup: { l1: 'do123' }
            }]);
            mockContentService.importContent = jest.fn(() => of([
                { identifier: 'do123', status: 1 }, { identifier: 'do1234', status: 0 }
            ]));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = { style: { display: 'flex' } };
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should check payload if import completed and download percentage is 100', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            coursesPage.resumeContentData = mockCourse;
            coursesPage.downloadPercentage = 100;
            mockRouter.navigate = jest.fn();
            mockNgZone.run = jest.fn((fn) => fn());
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{ id: 'do123', type: 'resource' }],
                rollup: { l1: 'do123' }
            }]);
            mockContentService.importContent = jest.fn(() => throwError('error'));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = { style: { display: 'flex' } };
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('navigate to details if data is available locally but pkgVersion is different', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 1
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 2
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should go to else part and call contentDetailsImportCall', (done) => {
            // arrange
            const mockCourse: Course = {
                identifier: 'do123',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: false,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            coursesPage.resumeContentData = mockCourse;
            coursesPage.downloadPercentage = 100;
            mockRouter.navigate = jest.fn();
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{ id: 'do123', type: 'resource' }],
                rollup: { l1: 'do123' }
            }]);
            mockContentService.importContent = jest.fn(() => of([
                { identifier: 'do123', status: 1 }, { identifier: 'do1234', status: 0 }
            ]));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = { style: { display: 'flex' } };

            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should go catch part if getContentDetails throw network error', (done) => {
            // arrange
            const mockCourse: Course = {
                identifier: 'do123',
                content: {
                    pkgVersion: 2
                }
            };
            const error = new CsNetworkError('no internet');
            mockContentService.getContentDetails = jest.fn(() => throwError(error));
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_INTERNET');
                done();
            }, 0);
        });

        it('should go to catch part and call showToast if throw other error', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            mockContentService.getContentDetails = jest.fn(() => throwError('error'));
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                done();
            }, 0);
        });
    });

    describe('subscribeUtilityEvents', () => {
        it('should applied filter for tab change and data trim as course', (done) => {
            // arrange
            const data = { trim: jest.fn(() => 'courses'), update: true, batchId: 'd0_0123', selectedLanguage: 'en' };
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            coursesPage.appliedFilter = true;
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                done();
            }, 0);
        });

        it('should not applied filter for tab change and data trim as course', (done) => {
            // arrange
            const data = { trim: jest.fn(() => 'courses') };
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            coursesPage.appliedFilter = false;
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                expect(coursesPage.appliedFilter).toBeFalsy();
                done();
            }, 0);
        });

        it('should not apply filter for tab change and data trim is not course', (done) => {
            // arrange
            const data = { trim: jest.fn(() => 'library') };
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                done();
            }, 0);
        });
    });

    describe('navigateToDetails()', () => {

        it('should generate telemetry object, check for layout name and filter applied and navigate to details page', (done) => {
            // arrange
            const mockContent = {
                contentId: 'do123',
                contentType: 'Course',
                pkgVersion: 1
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'InProgress',
                isFilterApplied: true, env: 'home', pageName: 'Course', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'Course', { id: 'do123', type: 'Course', version: undefined },
                    values, { l1: 'do123' }, undefined
                );
                done();
            });
        });

        it('should generate telemetry object,for collection and navigate to details page', (done) => {
            // arrange
            const mockContent = {
                identifier: 'do123',
                contentType: 'collection',
                mimeType: 'application/vnd.ekstep.content-collection'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'sampleLayout',
                isFilterApplied: true, env: 'home', pageName: 'Collection', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.isCollection = jest.fn();

            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'Collection', { id: 'do123', type: 'collection', version: '' },
                    values, { l1: 'do123' }, undefined
                );
                done();
            });
        });

        it('should generate telemetry object, check for contentType resource and goto content-details page', (done) => {
            // arrange
            const mockContent = {
                contentId: 'do123',
                contentType: 'Resource',
                mimeType: 'resource'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'completed',
                isFilterApplied: true, env: 'home', pageName: 'library', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'library', { id: 'do123', type: 'Resource', version: '' },
                    values, { l1: 'do123' }, undefined
                );
                done();
            });
        });

    });


    describe('navigateToBatchListPopup', () => {
        it('should show a message saying, the user is offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            const content = {
                identifier: 'sample_id'
            };
            const courseDetails = {
                guestUser: true
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is not logged in', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            const content = {
                identifier: 'sample_id'
            };
            const courseDetails = {
                guestUser: true
            };
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is logged in and batchlist is not empty', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            const content = {
                identifier: 'sample_id',
                contentId: 'sample_id'
            };
            const courseDetails = {
                guestUser: false,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            mockRouter.navigate = jest.fn();
            const courseBatchesRequest = {
                filters: {
                    courseId: courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
                    enrollmentType: CourseEnrollmentType.OPEN,
                    status: [CourseBatchStatus.IN_PROGRESS]
                },
                sort_by: {
                    createdDate: 'desc',
                },
                fields: BatchConstants.REQUIRED_FIELDS
            };
            const data = [{
                status: 1
            }, {
                status: 2
            }
            ];
            mockPopCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            coursesPage.loader = {
                dismiss: jest.fn()
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalledWith(courseBatchesRequest);
                expect(mockPopCtrl.create).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is logged in and batchlist is empty', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            const content = {
                identifier: 'sample_id',
                contentId: 'sample_id'
            };
            const courseDetails = {
                guestUser: false,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            mockRouter.navigate = jest.fn();
            const courseBatchesRequest = {
                filters: {
                    courseId: courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
                    enrollmentType: CourseEnrollmentType.OPEN,
                    status: [CourseBatchStatus.IN_PROGRESS]
                },
                sort_by: {
                    createdDate: 'desc',
                },
                fields: BatchConstants.REQUIRED_FIELDS
            };
            const data = [];
            mockPopCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            coursesPage.loader = {
                dismiss: jest.fn()
            };
            coursesPage.navigateToDetailPage = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalledWith(courseBatchesRequest);
                expect(coursesPage.navigateToDetailPage).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    describe('checkRetiredOpenBatch', () => {
        it('should skip the execution, if course already in progress', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            coursesPage.loader = mockCommonUtilService.getLoader;
            const enrolledCourses = [{
                batch: { status: 1 },
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToDetailPage = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should check the course status equal to 1, which is a non retired course', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            const enrolledCourses = [{
                batch: { status: 1 },
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: 'sample_name'
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToDetailPage = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(coursesPage.navigateToDetailPage).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should check the course status equal to 2, which is a retired course', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            coursesPage.loader = mockCommonUtilService.getLoader;
            const enrolledCourses = [{
                batch: { status: 2 },
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: 'sample_name'
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToBatchListPopup = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(coursesPage.navigateToBatchListPopup).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    describe('openEnrolledCourseDetails', () => {
        it('should prepare the request parameters to open the enrolled training', () => {
            // arrange
            const contentData = {
                data: { name: 'sample_name' }
            };
            coursesPage.checkRetiredOpenBatch = jest.fn();
            // act
            coursesPage.openEnrolledCourseDetails(contentData);
            // assert
            expect(coursesPage.checkRetiredOpenBatch).toHaveBeenCalled();
        });
    });

    describe('openCourseDetails', () => {
        it('should prepare the request parameters to open the un-enrolled training', () => {
            // arrange
            const contentData = {
                data: {
                    name: 'sample_name',
                    identifier: 'sample_id2'
                }
            };
            const index = 0;
            const sectionData = {
                name: 'sectionName'
            };
            coursesPage.popularAndLatestCourses = [{
                contents: [{
                    identifier: 'sample_id1'
                }, {
                    identifier: 'sample_id2'
                }, {
                    identifier: 'sample_id3'
                }]
            }];
            coursesPage.checkRetiredOpenBatch = jest.fn();
            // act
            coursesPage.openCourseDetails(contentData, sectionData, index);
            // assert
            expect(coursesPage.checkRetiredOpenBatch).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy()', () => {
        it('destroy should unsubscribe 12 events', () => {
            coursesPage['headerObservable'] = {
                unsubscribe: jest.fn(),
            } as any;
            jest.spyOn(coursesPage, 'unsubscribeUtilityEvents');
            // act
            coursesPage.ngOnDestroy();
            // assert
            expect(coursesPage.unsubscribeUtilityEvents).toBeCalled();
            expect(mockEvents.unsubscribe).toBeCalledWith('update_header');
        });
    });

    describe('getUserId', () => {
        it('should check if user is guest', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockAppGlobalService.setEnrolledCourseList = jest.fn(() => []);
            mockAppGlobalService.getGuestUserType = jest.fn(() => ProfileType.TEACHER);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            mockAppGlobalService.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = true;
            // act
            coursesPage.getUserId().catch(() => {
                expect(coursesPage.guestUser).toBeTruthy();
                done();
            });
        });

        it('should check if user is loggedIn user', (done) => {
            // arrange
            const sessionObj = {
                userToken: 'sample_token'
            };
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getSessionData = jest.fn(() => sessionObj);
            jest.spyOn(coursesPage, 'getAggregatorResult').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            setTimeout(() => {
                coursesPage.getUserId();
                expect(coursesPage.userId).toBe('sample_token');
                done();
            }, 0);
        });
    });

    describe('navigateToViewMoreContents page', () => {
        it('should present toast for offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({}))
                });
            }) as any;
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            coursesPage.navigateToViewMoreContentsPage(false);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('NO_INTERNET_TITLE');
                done();

            }, 0);
        });

        it('should translate message for courses in progress and generate telemetry and navigate to viewmore activity', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockCommonUtilService.translateMessage = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['SectionName'] = 'My courses';
            // act
            coursesPage.navigateToViewMoreContentsPage(true);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSES_IN_PROGRESS');
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.VIEWALL_CLICKED,
                Environment.HOME,
                PageId.COURSES, undefined, values
            );
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('cancel download', () => {

        it('should call contentService cancelDownload', (done) => {
            // arrange
            coursesPage.resumeContentData = {
                contentId: 'do123'
            };
            mockNgZone.run = jest.fn((fn) => fn());
            coursesPage.tabBarElement = { style: { display: 'flex' } };
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            // act
            coursesPage.cancelDownload();
            setTimeout(() => {
                expect(coursesPage.showOverlay).toBeFalsy();
                done();
            }, 0);
        });

        it('show go to catch part if cancel throw error', (done) => {
            // arrange
            coursesPage.resumeContentData = {
                identifier: 'do123'
            };
            mockNgZone.run = jest.fn((fn) => fn());
            coursesPage.tabBarElement = { style: { display: 'flex' } };
            mockContentService.cancelDownload = jest.fn(() => throwError('error'));
            // act
            coursesPage.cancelDownload();
            setTimeout(() => {
                expect(coursesPage.showOverlay).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('retryShowingPopularCourses test cases', () => {
        it('should check for isNetworkAvailable and showRefresh', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            jest.spyOn(coursesPage, 'getCourseTabData').mockImplementation();
            // act
            coursesPage.retryShowingPopularCourses(true);
            // assert
            expect(coursesPage.getCourseTabData).toHaveBeenCalled();
        });

        it('should check for isNetworkAvailable returns false and showRefresh also false', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            jest.spyOn(coursesPage, 'getCourseTabData').mockImplementation();
            // act
            coursesPage.retryShowingPopularCourses(false);
            // assert
            expect(coursesPage.getCourseTabData).not.toHaveBeenCalled();
        });
    });

    it('should call presentOffline toast message when showOfflineWarning called upon', (done) => {
        // arrange
        mockToastController.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            });
        }) as any;
        // act
        coursesPage.showOfflineWarning();
        setTimeout(() => {
            expect(mockToastController.create).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('resetFilter', () => {
        it('return reset values', () => {
            // arrange
            let data = [{
                selected: [1, 2]
            }];
            // act
            data = coursesPage.resetFilter(data);
            // assert
            expect(data[0].selected).toEqual([]);
        });
    });

    describe('navigateToTextbookPage', () => {
        it('should navigate to textbook page if network is available', () => {
            //arrange
            const items = { isAvailableLocally: true }, subject = 'English';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            //act
            coursesPage.navigateToTextbookPage(items, subject);
            //assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
            expect(mockRouter.navigate).toBeTruthy();
        });
        it('should navigate to textbook page if network  and items are unavailable', () => {
            //arrange
            const items = 'item', subject = 'English';
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve())
            //act
            coursesPage.navigateToTextbookPage(items, subject);
            //assert
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalledWith('OFFLINE_WARNING_ETBUI');
        });
    });

    it('exploreOtherContents', (done) => {
        //arrange
        const mockCurrentProfile = {
            profileType: 'some_type'
        } as any;
        mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);
        mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{ name: 'sunbird' }])) as any;
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        //act
        coursesPage.exploreOtherContents();
        //assert
        setTimeout(() => {
            done();
        }, 0);
    });

    it('isGroupedCoursesAvailable', () => {
        //arrange
        const displayItems = [
            {
                data: {
                    sections: [
                        { contents: 'content1' }, { contents: 'content2' }
                    ]
                }
            }
        ]
        //act
        coursesPage.isGroupedCoursesAvailable(displayItems);
        //assert
        expect(coursesPage.isGroupedCoursesAvailable).toBeTruthy();
    });
});

