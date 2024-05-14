import { Component, Input } from '@angular/core';
import { LoaderService, ToastService, UtilsService } from '../../../../../app/manage-learn/core';
import { UnnatiDataService } from '../../../../../app/manage-learn/core/services/unnati-data.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Share } from '@capacitor/share';

import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { DhitiApiService } from '../../../../../app/manage-learn/core/services/dhiti-api.service';
import { Device } from '@capacitor/device';

@Component({
  selector: 'download-share',
  templateUrl: './download-share.component.html',
  styleUrls: ['./download-share.component.scss'],
})
export class DownloadShareComponent {
  @Input() interface;
  @Input() showOptions;
  @Input() name = ['filter'];
  @Input() extension: string;
  @Input() config: any;
  texts: any;
  constructor(
    public popoverController: PopoverController,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private file: File,
    public alertController: AlertController,
    public utils: UtilsService,
    public toast: ToastService,
    public loader: LoaderService,
    public unnatiSrvc: UnnatiDataService,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    public dhiti: DhitiApiService,
  ) {
    this.translate
      .get(['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING', 'FRMELEMENTS_MSG_SUCCESSFULLY DOWNLOADED'])
      .subscribe((data) => {
        this.texts = data;
      });
  }

  async openPopupMenu(ev) {
    const popover = await this.popoverController.create({
      component: DownloadShareComponent,
      componentProps: {
        showOptions: true,
        interface: 'simple',
        name: this.name,
        extension: this.extension,
        config: this.config,
      },
      event: ev,
      translucent: true,
    });
    return await popover.present();
  }

  callApi() {
    this.loader.startLoader();
    if (this.config.payload) {
      return new Promise(async (resolve, reject) => {
        let res = await this.dhiti.post(this.config).toPromise();
        this.loader.stopLoader();
        if (res.status != 'success' && !res.pdfUrl) {
          this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
          reject();
        }
        resolve(res.pdfUrl);
      });
    }
    return new Promise(async (resolve, reject) => {
      let res = await this.unnatiSrvc.get(this.config).toPromise();
      this.loader.stopLoader();
      if (res.result && !res.result.data && !res.result.data.downloadUrl) {
        this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
        reject();
      }
      resolve(res.result.data.downloadUrl);
    });
  }

  async download(share?) {
 

    let fileName = this.utils.generateFileName(this.name);
    fileName = fileName + this.extension;
    let url: any = await this.callApi();
    if (!url) {
      return;
    }

    const ft = this.fileTransfer.create();
    ft.download(url, this.directoryPath() + fileName)
      .then(
        (res) => {
          share ? this.share(res.nativeURL) : this.openFile(res);
        },
        (err) => {
          console.log(err);
          this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
          this.requestPermission();
        }
      )
      .finally(() => {
        this.interface == 'simple' ? this.popoverController.dismiss() : null; // close the overlay for Simple UI
        this.loader.stopLoader();
      });
  }

  async requestPermission() {
    const deviceInfo = await Device.getInfo()
    if (this.platform.is("android") && deviceInfo.osVersion >= "13") {
      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      ]);
    }
  }
  

async share(path) {
      try {
        await Share.share({
          url: path,
        });
      } catch (error) {
        return;
      }
  }

  directoryPath(): string {
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory;
    } else {
      return this.file.externalDataDirectory;
    }
  }
  openFile(res) {
    const fileOpenerOptions: FileOpenerOptions = {
      filePath: res.nativeURL,
      contentType: 'application/pdf',
    };
    FileOpener
      .open(fileOpenerOptions)
      .then(() => {
        console.log('File is opened');
      })
      .catch((e) => console.log('Error opening file', e));
  }
}
