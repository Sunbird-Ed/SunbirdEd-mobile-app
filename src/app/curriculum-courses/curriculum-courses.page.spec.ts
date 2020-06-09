import { CurriculumCoursesPage } from './curriculum-courses.page';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppGlobalService, AppHeaderService, CommonUtilService } from '@app/services';
import { CourseService, Course } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { ProfileConstants } from '../app.constant';

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

    beforeAll(() => {
        curriculumCoursesPage = new CurriculumCoursesPage(
            mockCourseService as CourseService,
            mockAppHeaderService as AppHeaderService,
            mockAppGlobalService as AppGlobalService,
            mockTranslate as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of chapterDetailsPage', () => {
        expect(curriculumCoursesPage).toBeTruthy();
    });

    it('should handle header back button', () => {
        mockAppHeaderService.showHeaderWithBackButton = jest.fn();
        curriculumCoursesPage.ionViewWillEnter();
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
    });

    it('should navigate to curriculumCourse', () => {
        const course = { name: 'sample-course' };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        curriculumCoursesPage.openCourseDetails(course);
        // assert
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
