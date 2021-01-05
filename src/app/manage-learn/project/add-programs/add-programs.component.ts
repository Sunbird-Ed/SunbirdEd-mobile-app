import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-programs',
  templateUrl: './add-programs.component.html',
  styleUrls: ['./add-programs.component.scss'],
})
export class AddProgramsComponent implements OnInit {
  dataList;
  selectedData;
  button = "FRMELEMNTS_BTN_ADD_PROGRAM";
  title = "FRMELEMNTS_LBL_MY_PROGRAMS";
  type
  constructor(
    private alertCtrl: AlertController,
    private modal: ModalController,
    private translate: TranslateService,
    private http: HttpClient
  ) { }
  ngOnInit() {
    this.getPrograms();
  }

  getPrograms() {
    this.http.get('assets/dummy/projectList.json').subscribe((data: any) => {
      console.log(data);
      this.dataList = data.result.data;
    });
  }
  async createProgram() {
    let text;
    this.translate.get(['FRMELEMNTS_LBL_CREATE_PROGRAM', 'FRMELEMNTS_MSG_CREATE_PROGRAM_MESSAGE', 'FRMELEMNTS_BTN_CANCEL', 'FRMELEMNTS_BTN_SAVE', 'FRMELEMNTS_LBL_CREATE_PROGRAM_INPUT_PLACEHOLDER', 'FRMELEMNTS_LBL_CREATE_PROGRAM_INPUT_NAME']).subscribe(data => {
      text = data;
    })
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: text['FRMELEMNTS_LBL_CREATE_PROGRAM'],
      message: text['FRMELEMNTS_MSG_CREATE_PROGRAM_MESSAGE'],
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: text['FRMELEMNTS_LBL_CREATE_PROGRAM_INPUT_PLACEHOLDER']
        }
      ],
      buttons: [
        {
          text: text['FRMELEMNTS_BTN_CANCEL'],
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: text['FRMELEMNTS_BTN_SAVE'],
          handler: (data) => {
            data.created = true;
            this.selectedData = data;
            this.close(this.selectedData);
          }
        }
      ]
    });
    await alert.present();
  }
  selectProgram(data) {
    this.selectedData = data;
  }
  close(data?) {
    this.modal.dismiss(data);
  }
  addProgram() {
    if (this.selectedData) {
      this.close(this.selectedData);
    }
  }
}
