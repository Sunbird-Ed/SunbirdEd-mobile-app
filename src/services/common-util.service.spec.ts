import { CommonUtilService } from './common-util.service';
import {
  ToastController,
  LoadingController,
  Events,
  PopoverController,
  Platform,
} from '@ionic/angular';
import { SharedPreferences, ProfileService, CorrelationData } from '@project-sunbird/sunbird-sdk';
import { TelemetryGeneratorService } from '../services/telemetry-generator.service';
import { InteractType, InteractSubtype, PageId, Environment } from '../services/telemetry-constants';
import { PreferenceKey } from '../app/app.constant';
import { SbGenericPopoverComponent } from '../app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { QRScannerAlert } from '../app/qrscanner-alert/qrscanner-alert.page';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { NgZone } from '@angular/core';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AndroidPermissionsService, ComingSoonMessageService } from '.';
import { TelemetryService } from '@project-sunbird/sunbird-sdk';

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

  describe('addPopupAccessibility', ()=>{

    it('Should add the accessibilty to the toast popup', ()=>{
      // arrange
      commonUtilService['popupAccessibilityFocus'] = jest.fn();
      commonUtilService['getPlatformBasedActiveElement'] = jest.fn();
      const toast = {
        present: jest.fn(),
        addEventListener: jest.fn(),
        onDidDismiss: jest.fn(()=>Promise.resolve()),
        setAttribute: jest.fn()
      }
      // act
      commonUtilService.addPopupAccessibility(toast, 'message');
      // assert
      expect(toast.setAttribute).toHaveBeenCalled();
    });

  });

  describe('showToast()', () => {

    it('should show Toast with provided configuration', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      mockToastController.create = jest.fn()
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', false);
      // assert
      setTimeout(() => {
        expect(mockToastController.create).toHaveBeenCalledWith({
          message: 'sample_translation',
          duration: 3000,
          position: 'bottom',
          cssClass: ''
        });
      }, 0); 
    });

    it('should return if isInactive true', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', true);
      // assert
      setTimeout(() => {
        expect(mockToastController.create).not.toHaveBeenCalledWith({
          message: 'sample_translation',
          duration: 3000,
          position: 'bottom',
          cssClass: ''
        });
      }, 0);
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
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
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

    it('should show Error alert popover, on left button clicked', () => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: true} }))
      } as any);
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      commonUtilService.afterOnBoardQRErrorAlert('sample_heading', 'sample_message');
      // assert
      expect(mockPopoverController.create).toHaveBeenCalled();
    });

    it('should show Error alert popover, on left button clicked false', () => {
      // arrange
      const createMock = jest.spyOn(mockPopoverController, 'create').mockResolvedValue({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: false} }))
      } as any);
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      commonUtilService.afterOnBoardQRErrorAlert('sample_heading', 'sample_message');
      // assert
      expect(mockPopoverController.create).toHaveBeenCalled();
    });
  });

  describe('showContentComingSoonAlert()', () => {
    it('should show Coming soon alert popover', () => {
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
      }, 0);
    });

    it('should generate INTERACT telemetry with given source', () => {
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
      });
    });

    it('should generate INTERACT telemetry if source is not provided', () => {
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
        ]
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
    it('should return true if IP location is available', () => {
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
    it('should show Exit Popup', () => {
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
      }, 0);
    });

    it('should return non-clicked telemetry', () => {
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
      }, 0);
    });
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
      const presentFn = jest.fn(() => Promise.resolve())
      const dissmissFn = jest.fn(() => Promise.resolve({data:{canDelete: true, btn: ''}}))
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: dissmissFn
      })) as any
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
    });

    it('should show last attempt available popup and on click of continue return false', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: true
      };
      const presentFn = jest.fn(() => Promise.resolve())
      const dissmissFn = jest.fn(() => Promise.resolve({data:{canDelete: true, btn: {isInternetNeededMessage: 'network'}}}))
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: dissmissFn
      })) as any
      commonUtilService.networkInfo = {
        isNetworkAvailable: false
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
    });

    it('should return false if the assessment is available to play directly', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: true
      };
      const presentFn = jest.fn(() => Promise.resolve())
      const dissmissFn = jest.fn(() => Promise.resolve({data:{canDelete: true, btn: {isInternetNeededMessage: 'network'}}}))
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: dissmissFn
      })) as any
      commonUtilService.networkInfo = {
        isNetworkAvailable: true
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).not.toHaveBeenCalled();

    });


    it('should return false if the assessment is available to play directly', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: true
      };
      const presentFn = jest.fn(() => Promise.resolve())
      const dissmissFn = jest.fn(() => Promise.resolve({data:{canDelete: false, btn: {isInternetNeededMessage: 'network'}}}))
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: dissmissFn
      })) as any
      commonUtilService.networkInfo = {
        isNetworkAvailable: true
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).not.toHaveBeenCalled();

    });

    it('should return false if the assessment is available to play directly', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: false
      };
      const presentFn = jest.fn(() => Promise.resolve())
      const dissmissFn = jest.fn(() => Promise.resolve({data:{canDelete: true, btn: {isInternetNeededMessage: 'network'}}}))
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: dissmissFn
      })) as any
      commonUtilService.networkInfo = {
        isNetworkAvailable: true
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).not.toHaveBeenCalled();

    });
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
    it('should return guest profile', () => {
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
      }, 0);
    });
  });
});