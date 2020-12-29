import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-operation',
  templateUrl: './project-operation.page.html',
  styleUrls: ['./project-operation.page.scss'],
})
export class ProjectOperationPage implements OnInit {
  button = 'FRMELEMNTS_LBL_IMPORT_PROJECT';
  createdType;
  today: any = new Date();
  currentYear = new Date().getFullYear();
  endDateMin: any = this.currentYear - 2;
  showLearningResources = false;
  showRatings = true;
  projectId;
  template = {
    categories: [],
    createdAt: "2019-09-13T11:45:21.000Z",
    deleted: false,
    description: "Enabling student leadership and overall student development",
    isDeleted: false,
    isImportedFromLibrary: true,
    lastDownloadedAt: "2020-12-23T17:40:09.771Z",
    lastSync: "2020-12-05T18:15:10.363Z",
    learningResources: [],
    primaryAudience: [""],
    programExternalId: "IMP-#547-Sep-2019",
    programId: "5d7b7e68639f5817a1d73028",
    programName: "AP Imp Demo Program",
    rationale: "sample",
    solutionExternalId: "9edae470-d61a-11e9-9fbf-236864017e03",
    solutionId: "5d7b7f0f2550177ef7f08c73",
    status: "notStarted",
    syncedAt: "2020-02-27T10:07:29.000Z",
    taskSequence: [],
    tasks: [],
    title: "Talent Day",
    updatedAt: "2020-12-05T18:15:10.368Z",
    userId: "4267621e-903e-4934-8ed7-38121a4e3c99",
    _id: "5fc54221cce64916855f6b84",
    _rev: "1-3718fdc86e773e7d7c7c5be38b294214"
  };

  constructor(
    private routerparam: ActivatedRoute
  ) {
    this.routerparam.queryParams.subscribe((params) => {
      if (params && params.createdType == 'bySelf') {
        this.createdType = 'bySelf';
        this.button = params.isEdit ? 'FRMELEMNTS_BTN_SAVE_EDITS' : 'FRMELEMNTS_BTN_CREATE_PROJECT'
        this.showLearningResources = true;
        this.showRatings = false;
        this.getProjectFromLocal(this.projectId);
      } else {
        this.showRatings = true;
        // this.networkService.isNetworkAvailable ? this.getTemplate(this.projectId) : this.toast.showMessage('MESSAGEs.OFFLINE', 'danger');
      }
    });
  }

  ngOnInit() {
  }
  getProjectFromLocal(id) {

  }
}
