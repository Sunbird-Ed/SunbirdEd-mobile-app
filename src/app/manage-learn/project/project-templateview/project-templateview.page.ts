import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '../../core/constants/statuses.constant';
import { UtilsService } from '../../../../app/manage-learn/core/services/utils.service';
import { AppHeaderService } from '../../../../services/app-header.service';
import {  ProjectService, ToastService, LoaderService } from '../../core';
import { RouterLinks, PreferenceKey } from '../../../../app/app.constant';
import { actions } from '../../core/constants/actions.constants';
import { GenericPopUpService } from '../../shared';
import { AppGlobalService } from '../../../../services/app-global-service.service';
import { Subscription } from 'rxjs';
import { CommonUtilService } from '../../../../services/common-util.service';

import {
  SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { ProfileNameConfirmationPopoverComponent } from '../../../../app/components/popups/sb-profile-name-confirmation-popup/sb-profile-name-confirmation-popup.component';
import { Location } from '@angular/common';
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
  isStarted : boolean = false;
  hideNameConfirmPopup = false;
  certificateCriteria:any =[];
  userId;
  clickedOnProfile :boolean = false;
  projectlisting:boolean = false;
  programlisting:boolean = false;
  projectLink = ''

  public backButtonFunc: Subscription;

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
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
    private toast :ToastService,
    private platform : Platform,
    private location :Location,
    private commonUtils: CommonUtilService,
    private loader: LoaderService
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
      this.programlisting = (parameters.listing == "program");
      this.projectlisting = (parameters.listing == "project");
      this.projectLink = parameters.link

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
        if (this.project?.projectId) {
          this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
        }
        this.metaData = {
          title: this.project?.title,
          subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
        }
      }).catch(error => {
        
      })
    }
  }

 async ngOnInit() {
  this.popupService.closeJoinProgramPopup()
  this.userId = await this.appGlobalService.getActiveProfileUid();
  const key = PreferenceKey.DO_NOT_SHOW_PROFILE_NAME_CONFIRMATION_POPUP + '-' + this.userId;
  this.hideNameConfirmPopup = await this.preferences.getBoolean(key).toPromise();
  }
  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.clickedOnProfile ? this.showProfileNameConfirmationPopup():'';
    this.templateDetailsInit();
  }
  handleBackButton() {
   this.location.back();
  }
  async getProjectApi() {
    this.loader.startLoader();
    this.actionItems = await actions.PROJECT_ACTIONS;
    let resp = await this.projectService.getTemplateBySoluntionId(this.id);
    this.project = resp.result;
    this.loader.stopLoader();
    if(this.project.criteria){
      let criteria = Object.keys(this.project?.criteria?.conditions);
      criteria.forEach(element => {
        let config ={
          name:this.project?.criteria?.conditions[element].validationText
        }
        this.certificateCriteria.push(config);
      })
    }
    if (this.project?.projectId) {
      this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
    }
    this.metaData = {
      title: this.project?.title,
      subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
    }
    if( this.project.hasOwnProperty('requestForPIIConsent') && this.project.programJoined && this.project?.requestForPIIConsent && !this.project.consentShared){
      let payloadData = {consumerId:  this.project.rootOrganisations, objectId:  this.project.programId}
      let profileData = await this.utils.getProfileInfo();
       await this.popupService.getConsent('Program',payloadData,this.project,profileData,'FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS').then((data)=>{
         if(data){
           this.project.programJoined = true
         }
       })
     }
    // if (this.project.tasks && this.project.tasks.length)
    //   this.projectProgress = this.utils.getCompletedTaskCount(this.project.tasks);
  }

  async getTemplateByExternalId() {
    this.loader.startLoader();
    let resp = await this.projectService.getTemplateByExternalId(this.id);
    this.programId = resp?.result?.programInformation?.programId || null;
    this.project = resp?.result;
    this.loader.stopLoader();
    if(this.project.certificate){
      let criteria = Object.keys(this.project?.criteria?.conditions);
      criteria.forEach(element => {
        let config ={
          name:this.project?.certificate?.conditions[element].validationText
        }
        this.certificateCriteria.push(config);
      })
    }
    if (this.project?.projectId) {
      this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
    }
    this.metaData = {
      title: this.project?.title,
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
    if(!this.project?.programJoined && this.project.hasOwnProperty('requestForPIIConsent')){
      this.popupService.joinProgram(this.project,'project')
      .then(async resp => {
        if(resp){
          let profileData = await this.utils.getProfileInfo();
          this.popupService.join(this.project,profileData).then((data :any) =>{
            if(data){
              this.project.programJoined = true
              let payload = {consumerId: this.project.rootOrganisations, objectId: this.project.programId};
              if(this.project.requestForPIIConsent){
                this.popupService.showConsent('Program',payload,this.project,profileData,'FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS').then(async (data)=>{
                  if(data){
                    this.project.programJoined = true
                  }
                })
              }else{
                this.commonUtils.showToast('FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS','','',9000,'top');
              }
              
            }
          },error =>{})
        }
      });
      return
    }else{
    if(!this.hideNameConfirmPopup && this.project.criteria && !this.isStarted  && this.project.hasAcceptedTAndC && (this.isAssignedProject || this.isTargeted || this.isATargetedSolution)){
      this.showProfileNameConfirmationPopup();
    }else{
    if(this.templateDetailsPayload?.referenceFrom == "observation" && !this.project?.projectId){
      this.startProjectConfirmation();
      return;
    }
    if(!this.appGlobalService.isUserLoggedIn()){
      this.toast.showMessage('FRMELEMNTS_MSG_NOT_LOGGEDIN_USER','danger')
      this.triggerLogin();
      return
    }
    if ( this.stateData?.referenceFrom != 'observation' && !this.isAssignedProject && !this.project.hasAcceptedTAndC && !this.isTargeted && !this.isATargetedSolution && !this.isStarted) {
      this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
      if (data && data.isClicked) {
          this.project.hasAcceptedTAndC = data.isChecked;
          if(this.project.criteria && !this.isStarted && !this.hideNameConfirmPopup){
            this.showProfileNameConfirmationPopup();
          }else{
          this.start();
          this.toast.showMessage('FRMELEMNTS_LBL_PROJECT_STARTED','success');
          }
        }
      })
    } else {
      if(this.project.criteria && !this.isStarted && !this.hideNameConfirmPopup){
        this.showProfileNameConfirmationPopup();
      }else{
      this.start();
    }
    }
  }
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
    if(this.projectlisting || this.stateData?.referenceFrom === 'link'){
    this.location.replaceState(this.router.serializeUrl(this.router.createUrlTree([RouterLinks.TABS])));
    await this.router
      .navigate([`/${RouterLinks.PROJECT}`], {
        queryParams: {
          selectedFilter:  this.isAssignedProject? 'assignedToMe' : 'discoveredByMe',
        }
      })
    }
    if(this.programlisting){
     await this.router.navigate([`/${RouterLinks.HOME}`]);
     await this.router.navigate([`/${RouterLinks.PROGRAM}`]);
     await this.router.navigate([`/${RouterLinks.PROGRAM}/${RouterLinks.DETAILS}`,  this.programId]);
    }
    setTimeout(() => {
    if (this.stateData?.referenceFrom === 'link') {
      this.startProjectsFromLink();
    } else if (this.project.projectId) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
        queryParams: {
          projectId: this.project.projectId,
          programId: this.programId,
          solutionId: this.solutionId,
          hasAcceptedTAndC: this.project.hasAcceptedTAndC,
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
        replaceUrl: true,
        certificate:false
      }
      this.projectService.getProjectDetails(payload);
    }
  },900)
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
            replaceUrl: false,
            certificate:false
          }
          this.projectService.getProjectDetails(payload);
        })
    } else {
      this.router
      .navigate([`/${RouterLinks.PROJECT}`], {
        queryParams: {
          selectedFilter: 'discoveredByMe',
        },
      }).then(() => {
        const params = {
          projectId: this.project.projectId,
          programId: this.programId,
          solutionId: this.solutionId,
          replaceUrl: false,
          hasAcceptedTAndC: this.project.hasAcceptedTAndC,
          certificate:false,
          isProfileInfoRequired: true,
          reference: { referenceFrom: "link", link: this.projectLink }
        }
        this.projectService.getProjectDetails(params)
      })
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
  openStartIMPPopup(){
    if(!this.project?.projectId){
      this.popupService.showStartIMPForProjectPopUp('FRMELEMNTS_LBL_START_IMPROVEMENT', 'FRMELEMNTS_LBL_START_IMP_POPUP_MSG1', 'FRMELEMNTS_LBL_START_IMP_POPUP_MSG2', 'FRMELEMNTS_LBL_START_IMPROVEMENT')
      .then((data: any) => {
        if(data){
          this.doAction();
        }
      })
    }
   }
   private async showProfileNameConfirmationPopup() {
     let listing;
     if(this.projectlisting){
       listing = 'project'
     }else if(this.programlisting){
      listing = 'program'
     }else{
      listing = false
     }
    let params ={
      isTargeted :this.isTargeted,
       programId: this.programId,
       solutionId :this.solutionId,
       isATargetedSolution :this.isATargetedSolution ,
       type  :this.isAssignedProject ? 'assignedToMe' : 'createdByMe',
       listing : listing
     }
   this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.PROJECT_TEMPLATE}`, this.solutionId], {
     queryParams: params,
     skipLocationChange: false,
     replaceUrl: true,
     state: {
       "referenceFrom": "link",
   }})
  
    this.clickedOnProfile = true;
    const popUp = await this.popoverController.create({
      component: ProfileNameConfirmationPopoverComponent,
      componentProps: {
        projectContent: this.project
      },
      cssClass: 'sb-popover sb-profile-name-confirmation-popover',
    });
    await popUp.present();
    const { data } = await popUp.onDidDismiss();
    if (data !== undefined) {
      if (data.buttonClicked) {
        this.isStarted = true;
        this.clickedOnProfile = false;
        this.doAction();
      }
    }
  }

  ionViewWillLeave(){
    this.popupService.closeConsent()
  }
  checkForActions(event){
    if(!this.project?.programJoined && this.project.hasOwnProperty('requestForPIIConsent')){
      this.popupService.joinProgram(this.project,'project')
      .then(async resp => {
        if(resp){
          let profileData = await this.utils.getProfileInfo();
          this.popupService.join(this.project,profileData).then((data :any) =>{
            if(data){
              this.project.programJoined = true
              let payload = {consumerId: this.project.rootOrganisations, objectId: this.project.programId};
              if(this.project.requestForPIIConsent){
                this.popupService.showConsent('Program',payload,this.project,profileData,'FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS').then(async (data)=>{
                  if(data){
                    this.project.programJoined = true
                  }
                })
              }else{
                this.commonUtils.showToast('FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS','','',9000,'top');
              }
              
            }
          },error =>{})
        }
      });
      return
    }else {
      this.openStartIMPPopup()
    }
  }
}