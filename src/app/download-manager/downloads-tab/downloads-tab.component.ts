import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuOverflow, RouterLinks } from '@app/app/app.constant';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';
import { AppHeaderService } from '@app/services';
import { CommonUtilService } from '@app/services/common-util.service';
import { NavigationService } from '@app/services/navigation-handler.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentUtil } from '@app/util/content-util';
import { PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Content, ContentDelete, CorrelationData, InteractType, TelemetryObject } from 'sunbird-sdk';
import { ActionButtonType, CorReleationDataType, Environment, InteractSubtype, PageId } from '../../../services/telemetry-constants';
import { SbGenericPopoverComponent } from '../../components/popups/sb-generic-popover/sb-generic-popover.component';
import { EmitedContents } from '../download-manager.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-downloads-tab',
  templateUrl: './downloads-tab.component.html',
  styleUrls: ['./downloads-tab.component.scss'],
})
export class DownloadsTabComponent implements OnInit {

  @Input() downloadedContents: Content[] = [];
  @Output() deleteContents = new EventEmitter();
  @Output() sortCriteriaChanged = new EventEmitter();
  showLoader = false;
  selectedContents: ContentDelete[] = [];
  showDeleteButton = true;
  deleteAllPopupPresent = false;
  showSelectAll = true;
  selectedFilter: string = MenuOverflow.DOWNLOAD_FILTERS[0];
  deleteAllConfirm;
  selectedContentsInfo = {
    totalSize: 0,
    count: 0
  };
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');

  constructor(
    private popoverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private navService: NavigationService,
    private headerService: AppHeaderService,
    private router:Router) {
  }

  ngOnInit(): void {
    this.headerService.headerEventEmitted$.subscribe(async () => {
      if (this.deleteAllPopupPresent) {
        await this.deleteAllConfirm.dismiss();
      }
    });
  }

  async showDeletePopup(identifier?,type?) {
    if (identifier) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.DELETE_CLICKED,
        Environment.DOWNLOADS,
        PageId.DOWNLOADS);
      const contentDelete: ContentDelete = {
        contentId: identifier,
        isChildContent: false
      };
      type=='project' ? contentDelete['type']=type:null
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
        sbPopoverContent: identifier ? this.commonUtilService.translateMessage('DELETE_CONTENT_WARNING')
          : this.commonUtilService.translateMessage('DELETE_ALL_CONTENT_WARNING')
      },
      cssClass: 'sb-popover danger',
    });
    await deleteConfirm.present();
    const { data } = await deleteConfirm.onDidDismiss();

    if (data === undefined) { // Backdrop clicked
      if (!identifier) { this.unSelectAllContents(); }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.OUTSIDE_POPUP_AREA_CLICKED,
        Environment.DOWNLOADS,
        PageId.SINGLE_DELETE_CONFIRMATION_POPUP);
    } else if (data.closeDeletePopOver) { // Close clicked
      if (!identifier) { this.unSelectAllContents(); }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CLOSE_CLICKED,
        Environment.DOWNLOADS,
        PageId.SINGLE_DELETE_CONFIRMATION_POPUP);
    } else if (data.canDelete) {
      const valuesMap = {};
      valuesMap['type'] = ActionButtonType.POSITIVE;
      let telemetryObject: TelemetryObject;
      if (identifier) {
        this.downloadedContents.forEach(element => {
          if (element.identifier === identifier) {
            telemetryObject = ContentUtil.getTelemetryObject(element);
          }
        });
      }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.ACTION_BUTTON_CLICKED,
        Environment.DOWNLOADS,
        identifier ? PageId.SINGLE_DELETE_CONFIRMATION_POPUP : PageId.BULK_DELETE_CONFIRMATION_POPUP,
        telemetryObject,
        valuesMap);
      this.deleteContent();
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
        await this.deleteAllConfirm.dismiss({ isLeftButtonClicked: null });
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
      await this.deleteAllConfirm.dismiss({ isLeftButtonClicked: null });
    }
    this.selectedContents = [];
  }

  async toggleContentSelect(event, idx) {
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
        await this.deleteAllConfirm.dismiss({ isLeftButtonClicked: null });
      }
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
        element['type']=='project'?contentDelete['type']=element['type']:null
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
      this.deleteAllPopupPresent = true;
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
        this.deleteAllConfirm = undefined;
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
      this.deleteAllConfirm = undefined;
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.ACTION_BUTTON_CLICKED,
        Environment.DOWNLOADS,
        PageId.BULK_DELETE_POPUP, undefined,
        valuesMap);
    }
  }

  navigateToDetailsPage(content) {
    if (content.type == 'project') {
      this.navigateToProjectDetails(content)
      return
    }
    const corRelationList: Array<CorrelationData> = [{
        id: CorReleationDataType.DOWNLOADS,
        type: CorReleationDataType.SECTION
      }];
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.DOWNLOADS,
      PageId.DOWNLOADS,
      ContentUtil.getTelemetryObject(content),
      undefined,
      ContentUtil.generateRollUp(undefined, content.identifier),
      corRelationList);
    this.navService.navigateToDetailPage(
      content, { content }
    );
  }

  navigateToProjectDetails(project) {
     const selectedFilter = project.isAPrivateProgram==false ? 'assignedToMe' : 'createdByMe';
     this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
       queryParams: {
         projectId: project._id,
         programId: project.programId,
         solutionId: project.solutionId,
         type: selectedFilter,
       },
     });
  }
}
