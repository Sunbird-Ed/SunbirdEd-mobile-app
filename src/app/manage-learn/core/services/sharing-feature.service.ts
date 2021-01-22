import { Injectable } from '@angular/core';
import { File } from "@ionic-native/file/ngx";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Injectable({
  providedIn: 'root',
})
export class SharingFeatureService {
  constructor(
    private fileChooser: FileChooser,
    private file: File,
    private socialSharing: SocialSharing
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
}
