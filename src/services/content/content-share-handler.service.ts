import { Injectable, Inject } from '@angular/core';
import {
  ContentService, StorageService, ContentExportRequest, ContentExportResponse,
  Content, Rollup, CorrelationData, ContentDetailRequest
} from 'sunbird-sdk';
import { CommonUtilService } from '../common-util.service';
import { InteractSubtype, InteractType, Environment, PageId } from '../telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { ShareUrl, ContentType } from '../../app/app.constant';
import { UtilityService } from '../utility-service';

@Injectable({
  providedIn: 'root'
})
export class ContentShareHandlerService {
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private commonUtilService: CommonUtilService,
    private social: SocialSharing,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private utilityService: UtilityService) {
  }
  public async shareContent(content: Content, corRelationList?: CorrelationData[], rollup?: Rollup) {
    if (content.hierarchyInfo && content.hierarchyInfo.length > 0) {
      const contentDetailRequest: ContentDetailRequest = {
        contentId: content.hierarchyInfo[0].identifier,
        attachFeedback: false,
        attachContentAccess: false,
        emitUpdateIfAny: false
      };
      await this.contentService.getContentDetails(contentDetailRequest).toPromise()
        .then((contentDetail: Content) => {
          content = contentDetail;
        });
    }

    this.generateShareInteractEvents(InteractType.TOUCH,
      InteractSubtype.SHARE_LIBRARY_INITIATED,
      content.contentData.contentType, corRelationList, rollup);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const baseUrl = await this.utilityService.getBuildConfigValue('BASE_URL');
    const url = baseUrl + ShareUrl.CONTENT + content.identifier;
    if (content.isAvailableLocally) {
      const exportContentRequest: ContentExportRequest = {
        contentIds: [content.identifier],
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath()
      };
      this.contentService.exportContent(exportContentRequest).toPromise()
        .then(async (response: ContentExportResponse) => {
          await loader.dismiss();
          this.generateShareInteractEvents(InteractType.OTHER,
            InteractSubtype.SHARE_LIBRARY_SUCCESS, content.contentData.contentType, corRelationList, rollup);
          this.social.share('', '', '' + response.exportedFilePath, url);
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast('SHARE_CONTENT_FAILED');
        });
    } else {
      await loader.dismiss();
      this.generateShareInteractEvents(InteractType.OTHER,
        InteractSubtype.SHARE_LIBRARY_SUCCESS,
        content.contentData.contentType, corRelationList, rollup);
      this.social.share(null, null, null, url);
    }
  }

  generateShareInteractEvents(interactType, subType, contentType, corRelationList, rollup) {
    const values = new Map();
    values['ContentType'] = contentType;
    this.telemetryGeneratorService.generateInteractTelemetry(interactType,
      subType,
      Environment.HOME,
      this.getPageId(contentType),
      undefined,
      values,
      rollup,
      corRelationList);
  }

  private getPageId(contentType): string {
    let pageId = PageId.CONTENT_DETAIL;
    switch (contentType) {
      case ContentType.COURSE:
        pageId = PageId.COURSE_DETAIL;
        break;
      case ContentType.TEXTBOOK:
        pageId = PageId.COLLECTION_DETAIL;
        break;
      case ContentType.COLLECTION:
        pageId = PageId.COLLECTION_DETAIL;
        break;
    }
    return pageId;
  }
}
