import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent {
  hint: any;
  constructor(private modalCtrl: ModalController, public navParams: NavParams) {
    this.hint = this.navParams.get('hint');
  }

  cancel(): void {
    this.modalCtrl.dismiss();
  }
}
