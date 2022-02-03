import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { DbService, ProjectService, taskStatus } from '@app/app/manage-learn/core';
import { menuConstants } from '@app/app/manage-learn/core/constants/menuConstants';
import { PopoverController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { PopoverComponent } from '../popover/popover.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
@Input() data :any;
@Output() actionEvent = new EventEmitter();
@Input() viewOnly: boolean = false;
statuses =taskStatus;
allStrings;
  constructor( private router : Router,
    private projectService :ProjectService,
    public popoverController: PopoverController,
    private translate :TranslateService,
    private alert : AlertController,
    private db: DbService,
    ) { }

  ngOnInit() {}
  onCardClick(task){
    !this.viewOnly ? 
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.data?._id, task?._id]): null;

  }
  startAssessment(task) {
   this.projectService.startAssessment(this.data._id,task._id);
  }

  checkReport(task){
    this.projectService.checkReport(this.data._id,task._id);
  }
  openResources(task){
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.LEARNING_RESOURCES}`, this.data._id, task._id]);
}
async openPopover(ev: any, task?) {
    let menu;
    if (task && task._id) {
      menu = JSON.parse(JSON.stringify(menuConstants.TASK));
      if (task.isDeletable) {
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
        switch(data.data){
          case 'editTask':
          this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.data._id, task._id]);
            break;
          case 'shareTask':
           this.projectService.openSyncSharePopup("shareTask", task.name,this.data, task._id);
            break;
          case 'deleteTask':
            this.askPermissionToDelete(data.data, task._id);
            break
        }
       
      }
    });
    return await popover.present();
}
async askPermissionToDelete(type, id?) {
  let data;
  this.translate.get(["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION", "CANCEL", "BTN_SUBMIT"]).subscribe((text) => {
    data = text;
  });
  const alert = await this.alert.create({
    message: data["FRMELEMNTS_MSG_DELETE_TASK_CONFIRMATION"],
    cssClass:'central-alert',
    buttons: [
      {
        text: data["CANCEL"],
        role: "cancel",
        cssClass: "secondary",
        handler: (blah) => { },
      },
      {
        text: data["BTN_SUBMIT"],
        handler: () => {
        this.deleteTask(id)
        },
      },
    ],
  });
  await alert.present();
}

  deleteTask(id) {
    let index = _.findIndex(this.data.tasks, (item) => {
      return item._id == id;
    });
    this.data.tasks[index].isDeleted = true;
    this.data.tasks[index].isEdit = true;
    this.updateLocalDb();
  }
  updateLocalDb() {
    this.data.isEdit = true;
    this.db.update(this.data).then(success => {
      this.data._rev = success.rev;
    })
  }
}