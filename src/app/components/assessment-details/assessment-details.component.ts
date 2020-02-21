import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation, OnDestroy, NgZone } from '@angular/core';
import { TelemetryObject, ReportSummary } from 'sunbird-sdk';
import { PopoverController, Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { PageId, InteractSubtype, ObjectType, InteractType, Environment } from '@app/services/telemetry-constants';
import { RouterLinks } from '@app/app/app.constant';
import { NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-assessment-details',
  templateUrl: './assessment-details.component.html',
  styleUrls: ['./assessment-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssessmentDetailsComponent implements OnInit, OnDestroy {

  backButtonFunc: Subscription;

  constructor(
    public popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private platform: Platform,
    private location: Location,
    private zone: NgZone,
  ) {
    this.showResult = true;
  }

  showResult: boolean;
  sortProps =  {
    key: 'index',
    type: 'asc'
  };
  @Input() assessmentData: any;
  @Input() columns: any;
  @Output() showQuestionFromUser = new EventEmitter<string>();

  ngOnInit() {
    if (this.assessmentData && typeof (this.assessmentData['showResult']) === typeof (true)) {
      this.showResult = this.assessmentData['showResult'];
    }
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async onActivate(event, showPopup, callback, report?) {
    let subType: string;
    let pageId: string;
    let telemetryObject: TelemetryObject;
    if (this.assessmentData && this.assessmentData.fromUser) {
      pageId = PageId.REPORTS_USER_ASSESMENT_DETAILS;
      subType = InteractSubtype.QUESTION_CLICKED;

      telemetryObject = new TelemetryObject(report.qid ? report.qid : '', ObjectType.QUESTION, undefined);

    } else if (this.assessmentData && this.assessmentData.fromGroup) {
      pageId = PageId.REPORTS_GROUP_ASSESMENT_DETAILS;
      const row = report;
      if (row.userName) {
        subType = InteractSubtype.USER_CLICKED;
        telemetryObject = new TelemetryObject(report.qid ? report.qid : '', ObjectType.USER, undefined);

        const reportSummaryRequest: Partial<ReportSummary> = {
          name: row.name,
          uid: row.uid,
          contentId: row.contentId,
          totalQuestionsScore: this.assessmentData.questionsScore
        };
        const navigationExtras: NavigationExtras = { state: { report: reportSummaryRequest } };
        this.router.navigate([`/${RouterLinks.REPORTS}/${RouterLinks.USER_REPORT}`], navigationExtras);

      } else if (row.qid) {
        subType = InteractSubtype.QUESTION_CLICKED;
        telemetryObject = new TelemetryObject(report.uid ? report.uid : '', ObjectType.QUESTION, undefined);
      }
    }

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      subType,
      Environment.USER,
      pageId,
      telemetryObject
    );
    if (showPopup && callback) {
      const popover = await this.popoverCtrl.create({
        component: callback,
        componentProps: { callback: report },
        cssClass: 'report-alert'
      });
      await popover.present();
    } else {
      this.showQuestionFromUser.emit();
    }
  }

  onSortChange(prop) {
    if (this.sortProps.key === prop) {
      switch (this.sortProps.type) {
        case 'asc': {
          this.sortProps.type = 'desc';
          break;
        }
        case 'desc': {
          this.sortProps.type = 'asc';
          break;
        }
        default: this.sortProps.type = 'asc';
      }
    } else {
      this.sortProps = {
        key : prop,
        type: 'asc'
      };
    }
  }
}
