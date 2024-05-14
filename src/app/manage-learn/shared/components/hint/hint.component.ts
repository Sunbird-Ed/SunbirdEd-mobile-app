import { Component } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent {
  hint: any;
  constructor(private modalCtrl: ModalController, public navParams: NavParams, public platform: Platform) {
    this.hint = this.navParams.get('hint');
  }

  cancel(): void {
    this.modalCtrl.dismiss();
  }
}
