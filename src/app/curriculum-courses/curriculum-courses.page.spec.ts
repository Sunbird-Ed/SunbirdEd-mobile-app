import { CurriculumCoursesPage } from './curriculum-courses.page';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    Environment,
    ImpressionType, InteractSubtype, InteractType,
    PageId,
    TelemetryGeneratorService
} from '@app/services';
import { CourseService, Course } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { ProfileConstants } from '../app.constant';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import {ContentUtil} from '@app/util/content-util';

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
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        curriculumCoursesPage = new CurriculumCoursesPage(
            mockCourseService as CourseService,
            mockAppHeaderService as AppHeaderService,
            mockAppGlobalService as AppGlobalService,
            mockTranslate as TranslateService,
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

    it('should handle header back button', () => {
        // arrange
        mockAppHeaderService.showHeaderWithBackButton = jest.fn();
        const data = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        jest.spyOn(curriculumCoursesPage, 'handleHeaderEvents').mockImplementation();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        curriculumCoursesPage.ionViewWillEnter();
        // assert
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(curriculumCoursesPage.handleHeaderEvents).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.COURSE_LIST,
            Environment.HOME,
            false
        );
        expect(subscribeWithPriorityData).toBeTruthy();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            PageId.COURSE_LIST,
            Environment.HOME
        );

    });

    it('should navigate to curriculumCourse', () => {
        // arrange
        const course = { name: 'sample-course' };
        const data = {
            id: 'do_21303499457124761611658',
            type: 'course',
            version: 1
        };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockCommonUtilService.deDupe = jest.fn(() => [{ id: 'Evs', type: 'Subject' }]);
        jest.spyOn(ContentUtil, 'getTelemetryObject').mockImplementation(() => {
            return data;
        });
        const rollUp = {
            l1: 'do_21303499457124761611658'
        };
        jest.spyOn(ContentUtil, 'generateRollUp').mockImplementation(() => {
            return rollUp;
        });
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        curriculumCoursesPage.openCourseDetails(course);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            Environment.HOME,
            PageId.COURSE_LIST,
            data,
            undefined,
            rollUp,
            [{ id: 'Evs', type: 'Subject' }]
        );
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
        });

        it('should call getEnrolledCourses() if user is logged in', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getSessionData = jest.fn(() => ({
                userToken: 'user_token'
            }));
            mockCommonUtilService.getContentImg = jest.fn(() => 'some_img_url');
            curriculumCoursesPage.courseList = [
                {
                    identifier: 'do_some_identifier'
                }
            ] as any;
            const enrolledCourses: Course[] = [
                {
                    courseId: 'do_0123'
                },
                {
                    courseId: 'do_some_identifier'
                }
            ];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(enrolledCourses));
            console.log('enrolledCourses:true ', curriculumCoursesPage.enrolledCourses);

            // act
            curriculumCoursesPage.ngOnInit();

            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toBeTruthy();
                expect(mockAppGlobalService.getSessionData).toHaveBeenCalled();
                expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                    returnFreshCourses: true, userId: 'user_token'
                });
                done();
            });
        });

        it('should call not call getEnrolledCourses() if user is guest user', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockCommonUtilService.getContentImg = jest.fn(() => 'some_img_url');
            curriculumCoursesPage.courseList = [
                {
                    identifier: 'do_some_identifier'
                }
            ] as any;

            console.log('enrolledCourses:false ', curriculumCoursesPage.enrolledCourses);

            // act
            curriculumCoursesPage.ngOnInit();

            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
