import { Component, Input } from '@angular/core';
import { LoaderService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { UnnatiDataService } from '@app/app/manage-learn/core/services/unnati-data.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DhitiApiService } from '@app/app/manage-learn/core/services/dhiti-api.service';

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
  // @Input() downloadUrl: any;
  @Input() config: any;
  texts: any;
  constructor(
    public popoverController: PopoverController,
    private socialSharing: SocialSharing,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private file: File,
    public alertController: AlertController,
    public utils: UtilsService,
    public toast: ToastService,
    public loader: LoaderService,
    public filePath: FilePath,
    public unnatiSrvc: UnnatiDataService,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    public fileOpener: FileOpener,
    public dhiti: DhitiApiService
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
        // downloadUrl: this.downloadUrl,
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
          // this.toast.showMessage(this.texts['FRMELEMENTS_MSG_SUCCESSFULLY DOWNLOADED'])
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

  requestPermission() {
    if (this.platform.is('android')) {
      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      ]);
    }
  }

  share(path) {
    this.socialSharing.share(null, null, path, null);
  }

  directoryPath(): string {
    let dir_name = 'Download/';
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory + dir_name;
    } else {
      return this.file.externalRootDirectory + dir_name;
    }
  }
  openFile(res) {
    this.fileOpener
      .open(res.nativeURL, 'application/pdf')
      .then(() => {
        console.log('File is opened');
      })
      .catch((e) => console.log('Error opening file', e));
  }
}
