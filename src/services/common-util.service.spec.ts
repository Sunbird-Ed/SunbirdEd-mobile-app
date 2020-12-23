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
import { QRScannerAlert } from '@app/app/qrscanner-alert/qrscanner-alert.page';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { NgZone } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AndroidPermissionsService, ComingSoonMessageService } from '.';

declare const FCMPlugin;

describe('CommonUtilService', () => {
  let commonUtilService: CommonUtilService;

  const mockSharedPreferences: Partial<SharedPreferences> = {
    putString: jest.fn(() => of(undefined)),
  };
  const mockProfileService: Partial<ProfileService> = {};
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
      dismiss: dissmissFn
    } as any)))
  };
  const mockNetwork: Partial<Network> = {
    onChange: jest.fn(() => of([{ type: 'online' }]))
  };
  const mockNgZone: Partial<NgZone> = {
    run: jest.fn((fn) => fn())
  };
  const mockPlatform: Partial<Platform> = {};
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

    it('should return if isInactive true', () => {
      // arrange
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
  });

  describe('getLoader()', () => {
    it('should return loader instance', () => {
      // arrange
      // act
      const loader: LoadingController = commonUtilService.getLoader();
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
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: undefined })),
        dismiss: jest.fn(() => Promise.resolve({}))
      } as any);
      // const createMock = jest.spyOn(mockPopoverController, 'create');
      // act
      commonUtilService.showContentComingSoonAlert('permission', 'dial_code').then(() => {
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
  });

  describe('getUserLocation()', () => {
    it('should return user location', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
          { type: 'block', name: 'Block-A' },
          { type: 'sadar', name: 'Sadar' }
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
  });

  describe('isUserLocationAvalable()', () => {
    it('should return true if user state and distric is available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
        ]
      };
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile)).toBeTruthy();
    });

    it('should return false if user any of the state or distric is not available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
        ]
      };
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile)).toBeFalsy();
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
      mockProfileService.searchLocation = jest.fn(() => of([]));
      // act
      commonUtilService.getDistrictList(code).then((res) => {
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
  });
});
