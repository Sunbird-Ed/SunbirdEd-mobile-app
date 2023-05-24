import { Component, OnInit, Inject } from '@angular/core';
import { AppHeaderService } from '../../../services/app-header.service';
import { RouterLinks, ProfileConstants, PreferenceKey } from '../../../app/app.constant';
import { Router } from '@angular/router';
import { CommonUtilService } from '../../../services/common-util.service';
import {
  ProfileService,
  CachedItemRequestSourceFrom,
  SharedPreferences,
  ServerProfile,
  CorrelationData
} from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { Observable, EMPTY, combineLatest, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { InteractType, Environment, PageId, ID, CorReleationDataType, ImpressionType } from '../../../services/telemetry-constants';
import { Location } from '@angular/common';
import { ToastNavigationComponent } from '../../../app/components/popups/toast-navigation/toast-navigation.component';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';

@Component({
  selector: 'app-manage-user-profiles',
  templateUrl: './manage-user-profiles.page.html',
  styleUrls: ['./manage-user-profiles.page.scss'],
})
export class ManageUserProfilesPage implements OnInit {

  private selectedUser: any;
  private backButtonFunc: Subscription;
  private headerObservable: any;

  public sbCardConfig = {
    size: 'medium',
    isBold: false,
    isSelectable: false,
    view: 'horizontal'
  };
  public manageProfileList$: Observable<ServerProfile[]>;
  public selectedUserIndex = -1;
  public appName = '';

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private appHeaderService: AppHeaderService,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    public platform: Platform,
    private location: Location,
    private popoverCtrl: PopoverController,
    private tncUpdateHandlerService: TncUpdateHandlerService
  ) {
    this.manageProfileList$ = combineLatest([
      this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }),
      this.profileService.managedProfileManager.getManagedServerProfiles({
        from: CachedItemRequestSourceFrom.SERVER,
        requiredFields: ProfileConstants.REQUIRED_FIELDS
      })
    ]).pipe(
      map(([activeProfile, profiles]) => {
        return profiles.filter(p => p.id !== activeProfile.uid);
      }),
      catchError(err => {
        this.commonUtilService.showToast('ERROR_WHILE_FETCHING_USERS');
        console.error(err);
        return EMPTY;
      })
    );
  }

  ngOnInit() {
    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    }).catch(e => console.error(e));
  }

  async ionViewWillEnter() {
    await this.appHeaderService.showHeaderWithBackButton();
    this.handleBackButtonEvents();
    this.headerObservable = this.appHeaderService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.MANAGE_USERS,
      Environment.USER,
    );
  }

  ionViewWillLeave() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  private handleBackButtonEvents() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(0, async () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.MANAGE_USERS,
        Environment.USER,
        false
      );
      this.location.back();
    });
  }

  selectUser(user, index) {
    this.selectedUserIndex = index;
    this.selectedUser = user;
  }

  switchUser() {
    if (!this.selectedUser || !this.selectedUser.id) {
      return;
    }
    const cData: Array<CorrelationData> = [
      { id: this.selectedUser.id || '', type: CorReleationDataType.SWITCHED_USER }
    ];
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ADD,
      '',
      Environment.USER,
      PageId.CREATE_MANAGED_USER,
      undefined,
      undefined,
      undefined,
      cData,
      ID.BTN_SWITCH
    );
    this.profileService.managedProfileManager.switchSessionToManagedProfile({ uid: this.selectedUser.id }).toPromise().then(async res => {
      this.events.publish(AppGlobalService.USER_INFO_UPDATED);
      this.events.publish('loggedInProfile:update');
      if(this.selectedUser.profileUserType && this.selectedUser.profileUserType.type){
        await this.sharedPreferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.selectedUser.profileUserType.type).toPromise();
        this.events.publish('UPDATE_TABS', {type: 'SWITCH_TABS_USERTYPE'});
      }
      await this.showSwitchSuccessPopup(this.selectedUser.firstName);
      await this.tncUpdateHandlerService.checkForTncUpdate();
    }).catch(err => {
      this.commonUtilService.showToast('ERROR_WHILE_SWITCHING_USER');
      console.error(err);
    });
  }

  async addUser() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ADD,
      '',
      Environment.USER,
      PageId.MANAGE_USERS,
      undefined,
      undefined,
      undefined,
      undefined,
      ID.BTN_ADD
    );

    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
      return;
    }

    await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SUB_PROFILE_EDIT}`]);
  }

  private handleHeaderEvents($event) {
    if($event.name == 'back')
    {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.MANAGE_USERS,
        Environment.USER,
        true);
    }
  }

  private async showSwitchSuccessPopup(name) {
    const confirm = await this.popoverCtrl.create({
      component: ToastNavigationComponent,
      componentProps: {
        message: this.commonUtilService.translateMessage('SUCCESSFULLY_SWITCHED_USER', { '%app': this.appName, '%user': name }),
        description: this.commonUtilService.translateMessage('UPDATE_YOUR_PREFERENCE_FROM_PROFILE', { app_name: this.appName }),
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('GO_TO_PROFILE'),
            btnClass: 'btn-right'
          }
        ]
      },
      cssClass: 'sb-popover'
    });
    await confirm.present();
    setTimeout(async () => {
      if (confirm) {
        await confirm.dismiss();
      }
    }, 3000);
    const { data } = await confirm.onDidDismiss();
    console.log(data);
    if (data) {
      await this.router.navigate([`/${RouterLinks.PROFILE_TAB}`]);
    }
  }

}
