import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '../../../../../src/services/app-header.service';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption';
import { TranslateService } from '@ngx-translate/core';
import { GenericPopUpService } from '../../shared';
import { ActivatedRoute } from '@angular/router';
import { urlConstants } from '../../core/constants/urlConstants';
import { LoaderService, UtilsService, ToastService } from '../../core';
import { KendraApiService } from '../../core/services/kendra-api.service';

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
  programDetails:any={}
  solutionsList:any=[]
  filteredList:any=[]
  sharingStatus='ACTIVE'
  programId
  count = 0;
  limit = 25;
  page = 1;

  constructor(private headerService: AppHeaderService, private translate: TranslateService, private popupService: GenericPopUpService,
    private activatedRoute: ActivatedRoute, private loader: LoaderService, private utils: UtilsService, private kendraService: KendraApiService,
    private toastService: ToastService) {
    this.translate.get(['ALL','FRMELEMNTS_LBL_PROJECTS','FRMELEMNTS_LBL_OBSERVATIONS','FRMELEMNTS_LBL_SURVEY']).subscribe((translation)=>{
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
      this.kendraService.post(config).subscribe(
        (success) => {
          this.loader.stopLoader();
          if (success.result.data) {
            this.programDetails = success.result
            this.count = success.result.count;
            this.formatList()
            this.readMoreOrLess()
          }
        },
        (error) => {
          this.loader.stopLoader();
        }
      );
    } else {
      this.loader.stopLoader();
    }
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
     let sectionName=data.type=='improvementProject'?'projects':data.type=='survey'?data.type:data.type+'s'
     let index = this.solutionsList.findIndex((val)=>{return val.sectionName==sectionName})
     if(index!==-1){
      this.solutionsList[index].sectionList.push(data)
     }else{
      let order=data.type=='improvementProject'?0:data.type=='observation'?1:2
      this.solutionsList.push({sectionName:sectionName,sectionList:[data],order:order})
     }
    });
    this.filteredList=this.solutionsList.sort((a,b)=>{return a.order - b.order})
  }

  onFilterChange(event){
    this.selectedFilterIndex = event.data.index
    this.filteredList=this.solutionsList
    this.selectedSection = ''
    if(event.data.index!==0){
      this.filteredList = this.solutionsList.filter((data)=>{
        return data.sectionName == event.data.text.toLowerCase()
      })
      this.selectedSection = event.data.text.toLowerCase()
    }
  }

  joinProgram(){
    // this.popupService.showJoinProgramForProjectPopup("FRMELEMNTS_LBL_JOIN_PROGRAM_POPUP",this.programDetails.programName,'program',
    // "FRMELEMNTS_LBL_JOIN_PROGRAM_POPUP","FRMELEMNTS_LBL_JOIN_PROGRAM_MSG2").then(
    //   (data:any)=>{
    //     if(data){
    //       this.showConsentPopup()
    //     }
    //   }
    // )
  }
  
  showConsentPopup(message?){
    this.popupService.showConsent('program').then((data)=>{
      if(data!==undefined){
        this.programDetails.programJoined = true
        if(message){
          this.toastService.openToast(message)
        }
      }
    })
  }

  cardClick(){
    if(!this.programDetails.programJoined){
      this.joinProgram()
    }
  }

  save(event){
    let message
    this.translate.get(['FRMELEMNTS_MSG_DATA_SETTINGS_UPDATE_SUCCESS']).subscribe((msg)=>{
      message = msg['FRMELEMNTS_MSG_DATA_SETTINGS_UPDATE_SUCCESS']
    })
    if(this.sharingStatus!==event){
      this.showConsentPopup(message)
      this.sharingStatus=event
    }else{
      this.toastService.openToast(message)
    }
  }

  ionViewWillLeave(){
    this.popupService.closeConsent()
  }

  selectSection(name){
    this.selectedSection = name
  }
}