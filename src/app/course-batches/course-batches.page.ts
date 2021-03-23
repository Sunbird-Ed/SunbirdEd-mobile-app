import { Location } from '@angular/common';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceKey } from '@app/app/app.constant';
import { CategoryKeyTranslator } from '@app/pipes/category-key-translator/category-key-translator-pipe';
import { AppGlobalService } from '@app/services';
import { ConsentPopoverActionsDelegate, LocalCourseService } from '@app/services/local-course.service';
import {
  Platform, PopoverController
} from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription } from 'rxjs';
import {
  Batch,
  CorrelationData, Rollup, SharedPreferences,
  TelemetryObject
} from 'sunbird-sdk';
import { EventTopics } from '../../app/app.constant';
import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import {
  Environment, ImpressionType, InteractSubtype, InteractType,
  PageId
} from '../../services/telemetry-constants';
import { SbPopoverComponent } from '../components/popups';
import { EnrollCourse } from '../enrolled-course-details-page/course.interface';
import { LoginHandlerService } from './../../services/login-handler.service';
import { TelemetryGeneratorService } from './../../services/telemetry-generator.service';

@Component({
  selector: 'app-course-batches',
  templateUrl: './course-batches.page.html',
  styleUrls: ['./course-batches.page.scss'],
})
export class CourseBatchesPage implements OnInit, ConsentPopoverActionsDelegate {

  public upcommingBatches: Array<Batch> = [];
  public ongoingBatches: Array<Batch> = [];
  public todayDate: any;

  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };

  public course: any;
  private userId: string;
  private isGuestUser = false;
  private backButtonFunc: Subscription;
  private objRollup: Rollup;
  private corRelationList: Array<CorrelationData>;
  private telemetryObject: TelemetryObject;
  loader?: HTMLIonLoadingElement;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appGlobalService: AppGlobalService,
    private popoverCtrl: PopoverController,
    private loginHandlerService: LoginHandlerService,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private location: Location,
    private router: Router,
    private platform: Platform,
    private localCourseService: LocalCourseService,
    private categoryKeyTranslator: CategoryKeyTranslator
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.ongoingBatches = extrasState.ongoingBatches;
      this.upcommingBatches = extrasState.upcommingBatches;
      this.course = extrasState.course;
      this.objRollup = extrasState.objRollup;
      this.corRelationList = extrasState.corRelationList;
      this.telemetryObject = extrasState.telemetryObject;
    } else {
      this.ongoingBatches = [];
      this.upcommingBatches = [];
    }
  }

  async ngOnInit() {
    this.todayDate = window.dayjs().format('YYYY-MM-DD');
    this.userId = await this.appGlobalService.getActiveProfileUid();
    this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  goBack() {
    this.location.back();
  }

  async enrollIntoBatch(batch: Batch) {
    if (!this.localCourseService.isEnrollable([batch], this.course)) {
      return false;
    }
    const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, batch);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_BATCHES, this.telemetryObject,
      this.localCourseService.prepareRequestValue(enrollCourseRequest),
      this.objRollup,
      this.corRelationList
    );

    if (this.isGuestUser) {
      this.joinTraining(batch);
    } else {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch,
        pageId: PageId.COURSE_BATCHES,
        courseId: this.course.identifier,
        telemetryObject: this.telemetryObject,
        objRollup: this.objRollup,
        corRelationList: this.corRelationList,
        channel: this.course.channel,
        userConsent: this.course.userConsent
      };

      this.localCourseService.enrollIntoBatch(enrollCourse, this).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            this.commonUtilService.showToast(this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_COURSE_ENROLLED', this.course));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: batch.id,
              courseId: batch.courseId
            });
            this.location.back();
          });
        }, async (error) => {
          await this.loader.dismiss();
        });
    }
  }

  private async joinTraining(batchDetails) {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
      '', PageId.SIGNIN_POPUP,
      Environment.HOME,
      this.telemetryObject.id,
      this.telemetryObject.type,
      this.telemetryObject.version,
      this.objRollup,
      this.corRelationList);
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL'),
        metaInfo: this.commonUtilService.translateMessage('TRAININGS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, JSON.stringify(batchDetails)).toPromise();
      this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, JSON.stringify(this.course)).toPromise();
      this.preferences.putString(PreferenceKey.CDATA_KEY, JSON.stringify(this.corRelationList)).toPromise();
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.LOGIN_CLICKED,
        Environment.HOME,
        PageId.SIGNIN_POPUP,
        this.telemetryObject,
        undefined,
        this.objRollup,
        this.corRelationList);
      this.loginHandlerService.signIn();
    }
  }

  onConsentPopoverShow() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = undefined;
    }
  }

  onConsentPopoverDismiss() {}

}
