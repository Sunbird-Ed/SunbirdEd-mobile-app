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
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SharingFeatureService } from './sharing-feature.service';
import { SyncService } from './sync.service';
import { GenericPopUpService } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  filterForReport: any;
  networkFlag: boolean;
  private _networkSubscription: Subscription;
  project;
  projectId;
  shareTaskId;
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
    private alert: AlertController,
    private translate: TranslateService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private share: SharingFeatureService,
    private syncService: SyncService,
    private popupService: GenericPopUpService
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
  async getTemplateByExternalId(id, extraParams?) {
    const config = {
      url: urlConstants.API_URLS.PROJECT_TEMPLATE_DETAILS + encodeURIComponent(id) + (extraParams ? extraParams : ''),
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

  async getProjectDetails({ projectId = '', solutionId, isProfileInfoRequired = false,
    programId, templateId = '', hasAcceptedTAndC = false, detailsPayload = null, replaceUrl = true }) {
    this.loader.startLoader();
    let payload = isProfileInfoRequired ? await this.utils.getProfileInfo() : {};
    const url = `${projectId ? '/' + projectId : ''}?${templateId ? 'templateId=' + encodeURIComponent(templateId) : ''}${solutionId ? ('&&solutionId=' + solutionId) : ''}`;
    const config = {
      url: urlConstants.API_URLS.GET_PROJECT + url,
      payload: detailsPayload ? detailsPayload : payload
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
        solutionId: solutionId,
        replaceUrl: replaceUrl
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

  navigateToProjectDetails({ projectId, programId, solutionId, replaceUrl }) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: projectId,
        programId: programId,
        solutionId: solutionId,
        from:'service'
      }, replaceUrl: replaceUrl
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
    this.loader.startLoader();
    this.contentService
      .getContentDetails(req)
      .toPromise()
      .then(async (data: Content) => {
        this.loader.stopLoader();
        this.navigateService.navigateToDetailPage(data, { content: data });
      })
      .catch(error => {
        this.loader.stopLoader();
      })
  }

  getProjectCompletionPercentage({ tasks }) {
    let tasksCount = tasks?.length;
    if (!tasksCount) {
      return { completedTasks: 0, totalTasks: 0 };
    }
    let completedTaskCount = 0;
    let validTaskCount = 0;
    for (const task of tasks) {
      if (!task.isDeleted) {
        validTaskCount++;
      }
      if (task.status === statusType.completed && !task.isDeleted) {
        completedTaskCount++
      }
    }
    const payload = { completedTasks: completedTaskCount, totalTasks: validTaskCount }
    return payload;
  }

  async startAssessment(projectId, id) {
    if (!this.networkFlag) {
      this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger');
      return;
    }
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.START_ASSESSMENT + `${projectId}?taskId=${id}`,
      payload: payload
    };
    this.unnatiService.post(config).subscribe(async success => {
      if (!success.result) {
        this.toast.showMessage('FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS', "danger");
        return;
      }
      let data = success.result;
      if (!data?.observationId) {
        const response  = await this.getTemplateBySoluntionId(data?.solutionDetails?._id);
          const result = response.result;
          if (
            result.assessment.evidences.length > 1 ||
            result.assessment.evidences[0].sections.length > 1 ||
            (result.solution.criteriaLevelReport && result.solution.isRubricDriven)
          ) {
            this.router.navigate([RouterLinks.DOMAIN_ECM_LISTING], { state: result });
          } else {
            this.router.navigate([RouterLinks.QUESTIONNAIRE], {
              queryParams: {
                evidenceIndex: 0,
                sectionIndex: 0,
              },
              state: result,
            });
          }
          return;
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

  async checkReport(projectId, taskId) {
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

  async mapProjectToUser({ programId, solutionId, templateId, isATargetedSolution, hasAcceptedTAndC }) {
    let payload = { programId: programId, solutionId: solutionId };
    const config = {
      url: urlConstants.API_URLS.IMPORT_LIBRARY_PROJECT + templateId + '?isATargetedSolution=false',
      payload: payload,
    };
    let importProject;
    try {
      importProject = await this.getTemplateData(payload, templateId, isATargetedSolution);
    } catch (error) {
      console.log(error);
    }

    if (importProject && importProject.result) {
      this.router
        .navigate([`/${RouterLinks.PROJECT}`], {
          queryParams: {
            selectedFilter: isATargetedSolution ? 'assignedToMe' : 'discoveredByMe',
          },
        }).then(() => {
          const params = {
            projectId: importProject.result._id,
            programId: programId,
            solutionId: solutionId,
            replaceUrl: false,
            hasAcceptedTAndC: hasAcceptedTAndC
          }
          this.getProjectDetails(params)
        })
    }
  }
  async openSyncSharePopup(type, name, project, taskId?) {
    if (this.networkFlag) {
      let data;
      this.project = project;
      this.translate.get(["FRMELEMNTS_LBL_SHARE_MSG", "FRMELEMNTS_BTN_DNTSYNC", "FRMELEMNTS_BTN_SYNCANDSHARE"]).subscribe((text) => {
        data = text;
      });
      this.shareTaskId = taskId ? taskId : null;
      const alert = await this.alert.create({
        cssClass: 'central-alert',
        message: data["FRMELEMNTS_LBL_SHARE_MSG"],
        buttons: [
          {
            text: data["FRMELEMNTS_BTN_DNTSYNC"],
            role: "cancel",
            cssClass: "secondary",
            handler: (blah) => {
              this.toast.showMessage("FRMELEMNTS_MSG_FILE_NOT_SHARED", "danger");
            },
          },
          {
            text: data["FRMELEMNTS_BTN_SYNCANDSHARE"],
            handler: () => {
              if (project.isEdit || project.isNew) {
                project.isNew
                  ? this.createNewProject(project, true)
                  : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: project._id, taskId: taskId, share: true, fileName: name } });
              } else {
                type == 'shareTask' ? this.getPdfUrl(name, taskId) : this.getPdfUrl(project.title);
              }
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger')
    }
  }

  getPdfUrl(fileName, taskId?) {
    let task_id = taskId ? taskId : '';
    const config = {
      url: urlConstants.API_URLS.GET_SHARABLE_PDF + this.project._id + '?tasks=' + task_id,
    };
    this.share.getFileUrl(config, fileName);
  }

  createNewProject(project, isShare?) {
    this.loader.startLoader();
    const projectDetails = JSON.parse(JSON.stringify(project));
    this.syncService
      .createNewProject(true, projectDetails)
      .then((success) => {
        const { _id, _rev } = project;
        projectDetails._id = success.result.projectId;
        projectDetails.programId = success.result.programId;
        projectDetails.lastDownloadedAt = success.result.lastDownloadedAt;
        projectDetails.tasks = project.tasks;
        this.projectId = projectDetails._id;
        projectDetails.isNew = false;
        delete projectDetails._rev;
        this.loader.stopLoader();
        this.db
          .create(projectDetails)
          .then((success) => {
            projectDetails._rev = success.rev;
            this.db
              .delete(_id, _rev)
              .then(res => {
                setTimeout(() => {
                  const queryParam = {
                    projectId: this.projectId,
                    taskId: this.shareTaskId
                  }
                  if (isShare) {
                    queryParam['share'] = true
                  }
                  this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], {
                    queryParams: queryParam
                  })
                }, 0)
                this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
                  queryParams: {
                    projectId: projectDetails._id,
                    programId: projectDetails.programId,
                    solutionId: projectDetails.solutionId,
                    // fromImportPage: this.importProjectClicked
                  }, replaceUrl: true
                });
              })
          })
      })
      .catch((error) => {
        this.toast.showMessage('FRMELEMNTS_MSG_SOMETHING_WENT_WRONG', "danger");
        this.loader.stopLoader();
      });
  }

  acceptDataSharingPrivacyPolicy() {
    return new Promise((resolve, reject) => {
      this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
        data && data.isClicked ? resolve(data.isChecked) : reject();
      })
    })
  }

  getLinks(links) {
    let formattedLinks = links.replace(/[ ]/g, ',').split(',');
    let linkArray = [];
    formattedLinks.forEach(element => {
      if(element){
        let link = {
          name: element,
          type: 'link',
          isUploaded: false,
          url: "",
        };
        linkArray.push(link);
      }
    });
    return linkArray.length ? linkArray : links;
  }
}