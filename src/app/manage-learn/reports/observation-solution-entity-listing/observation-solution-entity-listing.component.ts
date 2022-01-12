import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ToastService } from '../../core';

@Component({
  selector: 'app-observation-solution-entity-listing',
  templateUrl: './observation-solution-entity-listing.component.html',
  styleUrls: ['./observation-solution-entity-listing.component.scss'],
})
export class ObservationSolutionEntityListingComponent {
  solutionDetails;

  constructor(private router: Router, private toast: ToastService) {
    console.log(this.router.getCurrentNavigation().extras.state);
    this.solutionDetails = this.router.getCurrentNavigation().extras.state;
  }


  goToReports(entity) {

    let state = {
      scores: false,
      observation: true,
      entityId: entity._id,
      entityType: this.solutionDetails.entityType,
      observationId: this.solutionDetails.observationId,
    };
    if (this.solutionDetails.isRubricDriven) {
      state.scores = true;
    }
    if (!this.solutionDetails.criteriaLevelReport) {
      state['filter'] = { questionId: [] };
      state['criteriaWise'] = false;
    }
    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: state,
    });
  }
}
