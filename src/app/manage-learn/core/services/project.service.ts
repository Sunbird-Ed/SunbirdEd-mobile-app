import { Injectable, Inject } from '@angular/core';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { UnnatiDataService } from './unnati-data.service';
import { LoaderService } from '../../core';
import { UtilsService } from './utils.service';
import { DbService } from './db.service';
import { RouterLinks } from '@app/app/app.constant';
import { Router } from '@angular/router';
import { CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';
import { ContentDetailRequest, Content, ContentService } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
import { ToastService } from '../../core';
import { statusType } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  filterForReport: any;
  networkFlag: boolean;
  private _networkSubscription: Subscription;

  constructor(
    private kendra: KendraApiService,
    private utils: UtilsService,
    private loader: LoaderService,
    private db: DbService,
    private router: Router,
    private unnatiService: UnnatiDataService,
    private commonUtilService: CommonUtilService,
    private toast: ToastService,
    private navigateService: NavigationService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
  ) {
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
      this.networkFlag = available;
    })
  }
  async getTemplateBySoluntionId(id) {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.TEMPLATE_DETAILS + id,
      payload: payload,
    };
    return this.kendra.post(config).toPromise();
  }
  async getTemplateByExternalId(id){
    const config = {
        url: urlConstants.API_URLS.PROJECT_TEMPLATE_DETAILS + id,
    }
    return this.unnatiService.post(config).toPromise();
  }

  getTemplateData(payload, id, targeted) {
    const config = {
      url: urlConstants.API_URLS.IMPORT_LIBRARY_PROJECT + id + '?isATargetedSolution=' + targeted,
      payload: payload,
    };
    return this.unnatiService.post(config).toPromise();
  }

  async getProjectDetails({projectId = '', solutionId, isProfileInfoRequired = false, programId, templateId='',hasAcceptedTAndC=false}) {
    this.loader.startLoader();
    let payload = isProfileInfoRequired ? await this.utils.getProfileInfo() : {};
    const url = `${projectId ? '/' + projectId : ''}?${templateId ? 'templateId=' + templateId : ''}${solutionId ? ('&&solutionId=' + solutionId) : ''}`;
    const config = {
      url: urlConstants.API_URLS.GET_PROJECT + url,
      payload: payload
    }
    this.kendra.post(config).subscribe(success => {
      this.loader.stopLoader();
      success.result.hasAcceptedTAndC = hasAcceptedTAndC;
      let projectDetails = success.result;
      let newCategories = [];
      for (const category of projectDetails.categories) {
        if (category._id || category.name) {
          const obj = {
            label: category.name || category.label,
            value: category._id
          }
          newCategories.push(obj)
        }
      }
      projectDetails.categories = newCategories.length ? newCategories : projectDetails.categories;
      if (projectDetails.tasks) {
        projectDetails.tasks.map(t => {
          if ((t.type == 'observation' || t.type == 'assessment') && t.submissionDetails && t.submissionDetails.status) {
            if (t.submissionDetails.status != t.status) {
              t.status = t.submissionDetails.status
              t.isEdit = true;
              projectDetails.isEdit = true
            }
          }
        })
      }
      const navObj = {
        projectId: success.result._id,
        programId: programId,
        solutionId: solutionId
      }
      this.db.create(success.result).then(successData => {
        this.navigateToProjectDetails(navObj);
      }).catch(error => {
        if (error.status === 409) {
          this.navigateToProjectDetails(navObj);
        }
      })
    }, error => {
      this.loader.stopLoader();
    })
  }

  navigateToProjectDetails({ projectId, programId, solutionId }) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: projectId,
        programId: programId,
        solutionId: solutionId,
      }, replaceUrl: true
    })
  }

  openResources(resource) {
    let id
    if (resource.id) {
      id = resource.id;
    } else {
      id = resource.link.split('/').pop()
    }

    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
      return;
    }
    const req: ContentDetailRequest = {
      contentId: id,
      attachFeedback: false,
      attachContentAccess: false,
      emitUpdateIfAny: false
    };

    this.contentService
      .getContentDetails(req)
      .toPromise()
      .then(async (data: Content) => {
        this.navigateService.navigateToDetailPage(data, { content: data });
      });
  }

  getProjectCompletionPercentage({ tasks }) {
    const tasksCount = tasks?.length;
    if (!tasksCount) {
      return { completedTasks: 0, totalTasks: 0 };
    }
    let completedTaskCount = 0;
    for (const task of tasks) {
      if (task.status === statusType.completed) {
        completedTaskCount++
      }
    }
    const payload = { completedTasks: completedTaskCount, totalTasks: tasksCount }
    return payload;
  }

  async startAssessment(projectId,id){
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
      return;
    }
    let payload = await this.utils.getProfileInfo();
     const config = {
       url: urlConstants.API_URLS.START_ASSESSMENT + `${projectId}?taskId=${id}`,
       payload:payload
     };
     this.unnatiService.post(config).subscribe(success =>{
      if (!success.result) {
        this.toast.showMessage('FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS', "danger");
        return;
      }
      let data = success.result;
      if(!data?.observationId){
        this.getTemplateBySoluntionId(data?.solutionDetails?._id).then(resultdata =>{
          if (
            resultdata.assessment.evidences.length > 1 ||
            resultdata.assessment.evidences[0].sections.length > 1 ||
            (resultdata.solution.criteriaLevelReport && resultdata.solution.isRubricDriven)
          ) {
            this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], { state: resultdata });
          } else {
            this.router.navigate([RouterLinks.QUESTIONNAIRE], {
              queryParams: {
                evidenceIndex: 0,
                sectionIndex: 0,
              },
                state: resultdata,
            });
          }
          return;
        })
      }

      this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
        queryParams: {
          programId: data.programId,
          solutionId: data.solutionId,
          observationId: data.observationId,
          entityId: data.entityId,
          entityName: data.entityName,
        },
      });
     }, (error) => {
      this.toast.showMessage('FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS', "danger");
    })
  }

  async checkReport(projectId,taskId){
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
      return;
    }

     let payload = await this.utils.getProfileInfo();
     const config = {
       url: urlConstants.API_URLS.START_ASSESSMENT + `${projectId}?taskId=${taskId}`,
       payload: payload

     };
     this.unnatiService.get(config).subscribe(
       (success) => {
         if (!success.result) {
           this.toast.showMessage('FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS', "danger");
           return;
         }
         let data = success.result;

         this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
           queryParams: {
             programId: data.programId,
             solutionId: data.solutionId,
             observationId: data.observationId,
             entityId: data.entityId,
             entityName: data.entityName,
           },
         });

       },
       (error) => {
         this.toast.showMessage('FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS', "danger");
       }
     );
  }
}