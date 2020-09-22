import { PreferenceKey } from '@app/app/app.constant';
import { LoginHandlerService } from './../../services/login-handler.service';
import { TelemetryGeneratorService } from './../../services/telemetry-generator.service';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { AuthService, Batch, CourseService, EnrollCourseRequest, OAuthSession, SharedPreferences,
   Rollup, CorrelationData, TelemetryObject } from 'sunbird-sdk';
import { Events, NavController, Platform, PopoverController } from '@ionic/angular';
import { EventTopics } from '../../app/app.constant';
import { CommonUtilService } from '../../services/common-util.service';
import { InteractType, InteractSubtype, Environment, PageId, ImpressionType } from '../../services/telemetry-constants';
import { AppHeaderService } from '../../services/app-header.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SbPopoverComponent } from '../components/popups';
import { LocalCourseService } from '@app/services/local-course.service';
import { EnrollCourse } from '../enrolled-course-details-page/course.interface';

@Component({
  selector: 'app-course-batches',
  templateUrl: './course-batches.page.html',
  styleUrls: ['./course-batches.page.scss'],
})
export class CourseBatchesPage implements OnInit {

  /**
   * Contains user id
   */
  public userId: string;

  /**
   * To hold course indentifier
   */
  public identifier: string;

  /**
   * Loader
   */
  public showLoader: boolean;

  /**
   * Contains upcomming batches list
   */
  public upcommingBatches: Array<Batch> = [];

  /**
   * Contains ongoing batches list
   */
  public ongoingBatches: Array<Batch> = [];

  /**
   * Flag to check guest user
   */
  public isGuestUser = false;

  private backButtonFunc: Subscription;
  /**
   * Contains batches list
   */
  public batches: Array<Batch> = [];

  public todayDate: any;
  /**
   * Selected filter
   */
  public selectedFilter: string;
  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };
  public showSignInCard = false;
  course: any;

  public objRollup: Rollup;
  public corRelationList: Array<CorrelationData>;
  public telemetryObject: TelemetryObject;

  /**
   * Default method of class CourseBatchesComponent
   *
   * @param {CourseService} courseService To get batches list
   * @param {NavController} navCtrl To redirect form one page to another
   * @param {NavParams} navParams To get url params
   * @param {NgZone} zone To bind data
   * @param {AuthService} authService To get logged-in user data
   */
  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private popoverCtrl: PopoverController,
    private loginHandlerService: LoginHandlerService,
    private navCtrl: NavController,
    // private navParams: NavParams,
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
    const extrasState  = this.router.getCurrentNavigation().extras.state;
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

  ngOnInit(): void {
    this.todayDate =  window.dayjs().format('YYYY-MM-DD');
    this.getUserId();
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  private handleBackButton() {
    this.backButtonFunc =  this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  goBack() {
    this.location.back();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
  /**
   * Enroll logged-user into selected batch
   *
   * @param {any} batch contains details of select batch
   */

  async enrollIntoBatch(batch: Batch) {
    if (!this.localCourseService.isEnrollable([batch])) {
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
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const enrollCourse: EnrollCourse = {
        userId: this.userId,
        batch: batch,
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

  async joinTraining(batchDetails) {
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
  /**
   * Get logged-user id. User id is needed to enroll user into batch.
   */
  getUserId(): void {
    this.authService.getSession().subscribe((session: OAuthSession) => {
      if (!session) {
        this.zone.run(() => {
          this.isGuestUser = true;
        });
      } else {
        this.zone.run(() => {
          this.isGuestUser = false;
          this.userId = session.userToken;
          this.getBatchesByCourseId();
        });
      }
    }, () => {
    });
  }


  /**
   * To get batches, passed from enrolled-course-details page via navParams
   */
  getBatchesByCourseId(): void {
    this.ongoingBatches = this.ongoingBatches;
    this.upcommingBatches = this.upcommingBatches;
    this.objRollup = this.objRollup;
    this.corRelationList = this.corRelationList;
    this.telemetryObject = this.telemetryObject;
  }

  spinner(flag) {
    this.zone.run(() => {
      this.showLoader = false;
    });
  }
}
