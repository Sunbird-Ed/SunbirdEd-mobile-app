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
  navigateToobservationReport: boolean = false;
  showEntityActionsheet;
  showActionsheet;
  submissionList;
  showSubmissionAction;
  observationDetail;
  observationId;
  observationReport;
  entityType: any;
  entityId: any;
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public router: Router,
    private popover: PopoverController
  ) {
    this.submission = this.navParams.get('submission');
    this.entityId = this.navParams.get('entityId');
    this.observationId = this.navParams.get('observationId');
    this.observationReport = this.navParams.get('observationReport');
    this.navigateToobservationReport = this.navParams.get('navigateToobservationReport');
    this.observationDetail = this.navParams.get('observationDetail');
    this.entityType = this.navParams.get('entityType');
  }

  ngOnInit() {}

  viewObservationReportsWithoutScore() {
    this.popover.dismiss();
    this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        observationId: this.observationDetail.observationId,
        entityType: this.entityType,
      },
    });
  }

  viewObservationReportWithScore() {
    this.popover.dismiss();
    this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
      queryParams: {
        observationId: this.observationDetail.observationId,
        entityType: this.entityType,
      },
    });
  }

  submissionReportWithScore() {
    this.popover.dismiss();
    this.showActionsheet = false;
    // this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
    //   queryParams: {
    //     submissionId: this.submission._id || this.submission.submissionId,
    //     entityType: this.entityType,
    //   },
    // });
    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        scores: true,
        observation: true,
        criteriaWise: false,
        pdf: false,
        submissionId: this.submission._id,
        entityType: this.entityType,
        filter: { questionId: [] },
      },
    });
  }
  submissionReport() {
    this.popover.dismiss();
    this.showActionsheet = false;
    // this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
    //   queryParams: {
    //     submissionId: this.submission._id || this.submission.submissionId,
    //     entityType: this.entityType,
    //   },
    // });

    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        // scores: true,
        // observation: true,
        // pdf: false,
        // entityId: this.submission.entityId,
        // entityType: this.submission.entityType,
        // observationId: this.submission.observationId,
        scores: false,
        observation: true,
        criteriaWise: false,
        pdf: false,
        submissionId: this.submission._id,
        entityType: this.entityType,

        filter: { questionId: [] },
      },
    });
  }

  viewEntityReportsWithScore() {
    this.popover.dismiss();
    // this.router.navigate([RouterLinks.REPORT_WITH_SCORE], {
    //   queryParams: {
    //     entityId: this.entityId,
    //     observationId: this.observationId,
    //     entityType: this.entityType,
    //   },
    // });

    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        scores: true,
        observation: true,
        criteriaWise: false,
        pdf: false,
        entityId: this.entityId,
        entityType: this.entityType,
        observationId: this.observationId,
        filter: { questionId: [] },
      },
    });
  }

  viewEntityReports() {
    this.popover.dismiss();
    this.showEntityActionsheet = false;
    this.showActionsheet = false;
    /*  this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
      queryParams: {
        entityId: this.entity,
        observationId: this.observationId,
        entityType: this.entityType,
      },
    }); */

    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: {
        // entityId: this.entity,
        // observationId: this.observationId,
        // entityType: this.entityType,
        scores: false,
        observation: true,
        criteriaWise: false,
        pdf: false,
        entityId: this.entityId,
        entityType: this.entityType,
        observationId: this.observationId,
        filter: { questionId: [] },
      },
    });
  }
  // navigate to score report
  public navigateToScoreReport() {
    if (this.entityId) {
      this.viewEntityReportsWithScore();
    } else if (this.submission) {
      this.submissionReportWithScore();
    } else if (this.navigateToobservationReport && this.observationDetail) {
      this.viewObservationReportWithScore();
    }
  }
  // navigate to without score report
  public navigateToWithoutScoreReport() {
    if (this.entityId) {
      this.viewEntityReports();
    } else if (this.submission) {
      this.submissionReport();
    } else if (this.observationDetail) {
      this.viewObservationReportsWithoutScore();
    }
  }
}
