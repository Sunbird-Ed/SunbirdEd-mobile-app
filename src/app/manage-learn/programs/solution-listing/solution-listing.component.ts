import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { ToastService, UtilsService } from '../../core';
import { LoaderService } from '../../core';
import { RouterLinks } from '@app/app/app.constant';
import { SurveyProviderService } from '../../core/services/survey-provider.service';
import { Subscription } from 'rxjs';
import { AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';

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
  programName: any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
};
private backButtonFunc: Subscription;


  constructor(
    private activatedRoute: ActivatedRoute,
    private utils: UtilsService,
    private kendraService: KendraApiService,
    private loader: LoaderService,
    private location: Location,
    private router: Router,
    private surveyProvider: SurveyProviderService,
    private headerService: AppHeaderService,
    private platform: Platform,
    private toast:ToastService
  ) {
    activatedRoute.params.subscribe((param) => {
      this.programId = param.id;
      this.solutions=[]
      this.getSolutions();
    });
  }

  ngOnInit() {}


  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
}

ionViewWillLeave() {
  if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
  }
}

private handleBackButton() {
  this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.location.back();
  });
}

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
        if (res.result && res.result.status == 'completed') {
          // this.toast.openToast(res.message)
           this.surveyProvider.showMsg('surveyCompleted');
          return
        }
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
    // this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`, "", this.programId, data._id]);
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: projectId,
        programId: this.programId,
        solutionId:  data._id,
        type: 'assignedToMe'
      }
    });
  }
  redirectObservaiton(data) {
    debugger
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
            this.programName=success.result.programName
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
