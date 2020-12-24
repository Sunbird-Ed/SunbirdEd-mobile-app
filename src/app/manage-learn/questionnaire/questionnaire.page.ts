import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, AlertController, Events, IonContent, ModalController } from '@ionic/angular';
import { LocalStorageService, LoaderService, UtilsService, ToastService } from '../core';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { QuestionMapModalComponent } from './question-map-modal/question-map-modal.component';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.page.html',
  styleUrls: ['./questionnaire.page.scss'],
})
export class QuestionnairePage implements OnInit, OnDestroy {
  @ViewChild('sample') nameInputRef: ElementRef;
  @ViewChild('pageTop') pageTop: IonContent;
  private _appHeaderSubscription?: Subscription;


  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };

  questions: any;
  schoolName: string;
  submissionId: any;
  selectedEvidenceIndex: any;
  selectedSectionIndex: any;
  start: number = 0;
  end: number = 1;
  schoolData: any;
  isLast: boolean;
  isFirst: boolean;
  selectedEvidenceId: string;
  isCurrentEvidenceSubmitted: any;
  allQuestionsOfEvidence: Array<any> = [];
  isViewOnly: boolean;
  dashbordData: any;
  modalRefrnc: any;
  localImageListKey: any;
  countCompletedQuestion: number;
  captureGpsLocationAtQuestionLevel: boolean;
  enableQuestionReadOut: boolean;
  networkAvailable;

  constructor(
    // public navCtrl: NavController,
    // public navParams: NavParams,
    private localStorage: LocalStorageService,
    private loader: LoaderService,
    private utils: UtilsService,
    private toast: ToastService,
    private location: Location,
    // private feedback: FeedbackProvider,
    public actionSheetCtrl: ActionSheetController,
    private events: Events,
    private routerParam: ActivatedRoute,
    // private diagnostic: Diagnostic,
    // private translate: TranslateService,
    // private network: Network,
    private alertCtrl: AlertController,
    // private ngps: NetworkGpsProvider,
    private headerService: AppHeaderService,
    private modalCtrl: ModalController
  ) {
    this.events.subscribe('network:offline', () => {
      this.networkAvailable = false;
    });
    this.routerParam.params.subscribe((parameters) => {
      this.submissionId = parameters.submisssionId;
      this.selectedEvidenceIndex = parameters.evidenceIndex;
      this.selectedSectionIndex = parameters.sectionIndex;
    });

    this.routerParam.queryParams.subscribe((params) => {
      this.schoolName = params.name;
    })

    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      if (eventName.name === 'questionMap') {
        this.openQuestionMap();
      }
    });


    // Online event
    this.events.subscribe('network:online', () => {
      this.networkAvailable = true;
    });
    // this.networkAvailable = this.ngps.getNetworkStatus();
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    // this.loader.startLoader();
    this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId)).then(data => {
      debugger
      this.schoolData = data;
      const currentEvidences = this.schoolData['assessment']['evidences'];
      this.enableQuestionReadOut = this.schoolData['solution']['enableQuestionReadOut'];
      this.captureGpsLocationAtQuestionLevel = this.schoolData['solution']['captureGpsLocationAtQuestionLevel'];
      this.countCompletedQuestion = this.utils.getCompletedQuestionsCount(this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex]['questions']);

      this.selectedEvidenceId = currentEvidences[this.selectedEvidenceIndex].externalId;
      this.localImageListKey = "images_" + this.selectedEvidenceId + "_" + this.submissionId;
      this.isViewOnly = !currentEvidences[this.selectedEvidenceIndex]['startTime'] ? true : false;
      debugger

      this.questions = currentEvidences[this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex]['questions'];
      this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex].totalQuestions = this.questions.length;
      this.dashbordData = {
        questions: this.questions,
        evidenceMethod: currentEvidences[this.selectedEvidenceIndex]['name'],
        sectionName: currentEvidences[this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex].name,
        currentViewIndex: this.start
      }
      this.isCurrentEvidenceSubmitted = currentEvidences[this.selectedEvidenceIndex].isSubmitted
      if (this.isCurrentEvidenceSubmitted || this.isViewOnly) {
        // document.getElementById('stop').style.pointerEvents = 'none';

      }
      // this.loader.stopLoader();
    }).catch(error => {
      // this.loader.stopLoader();

    })
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = ['questionMap'];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewDidLoad() {
  }

  async openQuestionMap() {
    debugger
    const questionModal = await this.modalCtrl.create({
      component: QuestionMapModalComponent,
      componentProps: {
        data: this.dashbordData
      }
    });
    debugger
    await questionModal.present();
    const { data } = await questionModal.onDidDismiss();
    if (data >= 0) {
      this.start = data;
      this.end = data + 1;
      this.dashbordData.currentViewIndex = data;
    }
  }
  // images_CO_5bebcfcf92ec921dcf114828

  next(status?: string) {
    this.pageTop.scrollToTop();
    if (this.questions[this.start].responseType === 'pageQuestions') {
      this.questions[this.start].endTime = this.questions[this.start] ? Date.now() : "";
      this.questions[this.start].isCompleted = this.utils.isPageQuestionComplete(this.questions[this.start]);
    }
    if (this.questions[this.start].children.length) {
      this.updateTheChildrenQuestions(this.questions[this.start])
    }
    if (this.end < this.questions.length && !status) {
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData)
      this.start++;
      this.end++;;
      this.dashbordData.currentViewIndex = this.start;
      if (this.questions[this.start].visibleIf.length && this.questions[this.start].visibleIf[0] && !this.checkForQuestionDisplay(this.questions[this.start])) {
        this.questions[this.start].isCompleted = true;
        this.next();
      } else if (this.questions[this.start].visibleIf.length && this.questions[this.start].visibleIf[0] && this.checkForQuestionDisplay(this.questions[this.start])) {
      }
    } else if (status === 'completed') {
      this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex].sections[this.selectedSectionIndex].progressStatus = this.getSectionStatus();
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData).then(success => {
        this.schoolData.observation || this.schoolData.survey ? this.checkForAllEcmCompletion() : this.location.back();
      })
    } else {
      this.next('completed')
    }
    this.updateCompletedQuestionCount();
    // this.calculateCompletedQuestion();
  }


  getSectionStatus(): string {
    let allAnswered = true;
    let currentEcm = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex];
    let currentSection = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex].sections[this.selectedSectionIndex];
    for (const question of currentSection.questions) {
      if (!question.isCompleted) {
        allAnswered = false;
        break;
      }
    }
    if (currentEcm.isSubmitted) {
      currentSection.progressStatus = 'submitted';
    } else if (!currentEcm.startTime) {
      currentSection.progressStatus = '';
    } else if (allAnswered) {
      currentSection.progressStatus = 'completed';
    } else if (!allAnswered && currentSection.progressStatus) {
      currentSection.progressStatus = 'inProgress';
    } else if (!currentSection.progressStatus) {
      currentSection.progressStatus = '';
    }
    return currentSection.progressStatus
  }


  checkForAllEcmCompletion() {
    this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId)).then(data => {
      let completedAllSections = true;
      let currentEcm = data.assessment.evidences[this.selectedEvidenceIndex];
      for (const section of currentEcm.sections) {
        if (section.progressStatus !== 'completed') {
          completedAllSections = false;
          break
        }
      }
      if (completedAllSections && !currentEcm.isSubmitted) {
        this.openActionSheet();
      } else {
        this.location.back();
      }
    }).catch(error => {

    })
  }

  async openActionSheet() {
    let translateObject;
    // this.translate.get(['actionSheet.submitForm', 'actionSheet.previewForm', 'actionSheet.saveForm']).subscribe(translations => {
    //   translateObject = translations;
    // })
    let actionSheet = await this.actionSheetCtrl.create({
      // title: 'Modify your album',
      buttons: [
        {
          text: translateObject['actionSheet.submitForm'],
          icon: 'cloud-upload',
          handler: () => {
            this.checkForNetworkTypeAlert();
          }
        },
        {
          text: translateObject['actionSheet.previewForm'],
          icon: 'clipboard',
          handler: () => {
            const payload = {
              _id: this.submissionId,
              name: this.schoolName,
              selectedEvidence: this.selectedEvidenceIndex
            }
            // this.navCtrl.push(PreviewPage, payload);
          }
        },
        {
          text: translateObject['actionSheet.saveForm'],
          icon: 'filing',
          handler: () => {
            this.location.back();
          }
        }
      ]
    });
    actionSheet.present();
  }

  checkForNetworkTypeAlert() {
    // if (this.network.type === 'cellular' || this.network.type === 'unknown' || this.network.type === '2g' || this.network.type === 'ethernet') {
    //   let translateObject;
    //   this.translate.get(['actionSheet.confirm', 'actionSheet.yes', 'actionSheet.no', 'actionSheet.slowInternet']).subscribe(translations => {
    //     translateObject = translations;
    //   })
    //   let alert = this.alertCtrl.create({
    //     title: translateObject['actionSheet.confirm'],
    //     message: translateObject['actionSheet.slowInternet'],
    //     buttons: [
    //       {
    //         text: translateObject['actionSheet.no'],
    //         role: 'cancel',
    //         handler: () => {
    //           //console.log('Cancel clicked');
    //         }
    //       },
    //       {
    //         text: translateObject['actionSheet.yes'],
    //         handler: () => {
    //           this.goToImageListing();
    //         }
    //       }
    //     ]
    //   });
    //   alert.present();
    // } else if (this.network.type === 'wifi' || this.network.type === '3g' || this.network.type === '4g') {
    //   this.goToImageListing()
    // } else if (this.network.type === 'none') {
    //   let noInternetMsg;
    //   this.translate.get(['toastMessage.networkConnectionForAction']).subscribe(translations => {
    //     noInternetMsg = translations['toastMessage.networkConnectionForAction'];
    //     this.toast.openToast(noInternetMsg);
    //   })
    // }
  }

  goToImageListing() {
    // if (this.networkAvailable) {
    //   this.diagnostic
    //     .isLocationAuthorized()
    //     .then((authorized) => {
    //       if (!AppConfigs.enableGps) {
    //         return true;
    //       }
    //       if (authorized) {
    //         return this.diagnostic.isLocationEnabled();
    //       } else {
    //         this.toast.openToast("Please enable location permission to continue.");
    //       }
    //     })
    //     .then((success) => {
    //       if (success) {
    //         const params = {
    //           _id: this.submissionId,
    //           name: this.schoolName,
    //           selectedEvidence: this.selectedEvidenceIndex,
    //         };
    //         this.navCtrl.push(ImageListingPage, params);
    //       } else {
    //         this.ngps.checkForLocationPermissions();
    //       }
    //     })
    //     .catch((error) => {
    //       this.ngps.checkForLocationPermissions();
    //     });
    // } else {
    //   this.translate.get('toastMessage.connectToInternet').subscribe(translations => {
    //     this.toast.openToast(translations);
    //   })
    // }


  }


  updateCompletedQuestionCount() {
    this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex].completedQuestions = this.utils.getCompletedQuestionsCount(this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex]['questions']);
    this.countCompletedQuestion = this.utils.getCompletedQuestionsCount(this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex]['questions']);

  }

  updateLocalData(): void {
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData)
  }

  checkForQuestionDisplay(qst): boolean {
    return this.utils.checkForDependentVisibility(qst, this.questions)
  }

  updateTheChildrenQuestions(parentQuestion) {
    for (const child of parentQuestion.children) {
      for (const question of this.questions) {
        if (child === question._id && (eval('"' + parentQuestion.value + '"' + question.visibleIf[0].operator + '"' + question.visibleIf[0].value + '"')) && !question.value) {
          question.isCompleted = false;
        } else if (child === question._id && parentQuestion.value !== question.visibleIf[0].value) {
          question.isCompleted = true;
        }
      }
    }
  }

  back() {
    this.pageTop.scrollToTop();
    if (this.questions[this.start].responseType === 'pageQuestions') {
      this.questions[this.start].endTime = this.questions[this.start] ? Date.now() : "";
      this.questions[this.start].isCompleted = this.utils.isPageQuestionComplete(this.questions[this.start]);
    }
    if (this.questions[this.start].children.length) {
      this.updateTheChildrenQuestions(this.questions[this.start])
    }
    if (this.start > 0) {
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData)
      this.start--;
      this.dashbordData.currentViewIndex = this.start;
      this.end--;
      if (this.questions[this.start].visibleIf.length && !this.checkForQuestionDisplay(this.questions[this.start])) {
        this.back();
      }
    }
    this.updateCompletedQuestionCount();
  }

  feedBack() {
    // this.feedback.sendFeedback()
  }

  setModalRefernc(refrc): void {
    this.modalRefrnc = refrc;
    this.modalRefrnc.onDidDismiss(data => {
      if (data >= 0) {
        this.start = data;
        this.end = data + 1;
        this.dashbordData.currentViewIndex = data;
      }
    })
  }

}
