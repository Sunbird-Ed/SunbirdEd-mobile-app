import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { statusType } from '@app/app/manage-learn/core';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
@Input() data :any;
@Output() actionEvent = new EventEmitter();
statuses =statusType;
  constructor() { }

  ngOnInit() {}
  onCardClick(task){
    this.actionEvent.emit(task);
  }
}
