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
import { RouterLinks, MenuOverflow } from '@app/app/app.constant';
import { Platform, PopoverController } from '@ionic/angular';
import { ClassRoomGetByIdRequest, ClassRoomService, ClassRoom } from '@project-sunbird/sunbird-sdk';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.page.html',
  styleUrls: ['./class-details.page.scss'],
})
export class ClassDetailsPage {

  headerObservable: any;
  groupId: string;
  groupDetails: ClassRoom;
  activeTab = 'members';
  memberList = [
    {
      title: 'Bala',
      initial: 'B',
      isAdmin: true,
    },
    {
      title: 'Anil',
      initial: 'A'
    },
    {
      title: 'Sharath',
      initial: 'S'
    },
    {
      title: 'Mani',
      initial: 'M'
    },
    {
      title: 'naveen',
      initial: 'N'
    }
  ];
  private unregisterBackButton: Subscription;

  constructor(
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private popoverCtrl: PopoverController,
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
    this.fetchGroupDetails();
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
    const navigationExtras: NavigationExtras = {
        state: {
          groupId: this.groupId
        }
      };
    this.router.navigate([`/${RouterLinks.ADD_USER_TO_CLASS}`], navigationExtras);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  async fetchGroupDetails() {
    const classRoomGetByIdRequest: ClassRoomGetByIdRequest = {
      id: this.groupId
    };
    try {
      this.groupDetails = await this.classRoomService.getById(classRoomGetByIdRequest).toPromise();
      console.log('this.groupDetails', this.groupDetails);
    } catch {

    }
  }

  switchTabs(tab) {
    this.activeTab = tab;
  }

  async showGroupOptions(event) {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.SORT_OPTION_CLICKED,
    //   Environment.DOWNLOADS,
    //   PageId.DOWNLOADS);
    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      event,
      componentProps: {
        list: MenuOverflow.GROUP_OPTIONS
      },
      cssClass: 'download-popover'
    });
    await groupOptions.present();
    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      console.log('dataon dismiss', data);
    }
  }

}
