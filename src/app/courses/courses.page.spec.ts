import { CoursesPage } from './courses.page';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { NgZone } from '@angular/core';
import { SunbirdQRScanner } from '../../services/sunbirdqrscanner.service';
import { PopoverController, Events, ToastController } from '@ionic/angular';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CourseUtilService } from '../../services/course-util.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Network } from '@ionic-native/network/ngx';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '../../services/telemetry-constants';
import {
    ContentService, Course, PageAssembleCriteria,
    CourseService, EventsBusService,
    PageAssembleService, SharedPreferences, FrameWorkService
} from 'sunbird-sdk';
import { of, throwError } from 'rxjs';
import { PageName } from '../app.constant';

describe('CoursesPage', () => {
    let coursesPage: CoursesPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {

    };
    const mockFrameworkService: Partial<FrameWorkService> = {

    };
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockEventBusService: Partial<EventsBusService> = {
        // events: jest.fn(() => of({
        //     subscribe: jest.fn(() => ({closed: true}))
        // }))
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockNetwork: Partial<Network> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
    const mockPageService: Partial<PageAssembleService> = {};
    const mockPopCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('{"body": {"identifier": "do_123"}}'))
    };
    const mockQrScanner: Partial<SunbirdQRScanner> = {};
    const mockRouter: Partial<Router> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockToastController: Partial<ToastController> = {};

    beforeAll(() => {
        coursesPage = new CoursesPage(
            mockEventBusService as EventsBusService,
            mockPageService as PageAssembleService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockContentService as ContentService,
            mockFrameworkService as FrameWorkService,
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
            mockHeaderService as AppHeaderService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of coursePage', () => {
        expect(coursesPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should return enrolledCourse data and course tab data by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const course: Course[] = [{
                identifier: 'do_0123'
            }];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(course));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({ returnFreshCourses: false, userId: undefined });
                done();
            }, 0);
        });

        it('should not return enrolledCourse data if data is available by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockCourseService.getEnrolledCourses = jest.fn(() => of(undefined));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({ returnFreshCourses: false, userId: undefined });
                done();
            }, 0);
        });

        it('should return enrolledCourse data if enrolledCourses length is zero by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            const course: Course[] = [];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(course));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({ returnFreshCourses: false, userId: undefined });
                done();
            }, 0);
        });

        it('should return error enrolledCourse data by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = { isOnBoardingCardCompleted: true, contentId: 'do_123' };
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const course: Course[] = [{
                identifier: 'do_0123'
            }];
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError(course));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({ returnFreshCourses: false, userId: undefined });
                done();
            }, 0);
        });
    });

    it('should handle header service by invoked ionViewWillEnter', () => {
        // arrange
        mockEvents.subscribe = jest.fn((_, fn) => fn());
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        jest.spyOn(coursesPage, 'handleHeaderEvents').mockReturnValue();
        // act
        coursesPage.ionViewWillEnter();
        // assert
        expect(mockEvents.subscribe).toHaveBeenCalled();
        expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
        expect(data).toHaveBeenCalled();
    });

    describe('ionViewDidEnter', () => {
        it('should start qrScanner if pageId is course', () => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = { pageName: 'courses' };
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockQrScanner.startScanner = jest.fn(() => Promise.resolve('start'));
            // act
            coursesPage.ionViewDidEnter();
            // assert
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalledWith(PageId.COURSES, isOnboardingComplete);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockQrScanner.startScanner).toHaveBeenCalledWith(PageId.COURSES, false);
        });

        it('should not start qrScanner if pageId is not course', () => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = { pageName: 'library' };
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            // act
            coursesPage.ionViewDidEnter();
            // assert
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalledWith(PageId.COURSES, isOnboardingComplete);
            expect(mockEvents.subscribe).toHaveBeenCalled();
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe eventservice and headerObservable by invoked ionViewWillLeave', () => {
            // arrange
            coursesPage.headerObservable = true;
            coursesPage.headerObservable = {
                unsubscribe: jest.fn(() => true)
            };
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
        mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
        const values = new Map();
        values['network-type'] = mockNetwork.type = '4g';
        // act
        coursesPage.generateNetworkType();
        // assert
        expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalledWith(values, PageId.LIBRARY);
    });

    describe('getPopularAndLatestCourses', () => {
        it('should return pageAssemble data when PageAssembleCriteria is undefined', (done) => {
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = '';
            mockPageService.getPageAssemble = jest.fn(() => throwError('NOT_FOUND'));
            coursesPage.selectedLanguage = 'en';
            // act
            coursesPage.getPopularAndLatestCourses(false);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return pageAssemble data when PageAssembleCriteria is undefined', (done) => {
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = { board: 'cbsc', medium: 'english' };
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{ display: '{"name": {"en": "example"}}' }]
            }));
            coursesPage.selectedLanguage = 'en';
            const values = new Map();
            values['pageSectionCount'] = 1;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            // act
            coursesPage.getPopularAndLatestCourses(false);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: ['cbsc', 'assam'],
                medium: ['english', 'hindi'],
                grade: ['class 1', 'class 2'],
                subject: ['math', 'phy']
            };
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = { board: 'cbsc', medium: 'english' };
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{ display: '{"name": {"en": "example"}}' }]
            }));
            coursesPage.selectedLanguage = 'hindi';
            const values = new Map();
            values['pageSectionCount'] = 1;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockAppGlobalService.getNameForCodeInFramework = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                expect(mockAppGlobalService.getNameForCodeInFramework).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data if board medium and grade are undefined', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{ display: '{}' }]
            }));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockAppGlobalService.getNameForCodeInFramework = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data for pageService error part of connection-error', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => throwError('CONNECTION_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                done();
            }, 0);
        });

        it('should applied filter for latest course data for pageService error part of SERVER_ERROR', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => throwError('SERVER_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                done();
            }, 0);
        });


        it('should applied filter for latest course data for pageService error part of SERVER_AUTH_ERROR', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = { filters: {}, mode: 'soft', name: 'Course', source: 'app' };
            coursesPage.appliedFilter = '';
            mockPageService.getPageAssemble = jest.fn(() => throwError('SERVER_AUTH_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
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
            jest.spyOn(coursesPage, 'getEnrolledCourses').mockReturnValue();
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            coursesPage.appliedFilter = true;
            jest.spyOn(coursesPage, 'getPopularAndLatestCourses').mockImplementation(() => { });
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
            jest.spyOn(coursesPage, 'getPopularAndLatestCourses').mockReturnValue();
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

        it('should not applied filter for tab change and data trim is not course', (done) => {
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
});
