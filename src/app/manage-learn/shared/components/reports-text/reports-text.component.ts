import { Component, Input, OnInit } from '@angular/core';
import { SurveyProviderService } from '@app/app/manage-learn/core/services/survey-provider.service';

@Component({
  selector: 'reports-text',
  templateUrl: './reports-text.component.html',
  styleUrls: ['./reports-text.component.scss'],
})
export class ReportsTextComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  @Input() isFeedBackSurvey;
  @Input() solutionId;
  completedDate: any; // for pagination purpose in survey answers if more then 10 ans
  constructor(private surveyProvider:SurveyProviderService) {}

  ngOnInit() {
    this.completedDate = this.data.completedDate;
  }

  getAllResponse() {
    let questionExternalId = this.data.order;
    let completedDate = this.completedDate;
    let solutionId = this.solutionId;
    let Obj = { questionExternalId, completedDate, solutionId };
    this.surveyProvider
      .viewAllAns(Obj)
      .then((res: any) => {
        this.data.answers = [...this.data.answers, ...res.answers];
        this.completedDate = res.completedDate ? res.completedDate : this.completedDate;
      })
      .catch();
  }
}
