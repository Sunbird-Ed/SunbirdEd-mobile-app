import { Component, Input } from '@angular/core';
import {ContentData} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';


@Component({
  selector: 'app-toc-header',
  templateUrl: './toc-header.component.html',
  styleUrls: ['./toc-header.component.scss'],
})
export class TocHeaderComponent {
  @Input() contentData: ContentData;

  // defaultIcon
  defaultAppIcon: string;
  constructor(public commonUtil: CommonUtilService) {
    this.defaultAppIcon = 'assets/imgs/ic_launcher.png';
  }

}
