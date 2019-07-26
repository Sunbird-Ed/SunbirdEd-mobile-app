import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { TelemetryObject, ReportSummary } from 'sunbird-sdk';
import { PopoverController } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { PageId, InteractSubtype, ObjectType, InteractType, Environment } from '@app/services/telemetry-constants';
import { RouterLinks } from '@app/app/app.constant';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-assessment-details',
  templateUrl: './assessment-details.component.html',
  styleUrls: ['./assessment-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssessmentDetailsComponent implements OnInit {

  constructor(
    public popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router
  ) {
    this.showResult = true;
  }

  showResult: boolean;
  @Input() assessmentData: any;
  @Input() columns: any;
  @Output() showQuestionFromUser = new EventEmitter<string>();

  ngOnInit() {
    if (this.assessmentData && typeof (this.assessmentData['showResult']) === typeof (true)) {
      this.showResult = this.assessmentData['showResult'];
    }
  }

  async onActivate(event, showPopup, callback) {
    let subType: string;
    let pageId: string;
    let telemetryObject: TelemetryObject;
    if (this.assessmentData && this.assessmentData.fromUser) {
      pageId = PageId.REPORTS_USER_ASSESMENT_DETAILS;
      subType = InteractSubtype.QUESTION_CLICKED;

      telemetryObject = new TelemetryObject(event.row.qid ? event.row.qid : '', ObjectType.QUESTION, undefined);

    } else if (this.assessmentData && this.assessmentData.fromGroup) {
      pageId = PageId.REPORTS_GROUP_ASSESMENT_DETAILS;
      const row = event.row;
      if (row.userName) {
        subType = InteractSubtype.USER_CLICKED;
        telemetryObject = new TelemetryObject(event.row.qid ? event.row.qid : '', ObjectType.USER, undefined);

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
        telemetryObject = new TelemetryObject(event.row.uid ? event.row.uid : '', ObjectType.QUESTION, undefined);
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
        componentProps: { callback: event },
        cssClass: 'resource-filter'
      });
      popover.present();
    } else {
      this.showQuestionFromUser.emit();
    }
  }
}
