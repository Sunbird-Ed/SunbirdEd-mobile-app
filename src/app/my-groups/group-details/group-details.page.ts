import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { Router } from '@angular/router';
import { RouterLinks, MenuOverflow, ProfileConstants } from '../../../app/app.constant';
import {
  InteractType,
  InteractSubtype,
  Environment, PageId,
  ImpressionType,
  CorReleationDataType,
  ID
} from '../../../services/telemetry-constants';
import { Platform, PopoverController } from '@ionic/angular';
import {
  GroupService, GetByIdRequest, Group,
  GroupMember, GroupMemberRole, DeleteByIdRequest,
  RemoveMembersRequest,
  UpdateMembersRequest, RemoveActivitiesRequest,
  CachedItemRequestSourceFrom, GroupUpdateMembersResponse,
  GroupActivity,
  Form,
  GroupSupportedActivitiesFormField,
  CorrelationData, DiscussionService, ProfileService, FormService, ActivateAndDeactivateByIdRequest
} from '@project-sunbird/sunbird-sdk';
import {
  OverflowMenuComponent
} from '../../../app/profile/overflow-menu/overflow-menu.component';
import GraphemeSplitter from 'grapheme-splitter';
import {
  SbGenericPopoverComponent
} from '../../../app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { FilterPipe } from '../../../pipes/filter/filter.pipe';
import { ActivitiesGrouped } from '@project-sunbird/client-services/models';
import { ViewMoreActivityActionsDelegate, ViewMoreActivityDelegateService } from '../view-more-activity/view-more-activity-delegate.page';
import { NavigationService } from '../../../services/navigation-handler.service';
import { AccessDiscussionComponent } from '../../../app/components/access-discussion/access-discussion.component';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit, OnDestroy, ViewMoreActivityActionsDelegate {

  corRelationList: Array<CorrelationData> = [];
  isGroupLoading = false;
  userId: string;
  headerObservable: any;
  groupId: string;
  groupDetails: Group;
  activeTab = 'activities';
  activityList: ActivitiesGrouped[] = [];
  groupedActivityListMap: { [title: string]: GroupActivity[] };
  filteredGroupedActivityListMap: { [title: string]: GroupActivity[] };
  memberList: GroupMember[] = [];
  filteredMemberList = [];
  memberSearchQuery: string;
  activitySearchQuery: string;
  private unregisterBackButton: Subscription;
  loggedinUser: GroupMember;
  groupCreator: GroupMember;
  flattenedActivityList = [];
  isSuspended = false;
  isGroupCreatorOrAdmin = false;
  forumDetails;
  // createForumRequest;
  fetchForumIdReq;
  createUserReq = {
    username: '',
    identifier: ''
  };
  searchMember: any;
  searchActivity: any;
  @ViewChild(AccessDiscussionComponent, { static: false }) accessDiscussionComponent: AccessDiscussionComponent;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    @Inject('DISCUSSION_SERVICE') private discussionService: DiscussionService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FORM_SERVICE') private formService: FormService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private navService: NavigationService,
    public commonUtilService: CommonUtilService,
    private filterPipe: FilterPipe,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private viewMoreActivityDelegateService: ViewMoreActivityDelegateService
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.groupId = extras.groupId;
  }

  async ngOnInit() {
    this.appGlobalService.getActiveProfileUid()
      .then((uid) => {
        this.userId = uid;
        this.createUserReq.identifier = uid;
      }).catch(e => console.error(e));

    this.corRelationList.push({ id: this.groupId, type: CorReleationDataType.GROUP_ID });
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW, '', PageId.GROUP_DETAIL, Environment.GROUP,
      undefined, undefined, undefined, undefined, this.corRelationList);

    this.viewMoreActivityDelegateService.delegate = this;
    await this.generateDataForDF();
  }

  ngOnDestroy() {
    this.viewMoreActivityDelegateService.delegate = undefined;
  }

  async ionViewWillEnter() {
    await this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    await this.fetchGroupDetails();
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    if($event.name === 'back')
    {
      this.handleBackButton(true);
    }
  }

  handleBackButton(isNavBack) {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.GROUP_DETAIL,
      Environment.GROUP, isNavBack, undefined, this.corRelationList);

    this.location.back();
  }

  async navigateToAddUserPage() {
    this.generateInteractTelemetry(InteractType.ADD_MEMBER, InteractSubtype.ADD_MEMBER_CLICKED, ID.ADD_MEMBER)
    await this.navService.navigateTo([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ADD_MEMBER_TO_GROUP}`], {
      groupId: this.groupId,
      memberList: this.memberList,
      corRelation: this.corRelationList
    });
  }

  private async fetchGroupDetails() {
    this.isGroupLoading = true;
    const getByIdRequest: GetByIdRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      id: this.groupId,
      userId: this.userId,
      options: {
        includeMembers: true,
        includeActivities: true,
        groupActivities: true
      }
    };
    try {
      this.groupDetails = await this.groupService.getById(getByIdRequest).toPromise();
      this.isSuspended = this.groupDetails.status.toLowerCase() === 'suspended';
      this.memberList = this.groupDetails.members;
      this.activityList = this.groupDetails.activitiesGrouped;
      this.activityList.forEach((a) => {
        if (a.translations) {
          a.title = this.commonUtilService.getTranslatedValue(a.translations, a.title);
        }
      });

      if (this.memberList) {
        this.memberList.sort((a, b) => {
          if (b.userId === this.userId) {
            return 1;
          } else if (a.userId === this.userId) {
            return -1;
          }
          if (b.role === GroupMemberRole.ADMIN && a.role === GroupMemberRole.MEMBER) {
            return 1;
          } else if (b.role === GroupMemberRole.MEMBER && a.role === GroupMemberRole.ADMIN) {
            return -1;
          }
          return a.name.localeCompare(b.name);
        });
      }

      this.loggedinUser = this.memberList.find(m => m.userId === this.userId);
      this.groupCreator = this.memberList.find(m => m.userId === this.groupDetails.createdBy);

      this.filteredMemberList = new Array(...this.memberList);

      this.groupedActivityListMap = this.activityList.reduce((acc, activityGroup) => {
        acc[activityGroup.title] = activityGroup.items.map((i) => {
          const activity = {
            ...i.activityInfo,
            type: i.type,
            cardImg: this.commonUtilService.getContentImg(i.activityInfo)
          };
          return activity;
        });
        return acc;
      }, {});
      this.filteredGroupedActivityListMap = { ...this.groupedActivityListMap };
      this.isGroupLoading = false;
      if (this.groupCreator.userId === this.userId || this.loggedinUser.role === GroupMemberRole.ADMIN) {
        this.isGroupCreatorOrAdmin = true;
      }
      this.setFlattenedActivityList();
    } catch (e) {
      this.isGroupLoading = false;
      console.error(e);
    }
  }

  getMemberName(member) {
    let memberName = member.name;
    if (this.loggedinUser.userId === member.userId) {
      memberName = this.commonUtilService.translateMessage('LOGGED_IN_MEMBER', { member_name: member.name });
    }
    return memberName;
  }

  showMemberMenu(member) {
    let showMenu = false;
    if (this.loggedinUser.role === GroupMemberRole.ADMIN
      && member.userId !== this.groupCreator.userId
      && member.userId !== this.loggedinUser.userId) {
      showMenu = true;
    }
    return showMenu;
  }

  switchTabs(tab) {
    this.activeTab = tab;
    this.generateInteractTelemetry(InteractType.TOUCH, tab === 'activities' ? InteractSubtype.ACTIVITY_TAB_CLICKED : InteractSubtype.MEMBER_TAB_CLICKED)
  }
  

  async groupMenuClick(event) {
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.GROUP_KEBAB_MENU_CLICKED);
    let menuList = MenuOverflow.MENU_GROUP_NON_ADMIN;
    if (this.groupDetails.status.toLowerCase() === 'suspended') {
      if (this.groupCreator.userId === this.userId) {
        menuList = MenuOverflow.MENU_GROUP_CREATOR_SUSPENDED;
        this.isGroupCreatorOrAdmin = true;
      } else if (this.loggedinUser.role === GroupMemberRole.ADMIN) {
        menuList = MenuOverflow.MENU_GROUP_ADMIN__SUSPENDED;
        this.isGroupCreatorOrAdmin = true;
      }
    } else {
      if (this.groupCreator.userId === this.userId) {
        if(this.forumDetails){
          menuList = MenuOverflow.MENU_GROUP_CREATOR_DISABLE_DF;
        } else {
          menuList = MenuOverflow.MENU_GROUP_CREATOR;
        }
        
      } else if (this.loggedinUser.role === GroupMemberRole.ADMIN) {
        if(this.forumDetails){
          menuList = MenuOverflow.MENU_GROUP_ADMIN_DISABLE_DF
        } else {
          menuList = MenuOverflow.MENU_GROUP_ADMIN;
        }
      }
    }

    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: menuList
      },
      event,
      cssClass: 'group-option-popover'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      if (data.selectedItem === 'MENU_EDIT_GROUP_DETAILS') {
        this.generateInteractTelemetry( InteractType.UPDATE_GROUP, InteractSubtype.EDIT_GROUP_CLICKED, ID.UPDATE_GROUP);
        await this.navService.navigateTo([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`],
          {
            groupDetails: this.groupDetails,
            corRelation: this.corRelationList
          });
      } else if (data.selectedItem === 'MENU_DELETE_GROUP') {
        await this.showDeleteGroupPopup();
      } else if (data.selectedItem === 'MENU_LEAVE_GROUP') {
        await this.showLeaveGroupPopup();
      } else if (data.selectedItem === 'FRMELEMENTS_LBL_DEACTIVATEGRP') {
        await this.showDeactivateGroupPopup();
      } else if (data.selectedItem === 'FRMELEMENTS_LBL_ACTIVATEGRP') {
        await this.showReactivateGroupPopup();
      } else if (data.selectedItem === 'ENABLE_DISCUSSION_FORUM'){
        await this.enableDF();
      } else if(data.selectedItem === 'DISABLE_DISCUSSION_FORUM') {
        await this.showDisableDFPopupPopup();
      }
    }
  }

  async activityMenuClick(event): Promise<boolean> {
    const selectedActivity = event.data;
    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: MenuOverflow.MENU_GROUP_ACTIVITY_ADMIN
      },
      event: event.event,
      cssClass: 'group-option-popover group-option-popover-admin'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      return this.showRemoveActivityPopup(selectedActivity);
    }
    return false;
  }

  async memberMenuClick(event, selectedMember) {
    let menuList = MenuOverflow.MENU_GROUP_MEMBER_NON_ADMIN;

    if (selectedMember.role === GroupMemberRole.ADMIN) {  // Is admin and creator
      menuList = MenuOverflow.MENU_GROUP_MEMBER_ADMIN;
    }

    const groupOptions = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: menuList
      },
      event: event.event,
      cssClass: 'group-option-popover'
    });
    await groupOptions.present();

    const { data } = await groupOptions.onDidDismiss();
    if (data) {
      if (data.selectedItem === 'MENU_MAKE_GROUP_ADMIN') {
        await this.showMakeGroupAdminPopup(selectedMember);
      } else if (data.selectedItem === 'MENU_REMOVE_FROM_GROUP') {
        await this.showRemoveMemberPopup(selectedMember);
      } else if (data.selectedItem === 'DISMISS_AS_GROUP_ADMIN') {
        await this.showDismissAsGroupAdminPopup(selectedMember);
      }
    }
  }

  private async showDeactivateGroupPopup() {
    this.generateInteractTelemetry( InteractType.SELECT_DEACTIVATE, InteractSubtype.DEACTIVATE_GROUP_CLICKED, ID.SELECT_DEACTIVATE);
    const deleteConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('FRMELEMENTS_LBL_DEACTIVATEGRPQUES'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('FRMELEMENTS_BTN_DEACTIVATEGRP'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('FRMELEMENTS_MSG_DEACTIVATEGRPMSG', { group_name: this.groupDetails.name })
      },
      cssClass: 'sb-popover danger',
    });
    await deleteConfirm.present();

    const { data } = await deleteConfirm.onDidDismiss();
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      this.generateInteractTelemetry( InteractType.INITIATED, '', ID.DEACTIVATE_GROUP);
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      try {
       const deactivateByIdRequest: ActivateAndDeactivateByIdRequest = {
          id: this.groupId
        };
        await this.groupService.suspendById(deactivateByIdRequest).toPromise();
        this.commonUtilService.showToast('FRMELEMENTS_MSG_DEACTIVATEGRPSUCCESS');
        await loader.dismiss();
        this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.DEACTIVATE_GROUP);
        await this.fetchGroupDetails();
      } catch (e) {
        await loader.dismiss();
        console.error(e);
        this.commonUtilService.showToast('FRMELEMENTS_MSG_DEACTIVATEGRPFAILED');
      }
    }
  }

  async showReactivateGroupPopup() {
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.REACTIVATE_GROUP_CLICKED);
    const makeGroupAdminConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('FRMELEMENTS_LBL_ACTIVATEGRPQUES'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('FRMELEMENTS_BTN_ACTIVATEGRP'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('FRMELEMENTS_MSG_ACTIVATEGRPMSG')
      },
      cssClass: 'sb-popover',
    });
    await makeGroupAdminConfirm.present();

    const { data } = await makeGroupAdminConfirm.onDidDismiss();
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }

      this.generateInteractTelemetry( InteractType.INITIATED, '', ID.REACTIVATE_GROUP);
      this.isGroupLoading = true;
      const reActivateByIdRequest: ActivateAndDeactivateByIdRequest = {
        id: this.groupId
      };
      try {
        const resp = await this.groupService.reactivateById(reActivateByIdRequest).toPromise();
        this.isGroupLoading = false;
        this.commonUtilService.showToast('FRMELEMENTS_MSG_ACTIVATEGRPSUCCESS');
        this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.REACTIVATE_GROUP);

        await this.fetchGroupDetails();
      } catch (e) {
        this.isGroupLoading = false;
        this.commonUtilService.showToast('FRMELEMENTS_MSG_ACTIVATEGRPFAILED');
      }
    }
  }

  private async showDeleteGroupPopup() {
    this.generateInteractTelemetry( InteractType.SELECT_DELETE, InteractSubtype.DELETE_GROUP_CLICKED, ID.SELECT_DELETE);  

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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      this.generateInteractTelemetry( InteractType.INITIATED, '', ID.DELETE_GROUP);  
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const deleteByIdRequest: DeleteByIdRequest = {
        id: this.groupId
      };
      try {
        await this.groupService.deleteById(deleteByIdRequest).toPromise();
        await loader.dismiss();
        this.commonUtilService.showToast('DELETE_GROUP_SUCCESS_MSG');
        await loader.dismiss();
        this.location.back();
        this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.DELETE_GROUP);  
      } catch (e) {
        await loader.dismiss();
        console.error(e);
        this.commonUtilService.showToast('DELETE_GROUP_ERROR_MSG');
      }
    }
  }

  private async showLeaveGroupPopup() {
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.LEAVE_GROUP_CLICKED);  
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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      this.generateInteractTelemetry( InteractType.INITIATED, '', ID.LEAVE_GROUP);  
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      const removeMembersRequest: RemoveMembersRequest = {
        groupId: this.groupId,
        removeMembersRequest: {
          userIds: [this.userId]
        }
      };
      try {
        const removeMemberResponse = await this.groupService.removeMembers(removeMembersRequest).toPromise();

        await loader.dismiss();
        if (removeMemberResponse.error
          && removeMemberResponse.error.members
          && removeMemberResponse.error.members.length) {
          this.commonUtilService.showToast('LEAVE_GROUP_ERROR_MSG');
        } else {
          this.location.back();

          this.commonUtilService.showToast('LEAVE_GROUP_SUCCESS_MSG');
        this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.LEAVE_GROUP);  
        }
      } catch (e) {
        console.error(e);
        await loader.dismiss();
        this.commonUtilService.showToast('LEAVE_GROUP_ERROR_MSG');
      }
    }
  }

  private async showRemoveActivityPopup(selectedActivity): Promise<boolean> {
    this.generateInteractTelemetry( InteractType.TOUCH,  InteractSubtype.REMOVE_ACTIVITY_CLICKED);  
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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return false;
      }
      this.generateInteractTelemetry( InteractType.INITIATED, '', ID.REMOVE_ACTIVITY);  
      this.isGroupLoading = true;
      const removeActivitiesRequest: RemoveActivitiesRequest = {
        groupId: this.groupId,
        removeActivitiesRequest: {
          activityIds: [selectedActivity.identifier]
        }
      };
      try {
        const removeActivitiesResponse = await this.groupService.removeActivities(removeActivitiesRequest).toPromise();

        this.isGroupLoading = false;
        if (removeActivitiesResponse.error
          && removeActivitiesResponse.error.activities
          && removeActivitiesResponse.error.activities.length) {
          this.commonUtilService.showToast('REMOVE_ACTIVITY_ERROR_MSG');
          return false;
        } else {
          this.commonUtilService.showToast('REMOVE_ACTIVITY_SUCCESS_MSG');
          this.generateInteractTelemetry(InteractType.SUCCESS, '', ID.REMOVE_ACTIVITY);  
          await this.fetchGroupDetails();
          return true;
        }
      } catch (e) {
        console.error('showRemoveActivityPopup', e);
        this.isGroupLoading = false;
        this.commonUtilService.showToast('REMOVE_ACTIVITY_ERROR_MSG');
        return false;
      }
    }
  }

  private async showRemoveMemberPopup(selectedMember) {
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.REMOVE_MEMBER_CLICKED);  
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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      this.generateInteractTelemetry(InteractType.INITIATED, '', ID.REMOVE_MEMBER);  
      this.isGroupLoading = true;
      const removeMembersRequest: RemoveMembersRequest = {
        groupId: this.groupId,
        removeMembersRequest: {
          userIds: [selectedMember.userId]
        }
      };
      try {
        const removeMemberResponse = await this.groupService.removeMembers(removeMembersRequest).toPromise();

        this.isGroupLoading = false;
        if (removeMemberResponse.error
          && removeMemberResponse.error.members
          && removeMemberResponse.error.members.length) {
          this.commonUtilService.showToast('REMOVE_MEMBER_ERROR_MSG');
        } else {
          this.commonUtilService.showToast('REMOVE_MEMBER_SUCCESS_MSG', { member_name: selectedMember.name });
          this.generateInteractTelemetry(InteractType.SUCCESS, '', ID.REMOVE_MEMBER);  
          await this.fetchGroupDetails();
        }
      } catch (e) {
        this.isGroupLoading = false;
        console.error(e);
        this.commonUtilService.showToast('REMOVE_MEMBER_ERROR_MSG');
      }
    }
  }

  private async showMakeGroupAdminPopup(selectedMember) {
    this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.MAKE_GROUP_ADMIN_CLICKED);  
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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      this.generateInteractTelemetry(InteractType.INITIATED, '', ID.MAKE_GROUP_ADMIN);  
      this.isGroupLoading = true;
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
        const updateMemberResponse: GroupUpdateMembersResponse = await this.groupService.updateMembers(updateMembersRequest).toPromise();

        this.isGroupLoading = false;
        if (updateMemberResponse.error
          && updateMemberResponse.error.members
          && updateMemberResponse.error.members.length) {
          this.commonUtilService.showToast('MAKE_GROUP_ADMIN_ERROR_MSG', { member_name: selectedMember.name });
        } else {
          this.commonUtilService.showToast('MAKE_GROUP_ADMIN_SUCCESS_MSG', { member_name: selectedMember.name });
          this.generateInteractTelemetry(InteractType.SUCCESS, '', ID.MAKE_GROUP_ADMIN);  
          await this.fetchGroupDetails();
        }
      } catch (e) {
        console.error('showMakeGroupAdminPopup', e);
        this.isGroupLoading = false;
        this.commonUtilService.showToast('MAKE_GROUP_ADMIN_ERROR_MSG', { member_name: selectedMember.name });
      }
    }
  }

  private async showDismissAsGroupAdminPopup(selectedMember) {
    this.generateInteractTelemetry(InteractType.TOUCH,  InteractSubtype.DISMISS_GROUP_ADMIN_CLICKED);  

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
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }

      this.generateInteractTelemetry(InteractType.INITIATED, '', ID.DISMISS_GROUP_ADMIN);  

      this.isGroupLoading = true;
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
        const updateMemberResponse: GroupUpdateMembersResponse = await this.groupService.updateMembers(updateMembersRequest).toPromise();
        this.isGroupLoading = false;
        if (updateMemberResponse.error
          && updateMemberResponse.error.members
          && updateMemberResponse.error.members.length) {
          this.commonUtilService.showToast('DISMISS_AS_GROUP_ADMIN_ERROR_MSG', { member_name: selectedMember.name });
        } else {
          this.commonUtilService.showToast('DISMISS_AS_GROUP_ADMIN_SUCCESS_MSG', { member_name: selectedMember.name });
          this.generateInteractTelemetry(InteractType.SUCCESS, '', ID.DISMISS_GROUP_ADMIN);  
          await this.fetchGroupDetails();
        }
      } catch (e) {
        this.isGroupLoading = false;
        console.error(e);
        this.commonUtilService.showToast('DISMISS_AS_GROUP_ADMIN_ERROR_MSG', { member_name: selectedMember.name });
      }
    }
  }

  onMemberSearch(query) {
    this.memberSearchQuery = query;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'name', query)];
  }

  onActivitySearch(query) {
    this.activitySearchQuery = query;
    for (const property in this.groupedActivityListMap) {
      if (this.groupedActivityListMap[property].length) {
        this.filteredGroupedActivityListMap[property] = this.groupedActivityListMap[property].filter(
          (activity) => activity['name'].toLowerCase().includes(query.toLowerCase())
        );
      }
    }
    this.setFlattenedActivityList();
  }

  extractInitial(name) {
    const splitter = new GraphemeSplitter();
    const split: string[] = splitter.splitGraphemes(name.trim());
    return split[0];
  }

  async onActivityCardClick(event) {
    const activity = event.data;
    await this.navService.navigateToDetailPage(activity, {
      content: activity,
      activityData: {
        group: this.groupDetails,
        isGroupCreatorOrAdmin: this.isGroupCreatorOrAdmin,
        activity
      },
      corRelation: this.corRelationList,
    });
    
  }

  async navigateToAddActivityPage() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
      return;
    }
    this.generateInteractTelemetry(InteractType.ADD_ACTIVITY, InteractSubtype.ADD_ACTIVITY_CLICKED, ID.ADD_ACTIVITY);  
    try {
      const supportedActivityResponse: Form<GroupSupportedActivitiesFormField>
        = await this.groupService.getSupportedActivities().toPromise();
      if (supportedActivityResponse && supportedActivityResponse.data && supportedActivityResponse.data.fields) {
        const supportedActivityList = supportedActivityResponse.data.fields;
        supportedActivityList.forEach(a => {
          if (a.translations) {
            a.title = this.commonUtilService.getTranslatedValue(a.translations, a.title);
          }
        });
        await this.navService.navigateTo([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}/${RouterLinks.ADD_ACTIVITY_TO_GROUP}`],
          {
            supportedActivityList,
            groupId: this.groupId,
            activityList: this.activityList,
            corRelation: this.corRelationList
          });
      }
    } catch (e) {
      console.error('navigateToAddActivityPage', e);
    }
  }

  async navigateToViewMorePage(activityGroup) {
    await this.navService.navigateTo([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}/${RouterLinks.ACTIVITY_VIEW_MORE}`],
      {
        isMenu: this.loggedinUser.role === 'admin',
        activityGroup,
        groupId: this.groupId,
        previousPageId: PageId.GROUP_DETAIL
      });
  }

  async onViewMoreCardClick(event: Event, activity: GroupActivity) {
    const data = {
      data: {
        ...activity.activityInfo,
        type: activity.type
      }
    };
    await this.onActivityCardClick(data);
  }

  onViewMoreCardMenuClick(event, activity) {
    return this.activityMenuClick(event);
  }

  private setFlattenedActivityList() {
    this.flattenedActivityList = [];
    for (const key in this.filteredGroupedActivityListMap) {
      if (this.filteredGroupedActivityListMap[key]) {
        this.flattenedActivityList = [...this.flattenedActivityList , ...this.filteredGroupedActivityListMap[key]];
      }
    }
  }

  private generateInteractTelemetry(interactType, interactSubType, id?){
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType,
      interactSubType,
      Environment.GROUP,
      PageId.GROUP_DETAIL,
      undefined,
      undefined,
      undefined,
      this.corRelationList,
      id
    );
  }

  async enableDF(){
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.ENABLE_DISCUSSIONS_CLICKED);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.generateInteractTelemetry( InteractType.INITIATED, '', ID.ENABLE_DISCUSSIONS);
    const request = {
      context: {
        type: 'group',
        identifier: this.groupId
      },
      type: 'group'
    }
    this.discussionService.attachForum(request).toPromise()
    .then(async (response) => {
      this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.ENABLE_DISCUSSIONS);
      await loader.dismiss();
      this.commonUtilService.showToast('DISCUSSION_FORUM_ENABLE_SUCCESS');
      this.accessDiscussionComponent.fetchForumIds();
      }).catch(async (err) => {
      console.log('enableDF err', err)
        await loader.dismiss();
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
      });
  }

  async disableDF(){
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.generateInteractTelemetry( InteractType.INITIATED, '', ID.DISABLE_DISCUSSIONS);
    const removeForumReq = {...this.forumDetails}
    removeForumReq.cid = [removeForumReq.cid];
    this.discussionService.removeForum(removeForumReq).toPromise()
    .then(async res => {
      this.generateInteractTelemetry( InteractType.SUCCESS, '', ID.DISABLE_DISCUSSIONS);
      await loader.dismiss();
      this.forumDetails = '';
      this.commonUtilService.showToast('DISCUSSION_FORUM_DISABLE_SUCCESS');
      this.accessDiscussionComponent.fetchForumIds();
    }).catch(async err => {
      console.log('disableDF err', err)
      await loader.dismiss();
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
    });
  }

  private async showDisableDFPopupPopup() {
    this.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.DISABLE_DISCUSSIONS_CLICKED);
    const deleteConfirm = await this.popoverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('DISCUSSION_FORUM_DISABLE_CONFIRM'),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('DISABLE_DISCUSSION_FORUM'),
            btnClass: 'popover-color'
          },
        ],
        icon: null,
        sbPopoverContent: this.commonUtilService.translateMessage('DISCUSSION_FORUM_DISABLE_CONFIRM_DESC', { group_name: this.groupDetails.name })
      },
      cssClass: 'sb-popover danger',
    });
    await deleteConfirm.present();

    const { data } = await deleteConfirm.onDidDismiss();
    if (data && data.isLeftButtonClicked) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
        return;
      }
      await this.disableDF();
    }
  }

  async generateDataForDF() {
    this.fetchForumIdReq =  {
      identifier: [this.groupId],
      type: 'group'
    };
    await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise().then((p) => {
      this.createUserReq.username = p.serverProfile['userName'];
    });
  }

  assignForumData(e){
    console.log('assignForumData', e)
    this.forumDetails = e;
  }
  
}
