import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Content, DownloadTracking } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss'],
})
export class DetailCardComponent {
  @Input() contentDetail: Content;
  @Input() defaultAppIcon: string;
  @Input() localImage: string;
  @Input() showDownloadBtn: boolean;
  @Input() isDepthChild: boolean;
  @Input() trackDownloads: Observable<DownloadTracking>;

  @Output() downloadAllContent = new EventEmitter();
  @Output() showOverflowMenuEvent = new EventEmitter();
  @Output() shareEvent = new EventEmitter();
  text: string;

  constructor(public commonUtil: CommonUtilService) {}

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

  rateContent() {
    console.log('rate content');
  }
}
