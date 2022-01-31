import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ProjectService, statusType } from '@app/app/manage-learn/core';
import { CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
@Input() data :any;
@Output() actionEvent = new EventEmitter();
@Input() viewOnly: boolean = false;
statuses =statusType;
networkFlag: boolean;
private _networkSubscription: Subscription;
allStrings;
  constructor( private router : Router,
    private commonUtilService : CommonUtilService,
    private projectService :ProjectService ) { 
      this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
      this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
        this.networkFlag = available;
      })
    }

  ngOnInit() {}
  onCardClick(task){
    !this.viewOnly ? 
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.TASK_VIEW}`, this.data?._id, task?._id]): null;

  }
  startAssessment(task) {
   this.projectService.startAssessment(this.data._id,task._id);
  }

  checkReport(task){

  }
  openResources(task){
}
}