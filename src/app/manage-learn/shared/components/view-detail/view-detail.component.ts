import { Component } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent {
  submission: any;

  constructor(params: NavParams, private modalCtrl: ModalController, public platform: Platform) {
    this.submission = params.get('submission');
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
