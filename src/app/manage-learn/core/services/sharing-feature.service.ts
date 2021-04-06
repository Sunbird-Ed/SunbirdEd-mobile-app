import { Injectable } from '@angular/core';
import { File } from "@ionic-native/file/ngx";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { LoaderService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { UnnatiDataService } from '@app/app/manage-learn/core/services/unnati-data.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
@Injectable({
  providedIn: 'root',
})
export class SharingFeatureService {
  texts: any;

  constructor(
    private fileChooser: FileChooser,
    private file: File,
    private socialSharing: SocialSharing,
    private fileTransfer: FileTransfer,
    private toast: ToastService,
    private platform: Platform,
    private utils: UtilsService,
    public alertController: AlertController,
    public loader: LoaderService,
    public filePath: FilePath,
    public unnatiSrvc: UnnatiDataService,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    public fileOpener: FileOpener,
  ) {
    console.log('Hello SharingFeaturesProvider Provider');
  }

  sharingThroughApp(fileName?) {
    let subject = 'hi';
    let link = 'google.com';
    let message = 'hi';
    if (!fileName) {
      this.fileChooser
        .open()
        .then((uri) => {
          (<any>window).FilePath.resolveNativePath(uri, (result) => {
            let fileName = result.split('/').pop();
            let path = result.substring(0, result.lastIndexOf('/') + 1);
            this.file
              .readAsDataURL(path, fileName)
              .then((base64File) => {
                this.socialSharing
                  .share(message, subject, base64File, link)
                  .then(() => {
                    console.log('share Success');
                  })
                  .catch(() => {
                    console.log('share Failure');
                  });
              })
              .catch(() => {
                console.log('Error reading file');
              });
          });
        })
        .catch((e) => console.log(e));
    } else {
      (<any>window).FilePath.resolveNativePath(fileName, (result) => {
        let fileName = result.split('/').pop();
        let path = result.substring(0, result.lastIndexOf('/') + 1);
        this.file
          .readAsDataURL(path, fileName)
          .then((base64File) => {
            this.socialSharing
              .share('', fileName, base64File, '')
              .then(() => {
                console.log('share Success');
              })
              .catch(() => {
                console.log('share Failure');
              });
          })
          .catch(() => {
            console.log('Error reading file');
          });
      });
    }
  }

  regularShare(msg): Promise<any> {
    return this.socialSharing.share(msg, null, null, null);
  }


  async getFileUrl(config, name) {
    this.loader.startLoader();
    let res = await this.unnatiSrvc.get(config).toPromise();
    if (res.result && !res.result.data && !res.result.data.downloadUrl) {
      this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
      this.loader.stopLoader();
      return;
    }
    let fileName = name + '.pdf';
    const ft = this.fileTransfer.create();
    ft.download(res.result.data.downloadUrl, this.directoryPath() + fileName)
    .then(
      (res) => {
        this.socialSharing.share(null, null, res.nativeURL, null).then(data =>{
        },error =>{
        })
      },
      (err) => {
        this.requestPermission();
        this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
      }
    )
    .finally(() => {
      this.loader.stopLoader();
    });
  }
  directoryPath(): string {
    let dir_name = 'Download/';
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory + dir_name;
    } else {
      return this.file.externalRootDirectory + dir_name;
    }
  }

  requestPermission() {
    if (this.platform.is('android')) {
      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      ]);
    }
  }
}
