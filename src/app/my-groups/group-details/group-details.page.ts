import { Component, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { AppHeaderService } from '../../../services/index';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks, MenuOverflow } from '@app/app/app.constant';
import { Platform, PopoverController } from '@ionic/angular';
import { ClassRoomGetByIdRequest, ClassRoomService, ClassRoom } from '@project-sunbird/sunbird-sdk';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';
import GraphemeSplitter from 'grapheme-splitter';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage {

  headerObservable: any;
  groupId: string;
  groupDetails: ClassRoom;
  activeTab = 'members';
  memberList = [];
  memberListDummy = [
    {
      name: 'Anil',
      isAdmin: true,
    },
    {
      name: 'Bharath',
    },
    {
      name: 'Mani',
    },
    {
      name: 'Naveen',
    },
    {
      name: 'Sharath',
    },
  ];
  private unregisterBackButton: Subscription;

  constructor(
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private filter: FilterPipe
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
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ADD_MEMBER_TO_GROUP}`], navigationExtras);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  async fetchGroupDetails() {
    this.memberList = [];
    const classRoomGetByIdRequest: ClassRoomGetByIdRequest = {
      id: this.groupId
    };
    this.memberListDummy.forEach(m => {
      const member = {
        title: m.name,
        initial: this.extractInitial(m.name),
        isAdmin: m.isAdmin ? true : false
      };
      this.memberList.push(member);
    });
    try {
      this.groupDetails = await this.classRoomService.getById(classRoomGetByIdRequest).toPromise();
      console.log('this.groupDetails', this.groupDetails);
      this.groupDetails.members.forEach(m => {
        const member = {
          title: 'Balakrishna M',
          initial: this.extractInitial('Balakrishna'),
          isAdmin: false
        };
        this.memberList.push(member);
      });
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

  onSearch(text) {
    console.log('onsearch', text);
    // this.memberList = this.filter.transform(this.memberList, text);
  }

  extractInitial(name) {
    const splitter = new GraphemeSplitter();
    const split: string[] = splitter.splitGraphemes(name.trim());
    return split[0];
  }

}
