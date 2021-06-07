import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';
import { NetworkService } from './network.service';
import { localStorageConstants } from '../constants/localStorageConstants';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { ToastService } from './toast/toast.service';
import { UnnatiDataService } from './unnati-data.service';
import { LoaderService } from './loader/loader.service';
import { DbService } from './db.service';
var environment = {
  db: {
    projects: "project.db",
    categories: "categories.db",
  }
};
@Injectable({
  providedIn: 'root'
})
export class SyncService {

  allStrings;
  isIos: boolean = false;
  fileBasePath;

  constructor(
    private unnatiServ: UnnatiDataService,
    private loader: LoaderService,
    private localStorage: LocalStorageService,
    private network: NetworkService,
    private router: Router,
    private toast: ToastService,
    private translate: TranslateService,
    private db: DbService,
    private kendra: KendraApiService,
    private file: File,
    private fileTransfer: FileTransfer,
    private platform: Platform
  ) {

    this.translate.get(['FRMELEMNTS_MSG_PLEASE_NETWORK']).subscribe(stringValues => {
      this.allStrings = stringValues;
    })
    this.isIos = this.platform.is('ios');
    this.fileBasePath = this.isIos ? this.file.documentsDirectory : this.file.externalDataDirectory;
  }


  checkForSync() {
    this.db.createPouchDB(environment.db.projects);
    //check if there is any unsynced data
    this.db.customQuery({
      selector: {
        $or: [
          { isNew: true },
          { isEdit: true },
        ]
      }
    }).then(success => {
      if (success['docs'].length) {

        //check the sync settings
        if (!this.network.isNetworkAvailable) {
          this.toast.showMessage(this.allStrings['FRMELEMNTS_MSG_PLEASE_NETWORK'], 'danger')
        } else {
          this.router.navigate(['/menu/sync']);

        }

        // this.localStorage.getLocalStorage(localStorageConstants.SYNC_VARIABLE).then(status => {
        //   if (status === 'ON' && this.network.isNetworkAvailable) {
        //     this.router.navigate(['/menu/sync']);
        //   } else if (status === 'ON' && !this.network.isNetworkAvailable) {
        //     this.toast.showMessage(this.allStrings['FRMELEMNTS_MSG_PLEASE_NETWORK'], 'danger')
        //   } else {
        //   }
        // }).catch(error => {
        //   this.router.navigate(['/menu/sync']);
        // })
      }
    })
  }

  syncApiRequest(payload, showLoader: boolean = false): Promise<any> {
    const obj = this.processPayload(payload);
    const { _id } = payload;
    delete payload._id;
    if (!obj.programId) {
      delete obj.programId
    }
    showLoader ? this.loader.startLoader() : null;
    const config = {
      url: urlConstants.API_URLS.SYNC_PROJECT + _id + `?lastDownloadedAt=${payload.lastDownloadedAt}`,
      payload: obj
    }
    return new Promise((resolve, reject) => {
      this.unnatiServ.post(config).subscribe(success => {
        showLoader ? this.loader.stopLoader() : null;
        resolve(success)
      }, error => {
        showLoader ? this.loader.stopLoader() : null;
        reject(error);
      })
    })
  }


  createNewProject(showLoader: boolean = false, project?): Promise<any> {
    if(showLoader){
      this.loader.startLoader()
    }
    // const project = JSON.parse(JSON.stringify(project));
    const payload = this.removeKeys(project, ['isNew', 'isEdit']);
    delete payload._rev;
    delete payload._id;
    const config = {
      url: urlConstants.API_URLS.CREATE_PROJECT,
      payload: payload
    }
    return new Promise((resolve, reject) => {
      this.unnatiServ.post(config).subscribe(success => {
        if(showLoader){
          this.loader.stopLoader()
        }
        resolve(success)
      }, error => {
        if(showLoader){
          this.loader.stopLoader()
        }
        reject(error);
      })
    })
  }

  removeKeys(doc, fields) {
    for (const field of fields) {
      delete doc[field]
      doc.tasks = this.deleteSpecificKey(doc.tasks, field)
    }
    return doc
  }

  deleteSpecificKey(tasks, key) {
    for (const task of tasks) {
      delete task[key];
      if (task.children && task.children.length) {
        for (const subTask of task.children) {
          delete subTask[key]
        }
      }
    }
    return tasks
  }

  getImageUploadUrls(projects): Promise<any> {
    const payload = { ...this.createImageUrlPayload(projects) }
    console.log(payload)
    return new Promise((resolve, reject) => {
      const config = {
        url: urlConstants.API_URLS.PRESIGNED_URLS,
        payload: payload,
      };
      this.kendra.post(config).subscribe(success => {
        resolve(success.result[projects._id].files)
        console.log(success);
      }, error => {
        reject(error);
        console.log(error)
      })
    })
  }

  createImageUrlPayload(project) {
    const payload = { request: {}, ref: 'improvementProject' };
    const completeImgObj = this.getAllAttachmentOfProject(project);
    const payloadImages = [];
    for (const image of completeImgObj) {
      payloadImages.push(image.name);
    }
    payload.request[project._id] = {
      files: payloadImages
    }
    return payload
  }

  getAllAttachmentOfProject(project) {
    let attachments = [];
    for (const task of project.tasks) {
      if (task.attachments && task.attachments.length) {
        for (const attachment of task.attachments) {
          !attachment['sourcePath'] ? attachments.push(attachment) : null;
        }
      }
    }
    return attachments
  }

  processPayload(payload) {
    delete payload._rev;
    delete payload.solutionInformation;
    delete payload.programInformation;
    delete payload.userId;
    return payload
  }


  cloudImageUpload(fileDetails) {
    return new Promise((resolve, reject) => {
      this.file.checkFile(this.fileBasePath, fileDetails.name).then(success => {
        var options = {
          fileKey: fileDetails.name,
          fileName: fileDetails.name,
          chunkedMode: false,
          mimeType: fileDetails.type,
          headers: {
            "Content-Type": "multipart/form-data",
            "x-ms-blob-type":
              fileDetails.cloudStorage === "AZURE"
                ? "BlockBlob"
                : null,
          },
          httpMethod: "PUT",
        };
        const fileTrans: FileTransferObject = this.fileTransfer.create();
        fileTrans.upload(this.fileBasePath + fileDetails.name, fileDetails.uploadUrl, options).then(success => {
          resolve(success)
        }).catch(error => {
          reject(error)
        })
      }).catch(error => {
        reject(error)
      })
    })
  }
}
