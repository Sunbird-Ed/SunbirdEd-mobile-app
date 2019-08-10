import { TelemetryGeneratorService } from './../../services/telemetry-generator.service';
import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { AuthService, Batch, CourseService, EnrollCourseRequest, OAuthSession } from 'sunbird-sdk';
import { Events, NavController, Platform } from '@ionic/angular';
import { EventTopics } from '../../app/app.constant';
import { CommonUtilService } from '../../services/common-util.service';
import { InteractType, InteractSubtype, Environment, PageId } from '../../services/telemetry-constants';
import { AppHeaderService } from '../../services/app-header.service';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

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
    private navCtrl: NavController,
    // private navParams: NavParams,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private location: Location,
    private router: Router,
    private platform: Platform
  ) {
    const extrasState  = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.ongoingBatches = extrasState.ongoingBatches;
      this.upcommingBatches = extrasState.upcommingBatches;
    } else {
      this.ongoingBatches = [];
      this.upcommingBatches = [];
    }
  }

  ngOnInit(): void {
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

  ionViewWillLeave() {
    if(this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    } 
  }
  /**
   * Enroll logged-user into selected batch
   *
   * @param {any} item contains details of select batch
   */
  async enrollIntoBatch(item: Batch) {
    const enrollCourseRequest: EnrollCourseRequest = {
      batchId: item.id,
      courseId: item.courseId,
      userId: this.userId,
      contentId: item.courseId,
      batchStatus: item.status
    };
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const reqvalues = new Map();
    reqvalues['enrollReq'] = enrollCourseRequest;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_BATCHES, undefined,
      reqvalues);

    this.courseService.enrollCourse(enrollCourseRequest).toPromise()
      .then((data: boolean) => {
        this.zone.run(async () => {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
          this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
            batchId: item.id,
            courseId: item.courseId
          });
          await loader.dismiss();
          // this.navCtrl.pop();
          this.location.back();

        });
      }, (error) => {
        this.zone.run(() => {
          if (error && error.code === 'NETWORK_ERROR') {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
          } else if (error && error.response
            && error.response.body && error.response.body.params && error.response.body.params.err === 'USER_ALREADY_ENROLLED_COURSE') {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
          }
        });
      });
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
    this.todayDate =  moment(new Date()).format('YYYY-MM-DD');
  }

  spinner(flag) {
    this.zone.run(() => {
      this.showLoader = false;
    });
  }
}
