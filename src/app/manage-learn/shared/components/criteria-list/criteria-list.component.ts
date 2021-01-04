import { Component, OnInit } from '@angular/core';
import { ToastService, UtilsService } from '@app/app/manage-learn/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-criteria-list',
  templateUrl: './criteria-list.component.html',
  styleUrls: ['./criteria-list.component.scss'],
})
export class CriteriaListComponent implements OnInit {
  allCriterias: any;
  filteredCriterias: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // private viewCntrl: ViewController,
    private utils: UtilsService,
    private toast: ToastService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.allCriterias = this.navParams.get('allCriterias');
    this.filteredCriterias = this.navParams.get('filteredCriterias');
  }

  onCriteriaClick(externalId) {
    if (this.filteredCriterias.includes(externalId)) {
      const indexOfQuestion = this.filteredCriterias.indexOf(externalId);
      this.filteredCriterias.splice(indexOfQuestion, 1);
    } else {
      this.filteredCriterias.push(externalId);
    }
    console.log(JSON.stringify(this.filteredCriterias));
  }
  applyFilter() {
    !this.filteredCriterias.length
      ? this.toast.openToast('Select at least one criteria')
      : //
        this.modalCtrl.dismiss({
          filter: this.filteredCriterias,
          action: 'updated',
        });
  }

  close() {
    this.modalCtrl.dismiss({ action: 'cancelled' });
  }
}
