import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { KendraApiService } from '../../core/services/kendra-api.service';

@Component({
  selector: 'app-deeplink-redirect',
  templateUrl: './deeplink-redirect.component.html',
  styleUrls: ['./deeplink-redirect.component.scss'],
})
export class DeeplinkRedirectComponent implements OnInit {
  data: any;
  translateObject: any;
  link: any;
  extra: string;

  constructor(
    public navCtrl: NavController,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentApiService,
    private utils: UtilsService,
    private http: HttpClient,
    private kendra: KendraApiService
  ) {
    this.extra = this.route.snapshot.paramMap.get('extra');
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.data = extrasState.data;
    }
  }

  ionViewDidLoad() {}
  ngOnInit() {
    this.translate.get(['message.canNotOpenLink']).subscribe((translations) => {
      this.translateObject = translations;
    });
    this.switch(this.extra);
  }

  switch(key) {
    switch (key) {
      case 'observationLink':
        this.verifyLink(this.data.create_observation_id);
        break;
      case 'projectLink':
        this.verifyLink(this.data.create_project_id);
        break;
      default:
        break;
    }
  }

  async redirectProject(data) {
    await this.router.navigate([`/${RouterLinks.HOME}`]);
    if (data.isATargetedSolution) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
        queryParams: {
          projectId: data.projectId,
          programId: data.programId,
          solutionId: data.solutionId,
        },
      });
    }
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TEMPLATE}`, data.solutionId], {
      queryParams: data,
      skipLocationChange: true,
    });
  }

  async redirectObservation(resp) {
    await this.router.navigate([`/${RouterLinks.HOME}`]);
    if (
      resp.assessment.evidences.length > 1 ||
      resp.assessment.evidences[0].sections.length > 1 ||
      (resp.solution.criteriaLevelReport && resp.solution.isRubricDriven)
    ) {
      this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], { state: resp });
    } else {
      this.router.navigate([RouterLinks.QUESTIONNAIRE], {
        queryParams: {
          isTargeted: resp.isATargetedSolution,
        },
        state: resp,
      });
    }
  }

  async getTemplateDetails(data) {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + data.solutionId,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe((success) => {
      if (success.result) {
        success.result.isATargetedSolution = data.isATargetedSolution;
        this.redirectObservation(success.result);
      }
    });
  }

  goToEntities(data) {
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`], {
      queryParams: { solutionId: data.solutionId, solutionName: data.name, programId: data.programId },
      replaceUrl: true,
    });
  }

  async verifyLink(link) {
    let payload = await this.utils.getProfileInfo();

    const config = {
      url: urlConstants.API_URLS.DEEPLINK.VERIFY_LINK + link,
      payload: payload,
    };
    let resp = await this.kendra.post(config).toPromise();
    if (resp && resp.result) {
      switch (resp.result.type) {
        case 'improvementProject':
          this.redirectProject(resp.result);
          break;
        case 'observation':
          resp.result.observationId ? this.goToEntities(resp.result) : this.getTemplateDetails(resp.result);

        default:
          break;
      }
    }
  }
}
