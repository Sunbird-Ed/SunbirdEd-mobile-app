import { Injectable, Inject } from '@angular/core';
import {
  ContentService, StorageService, ContentExportRequest, ContentExportResponse,
  Content, Rollup, CorrelationData, ContentDetailRequest, TelemetryObject, DeviceInfo,
} from 'sunbird-sdk';
import { CommonUtilService } from '../common-util.service';
import { InteractSubtype, InteractType, Environment, PageId } from '../telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { ShareUrl, ContentType } from '../../app/app.constant';
import { UtilityService } from '../utility-service';
import { ContentUtil } from '@app/util/content-util';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Injectable({
  providedIn: 'root'
})

export class ContentShareHandlerService {
  public telemetryObject: TelemetryObject;
  appName: string;
  shareUrl: string;
  shareUTMUrl: string;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private commonUtilService: CommonUtilService,
    private social: SocialSharing,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion) {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  public async shareContent(shareParams: any, content: Content, corRelationList?: CorrelationData[], rollup?: Rollup) {
    this.telemetryObject = ContentUtil.getTelemetryObject(content);
    this.generateShareInteractEvents(InteractType.TOUCH,
      InteractSubtype.SHARE_CONTENT_INITIATED,
      content.contentData.contentType, corRelationList, rollup);
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
    let exportContentRequest: ContentExportRequest;
    if (shareParams && shareParams.byFile) {
      exportContentRequest = {
        contentIds: [content.identifier],
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath()
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup);
    } else if (shareParams && shareParams.byLink && shareParams.link) {
      this.generateShareInteractEvents(InteractType.OTHER,
        InteractSubtype.SHARE_CONTENT_SUCCESS,
        content.contentData.contentType, corRelationList, rollup);
      let shareLink = 'See \'' + content.contentData.name + '\' on ' + this.appName + '\n' + this.getContentUtm(shareParams.link, content);
      shareLink = '\n' + shareLink +
        `\n\n${this.commonUtilService.translateMessage('TRY_CONTENT_ON')}` + '\n' + await this.getPackageNameWithUTM(true);
      this.social.share(null, null, null, shareLink);
    } else if (shareParams && shareParams.saveFile) {
      exportContentRequest = {
        contentIds: [content.identifier],
        destinationFolder: cordova.file.externalRootDirectory + 'Download/',
        saveLocally: true
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup);
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
          let shareLink = this.appName + ': \'' + content.contentData.name + '\'' + '\n';
          shareLink = '\n' + shareLink +
            `\n\n${this.commonUtilService.translateMessage('TRY_CONTENT_ON')}` + '\n' + await this.getPackageNameWithUTM(true);
          this.social.share(shareLink, '', '' + response.exportedFilePath, '');
        }
        this.generateShareInteractEvents(InteractType.OTHER,
          InteractSubtype.SHARE_CONTENT_SUCCESS, content.contentData.contentType, corRelationList, rollup);
      }).catch(async (err) => {
        await loader.dismiss();
        this.commonUtilService.showToast('SHARE_CONTENT_FAILED');
      });
  }

  async getPackageNameWithUTM(utm: boolean): Promise<string> {
    const pkg = await this.appVersion.getPackageName();
    if (utm) {
      const utmParams = `&referrer=utm_source%3D${this.deviceInfo.getDeviceID()}%26utm_campaign%3Dshare_app`;
      const shareUTMUrl = `https://play.google.com/store/apps/details?id=${pkg}${utmParams}`;
      return shareUTMUrl;
    } else {
      return `https://play.google.com/store/apps/details?id=${pkg}&hl=en_IN`;
    }
  }

  getContentUtm(contentLink: string, content: Content): string {
    const contentUTM =
      `referrer=utm_source%3D${this.appName.toLocaleLowerCase()}_mobile%26utm_content%3D${content.identifier}%26utm_campaign%3Dshare_content`;
    return contentLink + '?' + contentUTM;
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
