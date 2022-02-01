import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { ProjectService, taskStatus } from '@app/app/manage-learn/core';

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
    private projectService :ProjectService) { }

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
}