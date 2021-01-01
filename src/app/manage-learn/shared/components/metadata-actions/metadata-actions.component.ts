import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-metadata-actions',
  templateUrl: './metadata-actions.component.html',
  styleUrls: ['./metadata-actions.component.scss'],
})
export class MetadataActionsComponent implements OnInit {
@Input() actionItem:any;
@Output() actionEvent = new EventEmitter();
  constructor() { }

  ngOnInit() {}

  action(event){
    this.actionEvent.emit(event);
  }
}
