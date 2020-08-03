import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {Content, DownloadTracking} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { Observable } from 'rxjs';


@Component({
  selector: 'collection-acions',
  templateUrl: './collection-acions.component.html',
  styleUrls: ['../detail-card/detail-card.component.scss'],
})
export class CollectionActionsComponent implements OnInit {
  @Input() contentDetail: Content;
  @Input() showDownloadBtn: boolean;
  @Input() isDepthChild: boolean;
  @Input() trackDownloads: Observable<DownloadTracking>;

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
  }

  showOverflowMenu() {
    this.showOverflowMenuEvent.emit();
  }

  share() {
    this.shareEvent.emit();
  }
}
