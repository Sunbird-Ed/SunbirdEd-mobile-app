import { Platform, PopoverController } from '@ionic/angular';
import { DownloadTranscriptPopupComponent } from './download-transcript-popup.component';
import { ContentService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  AndroidPermissionsService,
  AppGlobalService,
  TelemetryGeneratorService
} from '@app/services';
import { of } from 'rxjs';

describe('DownloadTranscriptPopupComponent', () => {
  let downloadTranscriptPopupComponent: DownloadTranscriptPopupComponent;
  const mockCommonUtilService: Partial<CommonUtilService> = {
    isAndroidVer13: jest.fn(),
    getGivenPermissionStatus: jest.fn(),
    buildPermissionPopover: jest.fn(),
    showSettingsPageToast: jest.fn(),
    translateMessage: jest.fn()
  };
  const mockContentService: Partial<ContentService> = {};
  const mockPopOverCtrl: Partial<PopoverController> = {};
  const mockPlatform: Partial<Platform> = {
    is: jest.fn(platform => platform === 'ios')
};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn()
  };
  const mockAppGlobalService: Partial<AppGlobalService> = {
    setNativePopupVisible: jest.fn()
  };
  const mockPermissionService: Partial<AndroidPermissionsService> = {
    requestPermission: jest.fn(() => {})
  };

  beforeAll(() => {
    downloadTranscriptPopupComponent = new DownloadTranscriptPopupComponent(
      mockContentService as ContentService,
      mockPopOverCtrl as PopoverController,
      mockCommonUtilService as CommonUtilService,
      mockPlatform as Platform,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockAppGlobalService as AppGlobalService,
      mockPermissionService as AndroidPermissionsService
    );
  });

  it('should create', () => {
    expect(downloadTranscriptPopupComponent).toBeTruthy();
  });

  describe('download', () => {
    it('should download transcript file', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => true);
      downloadTranscriptPopupComponent.contentData = {
        transcripts: [{
          identifier: 'sample-do_id',
          artifactUrl: 'http//:sample-url/do_id',
          language: 'english'
        }, {
          identifier: 'sample-do_id',
          artifactUrl: 'http//:sample-url/do_id',
          language: 'hindi'
        }],
        name: 'transcript-content'
      };
      downloadTranscriptPopupComponent.transcriptLanguage = 'english';
      mockContentService.downloadTranscriptFile = jest.fn(() => Promise.resolve({path: 'sample-local-storage-path'}));
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentService.downloadTranscriptFile).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file if api failed', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false);
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([{
          identifier: 'sample-do_id',
          artifactUrl: 'http//:sample-url/do_id',
          language: 'english'
        }, {
          identifier: 'sample-do_id',
          artifactUrl: 'http//:sample-url/do_id',
          language: 'hindi'
        }]),
        name: 'transcript-content'
      };
      downloadTranscriptPopupComponent.transcriptLanguage = 'english';
      mockContentService.downloadTranscriptFile = jest.fn(() => Promise.reject({error: 'api-failed'}));
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentService.downloadTranscriptFile).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file if transcript is not available', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: true}))
      mockCommonUtilService.showSettingsPageToast = jest.fn();
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        // expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file checkpermission isPermission denied true', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: false, isPermissionAlwaysDenied: true}))
      mockCommonUtilService.showSettingsPageToast = jest.fn();
      mockAppGlobalService.isNativePopupVisible = true;
      mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: true, isPermissionDenied: false }));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
     // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        // expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file checkpermission hasPermission true, translate message is empty', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: false, isPermissionAlwaysDenied: false}))
      mockCommonUtilService.showSettingsPageToast = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn(v => v);
      mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
        await callback(mockCommonUtilService.translateMessage(''));
        return {
            present: jest.fn(() => Promise.resolve())
        };
      });
      mockAppGlobalService.isNativePopupVisible = true;
      mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: true, isPermissionDenied: false }));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file checkpermission hasPermission true', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: false, isPermissionAlwaysDenied: false}))
      mockCommonUtilService.showSettingsPageToast = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn(v => v);
      mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
        await callback(mockCommonUtilService.translateMessage('ALLOW'));
        return {
            present: jest.fn(() => Promise.resolve())
        };
      });
      mockAppGlobalService.isNativePopupVisible = true;
      mockPermissionService.requestPermission = jest.fn(() => of({ hasPermission: true, isPermissionDenied: false }));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file checkpermission isPermission denied, hasPermission false', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: false, isPermissionAlwaysDenied: false}))
      mockCommonUtilService.showSettingsPageToast = jest.fn();
      mockCommonUtilService.translateMessage = jest.fn(v => v);
      mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
        await callback(mockCommonUtilService.translateMessage('ALLOW'));
        return {
            present: jest.fn(() => Promise.resolve())
        };
      });
      mockAppGlobalService.isNativePopupVisible = true;
      mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionDenied: true}))
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file checkpermission isPermission denied, hasPermission false, storage Permission build permission', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "android");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => ({hasPermission: false, isPermissionAlwaysDenied: false}))
      mockCommonUtilService.showSettingsPageToast = jest.fn(() => Promise.resolve());
      mockCommonUtilService.translateMessage = jest.fn(v => v);
      mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
        await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
        return {
          present: jest.fn(() => Promise.resolve())
        };
      });
      mockCommonUtilService.showSettingsPageToast = jest.fn(() => Promise.resolve());
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        // expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file if transcript is undefined', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(fn => fn == "ios");
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => false);
      downloadTranscriptPopupComponent.contentData = {
        transcripts: undefined,
        name: 'transcript-content'
      };
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        // expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  it('should closed the transcript download popup', () => {
    mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
    downloadTranscriptPopupComponent.closePopover();
    expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
  });

  it('ngOnInit', () => {
    downloadTranscriptPopupComponent.ngOnInit();
  });
});
