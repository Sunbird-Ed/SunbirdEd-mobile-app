import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import {
  Content,
  ContentFeedback,
  ContentFeedbackService,
  TelemetryLogRequest,
  TelemetryService,
  TelemetryObject
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ProfileConstants } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  LogLevel,
  LogType
} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';
@Component({
  selector: 'app-content-rating-alert',
  templateUrl: './content-rating-alert.component.html',
  styleUrls: ['./content-rating-alert.component.scss'],
})
export class ContentRatingAlertComponent implements OnInit {
  isDisable = false;
  userId = '';
  comment = '';
  backButtonFunc = undefined;
  ratingCount: any;
  content: Content;
  showCommentBox = false;
  private pageId = '';
  userRating = 0;
  private popupType: string;
  telemetryObject: TelemetryObject;
  constructor(
    @Inject('CONTENT_FEEDBACK_SERVICE') private contentService: ContentFeedbackService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    private popOverCtrl: PopoverController,
    private platform: Platform,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService
  ) {
    this.getUserId();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.content = this.navParams.get('content');
    this.userRating = this.navParams.get('rating');
    this.comment = this.navParams.get('comment');
    this.popupType = this.navParams.get('popupType');
    this.pageId = this.navParams.get('pageId');
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
    if (this.userRating) {
      this.showCommentBox = true;
    }
  }

  ngOnInit() {
    // this.content = this.navParams.get('content');
  }

  ionViewWillEnter() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.RATING_POPUP,
      this.pageId,
      Environment.HOME, this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version
    );

    const log = new TelemetryLogRequest();
    log.level = LogLevel.INFO;
    log.message = this.pageId;
    log.env = Environment.HOME;
    log.type = LogType.NOTIFICATION;
    const params = new Array<any>();
    const paramsMap = new Map();
    paramsMap['PopupType'] = this.popupType;
    params.push(paramsMap);
    log.params = params;
    this.telemetryService.log(log).subscribe((val) => {
      console.log(val);
    }, err => {
      console.log(err);
    });
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  /**
   * Get user id
   */
  getUserId() {
    if (this.appGlobalService.getSessionData()) {
      this.userId = this.appGlobalService.getSessionData()[ProfileConstants.USER_TOKEN];
    } else {
      this.userId = '';
    }
  }

  rateContent(ratingCount) {
    this.showCommentBox = true;
    this.ratingCount = ratingCount;
  }

  cancel() {
    this.showCommentBox = false;
    this.popOverCtrl.dismiss();
  }
  closePopover() {
    this.showCommentBox = false;
    this.popOverCtrl.dismiss();
  }

  submit() {
    const option: ContentFeedback = {
      contentId: this.content.identifier,
      rating: this.ratingCount ? this.ratingCount : this.userRating,
      comments: this.comment,
      contentVersion: this.content['versionKey']
    };
    this.popOverCtrl.dismiss();
    const paramsMap = new Map();
    paramsMap['Ratings'] = this.ratingCount ? this.ratingCount : this.userRating;
    paramsMap['Comment'] = this.comment;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RATING_SUBMITTED,
      Environment.HOME,
      this.pageId, this.telemetryObject, paramsMap
    );

    const viewDismissData = {
      rating: this.ratingCount,
      comment: this.comment ? this.comment : '',
      message: ''
    };

    this.contentService.sendFeedback(option).subscribe((res) => {
      console.log('success:', res);
      viewDismissData.message = 'rating.success';
      viewDismissData.rating = this.ratingCount ? this.ratingCount : this.userRating;
      viewDismissData.comment = this.comment;
      this.popOverCtrl.dismiss(viewDismissData);
      this.commonUtilService.showToast('THANK_FOR_RATING');
    }, (data) => {
      console.log('error:', data);
      viewDismissData.message = 'rating.error';
      this.popOverCtrl.dismiss(viewDismissData);
    });
  }

  showMessage(msg) {
    this.commonUtilService.showToast(this.commonUtilService.translateMessage(msg));
  }
}
