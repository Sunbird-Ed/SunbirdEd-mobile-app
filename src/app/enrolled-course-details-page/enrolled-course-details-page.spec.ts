import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';
import {
    ProfileService, ContentService, EventsBusService, CourseService, SharedPreferences,
    AuthService, CorrelationData, TelemetryObject, FetchEnrolledCourseRequest, Content, ContentFeedback
} from 'sunbird-sdk';
import {
    LoginHandlerService, CourseUtilService, AppGlobalService, TelemetryGeneratorService,
    CommonUtilService, UtilityService, AppHeaderService, ContentShareHandlerService, LocalCourseService
} from '../../services';
import { NgZone } from '@angular/core';
import { Events, PopoverController, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { Location } from '@angular/common';
import { mockEnrolledData, contentDetailsResponse } from './enrolled-course-details-page.data.spec';
import { of, Subject } from 'rxjs';
import { ContentInfo } from '../../services/content/content-info';
import { async } from 'rxjs/internal/scheduler/async';

describe('EnrolledCourseDetailsPage', () => {
    let enrolledCourseDetailsPage: EnrolledCourseDetailsPage;
    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getUserId: jest.fn(() => 'SAMPLE_USER'),
        isUserLoggedIn: jest.fn(() => false),
        getGuestUserInfo: jest.fn(() => Promise.resolve('SAMPLE_GUEST_USER'))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockDatePipe: Partial<DatePipe> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {};
    const mockLocation: Partial<Location> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockEnrolledData)
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockAppVersion: Partial<AppVersion> = {};

    beforeAll(() => {
        enrolledCourseDetailsPage = new EnrolledCourseDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventsBusService as EventsBusService,
            mockCourseService as CourseService,
            mockPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockLoginHandlerService as LoginHandlerService,
            mockZone as NgZone,
            mockEvents as Events,
            mockFileSizePipe as FileSizePipe,
            mockPopoverCtrl as PopoverController,
            mockCourseUtilService as CourseUtilService,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockDatePipe as DatePipe,
            mockUtilityService as UtilityService,
            mockHeaderService as AppHeaderService,
            mockContentShareHandler as ContentShareHandlerService,
            mockLocation as Location,
            mockRouter as Router,
            mockTranslate as TranslateService,
            mockPopOverCtrl as PopoverController,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockLocalCourseService as LocalCourseService,
            mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of enrolledCourseDetailsPage', () => {
        expect(enrolledCourseDetailsPage).toBeTruthy();
    });

    it('should get App name and subscribe utility service by invoked ngOnInit()', () => {
        // arrange
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('DIKSHA'));
        spyOn(enrolledCourseDetailsPage, 'subscribeUtilityEvents').and.returnValue('BASE_URL');
        // act
        enrolledCourseDetailsPage.ngOnInit();
        // assert
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        expect(enrolledCourseDetailsPage.subscribeUtilityEvents).toHaveBeenCalled();
    });

    it('should show delete popup by invoked showDeletePopup()', () => {
        // arrange
        const contentDelete = new Subject<any>();
        mockContentDeleteHandler.contentDeleteCompleted$ = contentDelete.asObservable();
        mockContentDeleteHandler.showContentDeletePopup = jest.fn();
        const telemetry: TelemetryObject = {
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE',
            version: 'SAMPLE_VERSION',
            setRollup: jest.fn()
        };
        const data: CorrelationData[] = [{
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE'
        }];
        const contentInfo: ContentInfo = {
            telemetryObject: telemetry,
            rollUp: {},
            correlationList: data,
            hierachyInfo: undefined
        };
        // act
        enrolledCourseDetailsPage.showDeletePopup();
        // assert
        expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
    });

    it('#subscribeUtilityEvents should handle error condition', (done) => {
        // arrange
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.reject(true));
        mockEvents.subscribe = jest.fn(() => ({ batchId: 'SAMPLE_BATCH_ID', courseId: 'SAMPLE_COURSE_ID' }));
        spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseList').and.stub();
        spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
        // assert
        enrolledCourseDetailsPage.subscribeUtilityEvents();
        // act
        setTimeout(() => {
            expect(enrolledCourseDetailsPage.baseUrl).toBe('');
            expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should update courseCard data and return base url by invoked subscribeUtilityEvents()', (done) => {
        // arrange
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('SAMPLE_BASE_URL'));
        mockEvents.subscribe = jest.fn((_, fn) => fn({ batchId: 'SAMPLE_BATCH_ID', courseId: 'SAMPLE_COURSE_ID' }));
        spyOn(enrolledCourseDetailsPage, 'updateEnrolledCourseList').and.stub();
        enrolledCourseDetailsPage.course = { createdBy: 'SAMPLE_CREATOR' };
        enrolledCourseDetailsPage.stickyPillsRef = {
            nativeElement: {
                classList: { remove: jest.fn(), add: jest.fn() }
            }
        };
        mockCommonUtilService.getLoader = jest.fn();
        mockCommonUtilService.translateMessage = jest.fn(() => ('YOU_MUST_JOIN_AN_ACTIVE_BATCH'));
        spyOn(enrolledCourseDetailsPage, 'getAllBatches').and.stub();
        mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 'SAMPLE_IDETIFIER' }]));
        spyOn(enrolledCourseDetailsPage, 'getBatchDetails').and.stub();
        spyOn(enrolledCourseDetailsPage, 'joinTraining').and.stub();
        // act
        enrolledCourseDetailsPage.subscribeUtilityEvents();
        // assert
        setTimeout(() => {
            expect(enrolledCourseDetailsPage.baseUrl).toBe('SAMPLE_BASE_URL');
            expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.course.createdBy).not.toEqual('SAMPLE_USER');
            expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.updateEnrolledCourseList).toBeCalled();
            expect(enrolledCourseDetailsPage.getAllBatches).toBeCalled();
            expect(enrolledCourseDetailsPage.getBatchDetails).toHaveBeenCalled();
            expect(enrolledCourseDetailsPage.joinTraining).toBeCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should update enroll details list by invoked updateEnrolledCourseList()', () => {
        // arrange
        const userDetails = mockAppGlobalService.getUserId = jest.fn(() => 'SAMPLE_USER_ID');
        const fetchEnrolledCourseRequest: FetchEnrolledCourseRequest = {
            userId: 'SAMPLE_USER_ID'
        };
        mockCourseService.getEnrolledCourses = jest.fn(() => of([{}]));
        mockZone.run = jest.fn((fn) => fn());
        // act
        enrolledCourseDetailsPage.updateEnrolledCourseList(mockEnrolledData.extras.state.content);
        // assert
        expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
        expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
    });

    it('should return last played content and license', () => {
        // assert
        const response = contentDetailsResponse;
        spyOn(enrolledCourseDetailsPage, 'generateImpressionEvent');
        spyOn(enrolledCourseDetailsPage, 'generateStartEvent');
        spyOn(enrolledCourseDetailsPage, 'setCourseStructure');
        spyOn(enrolledCourseDetailsPage, 'setChildContents');
        enrolledCourseDetailsPage.courseCardData = {lastReadContentId: 'SAMPLE_LAST_READ_CONTENT'};
        mockHeaderService.showHeaderWithBackButton = jest.fn(() => {});
        mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
        mockLocation.back = jest.fn();
        // act
        enrolledCourseDetailsPage.extractApiResponse(response);
        // assert
        expect(enrolledCourseDetailsPage.generateImpressionEvent).toBeCalled();
        expect(enrolledCourseDetailsPage.generateStartEvent).toBeCalled();
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(response.contentData.status).not.toBe('Live');
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(response.contentData.me_totalRatings).toBe('4');
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return import content if data is not available for extractApiResponse', () => {
        // assert
        const response = mockEnrolledData.extras.state.content;
        mockHeaderService.showHeaderWithBackButton = jest.fn(() => {});
        mockCommonUtilService.showToast = jest.fn(() => 'COURSE_NOT_AVAILABLE');
        mockLocation.back = jest.fn();
        mockTelemetryGeneratorService.generateSpineLoadingTelemetry = jest.fn();
        enrolledCourseDetailsPage.didViewLoad = true;
        mockHeaderService.hideHeader = jest.fn();
        spyOn(enrolledCourseDetailsPage, 'importContent').and.stub();
        spyOn(enrolledCourseDetailsPage, 'setCourseStructure').and.stub();
        // act
        enrolledCourseDetailsPage.extractApiResponse(response);
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockLocation.back).toHaveBeenCalled();
        expect(enrolledCourseDetailsPage.didViewLoad).toBeTruthy();
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
    });

    it('should checked current user type for cath part by invoked checkCurrentUserType()', () => {
        // arrange
        mockAppGlobalService.getGuestUserInfo = jest.fn(() => Promise.reject('SAMPLE_USER'));
        // act
        enrolledCourseDetailsPage.checkCurrentUserType();
        // assert
        expect(mockAppGlobalService.getGuestUserInfo).toHaveBeenCalled();
    });

    it('should be joined training for logged in user', async (done) => {
        // arrange
        mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => {}),
            onDidDismiss: jest.fn(() => Promise.resolve({}))
        } as any)));
        mockCommonUtilService.translateMessage = jest.fn(() => '');
        spyOn(enrolledCourseDetailsPage, 'navigateToBatchListPage').and.stub();
        
        // .present = jest.fn(() => Promise.resolve());
        // act
        enrolledCourseDetailsPage.joinTraining();
        // assert
        setTimeout(() => {
         expect(mockPopoverCtrl.create).toHaveBeenCalled();
         expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
         done();
        }, 0);
    });

    it('', () => {
        // arrange
        // act
        // assert
    });

});
