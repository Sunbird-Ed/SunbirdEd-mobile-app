import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '@app/app/manage-learn/core';
import { MatrixModalComponent } from '@app/app/manage-learn/questionnaire/matrix-modal/matrix-modal.component';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-matrix-type-input',
  templateUrl: './matrix-type-input.component.html',
  styleUrls: ['./matrix-type-input.component.scss'],
})
export class MatrixTypeInputComponent implements OnInit {

  @Input() data: any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter();
  @Output() updateLocalData = new EventEmitter();
  @Input() evidenceId: string;
  @Input() schoolId: string;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;
  @Input() submissionId: string;
  @Input() inputIndex;
  @Input() enableGps;
  @Input() enableQuestionReadOut: boolean;
  mainInstance: any;
  initilaData;

  constructor(
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private utils: UtilsService) { }

  ngOnInit() {
    this.data.startTime = this.data.startTime ? this.data.startTime : Date.now();
    this.initilaData = JSON.parse(JSON.stringify(this.data));
  }

  next(status?: any) {
    this.data.isCompleted = this.utils.isMatrixQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  back() {
    this.data.isCompleted = this.utils.isMatrixQuestionComplete(this.data);
    this.previousCallBack.emit('previous');
  }

  addInstances(): void {
    this.data.value = this.data.value ? this.data.value : [];
    this.data.value.push(JSON.parse(JSON.stringify(this.data.instanceQuestions)));
    this.checkForValidation();
  }

  async viewInstance(i) {
    const obj = {
      selectedIndex: i,
      data: JSON.parse(JSON.stringify(this.data)),
      evidenceId: this.evidenceId,
      schoolId: this.schoolId,
      generalQuestion: this.generalQuestion,
      submissionId: this.submissionId,
      questionIndex: this.inputIndex,
      enableQuestionReadOut: this.enableQuestionReadOut
    }
    let matrixModal = await this.modalCtrl.create({
      component: MatrixModalComponent,
      componentProps: obj
    });

    await matrixModal.present();

    const { data } = await matrixModal.onDidDismiss()
    this.updateInstance(i, data)
    // matrixModal.onDidDismiss(instanceValue => {
    //   if (this.enableGps) {
    //     this.checkForGpsLocation(i, instanceValue)
    //   } else {
    //     this.updateInstance(i, instanceValue)
    //   }
    // })
  }

  // checkForGpsLocation(instanceIndex, instanceValue) {
  //   if (JSON.stringify(instanceValue) !== JSON.stringify(this.data.value[instanceIndex]) && this.checkCompletionOfInstance(instanceValue, null)) {
  //     this.utils.startLoader();
  //     this.ngps.getGpsStatus().then(success => {
  //       this.utils.stopLoader();
  //       this.updateInstance(instanceIndex, instanceValue, success)
  //     }).catch(error => {
  //       this.utils.stopLoader();
  //       this.utils.openToast("Please try again.");
  //     })
  //   } else {
  //     this.updateInstance(instanceIndex, instanceValue)
  //   }
  // }

  updateInstance(instanceIndex, instanceValue, gpsLocation?: any) {
    if (instanceValue) {
      this.data.completedInstance = this.data.completedInstance ? this.data.completedInstance : [];
      this.data.value[instanceIndex] = instanceValue;
      let instanceCompletion = this.checkCompletionOfInstance(this.data.value[instanceIndex], gpsLocation);
      if (instanceCompletion) {
        if (this.data.completedInstance.indexOf(instanceIndex) < 0) {
          this.data.completedInstance.push(instanceIndex);
        }
      } else {
        const index = this.data.completedInstance.indexOf(instanceIndex);
        if (index >= 0) {
          this.data.completedInstance.splice(index, 1);
        }
      }
      this.checkForValidation();
    }
  }

  checkCompletionOfInstance(data, gpsLocation): boolean {
    let isCompleted = true;
    if (data) {
      for (const question of data) {
        question.gpsLocation = gpsLocation ? gpsLocation : "";
        if (!question.isCompleted) {
          isCompleted = false;
          return false
        }
      }
    } else {
      isCompleted = false
    }

    return isCompleted

  }

  deleteInstance(instanceIndex): void {
    this.data.value.splice(instanceIndex, 1);
    if (this.data.completedInstance && this.data.completedInstance.length && this.data.completedInstance.indexOf(instanceIndex) >= 0) {
      this.data.completedInstance.splice(instanceIndex, 1);
    }
    this.checkForValidation();

    // }
  }

  checkForValidation(): void {
    this.data.isCompleted = this.utils.isMatrixQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
    this.updateLocalData.emit();
  }


  async deleteInstanceAlert(index) {
    let translateObject;
    this.translate.get(['FRMELEMNTS_LBL_COFIRMATION_DELETE', 'FRMELEMNTS_LBL_COFIRMATION_DELETE_INSTANCE', 'NO', 'YES']).subscribe(translations => {
      translateObject = translations;
    })
    let alert = await this.alertCtrl.create({
      header: translateObject['FRMELEMNTS_LBL_COFIRMATION_DELETE'],
      message: translateObject['FRMELEMNTS_LBL_COFIRMATION_DELETE_INSTANCE'],
      buttons: [
        {
          text: translateObject['NO'],
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: translateObject['YES'],
          handler: () => {
            this.deleteInstance(index);
          }
        }
      ]
    });
    await alert.present();
  }

  getLastModified(instance) {
    let lastModifiedAt = 0;
    for (const question of instance) {
      if (question.startTime > lastModifiedAt) {
        lastModifiedAt = question.startTime;
      }
    }
    return lastModifiedAt
  }

}
