import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService } from '../../core';
import { LoaderService } from '../../core';
import { RouterLinks } from '@app/app/app.constant';
import { SurveyProviderService } from '../../survey/survey-provider.service';

@Component({
  selector: 'app-solution-listing',
  templateUrl: './solution-listing.component.html',
  styleUrls: ['./solution-listing.component.scss'],
})
export class SolutionListingComponent implements OnInit {
  programId: any;
  solutions 
  description;
  count = 0;
  limit = 25;
  page = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private utils: UtilsService,
    private kendraService: KendraApiService,
    private loader: LoaderService,
    private location: Location,
    private router: Router,
    private surveyProvider: SurveyProviderService
  ) {
    activatedRoute.params.subscribe((param) => {
      this.programId = param.id;
      this.solutions=[]
      this.getSolutions();
    });
  }

  ngOnInit() {}

  selectedSolution(data) {
    switch (data.type) {
      case 'observation':
        this.redirectObservaiton(data);
        break;
      case 'improvementProject':
        this.redirectProject(data);
        break;
      case 'survey':
        this.surveyRedirect(data);

      default:
        break;
    }
  }

  surveyRedirect(data) {
    let surveyId = '';
    if (data.surveyId) {
      surveyId = data.surveyId;
    }
    this.surveyProvider
      .getDetailsById(surveyId, data._id)
      .then((res) => {
        const survey = res.result;
        this.storeRedirect(survey);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  storeRedirect(survey): void {
    this.surveyProvider
      .storeSurvey(survey.assessment.submissionId, survey)
      .then((survey) => this.redirect(survey.assessment.submissionId));
  }

  redirect(submissionId: any): void {
    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      queryParams: {
        submisssionId: submissionId,
        evidenceIndex: 0,
        sectionIndex: 0,
        // schoolName: 'sample',
      },
    });
  }

  redirectProject(data) {
    let projectId = '';
    if (data.projectId) {
      projectId = data.projectId;
    }
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`, projectId, this.programId, data._id]);
  }
  redirectObservaiton(data) {
    let observationId = '';
    if (data.observationId) {
      observationId = data.observationId;
    }
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`], {
      queryParams: {
        programId: this.programId,
        solutionId: data._id,
        observationId: observationId,
        solutionName: data.name,
      },
    });
  }

  async getSolutions() {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    if (payload) {
      const config = {
        url:
          urlConstants.API_URLS.SOLUTIONS_LISTING +
          this.programId +
          '?page=' +
          this.page +
          '&limit=' +
          this.limit +
          '&search=',
        payload: payload,
      };
      this.kendraService.post(config).subscribe(
        (success) => {
          this.loader.stopLoader();
          if (success.result.data) {
            this.solutions = this.solutions.concat(success.result.data);
            this.count = success.result.count;
            this.description = success.result.description;
          }
        },
        (error) => {
          this.loader.stopLoader();
          this.solutions = [];
        }
      );
    } else {
      this.loader.stopLoader();
    }
  }
  goBack() {
    this.location.back();
  }
  loadMore() {
    this.page = this.page + 1;
    this.getSolutions();
  }
}
