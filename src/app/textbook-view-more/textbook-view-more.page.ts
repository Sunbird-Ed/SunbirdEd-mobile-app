import { RouterLinks } from '@app/app/app.constant';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TelemetryObject } from 'sunbird-sdk';

import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, InteractSubtype, InteractType, PageId } from '@app/services/telemetry-constants';
import { Location } from '@angular/common';

@Component({
  selector: 'app-textbook-view-more',
  templateUrl: './textbook-view-more.page.html',
  styleUrls: ['./textbook-view-more.page.scss'],
})
export class TextbookViewMorePage implements OnInit {

  content: any;
  subjectName: any;
  toast: any;
  layoutName = 'textbook';
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
    private toastController: ToastController,
    private router: Router,
    private location: Location
  ) {

    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras) {
      this.content = extras.content;
      this.subjectName = extras.subjectName;
    }
  }

  ionViewWillEnter() {
    this.initAppHeader();
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
    const identifier = item.contentId || item.identifier;
    let telemetryObject: TelemetryObject;
    telemetryObject = new TelemetryObject(identifier, item.contentType, undefined);

    const values = new Map();
    values['sectionName'] = item.subject;
    values['positionClicked'] = index;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.HOME,
      PageId.LIBRARY,
      telemetryObject,
      values);
    if (this.commonUtilService.networkInfo.isNetworkAvailable || item.isAvailableLocally) {
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
        state: {
          content: item
        }
      });
    } else {
      this.commonUtilService.showToast('OFFLINE_WARNING_ETBUI_1', false, 'toastHeader', 3000, 'top');
    }
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }
}
