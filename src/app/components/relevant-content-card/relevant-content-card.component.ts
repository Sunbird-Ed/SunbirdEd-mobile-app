import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {ContentData, DownloadTracking} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-relevant-content-card',
  templateUrl: './relevant-content-card.component.html',
  styleUrls: ['./relevant-content-card.component.scss'],
})
export class RelevantContentCardComponent implements OnInit {
  @Input() contentData: ContentData;
  @Input() isAlreadyEnrolled: boolean;
  @Input() isCertifiedCourse: boolean;
  @Input() certificateDescription: string;

  constructor(public commonUtil: CommonUtilService) {
  }

  ngOnInit() {
  }
}
