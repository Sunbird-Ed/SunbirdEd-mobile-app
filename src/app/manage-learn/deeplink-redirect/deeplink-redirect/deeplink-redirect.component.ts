import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { NavController} from '@ionic/angular';
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
    // public navParams: NavParams,
    // public deeplinkProvider: DeeplinkProvider,
    // public programSrvc: ProgramServiceProvider,
    // public viewCtrl: ViewController,
    // public utils: UtilsProvider,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private assessmentService: AssessmentApiService,
    private utils: UtilsService,
    private http:HttpClient,
    private kendra : KendraApiService
  ) {
    this.extra = this.route.snapshot.paramMap.get('extra');
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.data = extrasState.data;
    }
  }

  ionViewDidLoad() {
  }
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
      case 'observationParams':
        this.redirectWithParams(this.data[key], 'observation');
        break;
      case 'assessmentParams':
        this.redirectWithParams(this.data[key], 'assessment');
        break;
      case 'observationReportParams':
        this.redirectReportWithParams(this.data[key], 'observation');
        break;
      case 'assessmentReportParams':
        this.redirectReportWithParams(this.data[key], 'assessment');
        break;
    case 'projectLink':
        this.verifyLink(this.data.create_project_id);
        break;
      default:
        break;
    }
  }

  redirectProject(data){
      console.log( this.data,"redirectProject");
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TEMPLATE}`,this.data.create_project_id], {
        queryParams: {
            isTargeted: true
        },
    });
  }
  redirectWithParams(params: string, type) {
    let paramsArr = params.split('-');
    console.log(paramsArr);
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
  }

  redirectObservation(resp) {
    if (
        resp.assessment.evidences.length > 1 ||
        resp.assessment.evidences[0].sections.length > 1 ||
        (resp.solution.criteriaLevelReport && resp.solution.isRubricDriven)
    ) {
        this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], {state: resp, replaceUrl: true});
    } else {
        this.router.navigate([RouterLinks.QUESTIONNAIRE], {
            queryParams: {
                isTargeted: resp.isATargetedSolution,
            }, replaceUrl: true,
                state: resp
            });
        }
    }

    async verifyLink(link){
        let payload = await this.utils.getProfileInfo();
        const config = {
          url: urlConstants.API_URLS.DEEPLINK.VERIFY_LINK + link,
          payload:payload
        };
        this.assessmentService.post(config).subscribe(
          (success) => {
        if (success.result) {
          let data = success.result;
          if(success.result.type == 'improvementProject'){
            this.redirectProject(success.result);
          }else if(success.result.type == 'observation'){
            this.getTemplateDetails(success.result);
          }
        }
        })
  }
  async getTemplateDetails(data){
    let payload = await this.utils.getProfileInfo();
        const config = {
          url: urlConstants.API_URLS.TEMPLATE_DETAILS + data.solutionId,
          payload:payload
        };
        this.assessmentService.post(config).subscribe(
          (success) => {
        if (success.result) {
          success.result.isATargetedSolution = data.isATargetedSolution;
          this.redirectObservation(success.result);
        }
        })


  }
  redirectReportWithParams(params: string, type) {
    let paramsArr = params.split('-');
    let pId = paramsArr[0];
    let sId = paramsArr[1];
    let eId = paramsArr[2];
    let etype = paramsArr[3];
    let oId = paramsArr[4];

    if (type == 'observation') {
      let payload = {
        entityId: eId,
        entityType: etype,
        observationId: oId,
      };
      setTimeout(() => {
        // will go call entity report
        this.router.navigate([RouterLinks.OBSERVATION_REPORTS], {
          replaceUrl: true,
          queryParams: {
            entityId: eId,
            entityType: etype,
            observationId: oId,
          },
        });
      }, 1000);
    }

    if (type == 'assessment') {
      let payload = {
        programId: pId,
        entity: {
          _id: eId,
          entityType: etype,
        },
        entityType: etype,
        solutionId: sId,
      };
    }
  }
}