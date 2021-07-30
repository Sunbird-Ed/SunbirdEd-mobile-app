import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services';
import { Network } from '@ionic-native/network/ngx';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService, UtilsService } from '../../core';

@Component({
  selector: 'app-submission-preview-page',
  templateUrl: './submission-preview-page.component.html',
  styleUrls: ['./submission-preview-page.component.scss'],
})
export class SubmissionPreviewPageComponent {
  submissionId;
  entityName;
  selectedEvidenceIndex;
  selectedEvidenceName;
  currentEvidence;
  entityDetails;
  evidenceSections;
  allAnsweredForEvidence: boolean;
  networkAvailable: any;
  loaded: boolean = false;
  goBackNum: any;
  constructor(
    // private events: Events,
    private commonUtils: CommonUtilService,
    private routerParam: ActivatedRoute,
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private network: Network,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.networkAvailable = this.commonUtils.networkInfo.isNetworkAvailable;
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submissionId;
      this.selectedEvidenceIndex = params.selectedEvidenceIndex;
      this.entityName = params.name;
      this.goBackNum=params.goBackNum
    });
  }

  ionViewDidEnter() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((data) => {
        this.loaded = true;
        this.entityDetails = data;
        this.currentEvidence = data['assessment']['evidences'][this.selectedEvidenceIndex];
        this.evidenceSections = this.currentEvidence['sections'];
        this.checkForEvidenceCompletion();
      })
      .catch((error) => {
        this.loaded = true;
      });
    //TODO:remove
    //Moved to constructor
    // this.submissionId = this.navParams.get('_id');
    // this.entityName = this.navParams.get('name');
    // this.selectedEvidenceIndex = this.navParams.get('selectedEvidence');
    //TODO till here
    // this.localStorage
    //   .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
    //   .then((data) => {
    //     this.loaded = true;
    //     this.entityDetails = data;
    //     this.currentEvidence = data['assessment']['evidences'][this.selectedEvidenceIndex];
    //     this.evidenceSections = this.currentEvidence['sections'];
    //     this.checkForEvidenceCompletion();
    //   })
    //   .catch((error) => {
    //     this.loaded = true;
    //   });
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
    this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.entityDetails);
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
        .get(['FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_LBL_YES', 'FRMELEMNTS_LBL_NO', 'FRMELEMNTS_LBL_SLOW_INTERNET'])
        .subscribe((translations) => {
          translateObject = translations;
        });
      let alert = await this.alertCtrl.create({
        header: translateObject['FRMELEMNTS_LBL_CONFIRM'],
        message: translateObject['FRMELEMNTS_MSG_SLOW_INTERNET'],
        buttons: [
          {
            text: translateObject['FRMELEMNTS_LBL_NO'],
            role: 'cancel',
            handler: () => {
            },
          },
          {
            text: translateObject['FRMELEMNTS_LBL_YES'],
            handler: () => {
              this.goToImageListing();
            },
          },
        ],
      });
      alert.present();
    } else if (this.network.type === 'wifi' || this.network.type === '3g' || this.network.type === '4g') {
      this.goToImageListing();
    } else if (this.network.type === 'none') {
      let noInternetMsg;
      this.translate.get(['FRMELEMENTS_MSG_FEATURE_USING_OFFLINE']).subscribe((translations) => {
        noInternetMsg = translations['FRMELEMENTS_MSG_FEATURE_USING_OFFLINE'];
        this.commonUtils.showToast(noInternetMsg);
      });
    }
  }

  goToImageListing() {
    if (this.networkAvailable) {
      const params = {
        // selectedEvidenceId: this.currentEvidence._id,
        submissionId: this.submissionId,
        name: this.entityName,
        selectedEvidenceIndex: this.selectedEvidenceIndex,
      };
      this.router.navigate([RouterLinks.IMAGE_LISTING], { queryParams: params,replaceUrl:this.goBackNum?false:true });
    } else {
      this.translate.get('FRMELEMNTS_MSG_PLEASE_NETWORK').subscribe((translations) => {
        this.commonUtils.showToast(translations);
      });
    }
  }
}
