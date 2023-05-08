import { Platform, PopoverController } from '@ionic/angular';
import { DownloadTranscriptPopupComponent } from './download-transcript-popup.component';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../../services/common-util.service';
import {
  AndroidPermissionsService,
  AppGlobalService,
  TelemetryGeneratorService
} from '../../../../services';
import { of } from 'rxjs';

describe('DownloadTranscriptPopupComponent', () => {
  let downloadTranscriptPopupComponent: DownloadTranscriptPopupComponent;
  const mockCommonUtilService: Partial<CommonUtilService> = {
    getGivenPermissionStatus: jest.fn(() => Promise.resolve({hasPermission: true}))
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
    requestPermission: jest.fn(() => of({hasPermission: true}))
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
      mockPlatform.is = jest.fn(platform => platform === 'ios')
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.reject());
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

    it('should not download transcript file if api failed and hasPermission', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: true}));
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

    it('should not download transcript file if api failed and isPermissionAlwaysDenied', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({isPermissionAlwaysDenied: true}));
      mockCommonUtilService.showSettingsPageToast = jest.fn(() => {})
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
        done();
      }, 0);
    });

    it('should not download transcript file if api failed and isPermissionAlwaysDenied and hasPermission has false', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      const presentPopover = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false}));
      mockCommonUtilService.translateMessage = jest.fn();
      mockCommonUtilService.buildPermissionPopover = jest.fn(() => Promise.resolve({
        present: presentPopover
      }));
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
        done();
      }, 0);
    });

    it('should not download transcript file if api failed and isPermissionAlwaysDenied and hasPermission has false and not now is selected', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false})); 
      mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
          await callback(mockCommonUtilService.translateMessage('NOT_NOW'));
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          mockCommonUtilService.showSettingsPageToast = jest.fn()
          return {
            present: jest.fn(() => Promise.resolve())
        };
      });   
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
        done();
      }, 0);
    });

    it('should not download transcript file if api failed and isPermissionAlwaysDenied and hasPermission has false and allow is selected', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false})); 
      mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
          await callback(mockCommonUtilService.translateMessage('ALLOW'));
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          mockAppGlobalService.isNativePopupVisible = true;
          mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: true}))
          mockAppGlobalService.setNativePopupVisible = jest.fn();
          return {
            present: jest.fn(() => Promise.resolve())
        };
      });   
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
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
        expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file if api failed and isPermissionAlwaysDenied and hasPermission has false and allow is selected and request isPermissionAlwaysDenied', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false})); 
      mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
          await callback(mockCommonUtilService.translateMessage('ALLOW'));
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          mockAppGlobalService.isNativePopupVisible = true;
          mockPermissionService.requestPermission = jest.fn(() => of({isPermissionAlwaysDenied: true}))
          mockAppGlobalService.setNativePopupVisible = jest.fn();
          return {
            present: jest.fn(() => Promise.resolve())
        };
      });   
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
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
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
        expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file if api failed and isPermissionAlwaysDenied and hasPermission has false and allow is selected and no request with hasPermission and isPermissionAlwaysDenied', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false})); 
      mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
          await callback(mockCommonUtilService.translateMessage('ALLOW'));
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          mockAppGlobalService.isNativePopupVisible = true;
          mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}))
          mockAppGlobalService.setNativePopupVisible = jest.fn();
          mockCommonUtilService.showSettingsPageToast = jest.fn();
          return {
            present: jest.fn(() => Promise.resolve())
        };
      });   
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
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
        expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not download transcript file and allow is selected and no request with hasPermission and isPermissionAlwaysDenied', (done) => {
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockPlatform.is = jest.fn(platform => platform === 'android')
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      mockCommonUtilService.getGivenPermissionStatus = jest.fn(() => Promise.resolve({hasPermission: false, isPermissionAlwaysDenied: false})); 
      mockCommonUtilService.translateMessage = jest.fn(v => v);
        mockCommonUtilService.buildPermissionPopover = jest.fn(async (callback) => {
          await callback(mockCommonUtilService.translateMessage('Sample'));
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          mockAppGlobalService.isNativePopupVisible = true;
          mockPermissionService.requestPermission = jest.fn(() => of({hasPermission: false, isPermissionAlwaysDenied: false}))
          mockAppGlobalService.setNativePopupVisible = jest.fn();
          mockCommonUtilService.showSettingsPageToast = jest.fn();
          return {
            present: jest.fn(() => Promise.resolve())
        };
      });   
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
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
        expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
        expect(mockCommonUtilService.buildPermissionPopover).toHaveBeenCalled();
        expect(mockCommonUtilService.getGivenPermissionStatus).toHaveBeenCalled();
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
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      mockCommonUtilService.translateMessage = jest.fn();
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
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
