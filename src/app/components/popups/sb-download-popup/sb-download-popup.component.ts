import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { FileSizePipe } from '../../../../pipes/file-size/file-size';
import { Events } from '../../../../util/events';

@Component({
  selector: 'app-sb-download-popup',
  templateUrl: './sb-download-popup.component.html',
  styleUrls: ['./sb-download-popup.component.scss'],
})
export class SbDownloadPopupComponent implements OnInit, OnChanges {

  @Output() cancelDownloadEmit = new EventEmitter();
  @Input() queuedIdentifiers: any;
  @Input() currentCount: any;
  @Input() downloadSize: any;
  @Input() collectionName: any;
  @Input() downloadProgress: any;
  @Input() contentName: any;
  @Input() isUpdateAvail: any;
  @Input() showDownload: any;
  @Input() contentAvailableLocally: any;
  @Input() contentSize: any;
  @Input() showPopover: any;
  popupUpdate: any;
  constContentSize: any;
  didViewLoad: boolean;

  constructor(
    private events: Events,
    private fileSizePipe: FileSizePipe) {
  }

  ngOnInit() {
    this.queuedIdentifiers = typeof this.queuedIdentifiers === 'number' ? new Array(this.queuedIdentifiers) : this.queuedIdentifiers;
  }

  togglePopover(popover?) {
    if (popover) {
      this.events.publish('header:decreasezIndex');
    } else {
      this.events.publish('header:setzIndexToNormal');
    }
  }
  cancelDownload() {
    this.cancelDownloadEmit.emit();
    this.showDownload = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.popupUpdate = this.isUpdateAvail && this.contentAvailableLocally;
    this.constContentSize = this.fileSizePipe.transform(this.contentSize, 2);
    if (changes['queuedIdentifiers']) {
      this.queuedIdentifiers = typeof this.queuedIdentifiers === 'number' ? new Array(this.queuedIdentifiers) : this.queuedIdentifiers;
    }
    if (changes['currentCount']) {
      this.currentCount = changes['currentCount'].currentValue;
    }
    if (changes['downloadSize']) {
      this.downloadSize = changes['downloadSize'].currentValue;
    }
    if (changes['downloadProgress']) {
      this.downloadProgress = changes['downloadProgress'].currentValue;
      if ((this.contentName && this.contentAvailableLocally) && (this.downloadProgress  || this.downloadProgress === 100)) {
        this.showDownload = false;
      }
    }
    if (changes['contentName']) {
      this.contentName = changes['contentName'];
    }
  }
}
