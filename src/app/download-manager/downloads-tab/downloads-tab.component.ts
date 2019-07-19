import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ContentType, MimeType, MenuOverflow, RouterLinks } from '@app/app/app.constant';
// import { MenuOverflow } from '../../../app/app.constant';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';
// import { ViewController } from 'ionic-angular/navigation/view-controller';
import { CommonUtilService, TelemetryGeneratorService } from '@app/services';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PopoverController, Events } from '@ionic/angular';
import { InteractType, TelemetryObject } from 'sunbird-sdk';
import { Content, ContentDelete } from 'sunbird-sdk';
import { SbGenericPopoverComponent } from '../../components/popups/sb-generic-popover/sb-generic-popover.component';
import { InteractSubtype, Environment, PageId, ActionButtonType } from '../../../services/telemetry-constants';
import { EmitedContents } from '../download-manager.interface';
import { Router } from '@angular/router';

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
  showSelectAll: boolean = true;
  selectedFilter: string = MenuOverflow.DOWNLOAD_FILTERS[0];
  deleteAllConfirm;
  selectedContentsInfo = {
    totalSize: 0,
    count: 0
  };

  constructor(
    private popoverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router) {
  }

  async showDeletePopup(identifier?) {
    if (identifier) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.DELETE_CLICKED,
        Environment.DOWNLOADS,
        PageId.DOWNLOADS);
      const contentDelete: ContentDelete = {
        contentId: identifier,
        isChildContent: false
      };
      this.selectedContents = [contentDelete];
    }
    this.telemetryGeneratorService.generatePageViewTelemetry(
      identifier ? PageId.SINGLE_DELETE_CONFIRMATION_POPUP : PageId.BULK_DELETE_CONFIRMATION_POPUP, Environment.DOWNLOADS);
    const deleteConfirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DELETE_CONTENT'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('REMOVE'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        // mshowDeletePopupshowDeletePopupetaInfo: this.content.contentData.name,
        sbPopoverContent: identifier ? this.commonUtilService.translateMessage('DELETE_CONTENT_WARNING')
          : this.commonUtilService.translateMessage('DELETE_ALL_CONTENT_WARNING')
      },
      cssClass: 'sb-popover danger',
    });
    await deleteConfirm.present();
    const response = await deleteConfirm.onDidDismiss();
    console.log('downloads tab', response);
    switch (response.data) {
      case undefined:
        this.unSelectAllContents();
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.CLOSE_CLICKED,
          Environment.DOWNLOADS,
          PageId.SINGLE_DELETE_CONFIRMATION_POPUP);
        break;
      case null:
        this.unSelectAllContents();
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.OUTSIDE_POPUP_AREA_CLICKED,
          Environment.DOWNLOADS,
          PageId.SINGLE_DELETE_CONFIRMATION_POPUP);
        break;
      default:
        const valuesMap = {};
        valuesMap['type'] = ActionButtonType.POSITIVE;
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.ACTION_BUTTON_CLICKED,
          Environment.DOWNLOADS,
          PageId.SINGLE_DELETE_CONFIRMATION_POPUP, undefined,
          valuesMap);
        this.deleteContent();
        break;
    }
  }

  deleteContent() {
    const emitedContents: EmitedContents = {
      selectedContentsInfo: this.selectedContentsInfo,
      selectedContents: this.selectedContents
    };
    this.deleteContents.emit(emitedContents);
  }

  async showSortOptions(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SORT_OPTION_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    const sortOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: MenuOverflow.DOWNLOAD_FILTERS
      },
      cssClass: 'box download-popover'
    });
    await sortOptions.present();
    const { data } = await sortOptions.onDidDismiss();
    if (data) {
      if (data.content !== this.selectedFilter) {
        this.selectedFilter = data.content;
        this.sortCriteriaChanged.emit(data);
      }
      if (this.deleteAllPopupPresent) {
        this.deleteAllConfirm.dismiss(null);
      }
    }
  }

  selectAllContents() {
    this.downloadedContents.forEach(element => {
      element['isSelected'] = true;
    });
    this.showDeleteButton = false;
    this.showSelectAll = false;
    this.deleteAllContents();
  }

  unSelectAllContents() {
    this.downloadedContents.forEach(element => {
      element['isSelected'] = false;
    });
    this.showDeleteButton = true;
    this.showSelectAll = true;
    if (this.deleteAllPopupPresent) {
      this.deleteAllConfirm.dismiss(null);
    }
    this.selectedContents = [];
  }

  toggleContentSelect(event, idx) {
    // this.downloadedContents[idx]['isSelected'] = !this.downloadedContents[idx]['isSelected'];
    this.downloadedContents[idx]['isSelected'] = event.value;
    const selectedContents = (this.downloadedContents.filter((element) => element['isSelected']));
    if (selectedContents.length) {
      if (selectedContents.length === this.downloadedContents.length) {
        this.showSelectAll = false;
      } else {
        this.showSelectAll = true;
      }
      this.showDeleteButton = false;
      this.deleteAllContents();
    } else {
      this.showDeleteButton = true;
      this.deleteAllConfirm.dismiss(null);
    }
  }

  async deleteAllContents() {
    this.selectedContentsInfo = {
      totalSize: 0,
      count: 0
    };
    this.selectedContents = [];
    this.downloadedContents.forEach(element => {
      if (element['isSelected']) {
        const contentDelete: ContentDelete = {
          contentId: element.identifier,
          isChildContent: false
        };
        this.selectedContentsInfo.totalSize += element.sizeOnDevice;
        this.selectedContents.push(contentDelete);
      }
    });
    this.selectedContentsInfo.count = this.selectedContents.length;
    this.events.publish('selectedContents:changed', {
      selectedContents: this.selectedContentsInfo
    });
    if (!this.deleteAllPopupPresent) {
      this.telemetryGeneratorService.generatePageViewTelemetry(PageId.BULK_DELETE_POPUP, Environment.DOWNLOADS);
      this.deleteAllConfirm = this.popoverCtrl.create({
        component: SbGenericPopoverComponent,
        componentProps: {
          sbPopoverMainTitle: this.commonUtilService.translateMessage('ITEMS_SELECTED'),
          selectedContents: this.selectedContentsInfo,
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('CANCEL'),
              btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info'
            }, {
              btntext: this.commonUtilService.translateMessage('DELETE'),
              btnClass: 'popover-color'
            }
          ],
          showHeader: false,
          icon: null
        },
        cssClass: 'sb-popover danger sb-dw-delete-popover',
        showBackdrop: false,
        // migration-TODO
        // enableBackdropDismiss: false (ionic v3)
        backdropDismiss: false
      });
      await this.deleteAllConfirm.present();
      this.deleteAllPopupPresent = true;
    }
    this.deleteAllConfirm.onDidDismiss((leftBtnClicked: any) => {
      this.deleteAllPopupPresent = false;
      const valuesMap = {};
      if (leftBtnClicked == null) {
        this.unSelectAllContents();
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.POPUP_DISMISSED,
          Environment.DOWNLOADS,
          PageId.BULK_DELETE_POPUP);
        return;
      } else if (leftBtnClicked) {
        valuesMap['type'] = ActionButtonType.NEGATIVE;
        this.unSelectAllContents();
      } else {
        valuesMap['type'] = ActionButtonType.POSITIVE;
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.ACTION_BUTTON_CLICKED,
          Environment.DOWNLOADS,
          PageId.BULK_DELETE_POPUP, undefined,
          valuesMap);
        this.showDeletePopup();
      }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.ACTION_BUTTON_CLICKED,
        Environment.DOWNLOADS,
        PageId.BULK_DELETE_POPUP, undefined,
        valuesMap);
    });
  }

  navigateToDetailsPage(content) {
    const objectType = this.telemetryGeneratorService.isCollection(content.mimeType) ? content.contentData.contentType
      : ContentType.RESOURCE;
    const telemetryObject: TelemetryObject = new TelemetryObject(content.identifier, objectType, content.contentData.pkgVersion);
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS,
      telemetryObject);
    if (!this.selectedContents.length) {
      switch (content.mimeType) {

        // case MimeType.COLLECTION: this.navCtrl.push(CollectionDetailsEtbPage, { content: content });
        case MimeType.COLLECTION: this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
          state: {
            content: content
          }
        });

          break;
        // default: this.navCtrl.push(ContentDetailsPage, { content: content });
        default: this.router.navigate([RouterLinks.CONTENT_DETAILS], {
          state: {
            content: content
          }
        });
      }
    }

  }


}




