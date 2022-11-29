import { CommonUtilService } from './common-util.service';
import {
  ToastController,
  LoadingController,
  Events,
  PopoverController,
  Platform,
} from '@ionic/angular';
import { SharedPreferences, ProfileService, CorrelationData } from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractType, InteractSubtype, PageId, Environment } from '@app/services/telemetry-constants';
import { PreferenceKey } from '@app/app/app.constant';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { QRScannerAlert, QRAlertCallBack } from '@app/app/qrscanner-alert/qrscanner-alert.page';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { NgZone } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AndroidPermissionsService, ComingSoonMessageService, ImpressionType, ObjectType } from '.';
import { ProfileType, TelemetryService } from '@project-sunbird/sunbird-sdk';
import { AndroidPermission } from './android-permissions/android-permission';
import GraphemeSplitter from 'grapheme-splitter';

declare const FCMPlugin;

describe('CommonUtilService', () => {
  let commonUtilService: CommonUtilService;

  const mockSharedPreferences: Partial<SharedPreferences> = {
    putString: jest.fn(() => of(undefined)),
  };
  const mockProfileService: Partial<ProfileService> = {};
  const mockTelemetryService: Partial<TelemetryService> = {
    populateGlobalCorRelationData: jest.fn()
  };
  const mockToastController: Partial<ToastController> = {
    create: jest.fn(() => (Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
    } as any)))
  };
  const mockTranslateService: Partial<TranslateService> = {
    get: jest.fn(() => of('sample_translation')),
    currentLang: 'en',
    use: jest.fn()
  };
  const mockLoadingController: Partial<LoadingController> = {
    create: jest.fn(() => (Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
    } as any)))
  };
  const mockEvents: Partial<Events> = {
    publish: jest.fn()
  };
  const presentFn = jest.fn(() => Promise.resolve());
  const dissmissFn = jest.fn(() => Promise.resolve());
  const mockPopoverController: Partial<PopoverController> = {
    create: jest.fn(() => (Promise.resolve({
      present: presentFn,
      dismiss: dissmissFn,
      setAttribute: jest.fn()
    } as any)))
  };
  const mockNetwork: Partial<Network> = {
    onChange: jest.fn(() => of([{ type: 'online' }, { type: 'offline' }]))
  };
  const mockNgZone: Partial<NgZone> = {
    run: jest.fn((fn) => fn()) as any
  };
  const mockPlatform: Partial<Platform> = {
    is: jest.fn(platform => platform == 'android')
  };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateBackClickedTelemetry: jest.fn(),
    generateEndTelemetry: jest.fn()
  };
  const mockWebView: Partial<WebView> = {
    convertFileSrc: jest.fn(() => 'converted_file_src')
  };
  const mockAppversion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('Sunbird'))
  };
  const mockRouter: Partial<Router> = {};
  const mockPermissionService: Partial<AndroidPermissionsService> = {};
  const mockComingSoonMessageService: Partial<ComingSoonMessageService> = {};

  beforeAll(() => {
    commonUtilService = new CommonUtilService(
      mockSharedPreferences as SharedPreferences,
      mockProfileService as ProfileService,
      mockTelemetryService as TelemetryService,
      mockTranslateService as TranslateService,
      mockLoadingController as LoadingController,
      mockEvents as Events,
      mockPopoverController as PopoverController,
      mockNetwork as Network,
      mockNgZone as NgZone,
      mockPlatform as Platform,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockWebView as WebView,
      mockAppversion as AppVersion,
      mockRouter as Router,
      mockToastController as ToastController,
      mockPermissionService as AndroidPermissionsService,
      mockComingSoonMessageService as ComingSoonMessageService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create an instance of CommonUtilService', () => {
    expect(commonUtilService).toBeTruthy();
  });

  describe('showToast()', () => {

    it('should show Toast with provided configuration', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', false);
      // assert
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: ''
      });
    });

    it('should show Toast with provided configuration', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', false, 'red-toast', 3000, 'bottom', {});
      // assert
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: 'red-toast'
      });
    });

    it('should return if isInactive true', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', true);
      // assert
      expect(mockToastController.create).not.toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: ''
      });
    });
  });

  describe('translateMessage()', () => {

    it('should translate the key if fields is string', () => {
      // arrange
      jest.spyOn(mockTranslateService, 'get');
      // act
      commonUtilService.translateMessage('CONTENT_COMING_SOON', 'app_name');
      // assert
      expect(mockTranslateService.get).toHaveBeenCalledWith('CONTENT_COMING_SOON', { '%s': 'app_name' });
    });

    it('should translate the key if fields is object', () => {
      // arrange
      jest.spyOn(mockTranslateService, 'get');
      // act
      commonUtilService.translateMessage('CONTENT_COMING_SOON', { name: 'app_name' });
      // assert
      expect(mockTranslateService.get).toHaveBeenCalledWith('CONTENT_COMING_SOON', { name: 'app_name' });
    });
  });

  describe('getTranslatedValue()', () => {
    it('should return translated value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getTranslatedValue(
        '{\"en\": \"sample_translation\"}', 'en')).toEqual('sample_translation');
    });

    it('should return default if no translated value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getTranslatedValue('{\"sp\": \"sample_translation\"}', 'en'));
    });
  });

  describe('getLoader()', () => {
    it('should return loader instance', () => {
      // arrange
      // act
      const loader: LoadingController = commonUtilService.getLoader();
      // assert
      expect(loader).toBeDefined();
    });

    it('should return loader instance, if it has duration and message passed', () => {
      // arrange
      // act
      const loader: LoadingController = commonUtilService.getLoader('3000', 'some_msg');
      // assert
      expect(loader).toBeDefined();
    });
  });

  describe('arrayToString()', () => {
    it('should return concatinated string', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.arrayToString(['sample', 'sample1'])).toEqual('sample, sample1');
    });
  });

  describe('changeAppLanguage()', () => {
    it('should change the language to given language name', () => {
      // arrange
      // act
      commonUtilService.changeAppLanguage('English');
      // assert
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
    });

    it('should handle else case if language is not found', () => {
      // arrange
      // act
      commonUtilService.changeAppLanguage('other');
      // assert
    });

    it('should change the language to given language name, and if code is present', () => {
      // arrange
      // act
      commonUtilService.changeAppLanguage('English', 'en');
      // assert
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
    });
  });

  describe('afterOnBoardQRErrorAlert()', () => {
    it('should show Error alert popover', () => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined }))
      } as any);
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      commonUtilService.afterOnBoardQRErrorAlert('sample_heading', 'sample_message');
      // assert
      expect(mockPopoverController.create).toHaveBeenCalled();
    });

    it('should show Error alert popover, pass dialcode and source', () => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: true} }))
      } as any);
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      commonUtilService.afterOnBoardQRErrorAlert('Invalid QR code', 'sample_message', PageId.ONBOARDING_PROFILE_PREFERENCES, ObjectType.QR);
      // assert
      expect(mockPopoverController.create).toHaveBeenCalled();
    });

    it('should show Error alert popover, pass dialcode and source, on dismiss isLeftButtonClicked is not clicked', () => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: false} }))
      } as any);
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      commonUtilService.afterOnBoardQRErrorAlert('Invalid QR code', 'sample_message', PageId.ONBOARDING_PROFILE_PREFERENCES, ObjectType.QR);
      // assert
      expect(mockPopoverController.create).toHaveBeenCalled();
    });
  });

  describe('showContentComingSoonAlert()', () => {
    it('should show Coming soon alert popover', (done) => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      } as any);
      mockComingSoonMessageService.getComingSoonMessage = jest.fn(() => Promise.resolve('comming soon msg'));
      // act
      commonUtilService.showContentComingSoonAlert('permission', {});
      // assert
      setTimeout(() => {
        expect(mockComingSoonMessageService.getComingSoonMessage).toHaveBeenCalled();
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(createMock.mock.calls[0][0]['component']).toEqual(QRScannerAlert);
        done();
      }, 0);
    });

    it('should generate INTERACT telemetry with given source', (done) => {
      // arrange
      const callback = {
        tryAgain: jest.fn(),
        cancel: jest.fn()
      } as QRAlertCallBack
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      } as any);
      // const createMock = jest.spyOn(mockPopoverController, 'create');
      // act
      commonUtilService.showContentComingSoonAlert(PageId.PERMISSION, 'dial_code', 'Qr').then(() => {
        // assert
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(createMock.mock.calls[0][0]['component']).toEqual(QRScannerAlert);
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QR_CODE_COMINGSOON,
          Environment.HOME,
          'permission');
        done();
      });
    });

    it('should generate INTERACT telemetry with given source', (done) => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      } as any);
      const callback: QRAlertCallBack = {
        tryAgain: jest.fn(),
        cancel: jest.fn()
      }
      // act
      commonUtilService.showContentComingSoonAlert(PageId.ONBOARDING_PROFILE_PREFERENCES, 'dial_code', 'Qr').then(() => {
        // assert
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(createMock.mock.calls[0][0]['component']).toEqual(SbGenericPopoverComponent);
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QR_CODE_COMINGSOON,
          Environment.ONBOARDING,
          'profile-settings');
        done();
      });
    });

    it('should generate INTERACT telemetry if source is not provided', (done) => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      } as any);
      // const createMock = jest.spyOn(mockPopoverController, 'create');
      // act
      commonUtilService.showContentComingSoonAlert(undefined).then(() => {
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(createMock.mock.calls[0][0]['component']).toEqual(SbGenericPopoverComponent);
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.OTHER,
          InteractSubtype.QR_CODE_COMINGSOON,
          Environment.HOME,
          PageId.HOME);
        done();
      });
    });
  });

  describe('getAppName()', () => {
    it('should return App name', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getAppName().then((response) => {
        expect(response).toBe('Sunbird');
      }));
    });
  });

  describe('fileSizeInMB()', () => {
    it('should return 0 if input is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.fileSizeInMB(undefined)).toEqual('0.00');
    });

    it('should return size if input is valid', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.fileSizeInMB(12345678)).toEqual('11.77');
    });
  });

  describe('deDupe()', () => {
    it('should return empty array if input is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.deDupe(undefined, 'name')).toEqual([]);
    });

    it('should returndeduped Array if input contain any duplicate value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.deDupe([{ name: 'sample', id: '1' },
      { name: 'sample', id: '1' }], 'name')).toEqual([{ name: 'sample', id: '1' }]);
    });
  });

  describe('currentTabName()', () => {
    it('should return current Tab Name', () => {
      // arrange
      // act
      commonUtilService.currentTabName = 'Library';
      // assert
      expect(commonUtilService.currentTabName).toEqual('Library');
    });
  });

  describe('convertFileSrc()', () => {
    it('should return empty if img is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.convertFileSrc(null)).toEqual('');
    });

    it('should return converted file src if img is valid', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.convertFileSrc('sample_img')).toEqual('converted_file_src');
    });
  });

  describe('getOrgLocation()', () => {
    it('should return org location', () => {
      // arrange
      const organisation = {
        locations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
          { type: 'block', name: 'Block-A' },
          { type: 'sadar', name: 'Sadar' }
        ]
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: { type: 'block', name: 'Block-A' },
          district: { type: 'district', name: 'Cuttack' },
          state: { type: 'state', name: 'Odisha' }
        });
    });

    it('should return default location if organisation has no location details', () => {
      // arrange
      const organisation = {
        locations: ''
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: '',
          district: '',
          state: ''
        });
    });

    it('should return default location if organisation has no location length', () => {
      // arrange
      const organisation = {
        locations: [{}]
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: '',
          district: '',
          state: ''
        });
    });
  });

  describe('getUserLocation()', () => {
    it('should return user location', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' }
        ]
      };
      // act
      // assert
      expect(commonUtilService.getUserLocation(profile)).toEqual(
        {
          district: { type: 'district', name: 'Cuttack' },
          state: { type: 'state', name: 'Odisha' }
        });
    });

    it('should return user location and handle if profile has no userlocation', () => {
      // arrange
      const profile = {
        userLocations: []
      };
      // act
      // assert
      expect(commonUtilService.getUserLocation(profile)).toEqual(
        {});
    });
  });

  describe('isUserLocationAvalable()', () => {
    it('should return true if user state and distric is available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
        ],
        profileType: 'teacher'
      };
      const locationConfig = [
        {
          code: 'persona',
          children: {
            teacher: [{
              validations: [{
                type: 'required'
              }]
            }]
          }
        }
      ];
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile, locationConfig)).toBeFalsy();
    });

    it('should return false if user any of the state or distric is not available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
        ],
        serverProfile: {}
      };
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile, undefined)).toBeFalsy();
    });
  });

  describe('isDeviceLocationAvailable()', () => {
    it('should return true if user location is available', () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of({} as any));
      // act
      // assert
      commonUtilService.isDeviceLocationAvailable().then((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('should return false if user location is available', () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      // act
      // assert
      commonUtilService.isDeviceLocationAvailable().then((response) => {
        expect(response).toBeFalsy();
      });
    });
  });

  describe('isIpLocationAvailable()', () => {
    it('should return true if IP location is available', () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of({} as any));
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      // assert
      commonUtilService.isIpLocationAvailable().then((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('should return false if IP location is available', () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      // act
      // assert
      commonUtilService.isIpLocationAvailable().then((response) => {
        expect(response).toBeFalsy();
      });
    });
  });

  describe('handleToTopicBasedNotification()', () => {
    it('should return true if IP location is available', (done) => {
      // arrange
      const profile = {
        board: ['AP'], medium: ['English', 'Hindi', 'Bengali'],
        grade: ['class 8', 'class9', 'class10'], profileType: 'teacher'
      } as any;
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile));
      mockSharedPreferences.getString = jest.fn((arg) => {
        let value;
        switch (arg) {
          case PreferenceKey.DEVICE_LOCATION:
            value = '{\"state\": \"Odisha\", \"district\": \"Cuttack\"}';
            break;
          case PreferenceKey.SUBSCRIBE_TOPICS:
            value = '[\"AP\", \"English\", \"Odisha\", \"Cuttack\"]';
        }
        return of(value);
      });
      FCMPlugin.unsubscribeFromTopic = jest.fn((_, resolve, reject) => resolve());
      FCMPlugin.subscribeToTopic = jest.fn((_, resolve, reject) => resolve());
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.handleToTopicBasedNotification();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
        expect(mockSharedPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.DEVICE_LOCATION);
        expect(mockSharedPreferences.getString).toHaveBeenNthCalledWith(2, PreferenceKey.SUBSCRIBE_TOPICS);
        expect(mockSharedPreferences.putString).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should return true if IP location is available, if no data on get device location', (done) => {
      // arrange
      const profile = {
        board: ['AP'], medium: ['English', 'Hindi', 'Bengali'],
        grade: ['class 8', 'class9', 'class10'], profileType: 'teacher'
      } as any;
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile));
      mockSharedPreferences.getString = jest.fn((arg) => of(undefined));
      FCMPlugin.unsubscribeFromTopic = jest.fn((_, resolve, reject) => resolve());
      FCMPlugin.subscribeToTopic = jest.fn((_, resolve, reject) => resolve());
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.handleToTopicBasedNotification();
      // assert
      setTimeout(() => {
        expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
        expect(mockSharedPreferences.getString).toHaveBeenNthCalledWith(1, PreferenceKey.DEVICE_LOCATION);
        expect(mockSharedPreferences.getString).toHaveBeenNthCalledWith(2, PreferenceKey.SUBSCRIBE_TOPICS);
        expect(mockSharedPreferences.putString).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('getFormattedDate', () => {
    it('should format the date to DD-MMM-YYYY', () => {
      // arrange
      const date = '2020 02 10';
      // act
      commonUtilService.getFormattedDate(date);
      // assert
      expect(date).toEqual(date);
    });
  });

  describe('getContentImg', () => {
    it('should get the content image if present, else show the default image', () => {
      // arrange
      const content = {
        courseLogoUrl: 'sample_url'
      };
      commonUtilService.convertFileSrc = jest.fn();
      // act
      commonUtilService.getContentImg(content);
      // assert
      expect(commonUtilService.convertFileSrc).toHaveBeenCalledWith(content.courseLogoUrl);
    });
  });

  describe('presentToastForOffline', () => {
    it('should create a pop-up message', (done) => {
      const message = 'Connect to the internet to view the content';
      mockToastController.create = jest.fn(() => {
        return Promise.resolve({
          present: jest.fn(),
          onDidDismiss: jest.fn((fn) => {
            fn();
          })
        });
      });
      jest.spyOn(commonUtilService, 'translateMessage').mockImplementation(() => {
        return message;
      });
      commonUtilService.presentToastForOffline(message).then(() => {
        done();
      });
    });
  });

  describe('getStateList', () => {
    it('should return the state list', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => of([]));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return the state list is undefiend', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => of(undefined));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return empty state list', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => throwError(new Error()));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });
  });

  describe('getDistrictList', () => {
    it('should return the district list with state id', (done) => {
      // arrange
      const id = 'state_id';
      mockProfileService.searchLocation = jest.fn(() => of([]));
      // act
      commonUtilService.getDistrictList(id).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return the district list with state code', (done) => {
      // arrange
      const code = 'state_code';
      mockProfileService.searchLocation = jest.fn(() => of(''));
      // act
      commonUtilService.getDistrictList('', code).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return empty district list', (done) => {
      // arrange
      const id = 'state_id';
      mockProfileService.searchLocation = jest.fn(() => throwError(new Error()));
      // act
      commonUtilService.getDistrictList(id).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });
  });

  describe('showExitPopUp()', () => {
    it('should show Exit Popup', (done) => {
      // arrange
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      }) as any);
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockNetwork.onChange = jest.fn(() => of([{ type: 'online' }]));
      // act
      commonUtilService.showExitPopUp('permission', 'home', false);
      // assert
      setTimeout(() => {
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should return non-clicked telemetry', (done) => {
      // arrange
      commonUtilService = new CommonUtilService(
        mockSharedPreferences as SharedPreferences,
        mockProfileService as ProfileService,
        mockTelemetryService as TelemetryService,
        mockTranslateService as TranslateService,
        mockLoadingController as LoadingController,
        mockEvents as Events,
        mockPopoverController as PopoverController,
        mockNetwork as Network,
        mockNgZone as NgZone,
        mockPlatform as Platform,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockWebView as WebView,
        mockAppversion as AppVersion,
        mockRouter as Router,
        mockToastController as ToastController,
        mockPermissionService as AndroidPermissionsService,
        mockComingSoonMessageService as ComingSoonMessageService
      );
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: false} })),
        dismiss: jest.fn(() => Promise.resolve({}))
      }) as any);
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
      mockNetwork.onChange = jest.fn(() => of([{ type: 'online' }]));
      // act
      commonUtilService.showExitPopUp('library', 'home', false);
      // assert
      setTimeout(() => {
         expect(mockPopoverController.create).toHaveBeenCalled();
         expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
          InteractSubtype.NO_CLICKED,
          'home',
          'library');
         expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
         done();
      }, 0);
    });

    it('should return yes-clicked telemetry', (done) => {
      // arrange
      commonUtilService = new CommonUtilService(
        mockSharedPreferences as SharedPreferences,
        mockProfileService as ProfileService,
        mockTelemetryService as TelemetryService,
        mockTranslateService as TranslateService,
        mockLoadingController as LoadingController,
        mockEvents as Events,
        mockPopoverController as PopoverController,
        mockNetwork as Network,
        mockNgZone as NgZone,
        mockPlatform as Platform,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockWebView as WebView,
        mockAppversion as AppVersion,
        mockRouter as Router,
        mockToastController as ToastController,
        mockPermissionService as AndroidPermissionsService,
        mockComingSoonMessageService as ComingSoonMessageService
      );
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: true} })),
        dismiss: jest.fn(() => Promise.resolve({}))
      }) as any);
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
      mockNetwork.onChange = jest.fn(() => of([{ type: 'online' }]));
      navigator['app'] = {
        exitApp: jest.fn()
      } as any
      // act
      commonUtilService.showExitPopUp('library', 'home', false);
      // assert
      setTimeout(() => {
         expect(mockPopoverController.create).toHaveBeenCalled();
         expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
          InteractSubtype.YES_CLICKED,
          'home',
          'library');
         expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
         done();
      }, 0);
    });

    it('should handle if u have alert and dismiss ', () => {
      // arrange
      commonUtilService['alert'] = {
        dismiss: jest.fn()
      }
      // act
      commonUtilService.showExitPopUp('library', 'home', false);
      // assert
    })
  });

  describe('handleAssessmentStatus()', () => {
    it('should show assessment attempt exceeded toast message and return true', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: true,
        isLastAttempt: false
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).toHaveBeenCalled();
    });
    it('should show last attempt available popup and on click of continue return false', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: true
      };
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
    });
  
    it('should return false if the assessment is available to play directly', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: false
      };
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).not.toHaveBeenCalled();
  
    });
  });

  describe('showAssessmentLastAttemptPopup', () => {
    it('should show assessment popup', () => {
      // arange
      mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve()),
        onDidDismiss: jest.fn(() => Promise.resolve({canDelete: true}))
      })))as any;
      // act
      commonUtilService.showAssessmentLastAttemptPopup({isCloseButtonClicked: false});
      // assert
      setTimeout(() => {
      }, 0);
    })

    it('should show assessment popup on dismiss delete is not allowed', () => {
      // arange
      mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve()),
        onDidDismiss: jest.fn(() => Promise.resolve({canDelete: false}))
      })))as any;
      // act
      commonUtilService.showAssessmentLastAttemptPopup({isCloseButtonClicked: false});
      // assert
      setTimeout(() => {
      }, 0);
    })
  });

  describe('fetchPrimaryCategory', () => {
    it('should fetch primaryCategory from content and return trim and lowerCaseData', () => {
      // arrange
      // act
      jest.spyOn(commonUtilService, 'appendTypeToPrimaryCategory').getMockImplementation();
      commonUtilService.appendTypeToPrimaryCategory({primaryCategory: 'Digital Textbook'});
      // assert
      expect(commonUtilService.appendTypeToPrimaryCategory).toHaveReturnedWith('digitaltextbook-detail');
    });

    it('should fetch from contentType is primaryCategory is not available', () => {
      // arrange
      jest.spyOn(commonUtilService, 'appendTypeToPrimaryCategory').getMockImplementation();
      // act
      commonUtilService.appendTypeToPrimaryCategory({contentType: 'Digital Textbook'});
      // assert
      expect(commonUtilService.appendTypeToPrimaryCategory).toHaveReturnedWith('digitaltextbook-detail');
    });
  });

  describe('getGuestUserConfig', () => {
    it('should return guest profile', (done) => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of('sample-uid'));
      mockProfileService.getAllProfiles = jest.fn(() => of([
        {
          uid: 'sample-uid',
          name: 'sample-name'
        }, {
          uid: 'login-user-uid'
        }
      ]));
      // act
      commonUtilService.getGuestUserConfig();
      // assert
      setTimeout(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN);
        expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('convertFileToBase64', () => {
    it('should convert file to base64 ', (done) => {
      // arrange
      fetch = jest.fn(() => { jest.fn(); }) as any
      let file = "assets/imgs/ic_launcher.png"
        const sub = new Subject<any>();
        sub.next = jest.fn()
        sub.complete = jest.fn()
        sub.asObservable = jest.fn()
        const reader = new FileReader();
        reader.onload = jest.fn(() => ({result: ''}))
        reader.readAsDataURL = jest.fn()
      // act
      commonUtilService.convertFileToBase64(file);
      // assert
      done();
    })
  });

  describe('openLink', () => {
    it('should openLink ', () => {
      // arrange
      const url = '';
      // act
      commonUtilService.openLink(url);
      // assert
    })
  })

  describe('openUrlInBrowser', () => {
    it('should openUrlInBrowser ', () => {
      // arrange
      const url = '';
      const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
      window.cordova['InAppBrowser'].open = jest.fn();
      // act
      commonUtilService.openUrlInBrowser(url);
      // assert
      expect(window.cordova['InAppBrowser'].open).toHaveBeenCalledWith(url, '_blank', options);
    })
  })

  describe('getAppDirection', () => {
    it('should getAppDirection ', () => {
      // arrange
      mockPlatform['isRTL'] = jest.fn(() => true);
      // act
      commonUtilService.getAppDirection();
      // assert
    })

    it('should getAppDirection for isRTL false', () => {
      // arrange
      mockPlatform['isRTL'] = jest.fn(() => false);
      // act
      commonUtilService.getAppDirection();
      // assert
    })
  });

  describe('setGoogleCaptchaConfig', () => {
    it('should set googlde captcha config ', () => {
      // arrange
      // act
      commonUtilService.setGoogleCaptchaConfig('key', true);
      // assert
    })
  })

  describe('getGoogleCaptchaConfig', () => {
    it('shoul get google captchpa ', () => {
      // arrange
      // act
      commonUtilService.getGoogleCaptchaConfig();
      // assert
    })
  })

  describe('isAccessibleForNonStudentRole', () => {
    it('should handle accessible for non student role ', () => {
      // arrange
      // act
      commonUtilService.isAccessibleForNonStudentRole(ProfileType.ADMIN);
      // arrange
    })

    it('should handle accessible for non student role, handle for parent ', () => {
      // arrange
      // act
      commonUtilService.isAccessibleForNonStudentRole(ProfileType.PARENT);
      // arrange
    })
  })

  describe('getGivenPermissionStatus', () => {
    it('should getGivenPermissionStatus', () => {
      // arrange
      mockPermissionService.checkPermissions = jest.fn(() => of([]));
      // act
      commonUtilService.getGivenPermissionStatus(AndroidPermission.CAMERA)
      // assert
    })
  })

  describe('showSettingsPageToast', () => {
    it('should showSettingsPageToast ', () => {
      // arrange
      const toastController = {
        message: commonUtilService.translateMessage('description', 'sunbird'),
            cssClass: 'permissionSettingToast',
            buttons: [
                {
                    text: commonUtilService.translateMessage('SETTINGS'),
                    role: 'cancel',
                    handler: () => { }
                }
            ],
            position: 'bottom',
            duration: 3000
          }
      mockToastController.create = jest.fn((toastController) => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: 'cancel'}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', true);
      // assert
    })

    it('should showSettingsPageToast if on boarding false', () => {
      // arrange
      mockToastController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: 'cancel'}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', false);
      // assert
    })

    it('should showSettingsPageToast, if no role on dismiss', () => {
      // arrange
      mockToastController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: ''}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', false);
      // assert
    })
  })

  describe('buildPermissionPopover', () => {
    it('should buildPermissionPopover ', () => {
      // arrange
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
      // act
      commonUtilService.buildPermissionPopover(()=> '', 'sunbird', 'Camera', 'allow', 'common-util', true);
      // assert
      setTimeout(() => {  
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.CAMERA,
          'common-util',
          PageId.PERMISSION_POPUP,
          Environment.HOME);
      }, 0);
    })

    it('should buildPermissionPopover, if permission is not camera and onboaromng is not completed', () => {
      // arrange
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
      // act
      commonUtilService.buildPermissionPopover(()=> '', 'sunbird', 'file', 'allow', 'common-util', false);
      // assert
      setTimeout(() => {  
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.FILE_MANAGEMENT,
          'common-util',
          PageId.PERMISSION_POPUP,
          Environment.ONBOARDING);
      }, 0);
    })
  });

  describe('extractInitial', () => {
    it('should extractInitial and return initial as empty string if no name', () => {
      // arrange
      // act
      commonUtilService.extractInitial('')
      // assert
    })

    it('should extractInitial from name and split ', () => {
      // arrange
      const name = "sample_name"
      const splitter = new GraphemeSplitter();
        splitter.splitGraphemes = jest.fn(() => [])

      // act
      commonUtilService.extractInitial(name)
      // assert
    })
  });

  describe('populateGlobalCData', () => {
    it('should populateGlobalCData', () => {
      // arrange
      // act
      commonUtilService.populateGlobalCData();
      // assert
    })
  });

  describe('setRatingStarAriaLabel', () => {
    it('should setRatingStarAriaLabel ', () => {
      // arrange
      const domTag = [
        {children: [
          {setAttribute: jest.fn(() => {})}
        ]}
      ];
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('shopuld setRatingStarAriaLabel rating > 0', () => {
      // arrange
      const domTag = [
        {children: [
          {setAttribute: jest.fn(() => {})}
        ]}
      ];
      // act
      commonUtilService.setRatingStarAriaLabel(domTag, 3);
      // assert
    })

    it('should setRatingStarAriaLabel for inner children tags', () => {
      // arrange
      const domTag = [
        {children: [
          {
            setAttribute: jest.fn(() => {}),
            children:[
            {setAttribute: jest.fn(() => {}),
            shadowRoot: {
              querySelector: jest.fn(() => ({
                  setAttribute: jest.fn(() => {})
              }))
            }}
          ]}
        ]}
      ]
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('should setRatingStarAriaLabel for inner children tags else case if no query selector button', () => {
      // arrange
      const domTag = [
        {children: [
          {
            setAttribute: jest.fn(() => {}),
            children:[
            {setAttribute: jest.fn(() => {}),
            shadowRoot: {
              querySelector: jest.fn()
            }}
          ]}
        ]}
      ]
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('shopuld handle setRatingStarAriaLabel, if no ratingDOMtag ', () => {
      // arrange
      // act
      commonUtilService.setRatingStarAriaLabel([]);
      // assert
    })
  });

  describe('getPlatformBasedActiveElement', () => {
    it('shopuld getPlatformBasedActiveElement return active element', () => {
      // arrange
      window.document = {
        getElementById: jest.fn(() => ({setAttribute: jest.fn(), focus: jest.fn()})) as any,
        activeElement: {
          shadowRoot: null
        }
      } as any
      // act
      commonUtilService.getPlatformBasedActiveElement();
      // assert
    })

    it('shopuld getPlatformBasedActiveElement check platfrom and return childe node of active element', () => {
      // arrange
      window.document = {
        activeElement: {
          shadowRoot: {
            childNodes: [{}]
          }
        }
      } as any
      mockPlatform.is = jest.fn(platform => platform == "android");
      // act
      commonUtilService.getPlatformBasedActiveElement();
      // assert
    })
  });

  describe('popupAccessibilityFocus', () => {
    it('should popupAccessibilityFocus ', () => {
      // arrange
      const element = {setAttribute: jest.fn(), focus: jest.fn()} as any
      window.setTimeout = jest.fn((fn) => fn({
      }), 0) as any;
      // act
      commonUtilService.popupAccessibilityFocus(element);
      // assert
    })
  })

  describe('addPopupAccessibility', ()=>{
    it('Should add the accessibilty to the toast popup', ()=>{
      // arrange
      commonUtilService['popupAccessibilityFocus'] = jest.fn();
      commonUtilService['getPlatformBasedActiveElement'] = jest.fn(() => {}) as any;
      mockPlatform.is = jest.fn(platform => platform == "android");

      const toast = {
        present: jest.fn(),
        addEventListener: jest.fn(),
        onDidDismiss: jest.fn(()=>Promise.resolve()),
        setAttribute: jest.fn()
      }
      window.document = {
        getElementById: jest.fn(() => ({setAttribute: jest.fn(), focus: jest.fn()})) as any,
        activeElement: {
          shadowRoot: {
            childNodes: [{}]
          }
        }
      } as any
      mockPlatform.is = jest.fn(platform => platform=="android");
      // act
      commonUtilService.addPopupAccessibility(toast, 'message', 'sb-generic-toast');
      // assert
      expect(toast.setAttribute).toHaveBeenCalled();
    });

    it('Should add the accessibilty to the toast popup', ()=>{
      // arrange
      commonUtilService['popupAccessibilityFocus'] = jest.fn();
      commonUtilService['getPlatformBasedActiveElement'] = jest.fn();
      mockPlatform.is = jest.fn(platform => platform == "android");

      const toast = {
        present: jest.fn(),
        addEventListener: jest.fn((_, fn) => {
          fn({setTimeout: jest.fn(fn => fn())})
        }),
        onDidDismiss: jest.fn(()=>Promise.resolve()),
        setAttribute: jest.fn()
      }
      // act
      commonUtilService.addPopupAccessibility(toast, 'message');
      // assert
      expect(toast.setAttribute).toHaveBeenCalled();
    });

  });
});
