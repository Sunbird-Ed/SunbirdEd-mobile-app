import {ChapterDetailsPage} from './chapter-details.page';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Router } from '@angular/router';

describe('ChapterDetailsPage', () => {
    let chapterDetailsPage: ChapterDetailsPage;
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {courseName: 'sample-course', chapterData: 'sample-chapter'}
            }
        })) as any
    };
    const mockTranslate: Partial<TranslateService> = {};

    beforeAll(() => {
        chapterDetailsPage = new ChapterDetailsPage(
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
        expect(chapterDetailsPage).toBeTruthy();
    });

    it('should handle header back button', () => {
        mockAppHeaderService.showHeaderWithBackButton = jest.fn();
        chapterDetailsPage.ionViewWillEnter();
        expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
    });
});
