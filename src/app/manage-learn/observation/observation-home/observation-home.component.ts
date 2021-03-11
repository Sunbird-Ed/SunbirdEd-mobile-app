import { Component, OnInit } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Router } from '@angular/router';
import { LoaderService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

@Component({
  selector: 'app-observation-home',
  templateUrl: './observation-home.component.html',
  styleUrls: ['./observation-home.component.scss'],
})
export class ObservationHomeComponent implements OnInit {
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  solutionList: any;
  page = 1;
  limit = 10;
  count: any;

  constructor(
    private headerService: AppHeaderService,
    private router: Router,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    this.solutionList = [];
    this.getPrograms();
  }
  async getPrograms() {
    let payload = await this.utils.getProfileInfo();
    if (payload) {
      this.loader.startLoader();
      const config = {
        url: urlConstants.API_URLS.GET_PROG_SOL_FOR_OBSERVATION + `?page=${this.page}&limit=${this.limit}`,
        payload: payload,
      };
      this.assessmentService.post(config).subscribe(
        (success) => {
          this.loader.stopLoader();
          console.log(success);
          if (success && success.result && success.result.data) {
            this.count = success.result.count;

            this.solutionList = [...this.solutionList, ...success.result.data];
          }
        },
        (error) => {
          this.solutionList = [];
          this.loader.stopLoader();
        }
      );
    }
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  observationDetails(solution) {
    let { programId, solutionId, _id: observationId, name: solutionName } = solution;
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`], {
      queryParams: {
        programId: programId,
        solutionId: solutionId,
        observationId: observationId,
        solutionName: solutionName,
      },
    });
  }
  loadMore() {
    this.page = this.page + 1;
    this.getPrograms();
  }
}
