import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss'],
})
export class HintComponent implements OnInit {
  hint: any;
  constructor(private modalCtrl: ModalController, public navParams: NavParams) {
    this.hint = this.navParams.get('hint');
  }

  ngOnInit() {}
  cancel(): void {
    this.modalCtrl.dismiss();
  }
}
