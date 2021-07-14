import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption';
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
  ) {}

  ngOnInit() {
    this.getSolutions();
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
 
    let state = {
      scores: false,
      observation: true,
      entityId: solution.entities[0]._id,
      entityType: solution.entityType,
      observationId: solution.observationId,
    };
    if (solution.isRubricDriven) {
      state.scores = true;
    }
    if (!solution.criteriaLevelReport) {
      state['filter'] = { questionId: [] };
      state['criteriaWise'] = false;
    }
    this.router.navigate([RouterLinks.GENERIC_REPORT], {
      state: state,
    });
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
