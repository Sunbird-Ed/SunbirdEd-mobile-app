import { PopoverController } from '@ionic/angular';
import { DownloadTranscriptPopupComponent } from './download-transcript-popup.component';
import { ContentService, StorageService } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';

describe('DownloadTranscriptPopupComponent', () => {
  let downloadTranscriptPopupComponent: DownloadTranscriptPopupComponent;
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockContentService: Partial<ContentService> = {};
  const mockPopOverCtrl: Partial<PopoverController> = {};
  const mockStorageService: Partial<StorageService> = {};

  beforeAll(() => {
    downloadTranscriptPopupComponent = new DownloadTranscriptPopupComponent(
      mockContentService as ContentService,
      mockStorageService as StorageService,
      mockPopOverCtrl as PopoverController,
      mockCommonUtilService as CommonUtilService,
    );
  });

  it('should create', () => {
    expect(downloadTranscriptPopupComponent).toBeTruthy();
  });
});
