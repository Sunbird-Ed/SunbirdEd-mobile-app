import { RouterLinks } from '@app/app/app.constant';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TelemetryObject } from 'sunbird-sdk';
import { LibraryCardTypes } from '@project-sunbird/common-consumption';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, InteractSubtype, InteractType, PageId } from '@app/services/telemetry-constants';
import { Location } from '@angular/common';
import { NavigationService } from '@app/services/navigation-handler.service';
import { ContentUtil } from '@app/util/content-util';

@Component({
  selector: 'app-textbook-view-more',
  templateUrl: './textbook-view-more.page.html',
  styleUrls: ['./textbook-view-more.page.scss'],
})
export class TextbookViewMorePage {

  LibraryCardTypes = LibraryCardTypes;
  contentList: any;
  subjectName: any;
  toast: any;
  // header
  private _appHeaderSubscription?: Subscription;
  private _headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [] as string[]
  };

  constructor(
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private location: Location,
    private navService: NavigationService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.contentList = extras.contentList;
      this.subjectName = extras.subjectName;
    }
  }

  ionViewWillEnter() {
    this.initAppHeader();
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }

  private initAppHeader() {
    this._appHeaderSubscription = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this._headerConfig = this.headerService.getDefaultPageConfig();
    this._headerConfig.actionButtons = [];
    this._headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this._headerConfig);
  }

  private handleHeaderEvents(event: { name: string }) {
    switch (event.name) {
      case 'back':
        this.location.back();
        break;
    }
  }

  navigateToDetailPage(item, index, sectionName) {
    const values = new Map();
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      ContentUtil.getTelemetryObject(item),
      values);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.navService.navigateToCollection({
        content: item
      });
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {
          content: item
        }
      });
    } else {
      this.commonUtilService.showToast('OFFLINE_WARNING_ETBUI_1', false, 'toastHeader', 3000, 'top');
    }
  }

}
