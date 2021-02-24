import { Injectable, Inject } from '@angular/core';
import {
  ContentService, StorageService, ContentExportRequest,
  ContentExportResponse, Content, Rollup,
  CorrelationData, TelemetryObject,
} from 'sunbird-sdk';
import { CommonUtilService } from '../common-util.service';
import { InteractSubtype, InteractType, Environment } from '../telemetry-constants';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TelemetryGeneratorService } from '../telemetry-generator.service';
import { ContentUtil } from '@app/util/content-util';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppGlobalService } from '../app-global-service.service';

@Injectable({
  providedIn: 'root'
})

export class ContentShareHandlerService {

  private telemetryObject: TelemetryObject;
  private appName: string;

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    private commonUtilService: CommonUtilService,
    private social: SocialSharing,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private appGlobalService: AppGlobalService) {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  public async shareContent(
    shareParams: any, content: Content, moduleId: string,
    subContentIds: Array<string>, corRelationList?: CorrelationData[], rollup?: Rollup, pageId?: string
  ) {
    this.telemetryObject = ContentUtil.getTelemetryObject(content);
    this.generateShareInteractEvents(InteractType.TOUCH,
      InteractSubtype.SHARE_CONTENT_INITIATED,
      this.getPrimaryCategory(content),
      corRelationList, rollup, pageId);

    let contentId;
    if (rollup && rollup.l1 && rollup.l1 !== content.identifier) {
      contentId = content.identifier;
      if (!(subContentIds && subContentIds.length > 0)) {
        subContentIds = [];
        subContentIds.push(contentId);
      }
    }

    let rootContentIdentifier = content.identifier;
    if (rollup && rollup.l1 && rollup.l1 !== content.identifier) {
      rootContentIdentifier = rollup.l1;
    }

    let exportContentRequest: ContentExportRequest;
    if (shareParams && shareParams.byFile) {
      exportContentRequest = {
        contentIds: [rootContentIdentifier],
        subContentIds,
        destinationFolder: this.storageService.getStorageDestinationDirectoryPath()
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup, pageId);
    } else if (shareParams && shareParams.byLink && shareParams.link) {
      this.generateShareInteractEvents(InteractType.OTHER,
        InteractSubtype.SHARE_CONTENT_SUCCESS,
        this.getPrimaryCategory(content), corRelationList, rollup, pageId);

      let contentLink = this.getContentUtm(shareParams.link);
      if (moduleId) {
        contentLink = contentLink + `&moduleId=${moduleId}`;
      }
      if (contentId && !moduleId) {
        contentLink = contentLink + `&contentId=${contentId}`;
      }
      const shareLink = this.commonUtilService.translateMessage('SHARE_CONTENT_LINK', {
        app_name: this.appName,
        content_name: content.contentData.name,
        content_link: contentLink,
        play_store_url: await this.getPackageNameWithUTM()
      });
      this.appGlobalService.isNativePopupVisible = true;
      this.social.share(null, null, null, shareLink);
      this.appGlobalService.setNativePopupVisible(false, 2000);
    } else if (shareParams && shareParams.saveFile) {
      exportContentRequest = {
        contentIds: [rootContentIdentifier],
        subContentIds,
        destinationFolder: cordova.file.externalRootDirectory + 'Download/',
        saveLocally: true
      };
      this.exportContent(exportContentRequest, shareParams, content, corRelationList, rollup, pageId);
    }
  }

  private async exportContent(
    exportContentRequest: ContentExportRequest, shareParams, content: Content,
    corRelationList?: CorrelationData[], rollup?: Rollup, pageId?: string
  ) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.contentService.exportContent(exportContentRequest).toPromise()
      .then(async (response: ContentExportResponse) => {
        await loader.dismiss();
        if (shareParams.saveFile) {
          this.commonUtilService.showToast('FILE_SAVED', '', 'green-toast');
        } else if (shareParams.byFile) {
          const shareLink = this.commonUtilService.translateMessage('SHARE_CONTENT_FILE', {
            app_name: this.appName,
            content_name: content.contentData.name,
            play_store_url: await this.getPackageNameWithUTM()
          });
          this.appGlobalService.isNativePopupVisible = true;
          this.social.share(shareLink, '', '' + response.exportedFilePath, '');
          this.appGlobalService.setNativePopupVisible(false, 2000);
        }
        this.generateShareInteractEvents(InteractType.OTHER,
          InteractSubtype.SHARE_CONTENT_SUCCESS, this.getPrimaryCategory(content), corRelationList, rollup, pageId);
      }).catch(async (err) => {
        console.error('ContentShareHandlerService - exportContent', err);

        await loader.dismiss();
        this.commonUtilService.showToast('SHARE_CONTENT_FAILED');
      });
  }

  private async getPackageNameWithUTM(): Promise<string> {
    const pkg = await this.appVersion.getPackageName();
    const utmParams = `&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app`;
    const shareUTMUrl = `https://play.google.com/store/apps/details?id=${pkg}${utmParams}`;
    return shareUTMUrl;
  }

  private getContentUtm(contentLink: string): string {
    const contentUTM = `referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content`;
    return contentLink + '?' + contentUTM;
  }

  private generateShareInteractEvents(interactType, subType, primaryCategory, corRelationList, rollup, pageId) {
    const values = new Map();
    values['category'] = primaryCategory;
    this.telemetryGeneratorService.generateInteractTelemetry(interactType,
      subType,
      Environment.HOME,
      pageId,
      this.telemetryObject,
      values,
      rollup,
      corRelationList);
  }

  private getPrimaryCategory(content: Content) {
    return content.contentData.primaryCategory ? content.contentData.primaryCategory : content.contentData.contentType;
  }
}
