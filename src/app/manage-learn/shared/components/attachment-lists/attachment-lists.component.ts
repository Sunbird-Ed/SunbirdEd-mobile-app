import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-attachment-lists',
  templateUrl: './attachment-lists.component.html',
  styleUrls: ['./attachment-lists.component.scss'],
})
export class AttachmentListsComponent implements OnInit {
  @Input() attachments: any;
  @Input() title: any;
  @Input() type: any;
  @Input() viewOnly:boolean = false;
  @Output() eventAction = new EventEmitter();
  constructor() {}

  ngOnInit() {}
  deleteConfirmation(index) {
    let params = {
      index: index,
      action: "delete"
    }
    this.eventAction.emit(params);
  }
  viewDocument(attachment) {
    let params = {
      attachment: attachment,
      action: "view"
    }
    this.eventAction.emit(params);
  }
}
