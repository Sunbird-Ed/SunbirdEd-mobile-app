import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks, PreferenceKey } from '../app.constant';
import {
  AuthService, SharedPreferences, GroupService, Group,
  GroupSearchCriteria, CachedItemRequestSourceFrom, SortOrder
} from '@project-sunbird/sunbird-sdk';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
  CommonUtilService,
  AppGlobalService,
  TelemetryGeneratorService,
  ImpressionType,
  PageId,
  Environment, InteractType, InteractSubtype
} from '@app/services';
import {Platform, PopoverController} from '@ionic/angular';
import { MyGroupsPopoverComponent } from '../components/popups/sb-my-groups-popover/sb-my-groups-popover.component';
import { animationGrowInTopRight } from '../animations/animation-grow-in-top-right';
import { animationShrinkOutTopRight } from '../animations/animation-shrink-out-top-right';
import {SbProgressLoader} from '@app/services/sb-progress-loader.service';
import {Subscription} from 'rxjs';
import {Location} from '@angular/common';

interface GroupData extends Group {
  initial: string;
}
@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.page.html',
  styleUrls: ['./my-groups.page.scss'],
})
export class MyGroupsPage implements OnInit, OnDestroy {
  isGuestUser: boolean;
  groupList: GroupData[] = [];
  groupListLoader = false;
  headerObservable: any;
  userId: string;
  unregisterBackButton: Subscription;

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController,
    private sbProgressLoader: SbProgressLoader,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private location: Location
  ) { }

  ngOnInit() {
    this.checkUserLoggedIn();
    this.appGlobalService.getActiveProfileUid()
      .then(async (uid) => {
        this.userId = uid;
        const groupInfoScreen = await this.preferences.getBoolean(PreferenceKey.CREATE_GROUP_INFO_POPUP).toPromise();
        if (!groupInfoScreen) {
          this.openinfopopup();
          this.preferences.putBoolean(PreferenceKey.CREATE_GROUP_INFO_POPUP, true).toPromise().then();
        }
      });
  }

  private checkUserLoggedIn() {
    this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
  }

  ionViewWillEnter() {
    this.handleBackButton();
    this.headerService.showHeaderWithBackButton(['groupInfo']);
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  async ionViewDidEnter() {
    this.sbProgressLoader.hide({id: 'login'});
    this.fetchGroupList();
    this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.VIEW,
        '',
        PageId.MY_GROUP,
        Environment.GROUP
    );
  }

  ngOnDestroy() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }

    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'groupInfo':
        this.openinfopopup();
        break;
        case 'back':
            this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.MY_GROUP, Environment.GROUP, true);
            this.location.back();
            break;
    }
  }

  createClassroom() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.CREATE_GROUP_CLICKED,
        Environment.GROUP,
        PageId.MY_GROUP
    );
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.CREATE_EDIT_GROUP}`]);
  }

  login() {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.LOGIN_CLICKED,
        Environment.GROUP,
        PageId.MY_GROUP
    );
    this.loginHandlerService.signIn({ skipRootNavigation: true });
  }

  async fetchGroupList() {
    this.groupListLoader = true;
    try {
      const groupSearchCriteria: GroupSearchCriteria = {
        from: CachedItemRequestSourceFrom.SERVER,
        request: {
          filters: {
            userId: this.userId
          },
          sort_by: { name: SortOrder.ASC }
        }
      };
      this.groupList = (await this.groupService.search(groupSearchCriteria).toPromise())
        .map<GroupData>((group) => {
          return {
            ...group,
            initial: this.commonUtilService.extractInitial(group.name)
          };
        });
      this.groupListLoader = false;
      console.log('this.groupList', this.groupList);
    } catch {
      this.groupListLoader = false;
    }
  }

  navigateToGroupdetailsPage(event) {
    const navigationExtras: NavigationExtras = {
      state: {
        groupId: event.data.id
      }
    };
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`], navigationExtras);
  }

  async openinfopopup() {
    const popover = await this.popoverCtrl.create({
      component: MyGroupsPopoverComponent,
      componentProps: {
        title: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED'),
        body: this.commonUtilService.translateMessage('ANDROID_NOT_SUPPORTED_DESC'),
        buttonText: this.commonUtilService.translateMessage('INSTALL_CROSSWALK')
      },
      cssClass: 'popover-my-groups',
      enterAnimation: animationGrowInTopRight,
      leaveAnimation: animationShrinkOutTopRight,
      backdropDismiss: false,
      showBackdrop: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data === undefined) { // Backdrop clicked
    } else if (data.closeDeletePopOver) { // Close clicked
    } else if (data.canDelete) {
    }
  }

  private handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
          PageId.MY_GROUP,
          Environment.GROUP,
          false);
      this.location.back();
    });
  }

}
