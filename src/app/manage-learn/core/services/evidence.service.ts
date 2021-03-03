import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './local-storage/local-storage.service';
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
    private router: Router
  ) {}

  openActionSheet(params, type?) {
    type = type ? type : 'Survey';
    console.log(JSON.stringify(params) + ' test');
    this.entityDetails = params.entityDetails;
    this.schoolId = params._id;
    this.evidenceIndex = params.selectedEvidence;
    const selectedECM = this.entityDetails['assessment']['evidences'][this.evidenceIndex];
    let translateObject;
    this.translate
      .get([
        'FRMELEMNTS_LBL_SURVEY_ACTION',
        'VIEW',
        'START',
        'FRMELEMNTS_LBL_ECM_NOT_APPLICABLE',
        'CANCEL',
        'FRMELEMNTS_LBL_ECM_NOT_ALLOWED',
        'FRMELEMNTS_LBL_OBSERVATION'
      ])
      .subscribe(async (translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
        let action = await this.actionSheet.create({
          header: translateObject['FRMELEMNTS_LBL_SURVEY_ACTION'],
          buttons: [
            {
              text: translateObject['START'] + ' ' +( type ?  translateObject[type] : ""),
              icon: 'arrow-forward',
              handler: () => {
                params.entityDetails['assessment']['evidences'][params.selectedEvidence].startTime = Date.now();

                this.localStorage.setLocalStorage(
                  this.utils.getAssessmentLocalStorageKey(this.schoolId),
                  params.entityDetails
                );
                delete params.entityDetails;
                // this.appCtrl.getRootNav().push('SectionListPage', params);
                this.router.navigate([RouterLinks.SECTION_LISTING], {
                  queryParams: {
                    submisssionId: this.schoolId,
                    evidenceIndex: this.evidenceIndex,
                    schoolName: params.name,
                  },
                });
              },
            },
            {
              text: translateObject['VIEW'] + ' ' +( type ?  translateObject[type] : ""),
              icon: 'eye',
              handler: () => {
                delete params.entityDetails;
                // this.appCtrl.getRootNav().push('SectionListPage', params);
                this.router.navigate([RouterLinks.SECTION_LISTING], {
                  queryParams: {
                    submisssionId: this.schoolId,
                    evidenceIndex: this.evidenceIndex,
                    schoolName: params.name,
                  },
                });
              },
            },
            {
              text: selectedECM.canBeNotApplicable
                ? translateObject['FRMELEMNTS_LBL_ECM_NOT_APPLICABLE']
                : translateObject['CANCEL'],
              role: !selectedECM.canBeNotApplicable ? 'destructive' : '',
              icon: selectedECM.canBeNotApplicable ? 'alert' : '',
              handler: () => {
                if (selectedECM.canBeNotApplicable) {
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
  }

  async openAlert(selectedECM) {
    let translateObject;
    this.translate
      .get(['CANCEL', '"FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_LBL_ECM_NOT_APPLICABLE'])
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
            // this.openRemarksModal(selectedECM); //TODO:Verify its use?
          },
        },
      ],
    });
    await alert.present();
  }
}
