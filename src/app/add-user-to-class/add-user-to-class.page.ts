import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { InteractSubtype, Environment, PageId, InteractType } from '../../services/telemetry-constants';
import {
  EventNamespace,
  EventsBusService,
  ServerProfileDetailsRequest,
  ProfileService,
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { AppHeaderService, CommonUtilService, TelemetryGeneratorService } from '../../services/index';
import { tap, filter, take } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks, ProfileConstants } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-add-user-to-class',
  templateUrl: './add-user-to-class.page.html',
  styleUrls: ['./add-user-to-class.page.scss'],
})
export class AddUserToClassPage {
  userId = '';
  isUserIdVerified = false;
  headerObservable: any;
  userName = 'Rahul';
  userDetails;
  private unregisterBackButton: Subscription;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private commonUtilService: CommonUtilService
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
    if (this.isUserIdVerified) {
      this.isUserIdVerified = false;
    } else {
        this.location.back();
    }
  }

  async onVerify() {

    const req: ServerProfileDetailsRequest = {
      userId: 'da4e72df-0371-45be-9df4-a7c7762d3d7f',
      requiredFields: ProfileConstants.REQUIRED_FIELDS
    };
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.profileService.getServerProfilesDetails(req).toPromise()
      .then(async (serverProfile) => {
        await loader.dismiss();
        if (serverProfile) {
          this.userDetails = serverProfile;
          this.userName = serverProfile.firstName ? serverProfile.firstName : '';
          this.userName += serverProfile.lastName ? serverProfile.lastName : '';
          this.isUserIdVerified = true;
          console.log('this.userName', this.userName);
        }
      }).catch(async () => {
        await loader.dismiss();
      });
  }

  onClearUser() {
    this.isUserIdVerified = false;
  }

  onAddToClass() {
    this.router.navigate([`/${RouterLinks.MY_CLASSROOMS}/${RouterLinks.CLASS_DETAILS}`]);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
