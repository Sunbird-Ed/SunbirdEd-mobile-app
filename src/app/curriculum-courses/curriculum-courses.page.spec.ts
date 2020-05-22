import {CurriculumCoursesPage} from './curriculum-courses.page';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { of } from 'rxjs';
import { resolve } from 'dns';

describe('CurriculumCoursesPage', () => {
    let curriculumCoursesPage: CurriculumCoursesPage;
    const mockAppHeaderService: Partial<AppHeaderService> = {};
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
            mockAppHeaderService as AppHeaderService,
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

    it('should return content image', () => {
        const content = {
            courseLogoUrl: 'sample-logo-url',
            appIcon: 'sample-app-icon'
        };
        mockCommonUtilService.getContentImg = jest.fn(() => 'sample-image-code');
        curriculumCoursesPage.getContentImg(content);
        // assert
        expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
    });

    it('should navigate to curriculumCourse', () => {
        const course = {name: 'sample-course'};
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        curriculumCoursesPage.openCourseDetails(course);
        // assert
        expect(mockRouter.navigate).toHaveBeenCalled();
    });
});
