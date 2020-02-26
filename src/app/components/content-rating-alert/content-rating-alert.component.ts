import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import {
  Content,
  ContentFeedback,
  ContentFeedbackService,
  TelemetryLogRequest,
  TelemetryService,
  TelemetryObject,
  FormRequest,
  FormService,
  SharedPreferences,
  TelemetryFeedbackRequest
} from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ProfileConstants, PreferenceKey } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  LogLevel,
  LogType,
  ObjectType
} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';
import {Location} from '@angular/common';

@Component({
  selector: 'app-content-rating-alert',
  templateUrl: './content-rating-alert.component.html',
  styleUrls: ['./content-rating-alert.component.scss'],
})
export class ContentRatingAlertComponent implements OnInit {
  private readonly COMMENT_PREFIX = 'OTHER-';
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
  contentRatingOptions;
  ratingMetaInfo;
  ratingOptions;
  allComments;
  commentText;
  navigateBack;
  constructor(
    @Inject('CONTENT_FEEDBACK_SERVICE') private contentService: ContentFeedbackService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('FORM_SERVICE') private formService: FormService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private popOverCtrl: PopoverController,
    private platform: Platform,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private location: Location
  ) {
    this.getUserId();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.content = this.navParams.get('content');
    this.userRating = this.navParams.get('rating');
    this.allComments = this.navParams.get('comment');
    this.popupType = this.navParams.get('popupType');
    this.pageId = this.navParams.get('pageId');
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);
    this.navigateBack = this.navParams.get('navigateBack');
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
    this.invokeContentRatingFormApi();
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
    // this.showCommentBox = true;
    this.ratingCount = ratingCount;
    this.createRatingForm(ratingCount);
  }

  cancel() {
    // this.showCommentBox = false;
    this.popOverCtrl.dismiss();
  }
  closePopover() {
    // this.showCommentBox = false;
    this.popOverCtrl.dismiss();
  }

  submit() {
    let comment = '';
    this.ratingOptions.forEach(element => {
      if (element.key.toLowerCase() !== 'other' && element.isChecked) {
        comment += comment.length ? ',' + element.key :  element.key;
      }
    });
    if (this.commentText) {
      const text = 'OTHER,' + this.COMMENT_PREFIX + this.commentText;
      comment += comment.length ? ',' + text :  text;
    }
    this.allComments = comment;
    const option: ContentFeedback = {
      contentId: this.content.identifier,
      rating: this.ratingCount ? this.ratingCount : this.userRating,
      comments: this.allComments,
      contentVersion: this.content.contentData.pkgVersion
    };
    const paramsMap = new Map();
    paramsMap['Ratings'] = this.ratingCount ? this.ratingCount : this.userRating;
    paramsMap['Comment'] = this.allComments;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RATING_SUBMITTED,
      Environment.HOME,
      this.pageId, this.telemetryObject, paramsMap
    );
    this.generateContentRatingTelemetry(option);
    if (this.allComments) {
      this.generateContentFeedbackTelemetry(option);
    }
  }

  showMessage(msg) {
    this.commonUtilService.showToast(this.commonUtilService.translateMessage(msg));
  }

  createRatingForm(rating) {
    this.ratingMetaInfo =  { ratingText: this.contentRatingOptions[rating].ratingText,
                          ratingQuestion: this.contentRatingOptions[rating].question
                        };
    this.ratingOptions = this.contentRatingOptions[rating].options;
    this.ratingOptions.forEach(element => {
      element.isChecked = false;
    });
    this.commentText = '';
    this.showCommentBox = false;
  }

  ratingOptsChanged(key) {
    if (key.toLowerCase() === 'other') {
      this.showCommentBox = !this.showCommentBox;
    }
  }

  extractComments(comments) {
    const options = comments.split(',');
    options.forEach(e => {
      if (e.indexOf(this.COMMENT_PREFIX) !== -1) {
        this.commentText = e.substring(this.COMMENT_PREFIX.length);
      } else {
        const opt = this.ratingOptions.find((v) => e === v.key);
        if (opt) {
          opt.isChecked = true;
        }
      }
    });
  }

  async invokeContentRatingFormApi() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    const req: FormRequest = {
        type: 'contentfeedback',
        subType: selectedLanguage,
        action: 'get'
    };
    this.formService.getForm(req).toPromise()
      .then((res: any) => {
          const data = res.form ? res.form.data.fields : res.data.fields;
          if (res && data.length) {
              this.contentRatingOptions = data[0];
              this.createRatingForm(this.userRating);
              if (this.allComments) {
                this.extractComments(this.allComments);
              }
          }
      }).catch((error: any) => {
          this.getDefaultContentRatingFormApi();
      });
  }

  getDefaultContentRatingFormApi() {
    const req: FormRequest = {
      type: 'contentfeedback',
      subType: 'en',
      action: 'get'
    };
    this.formService.getForm(req).toPromise()
    .then((res: any) => {
        const data = res.form ? res.form.data.fields : res.data.fields;
        if (res && data.length) {
            this.contentRatingOptions = data[0];
            this.createRatingForm(this.userRating);
            if (this.allComments) {
              this.extractComments(this.allComments);
            }
        }
    }).catch((error: any) => {
    });
  }

  generateContentRatingTelemetry(option) {
    const viewDismissData = {
      rating: this.ratingCount ? this.ratingCount : this.userRating,
      comment: this.allComments ? this.allComments : '',
      message: ''
    };
    this.contentService.sendFeedback(option).subscribe((res) => {
      viewDismissData.message = 'rating.success';
      this.popOverCtrl.dismiss(viewDismissData);
      this.commonUtilService.showToast('THANK_FOR_RATING', false, 'green-toast');
      if (this.navigateBack) {
        this.location.back();
      }
    }, (data) => {
      viewDismissData.message = 'rating.error';
      this.popOverCtrl.dismiss(viewDismissData);
    });
  }

  generateContentFeedbackTelemetry(option1) {
    this.ratingOptions.forEach(opt => {
      const option: TelemetryFeedbackRequest = {
        objId: this.content.identifier,
        comments: this.allComments,
        env: Environment.HOME,
        objType: this.content.contentData.contentType,
        objVer: this.content.contentData.pkgVersion,
      };
      if (opt.isChecked) {
        if (opt.key.toLowerCase() === 'other') {
          option.commentid = opt.key;
          option.commenttxt = this.commentText;
        } else {
          option.commentid = opt.key;
          option.commenttxt = opt.value;
        }
        this.telemetryService.feedback(option).subscribe((res) => {
        }, (err) => {
        });
      }
    });
  }

}
