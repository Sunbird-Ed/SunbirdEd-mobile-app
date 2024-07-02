import { LocalCourseService } from './local-course.service';
import {
  ContentService,
  SharedPreferences,
  CourseService,
  Batch,
  NetworkError,
  HttpClientError,
  HttpServerError
} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from './common-util.service';
import { Events } from '../util/events';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { NgZone } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { of, throwError } from 'rxjs';
import { PreferenceKey } from '../app/app.constant';
import { Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { SbProgressLoader } from '../services/sb-progress-loader.service';
import { CategoryKeyTranslator } from '../pipes/category-key-translator/category-key-translator-pipe';
import { UserConsent } from '@project-sunbird/client-services/models';
import { ConsentService } from './consent-service';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';

describe('LocalCourseService', () => {
  let localCourseService: LocalCourseService;

  const mockCourseService: Partial<CourseService> = {};
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
  const mockSbProgressLoader: Partial<SbProgressLoader> = {
    hide: jest.fn()
  };
  const mockConsentService: Partial<ConsentService> = {};
  const mockDatePipe: Partial<DatePipe> = {};

  const mockCategoryKeyTranslator: Partial<CategoryKeyTranslator> = {
    transform: jest.fn(() => 'sample-message')
  };

  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

  beforeAll(() => {
    localCourseService = new LocalCourseService(
      mockCourseService as CourseService,
      mockPreferences as SharedPreferences,
      mockAppGlobalService as AppGlobalService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockCommonUtilService as CommonUtilService,
      mockEvents as Events,
      mockNgZone as NgZone,
      mockAppVersion as AppVersion,
      mockRouter as Router,
      mockLocation as Location,
      mockSbProgressLoader as SbProgressLoader,
      new DatePipe('en'),
      mockCategoryKeyTranslator as CategoryKeyTranslator,
      mockConsentService as ConsentService,
      mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create an instance of LocalCourseService', () => {
    expect(localCourseService).toBeTruthy();
  });

  it('should return reqestMap Value', () => {
    const course = {
      courseId: 'courseId',
      channel: 'sample-channelId',
      userId: 'sample-userId'
    };
    const data = localCourseService.prepareRequestValue(course);
    expect(data).toBeTruthy();
  });

  describe('enrollIntoBatch', () => {
    it('should Enrol into batch, and when the return is true', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: 'sample-do-ID',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
        channel: 'sample-channel',
        userConsent: 'Yes'
      };
      mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCourseService.enrollCourse = jest.fn(() => of(true));
      jest.spyOn(localCourseService, 'prepareRequestValue').mockImplementation();
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockAppGlobalService.getCurrentUser = jest.fn(() => ({serverProfile: {isMinor: false}}));
      mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
      // act
      localCourseService.enrollIntoBatch(enrollCourse).subscribe(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockCourseService.enrollCourse).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      });
    });

    it('should Enrol into batch, and when the return is true for updateConsent catchPart', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: 'sample-do-ID',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
        channel: 'sample-channel',
        userConsent: 'Yes'
      };
      mockSbProgressLoader.hide = jest.fn(() => Promise.resolve());
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCourseService.enrollCourse = jest.fn(() => of(true));
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockCommonUtilService.showToast = jest.fn();
      mockAppGlobalService.getCurrentUser = jest.fn(() => ({serverProfile: {isMinor: false}}));
      mockConsentService.showConsentPopup = jest.fn(() => Promise.resolve());
      // act
      localCourseService.enrollIntoBatch(enrollCourse).subscribe(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockCourseService.enrollCourse).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      });
    });

    it('should Enrol into batch, and when the return is false', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockCourseService.enrollCourse = jest.fn(() => of(false));

      // act
      localCourseService.enrollIntoBatch(enrollCourse).subscribe(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        done();
      });
    });

    it('should raise a telemetry event when error is thrown', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const map = new Map();
      map.set('data', 'sample-data');
      jest.spyOn(localCourseService, 'prepareRequestValue').mockImplementation(() => {
        return map;
      });
      mockCourseService.enrollCourse = jest.fn(() => throwError({}));
      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        done();
      });

    });

    it('should raise a telemetry event when Network error is thrown', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const networkError = new NetworkError({ code: 'samp' });
      mockCourseService.enrollCourse = jest.fn(() => throwError(networkError));
      mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled');
      mockCommonUtilService.showToast = jest.fn();

      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        done();
      });

    });

    it('should raise a telemetry event when HttpClient error is thrown and already enrolled', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
        userConsent: UserConsent.YES
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const httpClientError = new HttpClientError('http_clicnt_error', { body: { params: { status: 'USER_ALREADY_ENROLLED_COURSE' } } });

      mockCourseService.enrollCourse = jest.fn(() => throwError(httpClientError));
      mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled');
      mockCommonUtilService.showToast = jest.fn();
      const value = new Map();
      value.set('error', {});
      jest.spyOn(localCourseService, 'prepareRequestValue').mockImplementation(() => {
        return value;
      });
      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        done();
      });
    });


    it('should raise a telemetry event when HttpClient error is thrown and already enrolled and network error', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
        userConsent: UserConsent.YES
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const httpClientError = new HttpClientError('http_clicnt_error', { body: { params: { status: 'USER_ALREADY_ENROLLED_COURSE' } } });

      mockCourseService.enrollCourse = jest.fn(() => throwError(httpClientError));
      mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled');
      mockCommonUtilService.showToast = jest.fn();
      const value = new Map();
      value.set('error', {});
      jest.spyOn(localCourseService, 'prepareRequestValue').mockImplementation(() => {
        return value;
      });
      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        done();
      });
    });

    it('should raise a telemetry event when Httpclient error is thrown but not already enrolled', (done) => {
      // arrange
      const enrollCourse = {
        userId: 'sample_userid',
        batch: {
          id: '',
          courseId: '',
          status: 0
        },
        courseId: 'sample_courseid',
        pageId: 'sample_pageid',
        telemetryObject: {},
        objRollup: {},
        corRelationList: [],
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const httpClientError = new HttpClientError('http_clicnt_error', { body: {} });

      mockCourseService.enrollCourse = jest.fn(() => throwError(httpClientError));
      mockCommonUtilService.translateMessage = jest.fn(() => 'enrolled');
      mockCommonUtilService.showToast = jest.fn();

      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        done();
      });
    });

  });

  describe('checkCourseRedirect', () => {
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
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      // action
      localCourseService.checkCourseRedirect();
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockImplementation();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.isJoinTraningOnboardingFlow).toEqual(true);
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if batchId and course details are not saved in the preference.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockPreferences.getString = jest.fn(() => of(undefined));
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockImplementation();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        // expect(mockAppGlobalService.getActiveProfileUid).not.toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if session details is empty.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      mockPreferences.putString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.BATCH_DETAIL_KEY, '');
        done();
      }, 0);
    });

    it('should restrict the enrolling flow if created id and the userId are same.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('other_userId'));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      mockPreferences.putString = jest.fn(() => of(undefined));
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockEvents.publish).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.BATCH_DETAIL_KEY, expect.any(String));
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockCategoryKeyTranslator.transform).toBeCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
        expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference, but enrolledCourse is null.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockCategoryKeyTranslator.transform).toBeCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      }, 0);
    });

    it('should allow the enrolling flow if created id and the userId are saved in the preference, but enrolledCourse is [].', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockCategoryKeyTranslator.transform).toBeCalledWith('FRMELEMNTS_MSG_COURSE_ENROLLED', expect.anything());
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      }, 0);
    });

    it('should handle Network error when getEnrolled Courses is called.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
      mockNgZone.run = jest.fn((cb) => {
        cb();
      }) as any;
      mockPreferences.getString = jest.fn((key) => {
        switch (key) {
          case PreferenceKey.BATCH_DETAIL_KEY:
            return of(courseAndBatchData);
          case PreferenceKey.COURSE_DATA_KEY:
            return of(courseAndBatchData);
          case PreferenceKey.CDATA_KEY:
            return of(undefined);
        }
      });
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
      mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
      mockAppGlobalService.setEnrolledCourseList = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      const networkError = new NetworkError('sample_error');
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(networkError));
      mockSbProgressLoader.hide = jest.fn();
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });

        done();
      }, 0);
    });

    it('should handle HttpClient error when course is already enrolled.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
      mockPreferences.getString = jest.fn(() => of(courseAndBatchData));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockPreferences.putString = jest.fn(() => of(undefined));
      const httpClientError = new HttpClientError('http_clicnt_error', { body: { params: { status: 'USER_ALREADY_ENROLLED_COURSE' } } });
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(httpClientError));
      mockNgZone.run = jest.fn((cb) => {
        cb();
      }) as any;
      mockSbProgressLoader.hide = jest.fn();
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockEvents.publish).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        done();
      }, 0);
    });

    it('should handle HttpClient error when course is already enrolled.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
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
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();

        done();
      }, 0);
    });

    it('should handle error other than HttpClient error when course is already enrolled.', (done) => {
      // arrange
      mockAppGlobalService.isSignInOnboardingCompleted = true;
      mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
      mockAppGlobalService.getActiveProfileUid = jest.fn(() => Promise.resolve('sample-uid'));
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
      const httpClientError = new HttpServerError('http_server_error', { body: {} });
      jest.spyOn(localCourseService, 'enrollIntoBatch').mockReturnValue(throwError(httpClientError));
      mockNgZone.run = jest.fn((cb) => {
        cb();
      }) as any;
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
        expect(mockAppGlobalService.getActiveProfileUid).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalled();
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

  describe('getCourseProgress', () => {
    it('should calculate and return course progress', () => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2
      };
      const contentStatus = {
        contentList: [{ contentId: 'id1', status: 2 }]
      };
      mockCourseService.getContentState = jest.fn(() => of(contentStatus));
      // act
      localCourseService.getCourseProgress(context).then((res: any) => {
        expect(res.progress).toBe(100);
      });
    });

    it('should return 0 progress in case of failure ', () => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2
      };
      mockCourseService.getContentState = jest.fn(() => throwError(''));
      // act
      localCourseService.getCourseProgress(context).then((res: any) => {
        expect(res.progress).toBe(0);
      });
    });

    it('should return 0 progress if getContentState return empty response', () => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2
      };
      mockCourseService.getContentState = jest.fn(() => of(undefined));
      // act
      localCourseService.getCourseProgress(context).then((res: any) => {
        expect(res.progress).toBe(0);
      });
    });

    it('should return 0 progress if getContentState return wrong data', () => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2
      };
      mockCourseService.getContentState = jest.fn(() => of({ contentList: [{ contentId: 'do_1234' }] }));
      // act
      localCourseService.getCourseProgress(context).then((res: any) => {
        expect(res.progress).toBe(0);
      });
    });
  });

  describe('isEnrollable', () => {
    it('should return unEnrolled and invoked showFutureBatchMessage', () => {
      const batches = [{
        enrollmentEndDate: '01/01/01',
        startDate: '01/01/01'
      }];
      mockCommonUtilService.showToast = jest.fn();
      mockDatePipe.transform = jest.fn(() => '01-01-01');
      mockCategoryKeyTranslator.transform = jest.fn(() => 'batches avilable');
      // act
      const data = localCourseService.isEnrollable(batches, {});
      // assert
      expect(mockCommonUtilService.showToast).toHaveBeenCalled();
      expect(data).toBeFalsy();
    });

    it('should show toast message if batches is empty', (done) => {
          // arrnge
          mockCommonUtilService.showToast = jest.fn();
          // act
          const data = localCourseService.isEnrollable([], {});
          // assert
          setTimeout(() => {
              expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_BATCHES_AVAILABLE');
              done();
          }, 0);
      });

    it('should return is enrolled', () => {
      const batches = [{
        enrollmentEndDate: undefined,
        startDate: '01/01/01'
      }];
      mockCommonUtilService.showToast = jest.fn();
      mockDatePipe.transform = jest.fn(() => '01-01-01');
      mockCategoryKeyTranslator.transform = jest.fn(() => 'batches avilable');
      // act
      const data = localCourseService.isEnrollable(batches, {});
      // arrange
      expect(data).toBeTruthy();
    });

    it('should return is enrolled', () => {
      const batches = [{
        enrollmentEndDate: undefined,
        startDate: 1800863414000
      }, {
        enrollmentEndDate: undefined,
        startDate: '02/02/02'
      }, {
        startDate: 1800863614000
      }];
      mockCommonUtilService.showToast = jest.fn();
      mockDatePipe.transform = jest.fn(() => '01-01-01');
      mockCategoryKeyTranslator.transform = jest.fn(() => 'batches avilable');
      // act
      const data = localCourseService.isEnrollable(batches, {});
      // assert
      expect(data).toBeTruthy();
    });
  });

  describe('fetchAssessmentStatus()', () => {

    it('return default assessment status data', () => {
      // arrange
      const contentStatusData = null;
      // act
      const data = localCourseService.fetchAssessmentStatus(contentStatusData, 'do_id');
      // assert
      expect(data.isLastAttempt).toEqual(false);
      expect(data.isContentDisabled).toEqual(false);
    });

    it('return assessment status isLastAttempt as true if its the final attempt', () => {
      // arrange
      const contentStatusData = {
        contentList: [{ contentId: 'do_id', bestScore: {}, score: [1, 2] }]
      };
      // act
      const data = localCourseService.fetchAssessmentStatus(contentStatusData, { identifier: 'do_id', contentData: { maxAttempts: 3 } });
      // assert
      expect(data.isLastAttempt).toEqual(true);
      expect(data.isContentDisabled).toEqual(false);
    });

    it('return assessment status isContentDisabled as true if the user has exceeded the number of attempts', () => {
      // arrange
      const contentStatusData = {
        contentList: [{ contentId: 'do_id', bestScore: {}, score: [1, 2, 3] }]
      };
      // act
      const data = localCourseService.fetchAssessmentStatus(contentStatusData, { identifier: 'do_id', maxAttempts: 2 });
      // assert
      expect(data.isLastAttempt).toEqual(false);
      expect(data.isContentDisabled).toEqual(true);
    });
  });

});
