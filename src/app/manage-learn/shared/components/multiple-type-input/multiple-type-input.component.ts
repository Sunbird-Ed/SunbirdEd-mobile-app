import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { UtilsService } from '@app/app/manage-learn/core';
import { ModalController } from '@ionic/angular';
import { HintComponent } from '../hint/hint.component';

@Component({
  selector: 'app-multiple-type-input',
  templateUrl: './multiple-type-input.component.html',
  styleUrls: ['./multiple-type-input.component.scss'],
})
export class MultipleTypeInputComponent implements OnInit {

  text: string;
  @Input() data: any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter();
  @Input() evidenceId: string;
  @Input() hideButton: boolean;
  @Input() schoolId: string;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;
  @Input() submissionId: any;
  @Input() inputIndex;
  @Input() enableQuestionReadOut: boolean;
  constructor(
    private utils: UtilsService,
    // private hintService: HintProvider
     private modalCtrl:ModalController

  ) {
    this.text = "Hello World";


  }
  ngOnInit() {
    this.data.value = this.data.value ? this.data.value : [];
    this.data.startTime = this.data.startTime
      ? this.data.startTime
      : Date.now();

    if (
      !this.data.validation.required ||
      (this.data.value && this.data.value.length)
    ) {
      this.data.isCompleted = true;
    }
  }

  updateModelValue(val) {
    if (this.data.value.indexOf(val) > -1) {
      let index = this.data.value.indexOf(val);
      this.data.value.splice(index, 1);
    } else {
      this.data.value.push(val);
    }
    this.checkForValidation();
  }

  next(status?: string) {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  back() {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.previousCallBack.emit("previous");
  }

  checkForValidation(): void {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
  }

 async openHint(hint) {
    let hintModal = await this.modalCtrl.create({
      component: HintComponent,
      componentProps: {
        hint,
      },
    });
    // await hintModal.onDidDismiss(data => {
    // });
    hintModal.present();
  }
}
