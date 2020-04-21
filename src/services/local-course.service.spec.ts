import { LocalCourseService } from './local-course.service';
import { ContentService, SharedPreferences, CourseService, AuthService, Batch, NetworkError, HttpClientError } from 'sunbird-sdk';
import { CommonUtilService } from './common-util.service';
import { Events } from '@ionic/angular';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { NgZone } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { of, throwError } from 'rxjs';
import { PreferenceKey } from '../app/app.constant';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


describe('LocalCourseService', () => {
  let localCourseService: LocalCourseService;

  const mockCourseService: Partial<CourseService> = {};
  const mockAuthService: Partial<AuthService> = {};
  const mockPreferences: Partial<ContentService> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockEvents: Partial<Events> = {};
  const mockNgZone: Partial<NgZone> = {};
  const mockAppVersion: Partial<AppVersion> = {};
  const mockRouter: Partial<Router> = {
    url: 'localhost:8080/enrolled-course-details'
  };
  const mockLocation: Partial<Location> = {
    back: jest.fn()
  };

  beforeAll(() => {
    localCourseService = new LocalCourseService(
      mockCourseService as CourseService,
      mockAuthService as AuthService,
      mockPreferences as SharedPreferences,
      mockAppGlobalService as AppGlobalService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockCommonUtilService as CommonUtilService,
      mockEvents as Events,
      mockNgZone as NgZone,
      mockAppVersion as AppVersion,
      mockRouter as Router,
      mockLocation as Location
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of LocalCourseService', () => {
    expect(localCourseService).toBeTruthy();
  });

  describe('checkCourseRedirect', () => {
    const authSession = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      userToken: 'userId'
    };
    const courseAndBatchData: Batch = `{
      "identifier":"string",
      "id":"string",
      "createdFor":["string","string"],
      "courseAdditionalInfo":"any",
      "endDate":"string",
      "description":"string",
      "participant":"any",
      "updatedDate":"string",
      "createdDate":"string",
      "mentors":["string","string"],
      "name":"string",
      "enrollmentType":"string",
      "courseId":"string",
      "startDate":"string",
      "hashTagId":"string",
      "status":200,
      "courseCreator":"string",
      "createdBy":"other_userId"
  }`;
    mockEvents.publish = jest.fn(() => []);
    mockPreferences.putString = jest.fn(() => of(undefined));

    it('should restrict the enrolling flow, if the user is not logged in.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = false;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isJoinTraningOnboardingFlow).toEqual(true);
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if batchId and course details are not saved in the preference.', (done) => {
      // arrange
      authSession['userToken'] = 'other_userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if session details is empty.', (done) => {
      // arrange
      authSession['userToken'] = 'other_userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(undefined));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if created id and the userId are same.', (done) => {
      // arrange
      authSession['userToken'] = 'other_userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockEvents.publish).toHaveBeenCalledWith(expect.any(String));
        expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.BATCH_DETAIL_KEY, expect.any(String));
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference.', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(of(undefined));
      mockNgZone.run = jest.fn((fn) => fn());
      mockCommonUtilService.translateMessage = jest.fn(() => 'some_string');
      mockCommonUtilService.showToast = jest.fn();
      mockAppVersion.getAppName = jest.fn(() => Promise.resolve('some_string'));
      mockCourseService.getEnrolledCourses = jest.fn(() => of([{ courseId: 1 }, { courseId: 2 }]));
      mockAppGlobalService.setEnrolledCourseList = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference, but enrolledCourse is null.', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(of(undefined));
      mockNgZone.run = jest.fn((fn) => fn()); 
      mockCommonUtilService.translateMessage = jest.fn(() => 'some_string');
      mockCommonUtilService.showToast = jest.fn();
      mockAppVersion.getAppName = jest.fn(() => Promise.resolve('some_string'));
      mockCourseService.getEnrolledCourses = jest.fn(() => of(undefined));
      mockAppGlobalService.setEnrolledCourseList = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference, but enrolledCourse is [].', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(of(undefined));
      mockNgZone.run = jest.fn((fn) => fn());
      mockCommonUtilService.translateMessage = jest.fn(() => 'some_string');
      mockCommonUtilService.showToast = jest.fn();
      mockAppVersion.getAppName = jest.fn(() => Promise.resolve('some_string'));
      mockCourseService.getEnrolledCourses = jest.fn(() => of([]));
      mockAppGlobalService.setEnrolledCourseList = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        done();
      }, 0);
    });

    it('should handle Network error when getEnrolled Courses is called.', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn(() => 'some_string');
      mockCommonUtilService.showToast = jest.fn();
      mockAppVersion.getAppName = jest.fn(() => Promise.resolve('some_string'));
      mockCourseService.getEnrolledCourses = jest.fn(() => of([]));
      mockAppGlobalService.setEnrolledCourseList = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      const networkError = new NetworkError('sample_error');
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(networkError));
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();

        done();
      }, 0);
    });

    it('should handle HttpClient error when course is already enrolled.', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      const httpClientError = new HttpClientError('http_clicnt_error', { body: { params: { status: 'USER_ALREADY_ENROLLED_COURSE' } } });
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(httpClientError));
      mockNgZone.run = jest.fn((cb) => {
        cb();
      }) as any;
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockEvents.publish).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();

        done();
      }, 0);
    });

    it('should handle HttpClient error when course is already enrolled.', (done) => {
      // arrange
      authSession['userToken'] = 'userId';
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAuthService.getSession = jest.fn(() => of(authSession));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      })) as any;
      mockCommonUtilService.showToast = jest.fn();
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      const httpClientError = new HttpClientError('http_clicnt_error', { body: {} });
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(httpClientError));
      mockNgZone.run = jest.fn((cb) => {
        cb();
      }) as any;
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();

        done();
      }, 0);
    });

  });

  describe('navigateTocourseDetails()', () => {

    it('shouldn\'t invoke location back', () => {
      // arrange
      // act
      localCourseService.navigateTocourseDetails();
      // assert
      expect(mockLocation.back).not.toHaveBeenCalled();
    });

    it('should invoke location back', () => {
      // arrange
      mockRouter.url = 'localhost://course-batches';
      // act
      localCourseService.navigateTocourseDetails();
      // assert
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('getEnrolledCourseSectionHTMLData()', () => {

    it('shouldn return empty string id the content batch details are not present', () => {
      // arrange
      const content = {
        batch: null
      };
      // act
      localCourseService.getEnrolledCourseSectionHTMLData(content);
      // assert
      expect(content.batch).toEqual(null);
    });

    it('shouldn return HTML string when batch end date is higher than present date and content completion percent is not 100', () => {
      // arrange
      const content = {
        batch: {
          endDate: '2100 04 21'
        },
        completionPercentage: 80
      };
      mockCommonUtilService.getFormattedDate = jest.fn(() => '21 Apr 2100');
      mockCommonUtilService.translateMessage = jest.fn(() => 'sample_message');

      // act
      localCourseService.getEnrolledCourseSectionHTMLData(content);
      // assert
      expect(mockCommonUtilService.getFormattedDate).toHaveBeenCalled();
      expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
    });

    it('shouldn return HTML string when batch end date is lower than present date, content completion percent is not 100', () => {
      // arrange
      const content = {
        batch: {
          endDate: '2019 04 01'
        },
        completionPercentage: 80
      };
      mockCommonUtilService.getFormattedDate = jest.fn(() => '01 Apr 2019');
      mockCommonUtilService.translateMessage = jest.fn(() => 'sample_message');

      // act
      localCourseService.getEnrolledCourseSectionHTMLData(content);
      // assert
      expect(mockCommonUtilService.getFormattedDate).toHaveBeenCalled();
      expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
    });

  });

  describe('getCourseSectionHTMLData()', () => {

    it('shouldn return empty string id the content batch details are not present', () => {
      // arrange
      const content = {
        batches: null
      };
      // act
      localCourseService.getCourseSectionHTMLData(content);
      // assert
      expect(content.batches).toEqual(null);
    });

    it('shouldn return HTML string when batch end date is higher than present date and content completion percent is not 100', () => {
      // arrange
      const content = {
        batches: [{
          enrollmentEndDate: '2100 04 21'
        }],
        completionPercentage: 80
      };
      mockCommonUtilService.getFormattedDate = jest.fn(() => '21 Apr 2100');
      mockCommonUtilService.translateMessage = jest.fn(() => 'sample_message');

      // act
      localCourseService.getCourseSectionHTMLData(content);
      // assert
      expect(mockCommonUtilService.getFormattedDate).toHaveBeenCalled();
      expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
    });

    it('shouldn return HTML string when batch end date is lower than present date, content completion percent is not 100', () => {
      // arrange
      const content = {
        batches: [{
          enrollmentEndDate: '2019 04 01'
        }],
        completionPercentage: 80
      };
      mockCommonUtilService.getFormattedDate = jest.fn(() => '01 Apr 2019');
      mockCommonUtilService.translateMessage = jest.fn(() => 'sample_message');

      // act
      localCourseService.getCourseSectionHTMLData(content);
      // assert
      expect(mockCommonUtilService.getFormattedDate).toHaveBeenCalled();
      expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
    });

  });

});
