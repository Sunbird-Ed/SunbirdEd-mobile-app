import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { DbService, ProjectService, statusType, taskStatus, UtilsService } from '@app/app/manage-learn/core';
import { menuConstants } from '@app/app/manage-learn/core/constants/menuConstants';
import { PopoverController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PopoverComponent } from '../popover/popover.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush    
})
export class TaskCardComponent implements OnInit {
  @Input() data: any;
  @Output() actionEvent = new EventEmitter();
  @Input() viewOnly: boolean = false;
  statuses = taskStatus;
  upperLimit=2;
  allStrings;
  showLoadMore: boolean = false;

  constructor(private router: Router,
    private projectService: ProjectService,
    public popoverController: PopoverController,
    private translate: TranslateService,
    private alert: AlertController,
    private db: DbService,
    private util: UtilsService
  ) { }

  ngOnInit() {
    let count = this.util.getTaskCount(this.data);
    if (count > 2) {
      this.showLoadMore = true;
    }
   }

  onCardClick(task) {
    const viewOnlyMode = (this.data.status === statusType.submitted);
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.data?._id, task?._id], {
      queryParams: { viewOnlyMode: viewOnlyMode },
      state: {
        projectDetails: this.data
      }
    });

  }
  onObservatonActionButtonClick(task, index) {
    const submissionDetails = this.data?.tasks[index]?.submissionDetails;
    if(submissionDetails?.observationId) {
      this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
        queryParams: {
          programId: submissionDetails.programId,
          solutionId: submissionDetails.solutionId,
          observationId: submissionDetails.observationId,
          entityId: submissionDetails.entityId,
          entityName: submissionDetails.entityName,
          disableObserveAgain: this.data?.tasks[index].status === statusType.completed,
        },
      });
    } else {
      this.projectService.startAssessment(this.data._id, task._id);
    }
  }

  checkReport(task) {
    this.projectService.checkReport(this.data._id, task._id);
  }
  openResources(task) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.data._id, task._id]);
  }

  async openPopover(ev: any, taskIndex) {
    let menu:any =[];
    const selectedTask = this.data.tasks[taskIndex];
    if(this.viewOnly){
      let shareOption = {
        TITLE: 'FRMELEMNTS_LBL_SHARE',
        VALUE: 'shareTask',
        ICON: 'share'
    }
    menu.push(shareOption);
  }
  if(!this.viewOnly){
    menu = JSON.parse(JSON.stringify(menuConstants.TASK));
    if (selectedTask.isDeletable) {
      let deleteOption = {
        TITLE: 'DELETE',
        VALUE: 'deleteTask',
        ICON: 'trash'
      }
      menu.push(deleteOption);
    }
  }
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: { menus: menu },
      event: ev,
      translucent: true,
    });
    popover.onDidDismiss().then((data) => {
      if (data.data) {
        switch (data.data) {
          case 'editTask':
            this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.data._id, selectedTask._id]);
            break;
          case 'shareTask':
            this.projectService.openSyncSharePopup("shareTask", selectedTask.name, this.data, selectedTask._id);
            break;
          case 'deleteTask':
            this.askPermissionToDelete(data.data, taskIndex);
            break
        }

      }
    });
    return await popover.present();
  }

  async askPermissionToDelete(type, index) {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION", "NO", "YES"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      message: data["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION"],
      cssClass: 'central-alert',
      buttons: [
        {
          text: data["YES"],
          handler: () => {
            const obj = {
              type: type,
              taskId: this.data.tasks[index]._id
            }
            this.actionEvent.emit(obj);
          },
        },
        {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        }
      ],
    });
    await alert.present();
  }

  loadMore() {
    this.upperLimit = this.data?.tasks?.length;
    this.showLoadMore = false;
  }

}