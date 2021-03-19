import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-remarks-page',
  templateUrl: './remarks-page.component.html',
  styleUrls: ['./remarks-page.component.scss'],
})
export class RemarksPageComponent implements OnInit {
  @ViewChild('remarkInput', { static: false }) remarkInput;
  data: any;
  button: string;
  required: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController) {
    this.data = this.navParams.get('data');
    this.button = this.navParams.get('button') ? this.navParams.get('button') : 'save';
    this.required = this.navParams.get('required');
  }

  ngOnInit() {}

  update(): void {
    this.modalCtrl.dismiss(this.data.remarks);
  }
  ngAfterViewChecked() {
    this.remarkInput.setFocus();
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
