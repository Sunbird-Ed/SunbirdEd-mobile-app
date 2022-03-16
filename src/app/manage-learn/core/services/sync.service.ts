import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';
import { NetworkService } from './network.service';
import { urlConstants } from '../constants/urlConstants';
import { KendraApiService } from './kendra-api.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { ToastService } from './toast/toast.service';
import { UnnatiDataService } from './unnati-data.service';
import { LoaderService } from './loader/loader.service';
import { DbService } from './db.service';
import { statusType } from '../constants';
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


  createNewProject(showLoader: boolean = false, projectDetails = {}): Promise<any> {
    if(showLoader){
      this.loader.startLoader()
    }
    const project = { ...projectDetails };
    const payload = this.removeKeys(project, ['isNew', 'isEdit', 'submissionDetails']);
    delete payload._id;
    delete payload.tasks;
    const actualPayload = this.processPayload(payload);
    //Else in submitted status projects, the sync API will Fail while redirecting to sync page
    actualPayload.status = statusType.started;
    const config = {
      url: urlConstants.API_URLS.CREATE_PROJECT,
      payload: actualPayload
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

  deleteSpecificKey(tasks = [], key) {
    for (const task of tasks) {
      delete task[key];
      if (task?.children && task?.children?.length) {
        for (const subTask of task?.children) {
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
    // project leve attachments
    if (project.attachments && project.attachments.length) {
      for (const attachment of project.attachments) {
        if (attachment.type != 'link') {
          !attachment['sourcePath'] ? attachments.push(attachment) : null;
        }
      }
    }

    // Task leve attachments
    for (const task of project.tasks) {
      if (task.attachments && task.attachments.length) {
        for (const attachment of task.attachments) {
          if (attachment.type != 'link') {
            !attachment['sourcePath'] ? attachments.push(attachment) : null;
          }
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
    delete payload.downloaded;
    payload.status = (payload.status === statusType.notStarted) ? statusType.started : payload.status;
    payload.status = (payload.status === statusType.completed) ? statusType.inProgress : payload.status;
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
