import { Component, OnInit } from '@angular/core';
import { ToastService } from '@app/app/manage-learn/core';
import { CommonUtilService, UtilityService } from '@app/services';
import { ModalController, NavController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'report-modal-filter',
  templateUrl: './report.modal.filter.html',
  styleUrls: ['./report.modal.filter.scss'],
})
export class ReportModalFilter implements OnInit {
  filteredData: any;
  data: any;
  dataType: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // private viewCntrl: ViewController,
    private utils: UtilityService,
    private toast: ToastService,
    private modalCtrl: ModalController,
    private commonUtilService: CommonUtilService,
    public platform: Platform
  ) {}

  ngOnInit() {
    this.data = this.navParams.get('data');
    this.filteredData = this.navParams.get('filteredData');
    this.dataType = this.navParams.get('dataType');
  }

  /*  onQuestionClick(externalId) {
    if (this.filteredQuestions.includes(externalId)) {
      const indexOfQuestion = this.filteredQuestions.indexOf(externalId);
      this.filteredQuestions.splice(indexOfQuestion, 1);
    } else {
      this.filteredQuestions.push(externalId);
    }
    console.log(JSON.stringify(this.filteredQuestions));
  }
   */
  onQuestionClick(id) {
    if (this.filteredData.includes(id)) {
      const indexOfQuestion = this.filteredData.indexOf(id);
      this.filteredData.splice(indexOfQuestion, 1);
    } else {
      this.filteredData.push(id);
    }
    console.log(JSON.stringify(this.filteredData));
  }

  applyFilter() {
    let msg = this.commonUtilService.translateMessage('FRMELEMENTS_MSG_SELECT_AT_LEAST_ONE_QUESTION');
    if (this.dataType == 'criteria') {
      msg = this.commonUtilService.translateMessage('FRMELEMENTS_MSG_SELECT_AT_LEAST_ONE_CRITERIA');
    }
    !this.filteredData.length
      ? this.toast.openToast(msg)
      : // : this.viewCntrl.dismiss({
        this.modalCtrl.dismiss({
          filter: this.filteredData,
          action: 'updated',
        });
  }
  /* applyFilter() {
    !this.filteredQuestions.length
      ? this.toast.openToast('Select at least one question')
      : // : this.viewCntrl.dismiss({
        this.modalCtrl.dismiss({
          filter: this.filteredQuestions,
          action: 'updated',
        });
  }
 */
  close() {
    this.modalCtrl.dismiss('cancel');
  }
}
