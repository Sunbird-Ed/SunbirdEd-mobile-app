import { UserReportComponent } from './../user-report/user-report.component';
import { GroupReportListComponent } from './../group-report-list/group-report-list.component';
import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { LearnerAssessmentSummary, ReportSummary, SummarizerService, SummaryRequest, TelemetryObject } from 'sunbird-sdk';
import {
  TelemetryGeneratorService,
  AppHeaderService,
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
  CommonUtilService
} from '@app/services';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
})
export class ReportListComponent implements OnInit {

  isFromUsers: boolean;
  isFromGroups: boolean;
  uids: Array<string>;
  listOfUsers;
  listOfReports: Array<LearnerAssessmentSummary> = [];
  groupInfo: any;
  handle: string;
  assessment: {};
  reportSummary: ReportSummary;
  navData: any;
  backButtonFunc: Subscription;

  constructor(
    private loading: LoadingController,
    @Inject('SUMMARIZER_SERVICE') public summarizerService: SummarizerService,
    public ngZone: NgZone,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private location: Location
  ) {
    this.getNavData();
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.isFromUsers = extrasState.isFromUsers;
      this.isFromGroups = extrasState.isFromGroups;
      this.uids = extrasState.uids;
      this.handle = extrasState.handle;
      this.groupInfo = extrasState.group;
    }
  }

  getNavData() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navData = navigation.extras.state;
    }
  }
  ionViewWillEnter() {
    this.handleDeviceBackButton();

  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.location.back();
    });
  }

  ionViewWillLeave() {
    this.backButtonFunc.unsubscribe();
  }

  async ngOnInit() {
    this.headerService.hideHeader();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.REPORTS_ASSESMENT_CONTENT_LIST,
      Environment.USER
    );
    const loader = await this.commonUtilService.getLoader();
    await loader.present();

    const summaryRequest: SummaryRequest = {
      qId: '',
      uids: this.uids,
      contentId: '',
      hierarchyData: null,
    };
    this.summarizerService.getSummary(summaryRequest).toPromise()
      .then((list: LearnerAssessmentSummary[]) => {
        this.ngZone.run(async () => {
          await loader.dismiss();
          this.listOfReports = list;
        });
      })
      .catch(async err => {
        console.log('get summary error :', err);
        await loader.dismiss();
      });

  }

  formatTime(time: number): string {
    const mm = Math.floor(time / 60);
    const ss = Math.floor(time % 60);
    return (mm > 9 ? mm : ('0' + mm))
      + ':' + (ss > 9 ? ss : ('0' + ss));
  }


  goToGroupReportsList(report: ReportSummary) {
    const telemetryObject = new TelemetryObject(report.contentId, ObjectType.CONTENT, undefined);

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.USER,
      PageId.REPORTS_ASSESMENT_CONTENT_LIST,
      telemetryObject
    );
    if (this.isFromUsers) {
      const navigationExtras: NavigationExtras = { state: { report: report, handle: this.handle } };
      this.router.navigate([`/${RouterLinks.REPORTS}/${RouterLinks.USER_REPORT}`], navigationExtras);
    } else
      if (this.isFromGroups) {
        const uids = this.navData.uids;
        const users = this.navData.users;

        this.router.navigate([`${RouterLinks.REPORTS}/${RouterLinks.GROUP_REPORT}`], {
          state: {
            report: report,
            uids: uids,
            users: users,
            group: this.groupInfo
            }
        });
      }
  }


}
