import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../app/app.constant';
import { AppHeaderService } from '../../../services/app-header.service';
import { ProjectService } from '../core';

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

  constructor(private router: Router, private headerService: AppHeaderService ,private projectService : ProjectService) {
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

async goToTemplateDetails(criteria, project) {
  let resp = await this.projectService.getTemplateByExternalId(project.externalId);
   resp?.result?.projectId ? 
     this.gotoDetailsPage(resp?.result) :
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.PROJECT_TEMPLATE}`,project.externalId], {
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
  gotoDetailsPage(project) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: project.projectId,
        programId: project.programId ? project.programId : project.programInformation.programId,
        solutionId: this.solutionId,
        hasAcceptedTAndC: project.hasAcceptedTAndC,
      }
    });
  }

}
