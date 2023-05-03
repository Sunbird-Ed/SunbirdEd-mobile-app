import { Component, Input } from '@angular/core';
import {ContentData} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';

@Component({
  selector: 'app-relevant-content-card',
  templateUrl: './relevant-content-card.component.html',
  styleUrls: ['./relevant-content-card.component.scss'],
})
export class RelevantContentCardComponent {
  @Input() contentData: ContentData;
  @Input() isAlreadyEnrolled: boolean;
  @Input() isCertifiedCourse: boolean;
  @Input() certificateDescription: string;
  @Input() batchEndDate;
  @Input() enrollmentEndDate;

  constructor(public commonUtil: CommonUtilService) {
  }

}
