import { Injectable } from '@angular/core';
import { File } from "@awesome-cordova-plugins/file/ngx";
// import { SocialSharing } from "@awesome-cordova-plugins/social-sharing/ngx";
import { Share } from '@capacitor/share';
// import { FileChooser } from '@awesome-cordova-plugins/file-chooser/ngx';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { UnnatiDataService } from '../../../../app/manage-learn/core/services/unnati-data.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
// import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
// import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { NetworkService } from './network.service';
import { ToastService } from './toast/toast.service';
import { UtilsService } from './utils.service';
import { LoaderService } from './loader/loader.service';
import { Device } from '@capacitor/device';


@Injectable({
  providedIn: 'root',
})
export class SharingFeatureService {
  texts: any;

  constructor(
    // private fileChooser: FileChooser,
    private file: File,
    // private socialSharing: SocialSharing,
    private fileTransfer: FileTransfer,
    private toast: ToastService,
    private platform: Platform,
    private utils: UtilsService,
    public alertController: AlertController,
    public loader: LoaderService,
    // public filePath: FilePath,
    public unnatiSrvc: UnnatiDataService,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    // public fileOpener: FileOpener,
    public network :NetworkService,
    // private device: Device
  ) {
    console.log('Hello SharingFeaturesProvider Provider');
  }

  sharingThroughApp(fileName?) {
    let subject = 'hi';
    let link = 'google.com';
    let message = 'hi';
    if (!fileName) {
      FilePicker.pickFiles()
        .then((uri) => {
          (<any>window).FilePath.resolveNativePath(uri, (result) => {
            let fileName = result.split('/').pop();
            let path = result.substring(0, result.lastIndexOf('/') + 1);
            this.file
              .readAsDataURL(path, fileName)
              .then((base64File) => {
                // this.socialSharing
                //   .share(message, subject, base64File, link)
                //   .then(() => {
                //     console.log('share Success');
                //   })
                //   .catch(() => {
                //     console.log('share Failure');
                //   });
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
            // this.socialSharing
            //   .share('', fileName, base64File, '')
            //   .then(() => {
            //     console.log('share Success');
            //   })
            //   .catch(() => {
            //     console.log('share Failure');
            //   });
          })
          .catch(() => {
            console.log('Error reading file');
          });
      });
    }
  }



  async getFileUrl(config, name) {
    if(this.network.isNetworkAvailable){
      this.loader.startLoader();
      if(name?.length > 40){
        name = name.slice(0, 40) + '...';
      }
      let res = await this.unnatiSrvc.get(config).toPromise();
      if (res.result && !res.result.data && !res.result.data.downloadUrl) {
        this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
        this.loader.stopLoader();
        return;
      }
      let fileName = name.replace(/[^A-Z0-9]/ig, "_") + '.pdf';
      const ft = this.fileTransfer.create();
      setTimeout(() => {
        ft.download(res.result.data.downloadUrl, this.directoryPath() + fileName)
        .then(
          (res) => {
            Share.share({
              url:res.nativeURL
            }).then(data =>{
            },error =>{
              console.log(error)
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
      }, 1000)
    }else{
      this.toast.showMessage('FRMELEMNTS_MSG_OFFLINE', 'danger');
    }
   
  }
  directoryPath(): string {
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory;
    } else {
      return this.file.externalDataDirectory;
    }
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
}
