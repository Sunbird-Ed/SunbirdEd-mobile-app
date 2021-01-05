import { Component, Input, OnInit } from '@angular/core';

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
  constructor() {}

  ngOnInit() {
    this.completedDate = this.data.completedDate;
  }

  getAllResponse() {
    //TODO: complete after api integration
    // let questionExternalId = this.data.order;
    // let completedDate = this.completedDate;
    // let solutionId = this.solutionId;
    // let Obj = { questionExternalId, completedDate, solutionId };
    // this.surveyProvider
    //   .viewAllAns(Obj)
    //   .then((res: any) => {
    //     this.data.answers = [...this.data.answers, ...res.answers];
    //     this.completedDate = res.completedDate ? res.completedDate : this.completedDate;
    //   })
    //   .catch();
  }
}
