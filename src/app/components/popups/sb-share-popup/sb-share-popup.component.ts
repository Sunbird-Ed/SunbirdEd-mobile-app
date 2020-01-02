import { UtilityService } from '@app/services/utility-service';
import { CommonUtilService } from '@app/services/common-util.service';
import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { Events, Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ContentShareHandlerService } from '@app/services';
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { ShareUrl } from '../../../../app/app.constant';

@Component({
  selector: 'app-sb-share-popup',
  templateUrl: './sb-share-popup.component.html',
  styleUrls: ['./sb-share-popup.component.scss'],
})
export class SbSharePopupComponent implements OnInit, OnDestroy {

  @Input() contentDetail: any;
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

  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private contentShareHandler: ContentShareHandlerService,
    private commonUtilService: CommonUtilService,
    private utilityService: UtilityService) { }

  async ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.shareType = this.shareOptions.link.value;
    
    if (this.contentDetail.hierarchyInfo && this.contentDetail.hierarchyInfo.length > 0) {
      const contentDetailRequest: ContentDetailRequest = {
        contentId: this.contentDetail.hierarchyInfo[0].identifier,
        attachFeedback: false,
        attachContentAccess: false,
        emitUpdateIfAny: false
      };
      await this.contentService.getContentDetails(contentDetailRequest).toPromise()
        .then((contentDetail: Content) => {
          this.contentDetail = contentDetail;
        });
    }
    const baseUrl = await this.utilityService.getBuildConfigValue('BASE_URL');
    this.shareUrl = baseUrl + ShareUrl.CONTENT + this.contentDetail.identifier;
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }

  shareLink() {
    const shareParams = {
      byLink: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.contentDetail, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }

  shareFile() {
    const shareParams = {
      byFile: true,
      link: this.shareUrl
    };
    this.contentShareHandler.shareContent(shareParams, this.contentDetail, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }

  saveFile() {
    const shareParams = {
      saveFile: true,
    };
    this.contentShareHandler.shareContent(shareParams, this.contentDetail, this.corRelationList, this.objRollup);
    this.popoverCtrl.dismiss();
  }


}
