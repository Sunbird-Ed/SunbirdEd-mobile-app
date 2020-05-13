import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { InteractSubtype, Environment, PageId, InteractType } from '../../../services/telemetry-constants';
import {
  EventNamespace,
  EventsBusService,
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { AppHeaderService, CommonUtilService, TelemetryGeneratorService } from '../../../services/index';
import { tap, filter, take } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage {

  headerObservable: any;
  private unregisterBackButton: Subscription;

  constructor(
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform
  ) {
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }


  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        // this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.COLLECTION_DETAIL, Environment.HOME,
          // true, this.cardData.identifier, this.corRelationList);
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    this.location.back();
  }

  navigateToAddUserPage() {
    this.router.navigate([`/${RouterLinks.ADD_USER_TO_CLASS}`]);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
