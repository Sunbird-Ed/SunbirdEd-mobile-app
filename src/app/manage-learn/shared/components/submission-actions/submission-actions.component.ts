import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ViewDetailComponent } from '../view-detail/view-detail.component';

@Component({
  selector: 'app-submission-actions',
  templateUrl: './submission-actions.component.html',
  styleUrls: ['./submission-actions.component.scss'],
})
export class SubmissionActionsComponent implements OnInit {
  text: string;
  submission: any;
  translateObject: any;
  constructor(
    private navParams: NavParams,
    private alertCntrler: AlertController,
    // private viewCntrlr: ViewController,
    public popover: PopoverController,
    private translateService: TranslateService,
    private modalCtrl: ModalController,
    private datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.submission = this.navParams.get('submission');
    this.translateService
      .get(['FRMELEMNTS_BTN_UPDATE', 'CANCEL', 'FRMELEMNTS_LBL_INSTANCE_NAME'])
      .subscribe((translations) => {
        this.translateObject = translations;
      });
  }

  async presentAlert() {
    let alert = await this.alertCntrler.create({
      header: this.translateObject['FRMELEMNTS_LBL_INSTANCE_NAME'],
      inputs: [
        {
          name: 'title',
          placeholder: 'Title',
          value: this.submission.title,
        },
      ],
      buttons: [
        {
          text: this.translateObject['CANCEL'],
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked');
            this.popover.dismiss();
          },
        },
        {
          text: this.translateObject['FRMELEMNTS_BTN_UPDATE'],
          handler: (data) => {
            const payload = {
              action: 'update',
              name: data.title,
            };
            this.popover.dismiss(payload);
          },
        },
      ],
    });
    alert.present();
  }

  async presentModal() {
    this.popover.dismiss();
    const modal = await this.modalCtrl.create({
      component: ViewDetailComponent,
      componentProps: {
        submission: this.submission,
      },
    });
    modal.present();
  }
}
