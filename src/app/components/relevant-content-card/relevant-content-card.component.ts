import { Component, Input } from '@angular/core';
import {ContentData} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services';


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

  constructor(public commonUtil: CommonUtilService) {
  }

}
