import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {
@Input() data :any;
@Output() actionEvent = new EventEmitter();
  constructor() { }

  ngOnInit() {}
  onCardClick(){
    this.actionEvent.emit(this.data);
  }
}
