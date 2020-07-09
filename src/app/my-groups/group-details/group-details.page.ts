import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import {
  AppHeaderService, PageId,
  FormAndFrameworkUtilService,
  CommonUtilService, AppGlobalService, TelemetryGeneratorService, InteractType, InteractSubtype, Environment, ImpressionType, ID
} from '../../../services';
import { Router, NavigationExtras } from '@angular/router';
import { RouterLinks, MenuOverflow } from '@app/app/app.constant';
import { Platform, PopoverController } from '@ionic/angular';
import {
  GroupService, GetByIdRequest, Group,
  GroupMember, GroupMemberRole, DeleteByIdRequest,
  RemoveMembersRequest, Profile,
  UpdateMembersRequest, RemoveActivitiesRequest
} from '@project-sunbird/sunbird-sdk';
import { OverflowMenuComponent } from '@app/app/profile/overflow-menu/overflow-menu.component';
import GraphemeSplitter from 'grapheme-splitter';
import { SbGenericFormPopoverComponent } from '@app/app/components/popups/sb-generic-form-popover/sb-generic-form-popover.component';
import { SbGenericPopoverComponent } from '@app/app/components/popups';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {

  userId: string;
  headerObservable: any;
  groupId: string;
  groupDetails: Group;
  activeTab = 'courses';
  activityList = [];
  memberList: GroupMember[] = [];
  filteredMemberList = [];
  searchValue: string;
  private unregisterBackButton: Subscription;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private commonUtilService: CommonUtilService,
    private filterPipe: FilterPipe,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.groupId = extras.groupId;
  }

  ngOnInit() {
    this.appGlobalService.getActiveProfileUid()
      .then((uid) => {
        this.userId = uid;
      });
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    this.fetchGroupDetails();

    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '', PageId.GROUP_DETAIL, Environment.GROUP);
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.GROUP_DETAIL, Environment.GROUP, isNavBack);
    this.location.back();
  }

  navigateToAddUserPage() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ADD_MEMBER_CLICKED, Environment.GROUP, PageId.GROUP_DETAIL);
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

  private async fetchGroupDetails() {
    this.memberList = [];
    const getByIdRequest: GetByIdRequest = {
      id: this.groupId,
      options: {
        includeMembers: true,
        includeActivities: true
      }
    };
    try {
      this.groupDetails = await this.groupService.getById(getByIdRequest).toPromise();
      console.log('this.groupDetails', this.groupDetails);
      this.memberList = this.groupDetails.members;
      this.filteredMemberList = new Array(...this.memberList);
    } catch (e) {
      console.error(e);
    }
  }

  switchTabs(tab) {
    this.activeTab = tab;
  }

  async groupMenuClick() {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.SORT_OPTION_CLICKED,
    //   Environment.DOWNLOADS,
    // PageId.GROUP_DETAIL);

    const menuList = MenuOverflow.MENU_GROUP_ADMIN;
    // TODO: Handle below condition while API intigration.
    // if (!isAdmin) {
    //   menuList = MenuOverflow.MENU_GROUP_NON_ADMIN;
    // }

    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: menuList
      },
      cssClass: 'group-option-popover'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      console.log('dataon dismiss', data);
      if (data.selectedItem === 'MENU_EDIT_GROUP_DETAILS') {
        this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
      } else if (data.selectedItem === 'MENU_DELETE_GROUP') {
        this.showDeleteGroupPopup();
      }
    }
  }

  async activityMenuClick(event) {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.SORT_OPTION_CLICKED,
    //   Environment.DOWNLOADS,
    // PageId.GROUP_DETAIL);

    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: MenuOverflow.MENU_GROUP_ACTIVITY_ADMIN
      },
      event: event.event,
      cssClass: 'download-popover my-group-menu'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      console.log('dataon dismiss', data);
      this.showRemoveActivityPopup(data);
    }
  }

  async memberMenuClick(event) {
    // this.telemetryGeneratorService.generateInteractTelemetry(
    //   InteractType.TOUCH,
    //   InteractSubtype.SORT_OPTION_CLICKED,
    //   Environment.DOWNLOADS,
    // PageId.GROUP_DETAIL);
    const selectedMemberDetail = this.memberList.find(m => m.userId === event.data.userId);
    let menuList = MenuOverflow.MENU_GROUP_MEMBER_NON_ADMIN;

    if (selectedMemberDetail.role === GroupMemberRole.ADMIN) {  // Is admin and creator
      menuList = MenuOverflow.MENU_GROUP_MEMBER_ADMIN;
    }

    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: menuList
      },
      event: event.event,
      cssClass: 'download-popover my-group-menu'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      console.log('dataon dismiss', data);
      if (data.selectedItem === 'MENU_MAKE_GROUP_ADMIN') {
        this.showMakeGroupAdminPopup(selectedMemberDetail);
      } else if (data.selectedItem === 'MENU_REMOVE_FROM_GROUP') {
        this.showRemoveMemberPopup(selectedMemberDetail);
      } else if (data.selectedItem === 'DISMISS_AS_GROUP_ADMIN') {
        this.showDismissAsGroupAdminPopup(selectedMemberDetail);
      }
    }
  }

  private async showDeleteGroupPopup() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.DELETE_GROUP_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const deleteConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DELETE_GROUP_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('REMOVE'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('DELETE_GROUP_DESC', { group_name: this.groupDetails.name })
      },
      cssClass: 'sb-popover danger',
    });
    await deleteConfirm.present();

    const { data } = await deleteConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.DELETE_GROUP);
      const deleteByIdRequest: DeleteByIdRequest = {
        id: this.groupId
      };
      try {
        this.groupService.deleteById(deleteByIdRequest).toPromise();
        this.location.back();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.DELETE_GROUP
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async showLeaveGroupPopup() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.LEAVE_GROUP_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const leaveGroupConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('LEAVE_GROUP_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('LEAVE_GROUP'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('LEAVE_GROUP_POPUP_DESC', { group_name: this.groupDetails.name })
      },
      cssClass: 'sb-popover danger',
    });
    await leaveGroupConfirm.present();

    const { data } = await leaveGroupConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.LEAVE_GROUP);
      const removeMembersRequest: RemoveMembersRequest = {
        groupId: this.groupId,
        removeMembersRequest: {
          userIds: [this.userId]
        }
      };
      try {
        this.groupService.removeMembers(removeMembersRequest).toPromise();
        this.location.back();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.LEAVE_GROUP);
      } catch (e) {
        console.error(e);
      }
      this.location.back();
    }
  }

  private async showRemoveActivityPopup(selectedActivity) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.REMOVE_ACTIVITY_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const removeActivityConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('REMOVE_ACTIVITY_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('REMOVE_ACTIVITY'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('REMOVE_ACTIVITY_GROUP_DESC')
      },
      cssClass: 'sb-popover danger',
    });
    await removeActivityConfirm.present();

    const { data } = await removeActivityConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.REMOVE_ACTIVITY);
      const removeActivitiesRequest: RemoveActivitiesRequest = {
        groupId: this.groupId,
        removeActivitiesRequest: {
          activityIds: [selectedActivity.id]
        }
      };
      try {
        this.groupService.removeActivities(removeActivitiesRequest).toPromise();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.REMOVE_ACTIVITY);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async showRemoveMemberPopup(selectedMember) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.REMOVE_MEMBER_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const removeMemberConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('REMOVE_MEMBER_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('REMOVE_MEMBER'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('REMOVE_MEMBER_GROUP_DESC', { member_name: selectedMember.name })
      },
      cssClass: 'sb-popover danger',
    });
    await removeMemberConfirm.present();

    const { data } = await removeMemberConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.REMOVE_MEMBER);
      const removeMembersRequest: RemoveMembersRequest = {
        groupId: this.groupId,
        removeMembersRequest: {
          userIds: [selectedMember.userId]
        }
      };
      try {
        this.groupService.removeMembers(removeMembersRequest).toPromise();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.REMOVE_MEMBER);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async showMakeGroupAdminPopup(selectedMember) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.MAKE_GROUP_ADMIN_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const makeGroupAdminConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('MAKE_GROUP_ADMIN_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('MAKE_ADMIN'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('MAKE_GROUP_ADMIN_POPUP_DESC',
          { member_name: selectedMember.name })
      },
      cssClass: 'sb-popover',
    });
    await makeGroupAdminConfirm.present();

    const { data } = await makeGroupAdminConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.MAKE_GROUP_ADMIN);
      const updateMembersRequest: UpdateMembersRequest = {
        groupId: this.groupId,
        updateMembersRequest: {
          members: [{
            userId: selectedMember.userId,
            role: GroupMemberRole.ADMIN
          }]
        }
      };
      try {
        this.groupService.updateMembers(updateMembersRequest).toPromise();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.MAKE_GROUP_ADMIN);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async showDismissAsGroupAdminPopup(selectedMember) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.DISMISS_GROUP_ADMIN_CLICKED,
        Environment.GROUP,
        PageId.GROUP_DETAIL);
    const dismissAsGroupAdminConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DISMISS_AS_GROUP_ADMIN_POPUP_TITLE'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('DISMISS_AS_GROUP_ADMIN'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('DISMISS_AS_GROUP_ADMIN_POPUP_DESC',
          { member_name: selectedMember.name })
      },
      cssClass: 'sb-popover',
    });
    await dismissAsGroupAdminConfirm.present();

    const { data } = await dismissAsGroupAdminConfirm.onDidDismiss();
    if (data) {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.INITIATED,
          '',
          Environment.GROUP,
          PageId.GROUP_DETAIL,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.DISMISS_GROUP_ADMIN);
      const updateMembersRequest: UpdateMembersRequest = {
        groupId: this.groupId,
        updateMembersRequest: {
          members: [{
            userId: selectedMember.userId,
            role: GroupMemberRole.MEMBER
          }]
        }
      };
      try {
        this.groupService.updateMembers(updateMembersRequest).toPromise();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.SUCCESS,
            '',
            Environment.GROUP,
            PageId.GROUP_DETAIL,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.DISMISS_GROUP_ADMIN);
      } catch (e) {
        console.error(e);
      }
    }
  }

  onSearch(searchText) {
    console.log('onsearch', searchText);
    this.searchValue = searchText;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'title', searchText)];
  }

  extractInitial(name) {
    const splitter = new GraphemeSplitter();
    const split: string[] = splitter.splitGraphemes(name.trim());
    return split[0];
  }

  navigateToActivityDetails(event) {
    const navigationExtras: NavigationExtras = {
      state: {
        groupId: this.groupId,
        memberList: this.memberList
      }
    };
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}`], navigationExtras);
  }

  async showAddActivityPopup() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.ADD_ACTIVITY_CLICKED, Environment.GROUP, PageId.GROUP_DETAIL);
    try {
      const supportedActivityList = await this.formAndFrameworkUtilService.invokeSupportedGroupActivitiesFormApi();

      const selectActivityPopup = await this.popoverCtrl.create({
        component: SbGenericFormPopoverComponent,
        componentProps: {
          sbPopoverHeading: this.commonUtilService.translateMessage('SELECT_ACTIVITY'),
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('NEXT'),
              btnClass: 'popover-color'
            }
          ],
          icon: null,
          formItems: supportedActivityList
        },
        cssClass: 'sb-popover info',
      });
      await selectActivityPopup.present();
      const { data } = await selectActivityPopup.onDidDismiss();
      if (data && data.selectedVal && data.selectedVal.activityType === 'Content') {
        this.search(data);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async search(data) {
    // this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
    //   InteractSubtype.SEARCH_BUTTON_CLICKED,
    //   Environment.HOME,
    //   PageId.COURSES);
    this.router.navigate([RouterLinks.SEARCH], {
      state: {
        contentType: data.selectedVal.activityValues,
        source: PageId.GROUP_DETAIL,
        groupId: this.groupId
      }
    });
  }

}
