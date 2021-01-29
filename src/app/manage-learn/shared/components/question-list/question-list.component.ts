import { Component, OnInit } from '@angular/core';
import { ToastService } from '@app/app/manage-learn/core';
import { UtilityService } from '@app/services';
import { ModalController, NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit {
  allQuestions;
  filteredQuestions;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // private viewCntrl: ViewController,
    private utils: UtilityService,
    private toast: ToastService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.allQuestions = this.navParams.get('allQuestions');
    this.filteredQuestions = this.navParams.get('filteredQuestions');
  }

  onQuestionClick(externalId) {
    if (this.filteredQuestions.includes(externalId)) {
      const indexOfQuestion = this.filteredQuestions.indexOf(externalId);
      this.filteredQuestions.splice(indexOfQuestion, 1);
    } else {
      this.filteredQuestions.push(externalId);
    }
    console.log(JSON.stringify(this.filteredQuestions));
  }

  applyFilter() {
    !this.filteredQuestions.length
      ? this.toast.openToast('Select at least one question')
      : // : this.viewCntrl.dismiss({
        this.modalCtrl.dismiss({
          filter: this.filteredQuestions,
          action: 'updated',
        });
  }

  close() {
    // this.viewCntrl.dismiss({ action: "cancelled" }); TODO:remove after checking,viewCtrl is not available in i3
    this.modalCtrl.dismiss('cancel');
  }
}
