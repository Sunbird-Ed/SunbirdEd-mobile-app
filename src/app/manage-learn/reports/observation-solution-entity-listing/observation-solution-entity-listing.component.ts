import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ToastService } from '../../core';

@Component({
  selector: 'app-observation-solution-entity-listing',
  templateUrl: './observation-solution-entity-listing.component.html',
  styleUrls: ['./observation-solution-entity-listing.component.scss'],
})
export class ObservationSolutionEntityListingComponent implements OnInit {

  solutionDetails;

  constructor(
    private router: Router,
    private toast: ToastService
  ) {
    console.log(this.router.getCurrentNavigation().extras.state);
    this.solutionDetails = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() { }

  goToReports(entity) {
    // if (!this.solutionDetails.scoringSystem || this.solutionDetails.scoringSystem === 'pointBasedScoring') {
    if (this.solutionDetails.scoringSystem === 'pointBasedScoring' || !this.solutionDetails.isRubricDriven) {
      const queryParams = {
        queryParams: {
          observationId: this.solutionDetails.observationId,
          solutionId: this.solutionDetails.solutionId,
          programId: this.solutionDetails.programId,
          entityId: entity._id,
          entityName: entity.name
        }
      }
      this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], queryParams);

    } else {
      // this.toast.openToast("coming soon")
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          scores: true,
          observation: true,
          pdf: false,
          entityId: entity._id,
          entityType: this.solutionDetails.entityType,
          observationId: this.solutionDetails.observationId,
        },
      });
    }
  }

}
