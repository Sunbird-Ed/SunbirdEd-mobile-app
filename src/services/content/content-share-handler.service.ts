import { Injectable, Inject } from '@angular/core';
import {
  ContentService, StorageService, ContentExportRequest, ContentExportResponse,
  Content, Rollup, CorrelationData, ContentDetailRequest, TelemetryObject,
} from 'sunbird-sdk';
import { CommonUtilService } from '../common-util.service';
import { InteractSubtype, InteractType, Environment, PageId } from '../telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { ShareUrl, ContentType } from '../../app/app.constant';
import { UtilityService } from '../utility-service';
import { ContentUtil } from '@app/util/content-util';

@Injectable({
  providedIn: 'root'
})

export class ContentShareHandlerService {
  public telemetryObject: TelemetryObject;
  // enum shareParams = {
  //   byLink: boolean | undefined,
  //   link: string | undefined,
  //   byFile: boolean | undefined,
  //   saveFile: boolean | undefined
  // }
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private commonUtilService: CommonUtilService,
    private social: SocialSharing,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private utilityService: UtilityService) {
  }
  public async shareContent(shareParams: any, content: Content, corRelationList?: CorrelationData[], rollup?: Rollup) {
    this.telemetryObject = ContentUtil.getTelemetryObject(content);
    let exportContentRequest: ContentExportRequest;
    if (shareParams && shareParams.byFile) {
      exportContentRequest = {
        contentIds: [content.identifier],
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath()
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup);
    } else if (shareParams && shareParams.byLink && shareParams.link) {
      this.generateShareInteractEvents(InteractType.OTHER,
        InteractSubtype.SHARE_LIBRARY_SUCCESS,
        content.contentData.contentType, corRelationList, rollup);
      this.social.share(null, null, null, shareParams.link);
    } else if (shareParams && shareParams.saveFile) {
      exportContentRequest = {
        contentIds: [content.identifier],
        destinationFolder: cordova.file.externalRootDirectory + 'Download/',
        saveLocally: true
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup)
    }
  }

  async exportContent(
    exportContentRequest: ContentExportRequest, shareParams, content: Content, corRelationList?: CorrelationData[], rollup?: Rollup
  ) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.contentService.exportContent(exportContentRequest).toPromise()
        .then(async (response: ContentExportResponse) => {
          await loader.dismiss();
          if (shareParams.saveFile) {
            this.commonUtilService.showToast('FILE_SAVED', '', 'green-toast');
          } else if (shareParams.byFile) {
            this.social.share('', '', '' + response.exportedFilePath, shareParams.link);
          }
          this.generateShareInteractEvents(InteractType.OTHER,
            InteractSubtype.SHARE_LIBRARY_SUCCESS, content.contentData.contentType, corRelationList, rollup);
        }).catch(async (err) => {
          await loader.dismiss();
          this.commonUtilService.showToast('SHARE_CONTENT_FAILED');
        });
  }

  generateShareInteractEvents(interactType, subType, contentType, corRelationList, rollup) {
    const values = new Map();
    values['ContentType'] = contentType;
    this.telemetryGeneratorService.generateInteractTelemetry(interactType,
      subType,
      Environment.HOME,
      this.getPageId(contentType),
      this.telemetryObject,
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
