import { Component, Input, EventEmitter, Output, NgZone, OnInit, OnChanges } from '@angular/core';
import { ContentType, MimeType, MenuOverflow, RouterLinks } from '@app/app/app.constant';
// import { MenuOverflow } from '../../../app/app.constant';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';
// import { ViewController } from 'ionic-angular/navigation/view-controller';
import { CommonUtilService, } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PopoverController, Events } from '@ionic/angular';
import { InteractType, TelemetryObject } from 'sunbird-sdk';
import { Content, ContentDelete } from 'sunbird-sdk';
import { SbGenericPopoverComponent } from '../../components/popups/sb-generic-popover/sb-generic-popover.component';
import { InteractSubtype, Environment, PageId, ActionButtonType } from '../../../services/telemetry-constants';
import { EmitedContents } from '../download-manager.interface';
import { Router } from '@angular/router';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-downloads-tab',
  templateUrl: './downloads-tab.component.html',
  styleUrls: ['./downloads-tab.component.scss'],
})
export class DownloadsTabComponent implements OnInit, OnChanges {

  @Input() downloadedContents: Content[] = [];
  @Output() deleteContents = new EventEmitter();
  @Output() sortCriteriaChanged = new EventEmitter();
  showLoader = false;
  selectedContents: ContentDelete[] = [];
  showDeleteButton: Boolean = true;
  deleteAllPopupPresent: Boolean = false;
  showSelectAll: Boolean = true;
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
    private router: Router,
    private zone: NgZone,
    private headerService: AppHeaderService) {
    this.setSelectedItems();
  }
  ngOnInit(): void {
    this.headerService.headerEventEmitted$.subscribe(async () => {
      if (this.deleteAllPopupPresent) {
        await this.deleteAllConfirm.dismiss();
      }
    });
  }

  setSelectedItems() {
    this.downloadedContents.forEach(element => {
      element['isSelected'] = false;
    });
    console.log('contents', this.downloadedContents);
  }

  ngOnChanges() {
    this.setSelectedItems();
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
        if (identifier) {
            this.unSelectAllContents();
        }
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
      event,
      componentProps: {
        list: MenuOverflow.DOWNLOAD_FILTERS
      },
      cssClass: 'download-popover'
    });
    await sortOptions.present();
    const { data } = await sortOptions.onDidDismiss();
    if (data) {
      if (data.content !== this.selectedFilter) {
        this.selectedFilter = data.content;
        this.sortCriteriaChanged.emit(data);
      }
      if (this.deleteAllPopupPresent) {
        await this.deleteAllConfirm.dismiss({isLeftButtonClicked: null});
      }
    }
  }

  selectAllContents() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SELECT_ALL_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    this.downloadedContents.forEach(element => {
      element['isSelected'] = true;
    });
    this.showDeleteButton = false;
    this.showSelectAll = false;
    this.deleteAllContents();
  }

  async unSelectAllContents(event?) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UNSELECT_ALL_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS);
    this.downloadedContents.forEach(element => {
      element['isSelected'] = false;
    });
    this.showDeleteButton = true;
    this.showSelectAll = true;
    if (this.deleteAllPopupPresent) {
      await this.deleteAllConfirm.dismiss({isLeftButtonClicked: null});
    }
    this.selectedContents = [];
  }

  async toggleContentSelect(event, idx) {
    // this.downloadedContents[idx]['isSelected'] = !this.downloadedContents[idx]['isSelected'];

    // if (event.detail.checked) {
      this.downloadedContents[idx]['isSelected'] = event.detail.checked;
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
        if (this.deleteAllPopupPresent) {
          await this.deleteAllConfirm.dismiss({isLeftButtonClicked: null});
        }
      }
    // }
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
      this.deleteAllConfirm = await this.popoverCtrl.create({
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
        backdropDismiss: false,
        animated: true
      });
      await this.deleteAllConfirm.present();
      this.deleteAllPopupPresent = true;
      const { data } = await this.deleteAllConfirm.onDidDismiss();
      this.deleteAllPopupPresent = false;
      const valuesMap = {};
      if (data && data.isLeftButtonClicked === null) {
        this.unSelectAllContents();
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.POPUP_DISMISSED,
          Environment.DOWNLOADS,
          PageId.BULK_DELETE_POPUP);
        return;
      } else if (data.isLeftButtonClicked) {
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
    }
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
      if (content.contentData && content.contentData.contentType === ContentType.COURSE) {
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
          state: {
            content: content
          }
        });
      } else if (content.mimeType === MimeType.COLLECTION) {
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
          state: {
            content: content
          }
        });
      } else {
        this.router.navigate([RouterLinks.CONTENT_DETAILS], {
          state: {
            content: content
          }
        });
      }
    }
  }
}
