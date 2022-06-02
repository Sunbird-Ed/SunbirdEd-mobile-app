import { PopoverController } from '@ionic/angular';
import { DownloadTranscriptPopupComponent } from './download-transcript-popup.component';
import { ContentService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';

describe('DownloadTranscriptPopupComponent', () => {
  let downloadTranscriptPopupComponent: DownloadTranscriptPopupComponent;
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockContentService: Partial<ContentService> = {};
  const mockPopOverCtrl: Partial<PopoverController> = {};

  beforeAll(() => {
    downloadTranscriptPopupComponent = new DownloadTranscriptPopupComponent(
      mockContentService as ContentService,
      mockPopOverCtrl as PopoverController,
      mockCommonUtilService as CommonUtilService,
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
      mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
      downloadTranscriptPopupComponent.contentData = {
        transcripts: JSON.stringify([]),
        name: 'transcript-content'
      };
      // act
      downloadTranscriptPopupComponent.download();
      // assert
      setTimeout(() => {
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
        expect(dismissFn).toHaveBeenCalled();
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
