import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import {
  ProfileService,
  SystemSettingsService,
  FrameworkUtilService,
  FormService,
  FrameworkService,
  SharedPreferences,
  ProfileType,
  ProfileSource
} from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from './app-global-service.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '../util/events';
import { of, throwError } from 'rxjs';
import {
  mockWebviewFormResponse,
  mockExternalIdVerificationResponse,
  mockFAQSystemSettingsResponse,
  mockComingSoonMessageSystemSettingsResponse,
  mockCustodianOrIdResponse,
  mockTPDFrameworkIdResponse,
  mockWebsessionConfigResponse,
  mockLibraryFilterConfigResponse,
  mockCourseFilterConfigResponse,
  mockDialCodeConfigResponse,
  mockLocationConfigResponse,
  mockContentConfigResponse,
  mockforceUpgradeFormAPIResponse,
  mockCategoryTermsResponse,
  mockPdfPlayerConfigurationResponse,
  mockSelfDeclarationForm
} from './formandframeworkutil.service.spec.data';
import { FormConstants } from '../app/form.constants';
import { doesNotReject } from 'assert';
import { PreferenceKey } from '../app/app.constant';


describe('FormAndFrameworkUtilService', () => {
  let formAndFrameworkUtilService: FormAndFrameworkUtilService;

  const mockProfileService: Partial<ProfileService> = {
    updateProfile: jest.fn(() => of({} as any))
  };
  const mockSystemSettingsService: Partial<SystemSettingsService> = {
    getSystemSettings: jest.fn()
  };
  const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
  const mockFormService: Partial<FormService> = {};
  const mockFrameworkService: Partial<FrameworkService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {
    getString: jest.fn(() => of(''))
  };
  const mockAppGlobalService: Partial<AppGlobalService> = {
    setLibraryFilterConfig: jest.fn(),
    setCourseFilterConfig: jest.fn(),
    setSupportedUrlRegexConfig: jest.fn(),
    setLocationConfig: jest.fn(),
    setRootOrganizations: jest.fn()
  };
  const mockAppVersion: Partial<AppVersion> = {
    getVersionCode: jest.fn(() => Promise.resolve(48))
  };
  const mockTranslateService: Partial<TranslateService> = {};
  const mockEvents: Partial<Events> = {
    publish: jest.fn()
  };

  beforeAll(() => {
    formAndFrameworkUtilService = new FormAndFrameworkUtilService(
      mockProfileService as ProfileService,
      mockSystemSettingsService as SystemSettingsService,
      mockFrameworkUtilService as FrameworkUtilService,
      mockFormService as FormService,
      mockFrameworkService as FrameworkService,
      mockSharedPreferences as SharedPreferences,
      mockAppGlobalService as AppGlobalService,
      mockAppVersion as AppVersion,
      mockTranslateService as TranslateService,
      mockEvents as Events
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of FormAndFrameworkUtilService', () => {
    expect(formAndFrameworkUtilService).toBeTruthy();
  });

  describe('getWebviewConfig()', () => {

    it('should return the webview version', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockWebviewFormResponse));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewConfig().then((response) => {
        expect(response).toEqual(54);
        done();
      });
    });

    it('should return the webview version if value is not set', (done) => {
      // arrange
      const formResponse = {
        form: ''
      };
      mockFormService.getForm = jest.fn(() => of(formResponse));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewConfig().then((response) => {
        expect(response).toEqual(54);
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewConfig().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getTenantSpecificMessages()', () => {

    it('should return the tenantSpecific messages', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockExternalIdVerificationResponse));
      // act
      // assert
      formAndFrameworkUtilService.getTenantSpecificMessages('rootOrgId').then((response) => {
        expect(response[0]).toEqual({
          popupHeaderLabel: 'User Verification',
          headerLabel: 'Are you a government school teacher ?',
          fieldLabel: 'Enter your teacher ID for verification',
        });
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getTenantSpecificMessages('rootOrgId').catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getConsumptionFaqsUrl()', () => {

    it('should return the consumption FAQ url', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => of(mockFAQSystemSettingsResponse));
      // act
      // assert
      formAndFrameworkUtilService.getConsumptionFaqsUrl().then((response: string) => {
        expect(response).toBe('sample_url');
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getConsumptionFaqsUrl().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getContentComingSoonMsg()', () => {

    it('should return the Coming Soon Message', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => of(mockComingSoonMessageSystemSettingsResponse));
      // act
      // assert
      formAndFrameworkUtilService.getContentComingSoonMsg().then((response: string) => {
        expect(JSON.parse(response)[0].value).toBe('Org specific coming soon message');
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getContentComingSoonMsg().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getCustodianOrgId()', () => {

    it('should return the custodian orgid', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => of(mockCustodianOrIdResponse));
      // act
      // assert
      formAndFrameworkUtilService.getCustodianOrgId().then((response) => {
        expect(response).toBe('sample_custodianOrgId');
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getCustodianOrgId().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getCourseFrameworkId()', () => {

    it('should return the TPD frameworkid', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => of(mockTPDFrameworkIdResponse));
      // act
      // assert
      formAndFrameworkUtilService.getCourseFrameworkId().then((response) => {
        expect(response).toBe('sample_courseFrameworkId');
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockSystemSettingsService.getSystemSettings = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.getCourseFrameworkId().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getWebviewSessionProviderConfig()', () => {

    it('should return login websession config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockWebsessionConfigResponse));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewSessionProviderConfig('login').then((response) => {
        expect(response.context).toEqual('login');
        done();
      });
    });

    it('should return merge websession config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockWebsessionConfigResponse));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate').then((response) => {
        expect(response.context).toEqual('migrate');
        done();
      });
    });

    it('should throw SignInError error if context not available', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockWebsessionConfigResponse));
      // act
      // assert
      formAndFrameworkUtilService.getWebviewSessionProviderConfig('merge').catch((error) => {
        expect(error.message).toEqual('SESSION_PROVIDER_CONFIG_NOT_FOUND');
        done();
      });
    });
  });

  describe('getLibraryFilterConfig()', () => {

    it('should invoke invokeLibraryFilterConfigFormApi if cached response is not available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLibraryFilterConfig = jest.fn(() => undefined);
      mockFormService.getForm = jest.fn(() => of(mockLibraryFilterConfigResponse));
      jest.spyOn<any, any>(formAndFrameworkUtilService, 'invokeLibraryFilterConfigFormApi');
      // act
      // assert
      formAndFrameworkUtilService.getLibraryFilterConfig().then((response) => {
        expect(formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']).toHaveBeenCalled();
        done();
      });
    });

    it('should resolve  if cached response available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLibraryFilterConfig = jest.fn(() => mockLibraryFilterConfigResponse.form.data.fields);
      // act
      // assert
      formAndFrameworkUtilService.getLibraryFilterConfig().then((response) => {
        expect(response.length).toEqual(5);
        done();
      });
    });
  });

  describe('invokeLibraryFilterConfigFormApi()', () => {

    it('should return library config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockLibraryFilterConfigResponse));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.reject());
      // act
      // assert
      formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 0);
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.resolve());
      // act
      // assert
      formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 10);
    });
  });

  describe('getLibraryFilterConfig()', () => {

    it('should invoke invokeLibraryFilterConfigFormApi if cached response is not available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLibraryFilterConfig = jest.fn(() => undefined);
      mockFormService.getForm = jest.fn(() => of(mockLibraryFilterConfigResponse));
      jest.spyOn<any, any>(formAndFrameworkUtilService, 'invokeLibraryFilterConfigFormApi');
      // act
      // assert
      formAndFrameworkUtilService.getLibraryFilterConfig().then((response) => {
        expect(formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']).toHaveBeenCalled();
        done();
      });
    });

    it('should resolve  if cached response available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLibraryFilterConfig = jest.fn(() => mockLibraryFilterConfigResponse.form.data.fields);
      // act
      // assert
      formAndFrameworkUtilService.getLibraryFilterConfig().then((response) => {
        expect(response.length).toEqual(5);
        done();
      });
    });
  });

  describe('invokeLibraryFilterConfigFormApi()', () => {

    it('should return library config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockLibraryFilterConfigResponse));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.reject());
      // act
      // assert
      formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 0);
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.resolve());
      // act
      // assert
      formAndFrameworkUtilService['invokeLibraryFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 10);
    });
  });

  describe('invokePdfPlayerConfiguration()', () => {
    it('should invoke form api to get pdf player configuration' , (done) => {
      mockFormService.getForm = jest.fn(() => of(mockPdfPlayerConfigurationResponse));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.reject());
      jest.spyOn<any, any>(formAndFrameworkUtilService, 'invokePdfPlayerConfiguration');
      formAndFrameworkUtilService.invokePdfPlayerConfiguration(undefined, resolve , reject).then((res) => {
        done();
      });
    });
  });

  describe('getPdfPlayerConfiguration()', () => {
    it('should not invoke pdf player configuration , if config is available locally', (done) => {
      mockFormService.getForm = jest.fn(() => of({}));
      mockAppGlobalService.getPdfPlayerConfiguration = jest.fn(() => true);
      formAndFrameworkUtilService.getPdfPlayerConfiguration().then((response) => {
        expect(response).toEqual(true);
        done();
      });
    });

    it('should invoke pdf player configuration, if config is not available locally' , (done) => {
      mockFormService.getForm = jest.fn(() => of({}));
      jest.spyOn(formAndFrameworkUtilService, 'invokePdfPlayerConfiguration').mockImplementation(() => {
        return Promise.resolve();
      });
      mockAppGlobalService.getPdfPlayerConfiguration = jest.fn(() => undefined);
      formAndFrameworkUtilService.getPdfPlayerConfiguration();
      setTimeout(() => {
        expect(formAndFrameworkUtilService.invokePdfPlayerConfiguration).toHaveBeenCalled();
        done();
      }, 0);
      // then((response) => {
        // expect(formAndFrameworkUtilService.invokePdfPlayerConfiguration).toHaveBeenCalled();
        // done();
      // });
    });
  });

  describe('getCourseFilterConfig()', () => {

    it('should invoke invokeCourseFilterConfigFormApi if cached response is not available', (done) => {
      // arrange
      mockAppGlobalService.getCachedCourseFilterConfig = jest.fn(() => undefined);
      mockFormService.getForm = jest.fn(() => of(mockCourseFilterConfigResponse));
      jest.spyOn<any, any>(formAndFrameworkUtilService, 'invokeCourseFilterConfigFormApi');
      // act
      // assert
      formAndFrameworkUtilService.getCourseFilterConfig().then((response) => {
        expect(formAndFrameworkUtilService['invokeCourseFilterConfigFormApi']).toHaveBeenCalled();
        done();
      });
    });

    it('should resolve  if cached response available', (done) => {
      // arrange
      mockAppGlobalService.getCachedCourseFilterConfig = jest.fn(() => mockCourseFilterConfigResponse.form.data.fields);
      // act
      // assert
      formAndFrameworkUtilService.getCourseFilterConfig().then((response) => {
        expect(response.length).toEqual(2);
        done();
      });
    });
  });

  describe('invokeCourseFilterConfigFormApi()', () => {

    it('should return course config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockCourseFilterConfigResponse));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.reject());
      // act
      // assert
      formAndFrameworkUtilService['invokeCourseFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 0);
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.resolve());
      // act
      // assert
      formAndFrameworkUtilService['invokeCourseFilterConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 10);
    });
  });

  describe('getLocationConfig()', () => {

    it('should invoke invokeLocationConfigFormApi if cached response is not available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLocationConfig = jest.fn(() => undefined);
      mockFormService.getForm = jest.fn(() => of(mockLocationConfigResponse));
      jest.spyOn<any, any>(formAndFrameworkUtilService, 'invokeLocationConfigFormApi');
      // act
      // assert
      formAndFrameworkUtilService.getLocationConfig().then((response) => {
        expect(formAndFrameworkUtilService['invokeLocationConfigFormApi']).toHaveBeenCalled();
        done();
      });
    });

    it('should resolve  if cached response available', (done) => {
      // arrange
      mockAppGlobalService.getCachedLocationConfig = jest.fn(() => mockLocationConfigResponse.form.data.fields);
      // act
      // assert
      formAndFrameworkUtilService.getLocationConfig().then((response) => {
        expect(response).toEqual([{
          name: 'Skip Location',
          code: 'skip',
          values: []
        }]);
        done();
      });
    });
  });

  describe('invokeLocationConfigFormApi()', () => {

    it('should return location config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockLocationConfigResponse));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.reject());
      // act
      // assert
      formAndFrameworkUtilService['invokeLocationConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 0);
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      const resolve = jest.fn(() => Promise.resolve());
      const reject = jest.fn(() => Promise.resolve());
      // act
      // assert
      formAndFrameworkUtilService['invokeLocationConfigFormApi']({} as any, resolve, reject);
      setTimeout(() => {
        expect(resolve).toHaveBeenCalledWith({});
        done();
      }, 10);
    });
  });

  describe('init()', () => {

    it('should invoke getDailCodeConfig', (done) => {
      // arrange
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi');
      // act
      // assert
      formAndFrameworkUtilService.init();
      setTimeout((() => {
        expect(formAndFrameworkUtilService.invokeUrlRegexFormApi).toHaveBeenCalled();
        done();
      }), 0);
    });
  });

  describe('invokeContentFilterConfigFormApi()', () => {

    it('should return content config', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockContentConfigResponse));
      // act
      // assert
      formAndFrameworkUtilService.invokeContentFilterConfigFormApi().then((response) => {
        expect(response[0].values.length).toEqual(9);
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.invokeContentFilterConfigFormApi().then((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('getSupportedContentFilterConfig()', () => {

    it('should invokeContentFilterConfigFormApi() and return content config', (done) => {
      // arrange
      formAndFrameworkUtilService['getCachedContentFilterConfig'] = jest.fn(() => undefined);
      formAndFrameworkUtilService['invokeContentFilterConfigFormApi'] = jest.fn(() =>
        Promise.resolve(mockContentConfigResponse.form.data.fields));
      // act
      // assert
      formAndFrameworkUtilService.getSupportedContentFilterConfig('library').then((response) => {
        expect(response).toEqual(expect.arrayContaining([
          'Course',
          'Teacher Resource',
          'Learning Resource',
          'Explanation Content',
          'Content Playlist',
          'Digital Textbook',
          'Practice Question Set',
          'eTextbook',
          'Course Assessment'
        ]));
        done();
      });
    });

    it('should return content config for library if invokeContentFilterConfigFormApi() API fails', (done) => {
      // arrange
      formAndFrameworkUtilService['getCachedContentFilterConfig'] = jest.fn(() => undefined);
      formAndFrameworkUtilService['invokeContentFilterConfigFormApi'] = jest.fn(() =>
        Promise.resolve([]));
      // act
      // assert
      formAndFrameworkUtilService.getSupportedContentFilterConfig('library').then((response) => {
        expect(response).toEqual(["Course", "Teacher Resource", "Learning Resource", "Explanation Content", "Content PlayList", "Digital Textbook", "Practice Question Set", "eTextbook", "Course Assessment"]);
        done();
      });
    });

    it('should return content config for course if invokeContentFilterConfigFormApi() API fails', (done) => {
      // arrange
      formAndFrameworkUtilService['getCachedContentFilterConfig'] = jest.fn(() => undefined);
      formAndFrameworkUtilService['invokeContentFilterConfigFormApi'] = jest.fn(() =>
        Promise.resolve([]));
      // act
      // assert
      formAndFrameworkUtilService.getSupportedContentFilterConfig('course').then((response) => {
        expect(response).toEqual(["Course", "Teacher Resource", "Learning Resource", "Explanation Content", "Content PlayList", "Digital Textbook", "Practice Question Set", "eTextbook", "Course Assessment"]);
        done();
      });
    });

    it('should return content config for downloads if invokeContentFilterConfigFormApi() API fails', (done) => {
      // arrange
      formAndFrameworkUtilService['getCachedContentFilterConfig'] = jest.fn(() => undefined);
      formAndFrameworkUtilService['invokeContentFilterConfigFormApi'] = jest.fn(() =>
        Promise.resolve([]));
      // act
      // assert
      formAndFrameworkUtilService.getSupportedContentFilterConfig('downloads').then((response) => {
        expect(response).toEqual([
          "Course", "Teacher Resource", "Learning Resource", "Explanation Content", "Content PlayList", "Digital Textbook", "Practice Question Set", "eTextbook", "Course Assessment"
        ]);
        done();
      });
    });

    it('should return content config for dialcode if invokeContentFilterConfigFormApi() API fails', (done) => {
      // arrange
      formAndFrameworkUtilService['getCachedContentFilterConfig'] = jest.fn(() => undefined);
      formAndFrameworkUtilService['invokeContentFilterConfigFormApi'] = jest.fn(() =>
        Promise.resolve([]));
      // act
      // assert
      formAndFrameworkUtilService.getSupportedContentFilterConfig('dialcode').then((response) => {
        expect(response).toEqual(expect.arrayContaining([
          'Digital Textbook',
          'Textbook Unit',
          'Course'
        ]));
        expect(formAndFrameworkUtilService['getCachedContentFilterConfig']()).toBeUndefined();
        done();
      });
    });

  });

  describe('getRootOrganizations()', () => {

    it('should invoke searchOrganization() API and return org list', (done) => {
      // arrange
      mockAppGlobalService.getCachedRootOrganizations = jest.fn(() => undefined);
      mockFrameworkService.searchOrganization = jest.fn(() => of({ content: ['sample_org'] } as any));
      // act
      formAndFrameworkUtilService.getRootOrganizations();
      // assert
      setTimeout(() => {
        expect(mockAppGlobalService.getCachedRootOrganizations).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should return the cache version if cache is available', (done) => {
      // arrange
      const searchOrgResponse = { content: ['sample_org'] } as any;
      mockAppGlobalService.getCachedRootOrganizations = jest.fn(() => searchOrgResponse);
      // act
      // assert
      formAndFrameworkUtilService.getRootOrganizations().then((response) => {
        expect(response).toEqual({ content: ['sample_org'] });
        done();
      });
    });
  });

  describe('checkNewAppVersion()', () => {

    it('should return forceupgrade types', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of(mockforceUpgradeFormAPIResponse));
      // act
      // assert
      formAndFrameworkUtilService.checkNewAppVersion().then((response) => {
        expect(response).toEqual(
          {
            actionButtons: [{
              action: 'yes', label: 'Update Now',
              link: 'https://play.google.com/store/apps/details?id=org.sunbird.app&hl=en'
            }],
            desc: '', title: 'Sample_title', type: 'forced',
            currentAppVersionCode: 48,
            maxVersionCode: 52,
            minVersionCode: 13
          }
        );
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => throwError({ error: 'API_ERROR' }));
      // act
      // assert
      formAndFrameworkUtilService.checkNewAppVersion().catch((error) => {
        expect(error).toEqual({ error: 'API_ERROR' });
        done();
      });
    });
  });

  describe('updateProfileInfo()', () => {

    it('should update the profile information successfully', (done) => {
      // arrange
      mockProfileService.updateProfile = jest.fn(() => of({ medium: ['English'], grade: ['class1'] } as any));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileData = { profileType: ProfileType.TEACHER, source: ProfileSource.SERVER };
      // act
      // assert
      formAndFrameworkUtilService.updateProfileInfo(profile, profileData).then((response) => {
        expect(mockEvents.publish).toHaveBeenCalledWith('refresh:loggedInProfile', undefined);
        expect(response).toEqual({ status: true });
        done();
      });
    });

    it('should update the profile information successfully and send the response back', (done) => {
      // arrange
      mockProfileService.updateProfile = jest.fn(() => of({ grade: ['class1'] } as any));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileData = { profileType: ProfileType.TEACHER, source: ProfileSource.SERVER };
      // act
      // assert
      formAndFrameworkUtilService.updateProfileInfo(profile, profileData).then((response) => {
        expect(mockEvents.publish).toHaveBeenCalledWith('refresh:loggedInProfile', undefined);
        expect(response).toEqual({ status: false, profile: { grade: ['class1'] } });
        done();
      });
    });

    it('should reject the error if API throws some error', (done) => {
      // arrange
      mockProfileService.updateProfile = jest.fn(() => throwError({ error: 'API_ERROR' }));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileData = { profileType: ProfileType.TEACHER, source: ProfileSource.SERVER };
      // act
      // assert
      formAndFrameworkUtilService.updateProfileInfo(profile, profileData).then((response) => {
        expect(response).toEqual({ status: false });
        done();
      });
    });
  });

  describe('updateLoggedInUser()', () => {

    it('should update logged in user information successfully', (done) => {
      // arrange
      mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of(mockCategoryTermsResponse));
      mockProfileService.updateProfile = jest.fn(() => of({ medium: ['English'], grade: ['class1'] } as any));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileRes = {
        framework: {
          gradeLevel: [
            'Class 1'
          ],
          subject: [
            'Telugu'
          ],
          id: [
            'ts_k-12_2'
          ],
          medium: [
            'English'
          ],
          board: [
            'State (Andhra Pradesh)'
          ]
        }
      };
      // act
      // assert
      formAndFrameworkUtilService.updateLoggedInUser(profileRes, profile).then((response) => {
        expect(response).toEqual({ status: true });
        done();
      });
    });

    it('should update logged in user information successfully if getFramework API fails', (done) => {
      // arrange
      mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => throwError({ error: 'API_ERROR' }));
      mockProfileService.updateProfile = jest.fn(() => of({ medium: ['English'], grade: ['class1'] } as any));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileRes = {
        framework: {
          gradeLevel: [
            'Class 1'
          ],
          subject: [
            'Telugu'
          ],
          id: [
            'ts_k-12_2'
          ],
          medium: [
            'English'
          ],
          board: [
            'State (Andhra Pradesh)'
          ]
        }
      };
      // act
      // assert
      formAndFrameworkUtilService.updateLoggedInUser(profileRes, profile).then((response) => {
        expect(response).toEqual({ status: true });
        done();
      });
    });

    it('should resolve if  framework info is not available', (done) => {
      // arrange
      mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => throwError({ error: 'API_ERROR' }));
      mockProfileService.updateProfile = jest.fn(() => of({ medium: ['English'], grade: ['class1'] } as any));
      const profile = { syllabus: ['tn'], board: ['tn', 'ap'], medium: ['English'], grade: ['class1'] };
      const profileRes = { framework: {} };
      // act
      // assert
      formAndFrameworkUtilService.updateLoggedInUser(profileRes, profile).then((response) => {
        expect(response).toEqual({ status: false });
        done();
      });
    });
  });

  describe('getDialcodeRegexFormApi()', () => {
    it('should return the dailcode regex if it is already saved', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => undefined);
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve({
        dialcode: 'sample-dail-code'
      }));

      formAndFrameworkUtilService.getDialcodeRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });

    it('should fetch the formAPI data and return the dailcode regex', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => ({ dialcode: 'dailcodeRegex' }));
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve({
        dialcode: 'sample-dail-code'
      }));

      formAndFrameworkUtilService.getDialcodeRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });

    it('should fetch the formAPI data and but if dialcode regex is not present then return empty string', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => undefined);
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve());

      formAndFrameworkUtilService.getDialcodeRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });
  });

  describe('getDeeplinkRegexFormApi()', () => {
    it('should return the deeplink regex if it is already saved', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => undefined);
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve({
        identifier: 'sample-dail-code'
      }));

      formAndFrameworkUtilService.getDeeplinkRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });

    it('should fetch the formAPI data and return the deeplink regex', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => ({ identifier: 'dailcodeRegex' }));
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve({
        identifier: 'sample-dail-code'
      }));

      formAndFrameworkUtilService.getDeeplinkRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });

    it('should fetch the formAPI data and but if deeplink regex is not present then return empty string', () => {
      mockAppGlobalService.getCachedSupportedUrlRegexConfig = jest.fn(() => undefined);
      jest.spyOn(formAndFrameworkUtilService, 'invokeUrlRegexFormApi').mockImplementation(() => Promise.resolve());

      formAndFrameworkUtilService.getDeeplinkRegexFormApi().then(() => {
        setTimeout(() => {
        }, 0);
      });
    });
  });

  describe('getContentRequestFormConfig()', () => {
    it('should return the formConfig for reuest content', (done) => {
      // arrange
      mockFormService.getForm = jest.fn(() => of({
        form: {
          data: {
            fields: []
          }
        }
      }));
      // act
      formAndFrameworkUtilService.getContentRequestFormConfig().then(() => {
        // assert
        expect(mockFormService.getForm).toHaveBeenCalled();
        done();
      });
      // assert

    });
  });

  it('should get formConfig and return data with fields', (done) => {
    // arrange
    mockFormService.getForm = jest.fn(() => of({
      form: {
        data: {
          fields: []
        }
      }
    }));
    // act
    formAndFrameworkUtilService.getFormConfig().then(() => {
      // assert
      expect(mockFormService.getForm).toHaveBeenCalled();
      done();
    });
  });

  it('should get form getStateContactList and return data with fields', (done) => {
    // arrange
    mockFormService.getForm = jest.fn(() => of({
      form: {
        data: {
          fields: []
        }
      }
    }));
    // act
    formAndFrameworkUtilService.getStateContactList().then(() => {
      // assert
      expect(mockFormService.getForm).toHaveBeenCalled();
      done();
    });
  });

  it('should get form for getConsentFormConfig and return data with fields', (done) => {
    // arrange
    mockFormService.getForm = jest.fn(() => of({
      form: {
        data: {
          fields: []
        }
      }
    }));
    // act
    formAndFrameworkUtilService.getConsentFormConfig().then(() => {
      expect(mockFormService.getForm).toHaveBeenCalled();
      done();
    });
  });

  it('should get form for notificationConfig and return data with fields', (done) => {
    // arrange
    mockFormService.getForm = jest.fn(() => of({
      form: {
        data: {
          fields: []
        }
      }
    }));
    // act
    formAndFrameworkUtilService.getNotificationFormConfig().then(() => {
      expect(mockFormService.getForm).toHaveBeenCalled();
      done();
    });
  });

  it('should get form with board alias and return data with fields', (done) => {
    // arrange
    mockFormService.getForm = jest.fn(() => of({
      form: {
        data: {
          fields: []
        }
      }
    }));
    // act
    formAndFrameworkUtilService.getBoardAliasName().then(() => {
      // assert
      expect(mockFormService.getForm).toHaveBeenCalled();
      done();
    });
  });

  describe('getFormFields()', () => {
    it('should return the field data in the response', () => {
      mockFormService.getForm = jest.fn(() => of({
        form: {
          data: {
            fields: mockSelfDeclarationForm
          }
        }
      }));

      formAndFrameworkUtilService.getFormFields(FormConstants.SELF_DECLARATION).then((response) => {
        expect(response).toEqual(mockSelfDeclarationForm);
      });
    });

    it('should return the empty response', () => {
      mockFormService.getForm = jest.fn(() => of({
        form: {
          data: {
          }
        }
      }));

      formAndFrameworkUtilService.getFormFields(FormConstants.SELF_DECLARATION, '12345678').then((response) => {
        expect(response).toEqual([]);
      });
    });

  });

  describe('invokeUrlRegexFormApi', () => {
    it('should invoke Url Regex Form Api ', () => {
      // arrange
      jest.spyOn(formAndFrameworkUtilService, 'getFormFields').mockReturnValue([{code:"", values:""}] as any);
      // act
      formAndFrameworkUtilService.invokeUrlRegexFormApi();
      // assert
    })
  });

  describe('getSearchFilters', () => {
    it('should get SearchFilters', () => {
      // arrange
      jest.spyOn(formAndFrameworkUtilService, 'getFormFields').mockImplementation();
      // act
      formAndFrameworkUtilService.getSearchFilters();
      // assert
    })
  });

  describe('changeChannelIdToName', () => {
    it('should change ChannelId To Name', () => {
      // arrange
      const filterCriteria = {
        facetFilters: [{
          name: "channel",
          values: [{
            rootOrgId: "sample_orgId",
            name: "sample_org"
          }]
        }]
      }
      // act
      formAndFrameworkUtilService.changeChannelIdToName(filterCriteria)
      // assert
    })
    it('should name is not channel or not present', () => {
      // arrange
      const filterCriteria = {
        facetFilters: [{
          name: "",
        }]
      }
      // act
      formAndFrameworkUtilService.changeChannelIdToName(filterCriteria)
      // assert
    });
  })

  describe('changeChannelNameToId', () => {
    it('should change ChannelName ToId', () => {
      // arrange
      const filterCriteria = {
        facetFilters: [{
          name: "channel",
          values: [{
            rootOrgId: "",
            name: ""
          }]
        }]
      }
      // act
      formAndFrameworkUtilService.changeChannelNameToId(filterCriteria)
      // assert
    })
    it('should check else case if name is not channel ', () => {
      // arrange
      const filterCriteria = {
        facetFilters: [{
          name: "channel2",
          values: [{
            rootOrgId: "",
            name: ""
          }]
        }]
      }
      // act
      formAndFrameworkUtilService.changeChannelNameToId(filterCriteria)
      // assert
    })
  })

  describe('getFrameworkCategories', () => {
    it('should invoked formApi and store in local storage for empty framework', (done) => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of('teacher'));
      mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({}));
      jest.spyOn(formAndFrameworkUtilService, 'getFormFields').mockImplementation(() => {
        return Promise.resolve([
          {
            "code": "category1",
            "label": "{\"en\":\"Board\"}",
            "placeHolder": "{\"en\":\"Selected Board\"}",
            "frameworkCode": "board",
            "supportedUserTypes": [
                "teacher",
                "student",
                "administrator",
                "parent",
                "other"
            ]
        },
        {
            "code": "category2",
            "label": "{\"en\":\"Medium\"}",
            "placeHolder": "{\"en\":\"Selected Medium\"}",
            "frameworkCode": "medium",
            "supportedUserTypes": [
                "teacher",
                "student",
                "parent",
                "other"
            ]
        }
        ]);
      });
      mockAppGlobalService.setFramewokCategory = jest.fn();
      // act
      formAndFrameworkUtilService.getFrameworkCategoryList(undefined).then(() => {
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
        expect(mockAppGlobalService.getCachedFrameworkCategory).toHaveBeenCalled();
        expect(mockAppGlobalService.setFramewokCategory).toHaveBeenCalled();
        done();
      });
    });

    it('should resolved framework category if already store', (done) => {
      // arrange
      mockAppGlobalService.getCachedFrameworkCategory = jest.fn(() => ({
        supportedFrameworkConfig: [
          {
            "code": "category1",
            "label": "{\"en\":\"Board\"}",
            "placeHolder": "{\"en\":\"Selected Board\"}",
            "frameworkCode": "board",
            "supportedUserTypes": [
                "teacher",
                "student",
                "administrator",
                "parent",
                "other"
            ]
        },
        {
            "code": "category2",
            "label": "{\"en\":\"Medium\"}",
            "placeHolder": "{\"en\":\"Selected Medium\"}",
            "frameworkCode": "medium",
            "supportedUserTypes": [
                "teacher",
                "student",
                "parent",
                "other"
            ]
        }
        ],
        supportedAttributes: {board: 'board'},
        userType: 'teacher'
      }));
      // act
      formAndFrameworkUtilService.getFrameworkCategoryList('teacher').then(() => {
        // assert
        expect(mockAppGlobalService.getCachedFrameworkCategory).toHaveBeenCalled();
        done();
      });
    })
  });

});
