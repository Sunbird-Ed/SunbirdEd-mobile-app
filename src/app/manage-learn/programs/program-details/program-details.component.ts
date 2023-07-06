import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '../../../../../src/services/app-header.service';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption';
import { TranslateService } from '@ngx-translate/core';
import { GenericPopUpService } from '../../shared';
import { ActivatedRoute, Router } from '@angular/router';
import { urlConstants } from '../../core/constants/urlConstants';
import { LoaderService, UtilsService, ToastService, LocalStorageService } from '../../core';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { RouterLinks } from '../../../../app/app.constant';
import { SurveyProviderService } from '../../core/services/survey-provider.service';
import { UpdateLocalSchoolDataService } from '../../core/services/update-local-school-data.service';
import { storageKeys } from '../../storageKeys';
import { CommonUtilService } from '../../../../services/common-util.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-program-details',
  templateUrl: './program-details.component.html',
  styleUrls: ['./program-details.component.scss'],
})
export class ProgramDetailsComponent implements OnInit {
  headerConfig = {
    showHeader : true,
    showBurgerMenu : false,
    actionButtons : []
  }
  filtersList : any = []
  selectedFilterIndex = 0
  layout = LibraryFiltersLayout.ROUND
  selectedSection: any
  showMore:boolean=false
  description
  characterLimit = 150
  programDetails:any={};
  solutionsList:any=[]
  filteredList:any=[]
  sharingStatus:any='REVOKED'
  programId
  count = 0;
  limit = 25;
  page = 1;
  isNewProgram = false
  lastUpdatedOn:any
  payload
  public unsubscribe$: Subject<void>= new Subject<void>()
  dataloaded : boolean = false;
  constructor(private headerService: AppHeaderService, private translate: TranslateService, private popupService: GenericPopUpService,
    private activatedRoute: ActivatedRoute, private loader: LoaderService, private utils: UtilsService, private kendraService: KendraApiService,
    private toastService: ToastService, private router: Router, private surveyProvider: SurveyProviderService, private ulsdp: UpdateLocalSchoolDataService,
    private localStorage: LocalStorageService, private commonUtils: CommonUtilService) {
    this.translate.get(['ALL','FRMELEMNTS_LBL_PROJECTS','FRMELEMNTS_LBL_OBSERVATIONS','FRMELEMNTS_LBL_SURVEYS']).subscribe((translation)=>{
      this.filtersList = Object.keys(translation).map(translateItem => { return translation[translateItem]})
    })
    activatedRoute.params.subscribe((param)=>{
      this.programId = param.id
      this.getSolutions()
    })
  }

  ngOnInit() {}

  ionViewWillEnter(){
    this.headerConfig = this.headerService.getDefaultPageConfig()
    this.headerConfig.showHeader = true
    this.headerConfig.showBurgerMenu = false
    this.headerConfig.actionButtons = []
    this.headerService.updatePageConfig(this.headerConfig)
  }

  async getSolutions() {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    if (payload) {
      const config = {
        url:`${urlConstants.API_URLS.SOLUTIONS_LISTING}${this.programId}?page=${this.page}&limit=${this.limit}&search=`,
        payload: payload,
      };
      this.kendraService.post(config).pipe(takeUntil(this.unsubscribe$)).subscribe(
        async(success) => {
          this.loader.stopLoader();
          this.dataloaded = true;
          if (success.result.data) {
            this.programDetails = success.result
            this.count = success.result.count;
            this.isNewProgram =  success.result.hasOwnProperty('requestForPIIConsent')
            this.payload = {consumerId: success.result.rootOrganisations, objectId: success.result.programId}
            this.formatList()
            this.readMoreOrLess()
            if(this.isNewProgram && this.programDetails.programJoined && this.programDetails?.requestForPIIConsent){
              let profileData = await this.utils.getProfileInfo();
              await this.popupService.getConsent('Program',this.payload,this.programDetails,profileData).then((response)=>{
                if(response){
                  this.sharingStatus = response?.status || response
                  this.lastUpdatedOn = response?.lastUpdatedOn || Date.now()
                }
              })
            }
          }
        },
        (error) => {
          this.loader.stopLoader();
          this.dataloaded = true;
        }
      );
    } else {
      this.loader.stopLoader();
      this.dataloaded = true;
    }
  }

