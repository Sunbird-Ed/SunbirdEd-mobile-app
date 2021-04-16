import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-imp-suggestions',
  templateUrl: './imp-suggestions.page.html',
  styleUrls: ['./imp-suggestions.page.scss'],
})
export class ImpSuggestionsPage implements OnInit {

  criterias;
  solutionName: string;
  observationId: string;
  entityId: string;
  item;
  solutionId: string;

  constructor(private router: Router) {
    this.criterias = this.router.getCurrentNavigation().extras.state.data;
    this.solutionName = this.router.getCurrentNavigation().extras.state.solutionName;
    this.observationId = this.router.getCurrentNavigation().extras.state.observationId;
    this.entityId = this.router.getCurrentNavigation().extras.state.entityId;
    this.solutionId = this.router.getCurrentNavigation().extras.state.solutionId;
  }

  ngOnInit() {
  }

  goToTemplateDetails(criteria, project) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        viewOnlyMode: true,
        templateId: project.externalId
      },
      state: {
        "referenceFrom": "observation",
        "submissions": {
          "observationId": this.observationId,
          "entityId": this.entityId,
          "criteriaId": criteria.criteriaId,
          "score": criteria.level,
          "solutionId": this.solutionId
        }
      },
    });
  }

}
