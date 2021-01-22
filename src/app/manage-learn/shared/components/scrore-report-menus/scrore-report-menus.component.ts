import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { NavParams, NavController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-scrore-report-menus',
  templateUrl: './scrore-report-menus.component.html',
  styleUrls: ['./scrore-report-menus.component.scss'],
})
export class ScroreReportMenusComponent implements OnInit {
  submission;
  entity;
  navigateToobservationReport: boolean = false;
  showEntityActionsheet;
  showActionsheet;
  submissionList;
  showSubmissionAction;
  observationDetail;
  observationId;
  observationReport;
  entityType: any;
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    // public viewCtrl: ViewController,
    // public appCtrl: App,
    public router: Router,
    private popover: PopoverController
  ) {
    this.submission = this.navParams.get('submission');
    this.entity = this.navParams.get('entityId');
    this.observationId = this.navParams.get('observationId');
    this.observationReport = this.navParams.get('observationReport');
    this.navigateToobservationReport = this.navParams.get('navigateToobservationReport');
    this.observationDetail = this.navParams.get('observationDetail');

    this.entityType = this.navParams.get('entityType');
  }

  ngOnInit() {}

  viewObservationReportsWithoutScore() {
    // const payload = {
    //   observationId: this.observationDetail.observationId,
    //   entityType: this.entityType,
    // };
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    //  this.appCtrl.getRootNav().push(ObservationReportsPage, payload);
    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        observationId: this.observationDetail.observationId,
        entityType: this.entityType,
      },
    });
  }

  viewObservationReportWithScore() {
    // const payload = {
    //   observationId: this.observationDetail.observationId,
    //   entityType: this.entityType,
    // };
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    // this.appCtrl.getRootNav().push("ReportsWithScorePage", payload);
    this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
      queryParams: {
        observationId: this.observationDetail.observationId,
        entityType: this.entityType,
      },
    });
  }

  actionsWithScore() {
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    this.showActionsheet = false;
    this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
      queryParams: {
        submissionId: this.submission._id || this.submission.submissionId,
        entityType: this.entityType,
      },
    });
    // this.appCtrl.getRootNav().push('ReportsWithScorePage', {
    //   //in place of _id getting submissionId in new
    //   //TODO:remove _id
    //   submissionId: this.submission._id || this.submission.submissionId,
    //   entityType: this.entityType,
    // });
  }
  actions() {
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    this.showActionsheet = false;
    // this.appCtrl.getRootNav().push(ObservationReportsPage, {
    //   //in place of _id getting submissionId in new
    //   //TODO:remove _id
    //   submissionId: this.submission._id || this.submission.submissionId,
    //   entityType: this.entityType,
    // });

    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        submissionId: this.submission._id || this.submission.submissionId,
        entityType: this.entityType,
      },
    });
  }

  viewEntityReportsWithScore() {
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    // const payload = {
    //   entityId: this.entity,
    //   observationId: this.observationId,
    //   entityType: this.entityType,
    // };
    // this.appCtrl.getRootNav().push("ReportsWithScorePage", payload);
    this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
      queryParams: {
        entityId: this.entity,
        observationId: this.observationId,
        entityType: this.entityType,
      },
    });
  }

  viewEntityReports() {
    // this.viewCtrl.dismiss();
    this.popover.dismiss();
    this.showEntityActionsheet = false;
    this.showActionsheet = false;
    // const payload = {
    //   entityId: this.entity,
    //   observationId: this.observationId,
    //   entityType: this.entityType,
    // };
    // this.appCtrl.getRootNav().push(ObservationReportsPage, payload);
    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        entityId: this.entity,
        observationId: this.observationId,
        entityType: this.entityType,
      },
    });
  }
  // navigate to score report
  public navigateToScoreReport() {
    if (this.entity) {
      this.viewEntityReportsWithScore();
    } else if (this.submission) {
      this.actionsWithScore();
    } else if (this.navigateToobservationReport && this.observationDetail) {
      this.viewObservationReportWithScore();
    }
  }
  // navigate to withou score report
  public navigateToWithoutScoreReport() {
    if (this.entity) {
      this.viewEntityReports();
    } else if (this.submission) {
      this.actions();
    } else if (this.observationDetail) {
      this.viewObservationReportsWithoutScore();
    }
  }
}
