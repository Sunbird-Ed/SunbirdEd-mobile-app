import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LoaderService, UtilsService } from '../../core';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { urlConstants } from '../../core/constants/urlConstants';

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
  type;
  constructor(
    private alertCtrl: AlertController,
    private modal: ModalController,
    private translate: TranslateService,
    private http: HttpClient,
    private loaderService: LoaderService,
    private kendraApiService: KendraApiService,
    private utils: UtilsService,
    public platform: Platform

  ) { }
  ngOnInit() {
    this.getPrograms();
  }

  async getPrograms() {
    this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROGRAM_LISTING+'isAPrivateProgram=true',
    }
    this.kendraApiService.get(config).subscribe(data => {
      this.loaderService.stopLoader();
      if (data.result && data.result.length) {
        this.dataList = data.result;
      }
    }, error => {
      this.loaderService.stopLoader(); 
    })
  }
  async createProgram() {
    let text;
    this.translate.get(['FRMELEMNTS_LBL_CREATE_PROGRAM', 'FRMELEMNTS_MSG_CREATE_PROGRAM_MESSAGE', 'CANCEL', 'FRMELEMNTS_BTN_SAVE', 'FRMELEMNTS_LBL_CREATE_PROGRAM_INPUT_PLACEHOLDER', 'FRMELEMNTS_LBL_CREATE_PROGRAM_INPUT_NAME']).subscribe(data => {
      text = data;
    })
    const alert = await this.alertCtrl.create({
      cssClass:'central-alert',
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
          text: text['CANCEL'],
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: text['FRMELEMNTS_BTN_SAVE'],
          handler: (data) => {
            data.name = data.name.trim();
            if (data.name || data.name != "") {
              data.created = true;
              data.isAPrivateProgram = true;
              this.selectedData = data;
              this.close(this.selectedData);
            }
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
