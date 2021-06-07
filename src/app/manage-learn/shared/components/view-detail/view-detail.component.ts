import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit {
  submission: any;

  constructor(params: NavParams, private modalCtrl: ModalController) {
    this.submission = params.get('submission');
  }
  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss();
  }
}