  ngOnDestroy(){
    this.popupService.closeConsent()
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  readMoreOrLess(){
    if(this.showMore){
      this.description = this.programDetails.description
    }else{
      if(this.programDetails.description.length > this.characterLimit){
        this.description = this.programDetails.description.slice(0,this.characterLimit)+'...'
      }else{
        this.description = this.programDetails.description
      }
    }
  }

  formatList(){
    this.programDetails.data.forEach(data => {
     let sectionName=data.type=='improvementProject'?'projects':data.type+'s'
     let index = this.solutionsList.findIndex((val)=>{return val.sectionName==sectionName})
     if(index!==-1){
      this.solutionsList[index].sectionList.push(data)
     }else{
      let order=data.type=='improvementProject'?0:data.type=='observation'?1:2
      this.solutionsList.push({sectionName:sectionName,sectionList:[data],order:order})
     }
    });
    this.filteredList=this.solutionsList.sort((a,b)=>{return a.order - b.order})
    if(this.selectedSection){
      this.filteredList.forEach(element => {
        if(this.selectedSection == element.sectionName){
          element.show =true;
        }else{
          element.show =false;
        }
      });
    }
  }

  onFilterChange(event){
    this.selectedFilterIndex = event.data.index
    this.filteredList=this.solutionsList
    this.selectedSection = ''
    this.solutionsList.filter((data)=>{
      data.show = false;
    })
    if(event.data.index!==0){
      this.filteredList = this.solutionsList.filter((data)=>{
        return (
          data.show = true,
          data.sectionName == event.data.text.toLowerCase())
      })
      this.selectedSection = event.data.text.toLowerCase()
    }
  }

  joinProgram(){
    this.popupService.joinProgram(this.programDetails,'program',"FRMELEMNTS_LBL_JOIN_PROGRAM_MSG2").then(async(data)=>{
      if(data){
        this.join()
      }
    })
  }

  async join(){
    let profileData = await this.utils.getProfileInfo();
    await this.popupService.join(this.programDetails,profileData).then(async(response:any)=>{
      if(response){
        this.programDetails.programJoined = true
        this.showConsentPopup()
        if(!this.programDetails.requestForPIIConsent){
          this.commonUtils.showToast('FRMELEMNTS_MSG_PROGRAM_JOINED_SUCCESS','','',9000);
        }
      }
    })
  }
  
  async showConsentPopup(){
    let profileData = await this.utils.getProfileInfo();
    if(this.programDetails?.requestForPIIConsent){
      this.popupService.showConsent('Program',this.payload,this.programDetails, profileData).then(async(data)=>{
        if(data){
          this.sharingStatus = data
          this.programDetails.consentShared = true
          this.lastUpdatedOn = Date.now()
        }
      })
    }
  }

  cardClick(data){
    if(!this.programDetails?.programJoined && this.isNewProgram){
      this.joinProgram()
    }else{
      switch (data.type) {
        case 'improvementProject':
          this.redirectProject(data);
          break;
        case 'observation':
          this.redirectObservation(data);
          break;
        case 'survey':
          this.onSurveyClick(data);
          break;
        default:
          break;
      }
    }
  }

  save(event){
    if(this.sharingStatus!==event){
      this.showConsentPopup()
    }else{
      this.commonUtils.showToast('FRMELEMNTS_MSG_DATA_SETTINGS_UPDATE_SUCCESS','','',9000);
    }
  }

  ionViewWillLeave(){
    this.solutionsList = []
    this.filteredList = []
    // this.selectedSection = ''
    this.popupService.closeConsent()
  }

  selectSection(data){
    this.filteredList.forEach(element => {
      if(data.sectionName == element.sectionName){
        data.show = ! data.show;
      }else{
        element.show =false;
      }
    });
    if(data.sectionName != this.selectedSection){
      this.selectedSection = '';
    }else{
      this.selectedSection = data.sectionName
    }
  }

  redirectProject(data) {
    let projectId = '';
    if (data.projectId) {
      projectId = data.projectId;
    }
    if (!projectId) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.PROJECT_TEMPLATE}`, data._id], {
        queryParams: {
          programId: this.programId,
          solutionId: data._id,
          type: 'assignedToMe',
          listing: 'program'
        },
      });
    } else {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
        queryParams: {
          projectId: projectId,
          programId: this.programId,
          solutionId: data._id,
          type: 'assignedToMe'
        },
      });
    }
  }

  redirectObservation(data) {
    let observationId = '';
    if (data.observationId) {
      observationId = data.observationId;
    }
    this.router.navigate(
      [`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`],
      {
        queryParams: {
          programId: this.programId,
          solutionId: data._id,
          observationId: observationId,
          solutionName: data.name,
          entityType: data.entityType ? data.entityType : ''
        },
      }
    );
  }

  onSurveyClick(data) {
    if (data.submissionId && data.submissionId.length) {
      this.localStorage
        .getLocalStorage(storageKeys.submissionIdArray)
        .then((allId) => {
          if (allId.includes(data.submissionId)) {
            this.redirect(data.submissionId);
          } else {
            this.surveyRedirect(data);
          }
        })
        .catch(error => {
          this.surveyRedirect(data);
        })
    } else {
      this.surveyRedirect(data);
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
        if (!res.result) {
          this.surveyProvider.showMsg('surveyExpired');
          return;
        }
        if (res.result && res.result.status == 'completed') {
          // this.toast.openToast(res.message)
          this.surveyProvider.showMsg('surveyCompleted');
          return;
        }
        const survey = res.result;
        this.ulsdp.mapSubmissionDataToQuestion(survey, false, true);
        this.storeRedirect(survey);
      })
      .catch((err) => {});
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
        isSurvey:true
      },
    });
  } 
}
