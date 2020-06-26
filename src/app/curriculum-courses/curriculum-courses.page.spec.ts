import { CurriculumCoursesPage } from './curriculum-courses.page';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService, AppHeaderService, CommonUtilService,
         TelemetryGeneratorService, PageId, Environment, ImpressionType,
         InteractSubtype, InteractType } from '@app/services';
import { CourseService, Course, CourseBatchStatus, TelemetryObject } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';

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
        // act
        curriculumCoursesPage.ionViewWillEnter();
        // assert
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
        const telemetryObject = new TelemetryObject(undefined, undefined, undefined);
        // act
        curriculumCoursesPage.openCourseDetails(course);
        // assert
        expect(mockCommonUtilService.deDupe).toHaveBeenCalledWith(curriculumCoursesPage.corRelationList, 'type');
        expect(mockRouter.navigate).toHaveBeenCalled();
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
            curriculumCoursesPage.appliedFilter = {};
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
            mockCourseService.getUserEnrolledCourses = jest.fn(() => of(enrolledCourses));

            // act
            curriculumCoursesPage.ngOnInit();

            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toBeTruthy();
                expect(mockAppGlobalService.getSessionData).toHaveBeenCalled();
                expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
                expect(mockCourseService.getUserEnrolledCourses).toHaveBeenCalledWith({
                    request: {
                        userId: 'user_token',
                        filters: {
                            subject: ['sample-subject']
                        }
                      }
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
