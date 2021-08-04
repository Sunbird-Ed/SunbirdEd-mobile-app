import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, ModalController } from '@ionic/angular';
import { LocalStorageService, LoaderService, UtilsService, ToastService } from '../core';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';
import { QuestionMapModalComponent } from './question-map-modal/question-map-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { RouterLinks } from '@app/app/app.constant';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.page.html',
  styleUrls: ['./questionnaire.page.scss'],
})
export class QuestionnairePage implements OnInit, OnDestroy {
  @ViewChild('sample',  {static: false}) nameInputRef: ElementRef;
  @ViewChild('pageTop',  {static: false}) pageTop: IonContent;
  private _appHeaderSubscription?: Subscription;

  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
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
    // private events: Events,
    private routerParam: ActivatedRoute,
    // private diagnostic: Diagnostic,
    // private translate: TranslateService,
    private network: Network,
    private alertCtrl: AlertController,
    // private ngps: NetworkGpsProvider,
    private headerService: AppHeaderService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private router: Router,
    private commonUtilService:CommonUtilService
  ) {

    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submisssionId;
      this.selectedEvidenceIndex = params.evidenceIndex;
      this.selectedSectionIndex = params.sectionIndex;
      this.schoolName = params.schoolName;
    });

    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe((eventName) => {
      if (eventName.name === 'questionMap') {
        this.openQuestionMap();
      }
    });

    // Online event
    // this.networkAvailable = this.ngps.getNetworkStatus();
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((data) => {
        this.schoolData = data;
        const currentEvidences = this.schoolData['assessment']['evidences'];
        this.enableQuestionReadOut = this.schoolData['solution']['enableQuestionReadOut'];
        this.captureGpsLocationAtQuestionLevel = this.schoolData['solution']['captureGpsLocationAtQuestionLevel'];
        this.countCompletedQuestion = this.utils.getCompletedQuestionsCount(
          this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex][
            'questions'
          ]
        );

        this.selectedEvidenceId = currentEvidences[this.selectedEvidenceIndex].externalId;
        this.localImageListKey = 'images_' + this.selectedEvidenceId + '_' + this.submissionId;
        this.isViewOnly = !currentEvidences[this.selectedEvidenceIndex]['startTime'] ? true : false;

        this.questions =
          currentEvidences[this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex]['questions'];
        this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][
          this.selectedSectionIndex
        ].totalQuestions = this.questions.length;
        this.dashbordData = {
          questions: this.questions,
          evidenceMethod: currentEvidences[this.selectedEvidenceIndex]['name'],
          sectionName: currentEvidences[this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex].name,
          currentViewIndex: this.start,
        };
        this.isCurrentEvidenceSubmitted = currentEvidences[this.selectedEvidenceIndex].isSubmitted;
        if (this.isCurrentEvidenceSubmitted || this.isViewOnly) {
          document.getElementById('stop').style.pointerEvents = 'none';
        }
      })
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = ['questionMap'];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewDidLoad() {}

  async openQuestionMap() {
    const questionModal = await this.modalCtrl.create({
      component: QuestionMapModalComponent,
      componentProps: {
        data: this.dashbordData,
      },
    });
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
      this.questions[this.start].endTime = this.questions[this.start] ? Date.now() : '';
      this.questions[this.start].isCompleted = this.utils.isPageQuestionComplete(this.questions[this.start]);
    }
    if (this.questions[this.start].children.length) {
      this.updateTheChildrenQuestions(this.questions[this.start]);
    }
    if (this.end < this.questions.length && !status) {
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData);
      this.start++;
      this.end++;
      this.dashbordData.currentViewIndex = this.start;
      if (
        this.questions[this.start].visibleIf.length &&
        this.questions[this.start].visibleIf[0] &&
        !this.checkForQuestionDisplay(this.questions[this.start])
      ) {
        this.questions[this.start].isCompleted = true;
        this.next();
      } else if (
        this.questions[this.start].visibleIf.length &&
        this.questions[this.start].visibleIf[0] &&
        this.checkForQuestionDisplay(this.questions[this.start])
      ) {
      }
    } else if (status === 'completed') {
      this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex].sections[
        this.selectedSectionIndex
      ].progressStatus = this.getSectionStatus();
      this.localStorage
        .setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData)
        .then((success) => {
          this.schoolData.observation || this.schoolData.survey
            ? this.checkForAllEcmCompletion()
            : this.location.back();
        });
    } else {
      this.next('completed');
    }
    this.updateCompletedQuestionCount();
  }

  getSectionStatus(): string {
    let allAnswered = true;
    let currentEcm = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex];
    let currentSection = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex].sections[
      this.selectedSectionIndex
    ];
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
    return currentSection.progressStatus;
  }

  checkForAllEcmCompletion() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((data) => {
        let completedAllSections = true;
        let currentEcm = data.assessment.evidences[this.selectedEvidenceIndex];
        for (const section of currentEcm.sections) {
          if (section.progressStatus !== 'completed') {
            completedAllSections = false;
            break;
          }
        }
        if (completedAllSections && !currentEcm.isSubmitted) {
          this.openActionSheet();
        } else {
          this.location.back();
        }
      })
  }

  async openActionSheet() {
    let translateObject;
    this.translate
      .get(['FRMELEMNTS_BTN_SUBMIT_FORM', 'FRMELEMNTS_BTN_PREVIEW_FORM', 'FRMELEMNTS_BTN_SAVE_FORM'])
      .subscribe((translations) => {
        translateObject = translations;
      });
    let actionSheet = await this.actionSheetCtrl.create({
      // title: 'Modify your album',
      buttons: [
        {
          text: translateObject['FRMELEMNTS_BTN_SUBMIT_FORM'],
          icon: 'cloud-upload',
          handler: () => {
            this.checkForNetworkTypeAlert();
          },
        },
        {
          text: translateObject['FRMELEMNTS_BTN_PREVIEW_FORM'],
          icon: 'clipboard',
          handler: () => {
            this.router.navigate([RouterLinks.SUBMISSION_PREVIEW], {
              queryParams: {
                submissionId: this.submissionId,
                name: this.schoolName,
                selectedEvidenceIndex: this.selectedEvidenceIndex,
              },
            });
          },
        },
        {
          text: translateObject['FRMELEMNTS_BTN_SAVE_FORM'],
          icon: 'file-tray-full',
          handler: () => {
            this.location.back();
          },
        },
      ],
    });
    actionSheet.present();
  }

  async checkForNetworkTypeAlert() {
    if (
      this.network.type === 'cellular' ||
      this.network.type === 'unknown' ||
      this.network.type === '2g' ||
      this.network.type === 'ethernet'
    ) {
      let translateObject;
      this.translate
        .get(['CONFIRM', 'YES', 'NO', 'FRMELEMENTS_LBL_SLOW_INTERNET'])
        .subscribe((translations) => {
          translateObject = translations;
        });
      let alert = await this.alertCtrl.create({
        header: translateObject['CONFIRM'],
        message: translateObject['FRMELEMENTS_LBL_SLOW_INTERNET'],
        buttons: [
          {
            text: translateObject['NO'],
            role: 'cancel',
            handler: () => {
            },
          },
          {
            text: translateObject['YES'],
            handler: () => {
              this.goToImageListing();
            },
          },
        ],
      });
      await alert.present();
    } else if (this.network.type === 'wifi' || this.network.type === '3g' || this.network.type === '4g') {
      this.goToImageListing();
    } else if (this.network.type === 'none') {
      let noInternetMsg;
      this.translate.get(['FRMELEMENTS_MSG_FEATURE_USING_OFFLINE']).subscribe((translations) => {
        noInternetMsg = translations['FRMELEMENTS_MSG_FEATURE_USING_OFFLINE'];
        this.toast.openToast(noInternetMsg);
      });
    }
  }

  goToImageListing() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.router.navigate([RouterLinks.IMAGE_LISTING], {
        queryParams: {
          submissionId: this.submissionId,
          name: this.schoolName,
          selectedEvidenceIndex: this.selectedEvidenceIndex,
        },
      });
    } else {
      this.translate.get('FRMELEMNTS_MSG_CONNECT_TO_INTERNET').subscribe((translations) => {
        this.toast.openToast(translations);
      });
    }
  }

  updateCompletedQuestionCount() {
    this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][
      this.selectedSectionIndex
    ].completedQuestions = this.utils.getCompletedQuestionsCount(
      this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex][
        'questions'
      ]
    );
    this.countCompletedQuestion = this.utils.getCompletedQuestionsCount(
      this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections'][this.selectedSectionIndex][
        'questions'
      ]
    );
  }

  updateLocalData(): void {
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData);
  }

  checkForQuestionDisplay(qst): boolean {
    return this.utils.checkForDependentVisibility(qst, this.questions);
  }

  updateTheChildrenQuestions(parentQuestion) {
    for (const child of parentQuestion.children) {
      for (const question of this.questions) {
        if (
          child === question._id &&
          eval(
            '"' + parentQuestion.value + '"' + question.visibleIf[0].operator + '"' + question.visibleIf[0].value + '"'
          ) &&
          !question.value
        ) {
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
      this.questions[this.start].endTime = this.questions[this.start] ? Date.now() : '';
      this.questions[this.start].isCompleted = this.utils.isPageQuestionComplete(this.questions[this.start]);
    }
    if (this.questions[this.start].children.length) {
      this.updateTheChildrenQuestions(this.questions[this.start]);
    }
    if (this.start > 0) {
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData);
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
    this.modalRefrnc.onDidDismiss((data) => {
      if (data >= 0) {
        this.start = data;
        this.end = data + 1;
        this.dashbordData.currentViewIndex = data;
      }
    });
  }
  checkForEvidenceCompletion(): boolean {
    let allAnswered;
    let evidenceSections = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex]['sections']
     let currentEvidence = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex];
    for (const section of evidenceSections) {
      allAnswered = true;
      for (const question of section.questions) {
        if (!question.isCompleted) {
          allAnswered = false;
          break;
        }
      }
      if (currentEvidence.isSubmitted) {
        section.progressStatus = 'submitted';
      } else if (!currentEvidence.startTime) {
        section.progressStatus = '';
      } else if (allAnswered) {
        section.progressStatus = 'completed';
      } else if (!allAnswered && section.progressStatus) {
        section.progressStatus = 'inProgress';
      } else if (!section.progressStatus) {
        section.progressStatus = '';
      }
    }
    let allAnsweredForEvidence = true;
    for (const section of evidenceSections) {
      if (section.progressStatus !== 'completed') {
        allAnsweredForEvidence = false;
        break;
      }
    }
    return allAnsweredForEvidence
  }

  ionViewWillLeave() {
    this.headerConfig.actionButtons = [];
    this.headerService.updatePageConfig(this.headerConfig);
  }
}