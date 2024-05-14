import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-attachment-card',
  templateUrl: './attachment-card.component.html',
  styleUrls: ['./attachment-card.component.scss'],
})
export class AttachmentCardComponent implements OnInit {
  @Input() data: any;
  @Input() viewOnly: any;
  @Output() deleteAttachment = new EventEmitter()
  limit = 2;
  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {}

  getImgContent(file) {
    return this.sanitizer.bypassSecurityTrustUrl(file);
  }
  delete(data, index) {
    this.deleteAttachment.emit({ data: data, index: index });
  }
  loadMore(){
    console.log(this.data,'loadmore',this.data.attachments.length);
    this.limit=this.data.attachments.length;
  }
}
