import { UtilityService } from '@app/services/utility-service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform, PopoverController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ContentShareHandlerService, TelemetryGeneratorService } from '@app/services';
import {
  Environment,
  ImpressionType,
  ID,
  PageId,
} from '@app/services/telemetry-constants';
import { TelemetryObject } from 'sunbird-sdk';
import { ShareUrl, ShareMode, ContentType, MimeType } from '@app/app/app.constant';
import { ContentUtil } from '@app/util/content-util';

@Component({
  selector: 'app-sb-share-popup',
  templateUrl: './sb-share-popup.component.html',
  styleUrls: ['./sb-share-popup.component.scss'],
})
export class SbSharePopupComponent implements OnInit, OnDestroy {

  @Input() content: any;
  @Input() corRelationList: any;
  @Input() objRollup: any;
  backButtonFunc: Subscription;
  shareOptions = {
    link: {
      name: 'SHARE_LINK',
      value: 'link'
    },
    file: {
      name: 'SEND_FILE',
      value: 'file'
    },
    save: {
      name: 'SAVE_FILE_ON_DEVICE',
      value: 'save'
    }
  };
  shareType: string;
  shareUrl: string;
  shareItemType: string;
  pageId: string;
  telemetryObject: TelemetryObject;

  constructor(
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private contentShareHandler: ContentShareHandlerService,
    private utilityService: UtilityService,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService) {
    this.content = this.navParams.get('content');
    this.corRelationList = this.navParams.get('corRelationList');
    this.objRollup = this.navParams.get('objRollup');
    this.shareItemType = this.navParams.get('shareItemType');
    this.pageId = this.navParams.get('pageId');
  }

  async ngOnInit() {
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
    this.generateShareClickTelemetry();
    this.generateImpressionTelemetry();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    const baseUrl = await this.utilityService.getBuildConfigValue('BASE_URL');
    this.shareUrl = baseUrl + this.getContentEndPoint(this.content) + this.content.identifier;
  }

  getContentEndPoint(content) {
    let endPoint = '';
    if (content.contentType.toLowerCase() === ContentType.COURSE.toLowerCase()) {
      endPoint = ShareUrl.COURSE;
    } else if (content.mimeType === MimeType.COLLECTION) {
      endPoint = ShareUrl.COLLECTION;
    } else {
      endPoint = ShareUrl.CONTENT;
    }
    return endPoint;
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.SHARE_CONTENT_POPUP,
      Environment.HOME,
      this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version,
      this.objRollup,
      this.corRelationList);
  }

  generateShareClickTelemetry() {
    this.telemetryGeneratorService.generateInteractTelemetry(this.shareItemType,
      '',
      Environment.HOME,
      this.pageId,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList,
      ID.SHARE);
  }

  generateConfirmClickTelemetry(shareMode) {
    this.telemetryGeneratorService.generateInteractTelemetry(shareMode,
      '',
      Environment.HOME,
      PageId.SHARE_CONTENT_POPUP,
      ContentUtil.getTelemetryObject(this.content),
      undefined,
      this.objRollup,
      this.corRelationList,
      ID.SHARE_CONFIRM);
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  shareLink() {
    this.generateConfirmClickTelemetry(ShareMode.SHARE);
    const shareParams = {
      byLink: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }

  shareFile() {
    this.generateConfirmClickTelemetry(ShareMode.SEND);
    const shareParams = {
      byFile: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }

  saveFile() {
    this.generateConfirmClickTelemetry(ShareMode.SAVE);
    const shareParams = {
      saveFile: true,
    };
    this.contentShareHandler.shareContent(shareParams, this.content, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }
}
