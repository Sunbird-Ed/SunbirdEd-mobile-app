import { Component, Input, EventEmitter, Output  } from '@angular/core';

// import { ContentDetailsPage } from './../../content-details/content-details';
// import { CollectionDetailsEtbPage } from '@app/pages/collection-details-etb/collection-details-etb';
// import { ContentType, MimeType } from '@app/app/app.constant';
import { MenuOverflow } from '../../../app/app.constant';
// import { OverflowMenuComponent } from '@app/pages/profile';
// import { ViewController } from 'ionic-angular/navigation/view-controller';
// import { CommonUtilService, TelemetryGeneratorService } from '@app/service';
// import { SbPopoverComponent } from '../../../component/popups/sb-popover/sb-popover';
// import { Component, Input, EventEmitter, Output } from '@angular/core';
// import { NavController, NavParams, PopoverController, Popover, Events } from 'ionic-angular';
import { InteractType, TelemetryObject } from 'sunbird-sdk';
import { Content, ContentDelete } from 'sunbird-sdk';
// import { SbGenericPopoverComponent } from '@app/component/popups/sb-generic-popup/sb-generic-popover';
import { InteractSubtype, Environment, PageId, ActionButtonType } from '../../../services/telemetry-constants';
import { EmitedContents } from '../download-manager.interface';

@Component({
  selector: 'app-downloads-tab',
  templateUrl: './downloads-tab.component.html',
  styleUrls: ['./downloads-tab.component.scss'],
})
export class DownloadsTabComponent {

    @Input() downloadedContents: Content[] = [];
    @Output() deleteContents = new EventEmitter();
    @Output() sortCriteriaChanged = new EventEmitter();
    showLoader = false;
    selectedContents: ContentDelete[] = [];
    showDeleteButton: Boolean = true;
    deleteAllPopupPresent: Boolean = false;
    showSelectAll: Boolean = true;
    selectedFilter: string = MenuOverflow.DOWNLOAD_FILTERS[0];
    // deleteAllConfirm: Popover;
    // selectedContentsInfo = {
    //     totalSize: 0,
    //     count: 0
    // };

  constructor() { }


}




