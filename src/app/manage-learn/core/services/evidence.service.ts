import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RemarksModalComponent } from '../../questionnaire/remarks-modal/remarks-modal.component';
import { urlConstants } from '../constants/urlConstants';
import { AssessmentApiService } from './assessment-api.service';
import { LoaderService } from './loader/loader.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { ToastService } from './toast/toast.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class EvidenceService {
  entityDetails: any;
  evidenceIndex: any;
  schoolId: any;
  constructor(
    private actionSheet: ActionSheetController,
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private toast: ToastService,
    private assessmentService: AssessmentApiService
  ) {}

  openActionSheet(params, type?) {
    type = type ? type : '';
    console.log(JSON.stringify(params) + ' test');
    this.entityDetails = params.entityDetails;
    this.schoolId = params._id;
    this.evidenceIndex = params.selectedEvidence;
    const selectedECM = this.entityDetails['assessment']['evidences'][this.evidenceIndex];
    let translateObject;
    return new Promise((resolve, reject) => {
      this.translate
        .get([
          'FRMELEMNTS_LBL_SURVEY_ACTION',
          'VIEW',
          'START',
          'FRMELEMNTS_LBL_ECM_NOT_APPLICABLE',
          'CANCEL',
          'FRMELEMNTS_LBL_ECM_NOT_ALLOWED',
          'FRMELEMNTS_LBL_OBSERVATION',
        ])
        .subscribe(async (translations) => {
          translateObject = translations;
          console.log(JSON.stringify(translations));
          let action = await this.actionSheet.create({
            header: translateObject['FRMELEMNTS_LBL_SURVEY_ACTION'],
            buttons: [
              {
                text: translateObject['START'] + ' ' + (type ? translateObject[type] : ''),
                icon: 'arrow-forward',
                handler: () => {
                  params.entityDetails['assessment']['evidences'][params.selectedEvidence].startTime = Date.now();

                  this.localStorage.setLocalStorage(
                    this.utils.getAssessmentLocalStorageKey(this.schoolId),
                    params.entityDetails
                  );
                  delete params.entityDetails;
                  // this.appCtrl.getRootNav().push('SectionListPage', params);
                  // this.router.navigate([RouterLinks.SECTION_LISTING], {
                  //   queryParams: {
                  //     submisssionId: this.schoolId,
                  //     evidenceIndex: this.evidenceIndex,
                  //     schoolName: params.name,
                  //   },
                  // });
                  resolve('start');
                  // return action.dismiss('start');
                },
              },
              {
                text: translateObject['VIEW'] + ' ' + (type ? translateObject[type] : ''),
                icon: 'eye',
                handler: () => {
                  delete params.entityDetails;
                  // this.appCtrl.getRootNav().push('SectionListPage', params);
                  // this.router.navigate([RouterLinks.SECTION_LISTING], {
                  //   queryParams: {
                  //     submisssionId: this.schoolId,
                  //     evidenceIndex: this.evidenceIndex,
                  //     schoolName: params.name,
                  //   },
                  // });
                  resolve('view');

                  // return action.dismiss('view');
                },
              },
              {
                text: selectedECM.canBeNotAllowed
                  ? translateObject['FRMELEMNTS_LBL_ECM_NOT_APPLICABLE']
                  : translateObject['CANCEL'],
                role: !selectedECM.canBeNotAllowed ? 'destructive' : '',
                icon: selectedECM.canBeNotAllowed ? 'alert' : '',
                handler: () => {
                  if (selectedECM.canBeNotAllowed) {
                    this.openAlert(selectedECM);
                  }
                },
              },
            ],
          });
          const notAvailable = {
            text: translateObject['FRMELEMNTS_LBL_ECM_NOT_ALLOWED'],
            icon: 'alert',
            handler: () => {
              delete params.entityDetails;
              this.openAlert(selectedECM);
            },
          };
          if (selectedECM.canBeNotAllowed) {
            // action.data.buttons.splice(action.data.buttons.length - 1, 0, notAvailable);TODO:need to verify
            action.buttons.splice(action.buttons.length - 1, 0, notAvailable);
          }
          action.present();
        });
    });
  }

  async openAlert(selectedECM) {
    let translateObject;
    this.translate
      .get(['CANCEL', 'FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_LBL_ECM_NOT_APPLICABLE'])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    let alert = await this.alertCtrl.create({
      header: translateObject['FRMELEMNTS_LBL_CONFIRM'],
      message: translateObject['FRMELEMNTS_LBL_ECM_NOT_APPLICABLE'],
      buttons: [
        {
          text: translateObject['CANCEL'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: translateObject['FRMELEMNTS_LBL_CONFIRM'],
          handler: () => {
            this.openRemarksModal(selectedECM);
          },
        },
      ],
    });
    await alert.present();
  }

  async openRemarksModal(selectedECM) {
    const modal = await this.modalCtrl.create({
      component: RemarksModalComponent,
      componentProps: { data: selectedECM, button: 'submit', required: true },
    });
    await modal.present();

    await modal.onDidDismiss().then((remarks) => {
      if (remarks.data) {
        selectedECM.remarks = remarks.data;
        this.notApplicable(selectedECM);
      }
    });
  }

  async notApplicable(selectedECM) {
    this.loader.startLoader();
    const constructPayload = this.constructPayload(selectedECM);
    const submissionId = this.entityDetails['assessment'].submissionId;
    // const url = AppConfigs.survey.submission + submissionId;
    const url = urlConstants.API_URLS.OBSERVATION_MAKE_SUBMISSION + submissionId;
    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...constructPayload };
    const config = {
      url: url,
      payload: payload,
    };

    this.assessmentService.post(config).subscribe(
      (response) => {
        console.log(JSON.stringify(response));
        this.toast.openToast(response.message);
        this.entityDetails['assessment']['evidences'][this.evidenceIndex].isSubmitted = true;
        this.entityDetails['assessment']['evidences'][this.evidenceIndex].notApplicable = true;
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.schoolId), this.entityDetails);
        this.loader.stopLoader();
      },
      (error) => {
        this.loader.stopLoader();
      }
    );
  }

  constructPayload(selectedECM): any {
    console.log('in construct');
    const payload = {
      evidence: {},
    };
    const evidence = {
      id: '',
      externalId: '',
      answers: {},
      startTime: 0,
      endTime: 0,
      notApplicable: true,
    };

    const currentEvidence = selectedECM;
    evidence.id = currentEvidence._id;
    evidence.externalId = currentEvidence.externalId;
    evidence.startTime = Date.now();
    evidence.endTime = Date.now();
    for (const section of selectedECM.sections) {
      for (const question of section.questions) {
        let obj = {
          qid: question._id,
          value:
            question.responseType === 'matrix'
              ? this.constructMatrixObject(question, evidence.endTime)
              : question.value,
          remarks: question.remarks,
          fileName: question.fileName,
          notApplicable: true,
          startTime: evidence.endTime,
          endTime: evidence.endTime,
          payload: {
            question: question.question,
            labels: [],
            responseType: question.responseType,
          },
        };

        for (const key of Object.keys(question.payload)) {
          obj[key] = question.payload[key];
        }
        evidence.answers[obj.qid] = obj;
      }
    }
    payload.evidence = evidence;
    return payload;
  }

  constructMatrixObject(question, evidenceEndTime) {
    const value = [];
    for (const instance of question.value) {
      let eachInstance = {};
      for (let qst of instance) {
        const obj1 = {
          qid: qst._id,
          value: qst.value,
          remarks: qst.remarks,
          fileName: qst.fileName,
          notApplicable: true,
          startTime: evidenceEndTime,
          endTime: evidenceEndTime,
          payload: {
            question: qst.question,
            labels: [],
            responseType: qst.responseType,
          },
        };
        for (const key of Object.keys(qst.payload)) {
          obj1[key] = qst.payload[key];
        }
        eachInstance[obj1.qid] = obj1;
      }
      value.push(eachInstance);
    }
    return value;
  }
}
