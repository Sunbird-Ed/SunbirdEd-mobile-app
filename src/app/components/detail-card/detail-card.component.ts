import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {Content} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';


@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss'],
})
export class DetailCardComponent implements OnInit {
  @Input() contentDetail: Content;
  @Input() defaultAppIcon: string;
  @Input() localImage: string;
  @Input() showDownloadBtn: boolean;
  @Input() isDepthChild: boolean;
  @Input() isDownloadStarted: boolean;
  @Input() queuedIdentifiers: boolean;
  @Input() currentCount: boolean;


  @Output() downloadAllContent = new EventEmitter();
  @Output() showOverflowMenuEvent = new EventEmitter();
  @Output() shareEvent = new EventEmitter();
  text: string;

  constructor(public commonUtil: CommonUtilService) {
  }

  ngOnInit() {
  }

  downloadAllContents() {
    this.downloadAllContent.emit();
    console.log('emited!');
  }

  showOverflowMenu() {
    this.showOverflowMenuEvent.emit();
  }

  share() {
    this.shareEvent.emit();
  }
}
