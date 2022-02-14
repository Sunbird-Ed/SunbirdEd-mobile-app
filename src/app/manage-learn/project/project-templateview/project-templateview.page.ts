import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '../../core/constants/statuses.constant';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import { AppHeaderService } from '@app/services';
import {  ProjectService, ToastService } from '../../core';
import { RouterLinks } from '@app/app/app.constant';
import { actions } from '../../core/constants/actions.constants';
import { GenericPopUpService } from '../../shared';
import { AppGlobalService } from '@app/services';

@Component({
  selector: 'app-project-templateview',
  templateUrl: './project-templateview.page.html',
  styleUrls: ['./project-templateview.page.scss'],
})
export class ProjectTemplateviewPage implements OnInit {
  showDetails: boolean = true;
  statuses = statuses;
  project: any;
  projectId;
  projectType = '';
  categories = [];
  isTargeted;
  taskCount: number = 0;
  filters: any = {};
  schedules = this.utils.getSchedules();
  sortedTasks;
  programId;
  solutionId;
  isNotSynced: boolean;
  locationChangeTriggered: boolean = false;
  allStrings;
  viewOnlyMode: boolean = false;
  templateId;
  templateDetailsPayload;
  importProjectClicked: boolean = false;
  fromImportProject: boolean = false;
  shareTaskId;
  networkFlag: boolean;
  id;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [],
  };
  projectProgress;
  actionItems = [];
  metaData: any;
  projectSegments;
  segmentType = "details";
  type;
  buttonLabel = 'FRMELEMNTS_LBL_START_IMPROVEMENT';
  stateData;
  isATargetedSolution;
  isAssignedProject : boolean = false;
  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private router: Router,
    private utils: UtilsService,
    private translate: TranslateService,
    private headerService: AppHeaderService,
    private projectService: ProjectService,
    private popupService: GenericPopUpService,
    private appGlobalService: AppGlobalService,
    private alert: AlertController,
    private toast :ToastService
  ) {

    params.params.subscribe((parameters) => {
      this.id = parameters.id;
    });
    params.queryParams.subscribe((parameters) => {
      this.isTargeted = parameters.isTargeted;
      this.programId = parameters.programId;
      this.solutionId = parameters.solutionId;
      this.isATargetedSolution = (parameters.isATargetedSolution === 'true');
      this.isAssignedProject = parameters.type  == 'assignedToMe'  ? true : false
    });
    this.stateData = this.router.getCurrentNavigation().extras.state;
    this.templateDetailsPayload = this.router.getCurrentNavigation().extras.state;
    this.translate
      .get([
        'FRMELEMNTS_MSG_SOMETHING_WENT_WRONG',
        'FRMELEMNTS_MSG_NO_ENTITY_MAPPED',
        'FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE',
        'YES',
        'NO',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS',
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
  }

  templateDetailsInit() {
    if(this.appGlobalService.isUserLoggedIn()){
      switch (this.stateData?.referenceFrom) {
        case 'observation':
          this.templateId = this.id;
          this.getTemplateByExternalId();
          break
        case 'link':
          this.getProjectApi();
          break
        default:
          this.getProjectApi();
      }
    } else {
      const extraPramas = `?link=${this.id}`
      this.projectService.getTemplateByExternalId(null,extraPramas ).then(data =>{
        this.project = data?.result;
        this.metaData = {
          title: this.project.title,
          subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
        }
      }).catch(error => {
        
      })
    }
  }

  ngOnInit() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillEnter() {
    this.templateDetailsInit();
  }

  async getProjectApi() {
    this.actionItems = await actions.PROJECT_ACTIONS;
    let resp = await this.projectService.getTemplateBySoluntionId(this.id);
    this.project = resp.result;
    this.metaData = {
      title: this.project.title,
      subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
    }
    if (this.project.tasks && this.project.tasks.length)
      this.projectProgress = this.utils.getCompletedTaskCount(this.project.tasks);
  }

  async getTemplateByExternalId() {
    let resp = await this.projectService.getTemplateByExternalId(this.id);
    this.programId = resp?.result?.programInformation?.programId || null;
    this.project = resp?.result;
    if (this.project?.projectId) {
      this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
    }
    this.metaData = {
      title: this.project.title,
      subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
    }
  }

  toggle() {
    this.showDetails = !this.showDetails;
  }

  segmentChanged(event) {
    this.segmentType = event.detail.value;
  }

  openResource(resource) {
    this.projectService.openResources(resource);
  }

  doAction() {
    if(this.templateDetailsPayload?.referenceFrom == "observation" && !this.project?.projectId){
      this.startProjectConfirmation();
      return;
    }
    if ( !this.isAssignedProject && !this.project.hasAcceptedTAndC && !this.isTargeted) {
      this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
        if (data && data.isClicked) {
          this.project.hasAcceptedTAndC = data.isChecked;
          this.start();
          this.toast.showMessage('FRMELEMNTS_LBL_PROJECT_STARTED','success');
        }
      })
    } else {
      this.start();
    }
  }

  gotoDetails() {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      replaceUrl: true,
      queryParams: {
        projectId: this.project._id,
        programId: this.project.programId,
        solutionId: this.project.solutionId
      },
    });
  }

  async start() {
    if(!this.appGlobalService.isUserLoggedIn()){
      this.triggerLogin();
      return
    }
    if (this.stateData?.referenceFrom === 'link') {
      this.startProjectsFromLink();
    } else if (this.project.projectId) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
        queryParams: {
          projectId: this.project.projectId,
          programId: this.programId,
          solutionId: this.solutionId,
        },
      });
    } else {
      const payload = {
        projectId: this.project.projectId,
        programId: this.project.programId,
        solutionId: this.project.solutionId,
        isProfileInfoRequired: true,
        hasAcceptedTAndC: this.project.hasAcceptedTAndC,
        detailsPayload: this.stateData ? this.stateData : null,
        templateId: this.templateId,
        replaceUrl: true
      }
      this.projectService.getProjectDetails(payload);
    }
  }

  startProjectsFromLink() {
    if (this.isATargetedSolution) {
      this.router
        .navigate([`/${RouterLinks.PROJECT}`], {
          queryParams: {
            selectedFilter: 'assignedToMe',
          },
        }).then(() => {
          const payload = {
            projectId: this.project.projectId,
            programId: this.project.programId,
            solutionId: this.project.solutionId,
            isProfileInfoRequired: true,
            hasAcceptedTAndC: this.project.hasAcceptedTAndC,
            templateId: this.templateId,
            replaceUrl: false
          }
          this.projectService.getProjectDetails(payload);
        })
    } else {
        const payload = {
          templateId: this.project._id,
          programId: this.programId,
          solutionId: this.solutionId,
          isATargetedSolution: false,
          hasAcceptedTAndC: this.project.hasAcceptedTAndC
        }
        this.projectService.mapProjectToUser(payload);
    }
  }

  triggerLogin() {
    this.router.navigate([RouterLinks.SIGN_IN], {state: {navigateToCourse: false}});
  }

  async startProjectConfirmation() {
    let data;
    this.translate.get(["FRMELEMNTS_BTN_IMPORT_PROJECT", "FRMELEMNTS_LBL_WANT_TO_START", "NO", "YES"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      header: data['FRMELEMNTS_BTN_IMPORT_PROJECT'],
      message: data["FRMELEMNTS_LBL_WANT_TO_START"],
      buttons: [
        {
          text: data["YES"],
          handler: () => {
          this.start();
          this.toast.showMessage('FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS','success');
          },
        }, {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {},
        },
      ],
    });
    await alert.present();
  }
}