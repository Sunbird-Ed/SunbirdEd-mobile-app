import { ChapterDetailsPage } from './chapter-details.page';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService, LocalCourseService } from '@app/services';
import { Router } from '@angular/router';
import {
    SharedPreferences, AuthService, CourseService, DownloadService,
    EventsBusService, ContentService
        } from '@project-sunbird/sunbird-sdk';
import { PopoverController, Events } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { FileService } from '@project-sunbird/sunbird-sdk/util/file/def/file-service';

describe('ChapterDetailsPage', () => {
    let chapterDetailsPage: ChapterDetailsPage;
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: { courseName: 'sample-course',
                chapterData: 'sample-chapter',
                courseContent: {name: 'course-content', identifier: 'do-123'},
                contentData: {name: 'sample-content-data', identifier: 'do-12345'}
            }
            }
        })) as any
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockDatePipe: Partial<DatePipe> = {};
    const mockDownloadService: Partial<DownloadService> = {};
    const mockEvents: Partial<Events> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockFileSizePipe: Partial<FileService> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockZone: Partial<NgZone> = {};

    beforeAll(() => {
        chapterDetailsPage = new ChapterDetailsPage(
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockCourseService as CourseService,
            mockDownloadService as DownloadService,
            mockEventsBusService as EventsBusService,
            mockContentService as ContentService,
            mockAppHeaderService as AppHeaderService,
            mockTranslate as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockLoginHandlerService as LoginHandlerService,
            mockAppGlobalService as AppGlobalService,
            mockPopoverCtrl as PopoverController,
            mockLocalCourseService as LocalCourseService,
            mockEvents as Events,
            mockZone as NgZone,
            mockDatePipe as DatePipe,
            mockFileSizePipe as FileSizePipe
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
