import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { ProfileService, SystemSettingsService, FrameworkUtilService, FormService, FrameworkService, SharedPreferences } from 'sunbird-sdk';
import { AppGlobalService } from './app-global-service.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '@ionic/angular';
import { of, throwError } from 'rxjs';


describe('FormAndFrameworkUtilService', () => {
  let formAndFrameworkUtilService: FormAndFrameworkUtilService;

  const mockProfileService: Partial<ProfileService> = {};
  const mockSystemSettingsService: Partial<SystemSettingsService> = {};
  const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
  const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
  const mockFormService: Partial<FormService> = {};
  const mockFrameworkService: Partial<FrameworkService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockAppVersion: Partial<AppVersion> = {};
  const mockTranslateService: Partial<TranslateService> = {};
  const mockEvents: Partial<Events> = {};

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

    it('should return the webview version', () => {
      // arrange
      const formResponse = {
        form: {
          type: 'config',
          subtype: 'webview_version',
          action: 'get',
          data: {
            action: 'get',
            fields: [
              {
                version: '54'
              }
            ]
          }
        }
      };
      mockFormService.getForm = jest.fn(() => of(formResponse));
      // act
      // assert
      expect(formAndFrameworkUtilService.getWebviewConfig()).resolves.toBe(54);
    });
  });

  it('should return the webview version if value is not set', () => {
    // arrange
    const formResponse = {
      form: ''
    };
    mockFormService.getForm = jest.fn(() => of(formResponse));
    // act
    // assert
    expect(formAndFrameworkUtilService.getWebviewConfig()).resolves.toBe(54);
  });

  it('should reject the error if API throws some error', () => {
        // arrange
        mockFormService.getForm = jest.fn(() => throwError({error: 'API_ERROR'}));
        // act
        // assert
        expect(formAndFrameworkUtilService.getWebviewConfig()).rejects.toEqual({error: 'API_ERROR'});
    });

  it('should check for appVersion and also get the data from form for it', (done) => {
        // arrange
        formAndFrameworkUtilService.selectedLanguage = 'en';
        mockAppVersion.getVersionCode = jest.fn(() => Promise.resolve('29'));
        mockFormService.getForm = jest.fn(() => of({
            form: {
                data: {
                    fields: [
                        {
                            code: 'upgrade',
                            name: 'Upgrade of app',
                            language: 'en',
                            range: [
                                {
                                    minVersionCode: 13,
                                    maxVersionCode: 52,
                                    versionName: '2.4.158',
                                    type: 'forced'
                                }
                            ],
                            upgradeTypes: [
                                {
                                    type: 'forced',
                                    title: 'We have corrected' +
                                        'problems faced for missing' +
                                        'images and audio within the content. For a better experience, we recommend that' +
                                        'you upgrade to the latest version of DIKSHA.',
                                    desc: '',
                                    actionButtons: [
                                        {
                                            action: 'yes',
                                            label: 'Update Now',
                                            link: 'https://play.google.com/store/apps/details?id=in.gov.diksha.app&hl=en'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }));
        // act
        formAndFrameworkUtilService.checkNewAppVersion();
        // assert
        expect(mockAppVersion.getVersionCode).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockFormService.getForm).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return undefined if data from is not available', (done) => {
        // arrange
        mockAppVersion.getVersionCode = jest.fn(() => Promise.resolve('29'));
        mockFormService.getForm = jest.fn(() => of(undefined));
        // act
        formAndFrameworkUtilService.checkNewAppVersion();
        // assert
        expect(mockAppVersion.getVersionCode).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockFormService.getForm).toHaveBeenCalled();
            done();
        }, 0);
    });

});
