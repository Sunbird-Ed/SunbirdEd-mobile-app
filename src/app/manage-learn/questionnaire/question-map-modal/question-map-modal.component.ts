import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService, UtilsService } from '../../core';

@Component({
  selector: 'app-question-map-modal',
  templateUrl: './question-map-modal.component.html',
  styleUrls: ['./question-map-modal.component.scss'],
})
export class QuestionMapModalComponent implements OnInit {

  @Input() data: any;
  evidenceMethod: string;
  sectionName: string;
  currentViewIndex: any;
  questions;

  constructor(
    private translate: TranslateService, private toast: ToastService, private modalCtrl: ModalController,
    private utils: UtilsService) {
  }

  ngOnInit() {
    debugger
    this.questions = this.data['questions'];
    this.evidenceMethod = this.data['evidenceMethod'];
    this.sectionName = this.data['sectionName'];
    this.currentViewIndex = this.data['currentViewIndex'];
  }

  isQuestionComplete(question) {
    if (question.responseType.toLowerCase() === 'matrix') {
      return this.utils.isMatrixQuestionComplete(question);
    } else if (question.responseType.toLowerCase() === 'pagequestions') {
      return this.utils.isPageQuestionComplete(question);
    } else {
      return this.utils.isQuestionComplete(question);
    }
  }

  checkForQuestionDisplay(qst): boolean {
    return this.utils.checkForDependentVisibility(qst, this.questions)
  }

  openToast(): void {
    this.translate.get('FRMELEMNTS_MSG_QUESTIONNAIRE_MSG').subscribe(translations => {
      this.toast.openToast(translations);
    })
  }

  goToQuestion(index) {
    this.modalCtrl.dismiss(index);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
