import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-imp-suggestions',
  templateUrl: './imp-suggestions.page.html',
  styleUrls: ['./imp-suggestions.page.scss'],
})
export class ImpSuggestionsPage {

  criterias;
  solutionName: string;
  observationId: string;
  entityId: string;
  item;
  solutionId: string;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
};

  constructor(private router: Router, private headerService: AppHeaderService) {
    this.criterias = this.router.getCurrentNavigation().extras.state.data;
    this.solutionName = this.router.getCurrentNavigation().extras.state.solutionName;
    this.observationId = this.router.getCurrentNavigation().extras.state.observationId;
    this.entityId = this.router.getCurrentNavigation().extras.state.entityId;
    this.solutionId = this.router.getCurrentNavigation().extras.state.solutionId;
  }



  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
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
