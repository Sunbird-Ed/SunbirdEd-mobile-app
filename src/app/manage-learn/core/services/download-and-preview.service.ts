import { Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Platform } from '@ionic/angular';
import { UtilsService } from './utils.service';
import { File } from '@ionic-native/file/ngx';
import { LoaderService, ToastService } from '.';
import { FILE_EXTENSION_HEADERS } from '../constants';
import { urlConstants } from '../constants/urlConstants';
import { AssessmentApiService } from './assessment-api.service';
import { SharingFeatureService } from './sharing-feature.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadAndPreviewService {
  isIos: boolean;
  appFolderPath;
  constructor(
    private fileTransfr: FileTransfer,
    private platform: Platform,
    private file: File,
    private shareFeature: SharingFeatureService,
    private fileOpener: FileOpener,
    private utils: UtilsService,
    private loader: LoaderService,
    private toast: ToastService,
    private assessment: AssessmentApiService
  ) {
    this.isIos = this.platform.is('ios') ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + 'submissionDocs'
      : cordova.file.externalDataDirectory + 'submissionDocs';
  }

  checkForSubmissionDoc(submissionId, action) {
    console.log('Check for file');
    const fileName = 'submissionDoc_' + submissionId + '.pdf';
    this.file
      .checkFile(this.appFolderPath + '/', fileName)
      .then((success) => {
        console.log('Check for file available');
        action === 'share'
          ? this.shareSubmissionDoc(this.appFolderPath + '/' + fileName)
          : this.previewSubmissionDoc(fileName);
      })
      .catch((error) => {
        console.log('Check for file not available');

        this.getSubmissionDocUrl(submissionId, action);
        // this.downloadSubmissionDoc(submissionId, action)
      });
  }

  shareSubmissionDoc(fileName: string) {
    this.shareFeature.sharingThroughApp(fileName);
  }

  downloadSubmissionDoc(submissionId, fileRemoteUrl, action) {
    console.log('file dowload');

    const fileName = 'submissionDoc_' + submissionId + '.pdf';
    const fileTransfer: FileTransferObject = this.fileTransfr.create();
    fileTransfer
      .download(fileRemoteUrl, this.appFolderPath + '/' + fileName)
      .then((success) => {
        console.log('file dowload success');

        if (action === 'preview') {
          this.previewSubmissionDoc(fileName);
        } else if (action === 'share') {
          this.shareSubmissionDoc(fileName);
        }
        this.loader.stopLoader();
        console.log(JSON.stringify(success));
      })
      .catch((error) => {
        console.log('file dowload error');

        this.loader.stopLoader();
        console.log(JSON.stringify(error));
      });
  }

  async getSubmissionDocUrl(submissionId, action) {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    let url = urlConstants.API_URLS.GET_SUBMISSION_PDF;
    const config = {
      url: url,
      payload: payload,
    };

    this.assessment.post(config).subscribe(
      (success) => {
        if (success.result.url) {
          this.downloadSubmissionDoc(submissionId, success.result.url, action);
        } else {
          this.toast.openToast(success.message);
          this.loader.stopLoader();
        }
      },
      (error) => {
        this.loader.stopLoader();
      }
    );

    // this.apiProvider.httpGet(
    //   AppConfigs.cro.getSubmissionPdf + submissionId,
    //   (success) => {
    //     if (success.result.url) {
    //       this.downloadSubmissionDoc(submissionId, success.result.url, action);
    //     } else {
    //       this.toast.openToast(success.message);
    //       this.loader.stopLoader();
    //     }
    //   },
    //   (error) => {
    //     this.loader.stopLoader();
    //   }
    // );
  }

  previewSubmissionDoc(filePath) {
    const fileName = filePath.split('/');
    const extension = this.getExtensionFromName(fileName[fileName.length - 1]);
    this.fileOpener
      .open(filePath, FILE_EXTENSION_HEADERS[extension])
      .then(() => console.log('File is opened'))
      .catch((e) => {
        this.toast.openToast('No file readers available');
      });
  }

  getExtensionFromName(fileName) {
    let splitString = fileName.split('.');
    let extension = splitString[splitString.length - 1];
    return extension;
  }
}
