import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { CommonUtilService,AppHeaderService } from '@app/services';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UtilsService, LocalStorageService, LoaderService, ToastService } from '../../core';
import { EvidenceService } from '../../core/services/evidence.service';
import { UpdateTrackerService } from '../../core/services/update-tracker.service';
import { ObservationService } from '../../observation/observation.service';
import { GenericPopUpService } from '../../shared';

@Component({
  selector: 'app-domain-ecm-lsiting',
  templateUrl: './domain-ecm-lsiting.component.html',
  styleUrls: ['./domain-ecm-lsiting.component.scss'],
})
export class DomainEcmLsitingComponent {
  entityName: any;
  entityData: any;
  entityEvidences: any;
  generalQuestions: any;
  recentlyUpdatedEntity: any;
  selectedEvidenceIndex: any;
  currentEvidence: any;
  evidenceSections: any;
  allAnsweredForEvidence: boolean;
  submissionId: any;
  downloadedSubmissionList: any;
  allowMultipleAssessemts: any;
  private _networkSubscription?: Subscription;
  networkFlag: boolean;
  msgs:any
  extrasState:any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
};
  constructor(
    private updateTracker: UpdateTrackerService,
    private utils: UtilsService,
    private localStorage: LocalStorageService,
    private evdnsServ: EvidenceService,
    private platform: Platform,
    private headerService: AppHeaderService,
    private routerParam: ActivatedRoute,
    private router: Router,
    private observationService: ObservationService,
    public genericPopup: GenericPopUpService,
    public loader: LoaderService,
    public commonUtilService: CommonUtilService,
    public toast: ToastService,
    private translate: TranslateService,

  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submisssionId;
      this.entityName = params.schoolName;
      this.allowMultipleAssessemts = params.allowMultipleAssessemts;
    });
    this.extrasState = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(
      async (available: boolean) => {
        this.networkFlag = available;
      }
    );
    this.translate.get(['FRMELEMENTS_MSG_FORM_DOWNLOADING']).subscribe(data => {
      this.msgs = data;
    })
  }

  ionViewWillEnter() {
    if(this.extrasState){
      this.getAssessmentDetails(this.extrasState);
    }else{
      this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((successData) => {
     this.getAssessmentDetails(successData);
      });
    }
    this.headerConfig = this.headerService.getDefaultPageConfig();
        this.headerConfig.actionButtons = [];
        this.headerConfig.showHeader = true;
        this.headerConfig.showBurgerMenu = false;
        this.headerService.updatePageConfig(this.headerConfig);
  }

  getAssessmentDetails(successData){
    this.entityData = successData;
    if(this.submissionId){
      this.entityEvidences = this.updateTracker.getLastModifiedInEvidences(
        this.entityData['assessment']['evidences'],
        this.recentlyUpdatedEntity
      );
      this.mapCompletedAndTotalQuestions();
      this.checkForProgressStatus();
      this.localStorage
        .getLocalStorage('generalQuestions_' + this.submissionId)
        .then((successData) => {
          this.generalQuestions = successData;
        });
        this.fetchDownloaded();
    }else{
      this.entityEvidences =  this.entityData['assessment']['evidences'];
    }
  }

  mapCompletedAndTotalQuestions() {
    for (const evidence of this.entityEvidences) {
      let totalQuestions = 0;
      let completedQuestions = 0;
      let sectionLength = evidence.sections.length
      let completedSections = 0;
      for (const section of evidence.sections) {
        totalQuestions = totalQuestions + section.totalQuestions;
        completedQuestions = completedQuestions + section.completedQuestions;
        if(section.progressStatus ===  "completed"){
          completedSections += 1;
        }
      }
      let percentage = totalQuestions ? (completedQuestions / totalQuestions) * 100 : completedSections ? (completedSections/sectionLength) * 100 : 0;
      if (!completedQuestions && !completedSections) {
        percentage = 0;
      }
      evidence.completePercentage = Math.trunc(percentage);
    }
  }

  checkForProgressStatus() {
    for (const evidence of this.entityEvidences) {
      if (evidence.isSubmitted) {
        evidence.progressStatus = 'submitted';
      } else if (!evidence.startTime) {
        evidence.progressStatus = '';
      } else {
        evidence.progressStatus = 'completed';
        for (const section of evidence.sections) {
          if (section.progressStatus === 'inProgress' || !section.progressStatus) {
            evidence.progressStatus = 'inProgress';
          }
        }
      }
    }
  }

  navigateToEvidence(index): void {
    if (this.entityEvidences[index].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[index].externalId, this.submissionId);
      this.router.navigate([RouterLinks.SECTION_LISTING], {
        queryParams: {
          submisssionId: this.submissionId,
          evidenceIndex: index,
          schoolName: this.entityName,
        },
      });
    } else {
      const entity = { _id: this.submissionId, name: this.entityName };
      this.openAction(entity, index);
    }
  }

  async openAction(assessment, evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, assessment._id);
    const options = {
      _id: assessment._id,
      name: assessment.name,
      selectedEvidence: evidenceIndex,
      entityDetails: this.entityData,
    };
    return 'view'
  }

  async openEvidence(evidenceIndex) {
    this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, this.submissionId);
    this.currentEvidence = this.entityData['assessment']['evidences'][evidenceIndex];
    this.evidenceSections = this.currentEvidence['sections'];
    this.checkForEvidenceCompletion();
    if (this.entityEvidences[evidenceIndex].startTime) {
      this.utils.setCurrentimageFolderName(this.entityEvidences[evidenceIndex].externalId, this.submissionId);

      this.selectedEvidenceIndex = evidenceIndex;
      this.currentEvidence = this.entityData['assessment']['evidences'][this.selectedEvidenceIndex];
      this.evidenceSections = this.currentEvidence['sections'];
      this.checkForEvidenceCompletion();
    } else {
      const entity = { _id: this.submissionId, name: this.entityName };
      let action = this.submissionId ?  await this.openAction(entity, evidenceIndex) : null;
      this.selectedEvidenceIndex = evidenceIndex;
      this.currentEvidence = this.entityData['assessment']['evidences'][this.selectedEvidenceIndex];
      this.evidenceSections = this.currentEvidence['sections'];
      this.checkForEvidenceCompletion();
    }
  }

  checkForEvidenceCompletion(): void {
    let allAnswered;
    for (const section of this.evidenceSections) {
      allAnswered = true;
      for (const question of section.questions) {
        if (!question.isCompleted) {
          allAnswered = false;
          break;
        }
      }
      if (this.currentEvidence.isSubmitted) {
        section.progressStatus = 'submitted';
      } else if (!this.currentEvidence.startTime) {
        section.progressStatus = '';
      } else if (allAnswered) {
        section.progressStatus = 'completed';
      } else if (!allAnswered && section.progressStatus) {
        section.progressStatus = 'inProgress';
      } else if (!section.progressStatus) {
        section.progressStatus = '';
      }
    }
    this.allAnsweredForEvidence = true;
    for (const section of this.evidenceSections) {
      if (section.progressStatus !== 'completed') {
        this.allAnsweredForEvidence = false;
        break;
      }
    }
    if (this.submissionId) {
     this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.entityData);
    }
  }

  async goToQuestioner(selectedSection) {
    const params = {
      _id: this.submissionId,
      name: this.entityName,
      selectedEvidence: this.selectedEvidenceIndex,
      selectedSection: selectedSection,
    };
    // //
    // if (!this.entityEvidences[this.selectedEvidenceIndex].startTime) {
    //   const entity = { _id: this.submissionId, name: this.entityName };
    //   let action = await this.openAction(entity, this.selectedEvidenceIndex);
    // }

    // //
    if (!this.evidenceSections[selectedSection].progressStatus && this.submissionId) {
      this.evidenceSections[selectedSection].progressStatus = this.currentEvidence.startTime ? 'inProgress' : '';
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.entityData);
    }

    this.router.navigate([RouterLinks.QUESTIONNAIRE], {
      queryParams: {
        submisssionId: this.submissionId,
        evidenceIndex: this.selectedEvidenceIndex,
        sectionIndex: selectedSection,
        schoolName: this.entityName,
      }, state: this.extrasState //State is using for Template view for Deeplink.
    });
  }

  async fetchDownloaded() {
    this.downloadedSubmissionList = await this.observationService.fetchDownloaded();
  }

  async pushToLocal() {
    if (!this.networkFlag) {
      this.toast.showMessage("FRMELEMENTS_MSG_FEATURE_USING_OFFLINE", "danger");
      return
    }
    let args = {
      title: 'DOWNLOAD_FORM',
      yes: 'YES',
      no: 'NO',
    };
    try {
      const confirmed = await this.genericPopup.confirmBox(args);
      if (!confirmed) return;
      
      this.loader.startLoader(this.msgs['FRMELEMENTS_MSG_FORM_DOWNLOADING'])
      await this.observationService.pushToDownloads(this.submissionId);
      this.fetchDownloaded();
      let successArgs = {
        title: 'FRMELEMENTS_MSG_FORM_DOWNLOADED',
        yes: 'OKAY',
        autoDissmiss: true,
      };
      this.loader.stopLoader()
      await this.genericPopup.confirmBox(successArgs);
    } catch {
      this.loader.stopLoader()
    }
  }
  notApplicableClick(selectedSectionIndex){
    this.evdnsServ.openConfirmation(this.entityData,selectedSectionIndex,this.submissionId)
  }
  ngOnDestroy() {
    if (this._networkSubscription) {
      this._networkSubscription.unsubscribe();
    }
  }
}
