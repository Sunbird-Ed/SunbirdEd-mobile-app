import { CurriculumCoursesPage } from './curriculum-courses.page';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService, AppHeaderService, CommonUtilService,
         TelemetryGeneratorService, PageId, Environment, ImpressionType,
         InteractSubtype, InteractType } from '../../services';
import { CourseService, Course, CourseBatchStatus, TelemetryObject } from '@project-sunbird/sunbird-sdk';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { NavigationService } from '../../services/navigation-handler.service';

describe('CurriculumCoursesPage', () => {
    let curriculumCoursesPage: CurriculumCoursesPage;
    const mockCourseService: Partial<CourseService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    subjectName: 'sample-subject',
                    subjectIcon: 'sample-icon',
                    curriculumCourseList: ['course-1', 'course-2'],
                    theme: 'sample-theme',
                    titleColor: 'sample-titleColor'
                }
            }
        })) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn()
    };
    window.console = {
        error: jest.fn()
    } as any

    beforeAll(() => {
        curriculumCoursesPage = new CurriculumCoursesPage(
            mockCourseService as CourseService,
            mockAppHeaderService as AppHeaderService,
            mockAppGlobalService as AppGlobalService,
            mockNavService as NavigationService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of chapterDetailsPage', () => {
        expect(curriculumCoursesPage).toBeTruthy();
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            const mockConfig = {
                subscribe: jest.fn(() => { })
            };
            mockAppHeaderService.headerEventEmitted$ = of(mockConfig);
            jest.spyOn(curriculumCoursesPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({}));
            mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData,
                } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockCommonUtilService.getContentImg = jest.fn(() => 'some_img_url');
            curriculumCoursesPage.courseList = [
                {
                    identifier: 'do_some_identifier'
                }
            ] as any;
        });

        it('should handle header back button', () => {
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            // act
            curriculumCoursesPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.COURSE_LIST,
                    Environment.HOME, false
                );
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.COURSE_LIST,
                    Environment.HOME
                );
            }, 0);
        });

        it('should handle getEnrolledCourses() failure', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            curriculumCoursesPage.appliedFilter = {};
            mockCourseService.getUserEnrolledCourses = jest.fn(() => throwError(''));
            // act
            curriculumCoursesPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.COURSE_LIST,
                    Environment.HOME, false
                );
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.COURSE_LIST,
                    Environment.HOME
                );
                expect(mockAppGlobalService.isUserLoggedIn).toBeTruthy();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockCourseService.getUserEnrolledCourses).toHaveBeenCalled();
                expect(curriculumCoursesPage.enrolledCourses).toEqual([]);
                done();
            });
        });

        it('should call getEnrolledCourses() if user is logged in', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
            curriculumCoursesPage.appliedFilter = {};
            const enrolledCourses: Course[] = [
                {
                    courseId: 'do_0123'
                },
                {
                    courseId: 'do_some_identifier'
                }
            ];
            mockCourseService.getUserEnrolledCourses = jest.fn(() => of(enrolledCourses));
            // act
            curriculumCoursesPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                expect(mockAppHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.COURSE_LIST,
                    Environment.HOME, false
                );
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.COURSE_LIST,
                    Environment.HOME
                );
                expect(mockAppGlobalService.isUserLoggedIn).toBeTruthy();
                expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
                expect(mockCourseService.getUserEnrolledCourses).toHaveBeenCalled();
                expect(curriculumCoursesPage.enrolledCourses).toEqual(enrolledCourses);
                done();
            });
        });
    });

    it('should navigate to curriculumCourse', () => {
        // arrange
        const course = { name: 'sample-course' };
        curriculumCoursesPage.corRelationList = [{
            id: 'do_123',
            type: 'course'
        }as any];
        mockCommonUtilService.deDupe = jest.fn(() => curriculumCoursesPage.corRelationList);
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        const telemetryObject = new TelemetryObject(undefined, undefined, '');
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        // act
        curriculumCoursesPage.openCourseDetails(course);
        // assert
        expect(mockCommonUtilService.deDupe).toHaveBeenCalledWith(curriculumCoursesPage.corRelationList, 'type');
        // expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.COURSE_LIST,
            telemetryObject,
            undefined,
            {l1: undefined},
            curriculumCoursesPage.corRelationList,
        );
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe the subscriptions', () => {
            curriculumCoursesPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            curriculumCoursesPage.headerObservable = {
                unsubscribe: jest.fn()
            } as any;
            // mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            curriculumCoursesPage.ionViewWillLeave();
            expect(curriculumCoursesPage.backButtonFunc).toBeTruthy();
            expect(curriculumCoursesPage.backButtonFunc.unsubscribe).toBeTruthy();
            expect(curriculumCoursesPage.headerObservable.unsubscribe).toHaveBeenCalled();
        });
    });
});
