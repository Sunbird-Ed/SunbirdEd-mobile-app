import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption-v8';
import { LoaderService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

@Component({
  selector: 'app-observation-solution-listing',
  templateUrl: './observation-solution-listing.component.html',
  styleUrls: ['./observation-solution-listing.component.scss'],
})
export class ObservationSolutionListingComponent implements OnInit {
  filters: Array<string> = [];
  selectedFilterIndex: number = 0;
  layout = LibraryFiltersLayout.ROUND;
  solutionList = [];
  entityType: string = '';
  pageSize: number = 10;
  pageNo: number = 1;
  showLoadMore: boolean = true;

  constructor(
    private apiService: AssessmentApiService,
    private utils: UtilsService,
    private loader: LoaderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getSolutions();
    // this.router.navigate([RouterLinks.GENERIC_REPORT], {
    //   state: {
    //     scores: true,
    //     observation: true,
    //     pdf: false,
    //     entityId: '',
    //     entityType: '',
    //     observationId: '',
    //     submissionId: '',
    //     null: null,
    //     undefined: undefined,
    //   },
    // });
  }

  async getSolutions() {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    const config = {
      url:
        urlConstants.API_URLS.OBSERVATION_REPORT_SOLUTION_LIST +
        `limit=${this.pageSize}&page=${this.pageNo}&entityType=${this.entityType}`,
      payload: payload,
    };
    this.apiService.post(config).subscribe(
      (data) => {
        this.loader.stopLoader();
        this.solutionList = data && data.result ? this.solutionList.concat(data.result.data) : [];
        this.filters = data && data.result && !this.filters.length ? data.result.entityType : this.filters;
        this.showLoadMore = this.solutionList.length < data.result.count ? true : false;
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }

  goToEntityList(solution) {
    this.router.navigate([`${RouterLinks.REPORTS}/${RouterLinks.OBSERVATION_SOLUTION_ENTITY_LISTING}`], {
      state: solution,
    });
  }

  goToReports(solution) {
    if (solution.scoringSystem === 'pointsBasedScoring' || !solution.isRubricDriven) {
      const queryParams = {
        queryParams: {
          observationId: solution.observationId,
          solutionId: solution.solutionId,
          programId: solution.programId,
          entityId: solution.entities[0]._id,
          entityName: solution.entities[0].name
        }
      }
      this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], queryParams);

    } else {
      this.router.navigate([RouterLinks.GENERIC_REPORT], {
        state: {
          scores: true,
          observation: true,
          pdf: false,
          entityId: solution.entities[0]._id,
          entityType: solution.entityType,
          observationId: solution.observationId,
        },
      });
    }
  }

  loadMore() {
    this.pageNo++;
    this.getSolutions();
  }

  applyFilter(filter) {
    this.selectedFilterIndex = filter.data.index;
    this.entityType = filter && filter.data ? filter.data.text : '';
    this.solutionList = [];
    this.getSolutions();
  }
}
