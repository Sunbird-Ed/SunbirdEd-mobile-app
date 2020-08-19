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
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';


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
  const mockSbProgressLoader: Partial<SbProgressLoader> = {};

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
      mockLocation as Location,
      mockSbProgressLoader as SbProgressLoader
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of LocalCourseService', () => {
    expect(localCourseService).toBeTruthy();
  });

  describe('enrollIntoBatch', () => {
    it('should Enrol into batch, and when the return is true', (done) => {
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
      mockCourseService.enrollCourse = jest.fn(() => of(true));

      // act
      localCourseService.enrollIntoBatch(enrollCourse).subscribe(() => {
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
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

      mockCourseService.enrollCourse = jest.fn(() => throwError(''));

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
      const networkError = new NetworkError({code: 'samp'});
      mockCourseService.enrollCourse = jest.fn(() => throwError(networkError));
      mockCommonUtilService.translateMessage = jest.fn();
      mockCommonUtilService.showToast = jest.fn();

      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
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
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const httpClientError = new HttpClientError('http_clicnt_error', { body: { params: { status: 'USER_ALREADY_ENROLLED_COURSE' } } });

      mockCourseService.enrollCourse = jest.fn(() => throwError(httpClientError));
      mockCommonUtilService.translateMessage = jest.fn();
      mockCommonUtilService.showToast = jest.fn();

      // act
      localCourseService.enrollIntoBatch(enrollCourse).toPromise().catch(() => {
        // assert
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
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
      mockCommonUtilService.translateMessage = jest.fn();
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
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
      mockSbProgressLoader.hide = jest.fn();
      // action
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSE_ENROLLED');
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
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
      mockSbProgressLoader.hide = jest.fn();
      // act
      localCourseService.checkCourseRedirect();
      // assert
      setTimeout(() => {
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});

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
        expect(mockEvents.publish).toHaveBeenCalled();
        expect(mockNgZone.run).toHaveBeenCalled();
        expect(mockPreferences.putString).toHaveBeenCalled();
        expect(mockAuthService.getSession).toHaveBeenCalled();
        expect(mockPreferences.getString).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({id: 'login'});
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

  describe('getCourseProgress', () => {
    it('should calculate and return course progress', (done) => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2 
      };
      const contentStatus = {
                contentList: [{contentId: 'id1', status: 2}]
            };
      mockCourseService.getContentState = jest.fn(() => of(contentStatus));
      // act
      localCourseService.getCourseProgress(context).then((res) => {
        expect(res).toBe(100);
        done();
      });
    });

    it('should return 0 progress in case of failure ', (done) => {
      // arrange
      mockAppGlobalService.getUserId = jest.fn(() => 'user');
      const context = {
        userId: 'userid', courseId: 'courseid', batchId: 'batchid', isCertified: false, leafNodeIds: ['id1'], batchStatus: 2 
      };
      mockCourseService.getContentState = jest.fn(() => throwError(''));
      // act
      localCourseService.getCourseProgress(context).then((res) => {
        expect(res).toBe(0);
        done();
      });
    });
  });

});
