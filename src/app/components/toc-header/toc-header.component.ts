import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {ContentData, DownloadTracking} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-toc-header',
  templateUrl: './toc-header.component.html',
  styleUrls: ['./toc-header.component.scss'],
})
export class TocHeaderComponent implements OnInit {
  @Input() contentData: ContentData;

  constructor(public commonUtil: CommonUtilService) {
  }

  ngOnInit() {
  }
}
