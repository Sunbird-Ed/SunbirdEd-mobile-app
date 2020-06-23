import { Component, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ServerProfileDetailsRequest,
  ProfileService,
} from 'sunbird-sdk';
import { Location } from '@angular/common';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks, ProfileConstants } from '@app/app/app.constant';
import { Platform } from '@ionic/angular';
import { ClassRoomService, ClassRoomAddMemberByIdRequest } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService, CommonUtilService } from '@app/services';

@Component({
  selector: 'app-add-member-to-group',
  templateUrl: './add-member-to-group.page.html',
  styleUrls: ['./add-member-to-group.page.scss'],
})
export class AddMemberToGroupPage {
  userId = '';
  isUserIdVerified = false;
  showErrorMsg = false;
  headerObservable: any;
  userName = 'Rahul';
  groupId: string;
  userDetails;
  private unregisterBackButton: Subscription;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private commonUtilService: CommonUtilService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.groupId = extras.groupId;
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

    if (!this.userId) {
      this.showErrorMsg = true;
      return;
    }
    this.showErrorMsg = false;
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
    this.userId = '';
  }

  async onAddToGroup() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const addMemberToGroupReq: ClassRoomAddMemberByIdRequest = {
      memberId: this.userDetails.userId,
      groupId: this.groupId
    };
    this.classRoomService.addMemberById(addMemberToGroupReq).toPromise().then(async (res) => {
      await loader.dismiss();
      this.commonUtilService.showToast('MEMBER_ADDED_TO_GROUP');
      this.location.back();
    }).catch(async (err) => {
      await loader.dismiss();
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
    });
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

}
