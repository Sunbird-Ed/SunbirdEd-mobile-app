import { Component, Input } from '@angular/core';
import { AppStorageInfo } from './../../download-manager.interface';


@Component({
  selector: 'app-downloads-header',
  templateUrl: './downloads-header.component.html',
  styleUrls: ['./downloads-header.component.scss'],
})
export class DownloadsHeaderComponent {

  @Input() storageInfo: AppStorageInfo;
  @Input() appName: string;

  constructor() { }


}

