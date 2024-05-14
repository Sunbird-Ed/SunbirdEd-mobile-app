import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-project-task-list",
  templateUrl: "./project-task-list.component.html",
  styleUrls: ["./project-task-list.component.scss"],
})
export class ProjectTaskListComponent {
  @Input() viewOnlyMode: boolean;
  @Input() sortedTasks: any;
  @Input() schedules: any;
  @Output() actionClick = new EventEmitter();
  @Output() openPopoverClick = new EventEmitter();
  @Output() openResourcesClick = new EventEmitter();
  @Output() startAssessmentClick = new EventEmitter();
  @Output() checkReportClick = new EventEmitter();
  constructor() {}

  ngOnInit(){
    console.log("viewOnlyMode : ",this.viewOnlyMode);
  }

  action(event, task?) {
    this.actionClick.emit({event:event,task:task});
  }

  openPopover(ev: any, task?) {
    this.openPopoverClick.emit({event:ev,task:task});
  }

  openResources(task){
    this.openResourcesClick.emit({task:task})
  }

  startAssessment(task){
    this.startAssessmentClick.emit({task:task})
  }

  checkReport(task){
    this.checkReportClick.emit({task:task});
  }

}
