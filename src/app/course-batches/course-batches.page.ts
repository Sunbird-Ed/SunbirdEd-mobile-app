import { PreferenceKey } from '@app/app/app.constant';
import { LoginHandlerService } from './../../services/login-handler.service';
import { TelemetryGeneratorService } from './../../services/telemetry-generator.service';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import {
  Batch, SharedPreferences,
  Rollup, CorrelationData, TelemetryObject
} from 'sunbird-sdk';
import {
  Events, Platform, PopoverController
} from '@ionic/angular';
import { EventTopics } from '../../app/app.constant';
import { CommonUtilService } from '../../services/common-util.service';
import {
  InteractType, InteractSubtype,
  Environment, PageId, ImpressionType
} from '../../services/telemetry-constants';
import { AppHeaderService } from '../../services/app-header.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SbPopoverComponent } from '../components/popups';
import { LocalCourseService } from '@app/services/local-course.service';
import { EnrollCourse } from '../enrolled-course-details-page/course.interface';
import { AppGlobalService } from '@app/services';

@Component({
  selector: 'app-course-batches',
  templateUrl: './course-batches.page.html',
  styleUrls: ['./course-batches.page.scss'],
})
export class CourseBatchesPage implements OnInit {

  public upcommingBatches: Array<Batch> = [];
  public ongoingBatches: Array<Batch> = [];
  public todayDate: any;

  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };

  private course: any;
  private userId: string;
  private isGuestUser = false;
  private backButtonFunc: Subscription;
  private objRollup: Rollup;
  private corRelationList: Array<CorrelationData>;
  private telemetryObject: TelemetryObject;

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
    private localCourseService: LocalCourseService
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

    if (!this.isGuestUser) {
      this.getBatchesByCourseId();
    }
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

  private getBatchesByCourseId(): void {
    this.ongoingBatches = this.ongoingBatches;
    this.upcommingBatches = this.upcommingBatches;
    this.objRollup = this.objRollup;
    this.corRelationList = this.corRelationList;
    this.telemetryObject = this.telemetryObject;
  }

  async enrollIntoBatch(batch: Batch) {
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
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch,
        pageId: PageId.COURSE_BATCHES,
        courseId: undefined,
        telemetryObject: this.telemetryObject,
        objRollup: this.objRollup,
        corRelationList: this.corRelationList
      };

      this.localCourseService.enrollIntoBatch(enrollCourse).toPromise()
        .then((data: boolean) => {
          this.zone.run(async () => {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
            this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
              batchId: batch.id,
              courseId: batch.courseId
            });
            await loader.dismiss();
            this.location.back();
          });
        }, async (error) => {
          await loader.dismiss();
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

}
