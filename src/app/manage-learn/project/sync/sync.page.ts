import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { SyncService } from '../../core/services/sync.service';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
  styleUrls: ['./sync.page.scss'],
})
export class SyncPage implements OnInit, OnDestroy {

  projectId;
  projectDetails;
  allProjects = [];
  syncIndex: number = 0;
  allStrings;
  progressPercentage = 0;
  attachments = [];
  imageUploadIndex = 0;
  syncCompletedProjects = []
  constructor(
    private routerparam: ActivatedRoute,
    // private toast: ToastMessageService,
    private location: Location,
    private syncServ: SyncService,
    private translate: TranslateService,
    private network: NetworkService) {
    // this.db.createPouchDB(environment.db.projects);
    this.translate
      .get([
        "MESSAGES.PROJCET_ALREADY_UPTODATE",
        "MESSAGES.SUCCESSFULLY_SYNCED",
        "MESSAGES.SOMETHING_WENT_WRONG",
        "MESSAGES.SYNC_FAILED",
        "MESSAGE.OFFLINE"
      ])
      .subscribe((data) => {
        this.allStrings = data
      });
    if (this.network.isNetworkAvailable) {
      this.routerparam.queryParams.subscribe((params) => {
        if (params && params.projectId) {
          //Sync only single project
          this.projectId = params.projectId;
          this.getProjectFromId(params.projectId);
        } else {
          //sync mutiple projects
          this.getAllUnSyncedProject();
        }
      })
    } else {
      // this.toast.showMessage('MESSAGES.OFFLINE', 'danger');
      this.location.back();
    }

  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  //get single project from db
  getProjectFromId(projectId) {
    // this.db.customQuery({
    //   selector: {
    //     _id: projectId,
    //     $or: [
    //       { isNew: true },
    //       { isEdit: true },
    //     ]
    //   }
    // }).then(success => {
    //   if (success['docs'].length) {
    //     this.allProjects.push(success['docs'][0]);
    //     this.checkForActions();
    //   } else {
    //     this.location.back()
    //     this.toast.showMessage(this.allStrings['MESSAGES.PROJCET_ALREADY_UPTODATE'], 'danger')
    //   }
    // }, error => { })
  }

  //get all new and edited projects (for overall sync)
  getAllUnSyncedProject() {
    // this.db.customQuery({
    //   selector: {
    //     $or: [
    //       { isNew: true },
    //       { isEdit: true },
    //     ]
    //   }
    // }).then(success => {
    //   if (success['docs'].length) {
    //     this.allProjects = this.allProjects.concat(success['docs']);
    //     this.checkForActions();
    //   } else {
    //     this.location.back()
    //     this.toast.showMessage(this.allStrings['MESSAGES.PROJCET_ALREADY_UPTODATE'])
    //   };
    // }, error => { })
  }

  //Check if the project is new or edited existing
  checkForActions() {
    if (this.allProjects[this.syncIndex]) {
      if (this.allProjects[this.syncIndex].isNew) {
        this.createProjectCall()
      } else {
        this.attachments = this.syncServ.getAllAttachmentOfProject(this.allProjects[this.syncIndex]);
        this.attachments.length ? this.getImageUploadUrls() : this.doSyncCall();
      }
      // this.allProjects[this.syncIndex].isNew ? this.createProjectCall() : this.getImageUploadUrls();
      // this.doSyncCall();
      this.calculateProgressPercentage()
    } else {
      this.syncIndex = 0;
      // this.toast.showMessage(this.allStrings['MESSAGES.SUCCESSFULLY_SYNCED'])
      this.location.back()
    }
  }

  calculateProgressPercentage() {
    let percent = ((this.syncCompletedProjects.length) / this.allProjects.length) * 100;
    this.progressPercentage = Math.round(percent);
  }

  //create projectId API call for new projects
  createProjectCall() {
    this.syncServ.createNewProject().then(success => {
      this.updateProjectDoc(success.result);
    }).catch(error => {
      // this.toast.showMessage(this.allStrings['MESSAGES.SOMETHING_WENT_WRONG'], 'danger');
      this.location.back();
    })
  }

  //Map project id to existing doc. create a new doc and delete the old doc
  updateProjectDoc(newPrjctDetails) {
    const _rev = this.allProjects[this.syncIndex]._rev;
    const oldPrjstId = this.allProjects[this.syncIndex]._id;
    this.allProjects[this.syncIndex]._id = newPrjctDetails._id;
    this.allProjects[this.syncIndex].lastDownloadedAt = newPrjctDetails.lastDownloadedAt;
    delete this.allProjects[this.syncIndex]._rev;
    //remove is isNew flag from project meta, task and sub task
    const newObj = this.syncServ.removeKeys(this.allProjects[this.syncIndex], ['isNew'])
    // this.db.create(newObj).then(success => {
    //   this.allProjects[this.syncIndex]._rev = success.rev;
    //   this.db.delete(oldPrjstId, _rev).then(deleteSuccess => {
    //     // this.doSyncCall()
    //     // this.getImageUploadUrls();
    //     this.attachments = this.syncServ.getAllAttachmentOfProject(this.allProjects[this.syncIndex]);
    //     this.attachments.length ? this.getImageUploadUrls() : this.doSyncCall();
    //   }).catch(deletError => {
    //     this.toast.showMessage(this.allStrings['MESSAGES.SOMETHING_WENT_WRONG'], 'danger');
    //     this.location.back();
    //   })
    // }).catch(error => {
    //   this.toast.showMessage(this.allStrings['MESSAGES.SOMETHING_WENT_WRONG'], 'danger');
    //   this.location.back();

    // })
  }

  //Syn project API call
  doSyncCall() {
    const paylod = this.createSyncPayload();
    this.syncServ.syncApiRequest(paylod).then(success => {
      this.allProjects[this.syncIndex] = this.syncServ.removeKeys(this.allProjects[this.syncIndex], ['isNew', 'isEdit']);
      (success.result && success.result.programId) ? this.allProjects[this.syncIndex]['programId'] = success.result.programId : null;
      this.updateSyncedDataToDb();
    }).catch(error => {
      this.location.back();
    })
  }

  //update the synced data to local
  updateSyncedDataToDb() {
    // this.db.update(this.allProjects[this.syncIndex]).then(success => {
    //   this.syncCompletedProjects.push(this.allProjects[this.syncIndex]);
    //   this.syncIndex++;
    //   this.resetImageUploadVariables()
    //   this.checkForActions();
    // }).catch(error => {

    // })
  }

  createSyncPayload() {
    const payload = { ...this.allProjects[this.syncIndex] };
    const filteredTasks = _.filter(payload.tasks, (task) => {
      return task.isNew || task.isEdit
    })
    delete payload.createdAt;
    delete payload.updatedAt;
    payload.tasks = filteredTasks;
    return this.syncServ.removeKeys(payload, ['isNew', 'isEdit'])
  }

  getImageUploadUrls() {
    const project = { ...this.allProjects[this.syncIndex] };
    this.syncServ.getImageUploadUrls(project).then(imageInfo => {
      console.log(imageInfo);
      for (let i = 0; i < this.attachments.length; i++) {
        this.attachments[i].uploadUrl = imageInfo[i].url;
        this.attachments[i].cloudStorage = imageInfo[i].cloudStorage;
        for (const key of Object.keys(imageInfo[i].payload)) {
          this.attachments[i][key] = imageInfo[i].payload[key];
        }
      }
      this.cloudUpload(this.attachments[this.imageUploadIndex])
    }).catch(error => {

    })
  }


  resetImageUploadVariables() {
    this.imageUploadIndex = 0;
    this.attachments = [];
  }

  cloudUpload(imageDetails) {
    this.syncServ.cloudImageUpload(imageDetails).then(success => {
      delete this.attachments[this.imageUploadIndex].cloudStorage;
      delete this.attachments[this.imageUploadIndex].uploadUrl;
      delete this.attachments[this.imageUploadIndex].isUploaded;
      if (this.imageUploadIndex + 1 < this.attachments.length) {
        this.imageUploadIndex++;
        this.cloudUpload(this.attachments[this.imageUploadIndex])
      } else {
        this.doSyncCall();
      }
    }).catch(error => {
      console.log(error)
      this.imageUploadIndex++;
      this.cloudUpload(this.attachments[this.imageUploadIndex])
    })
  }





}
