import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Component, Inject, OnInit, NgZone } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import {
  GetAllProfileRequest,
  GroupDeprecated,
  GroupServiceDeprecated,
  ObjectType,
  Profile,
  ProfileService,
  ProfileType,
  TelemetryObject
} from 'sunbird-sdk';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  ProfileType = ProfileType;
  report = 'users';
  otherUsers;
  currentUser: {};
  groups;
  currentGroups: {};
  private profileDetails: any;
  private deviceBackButton: Subscription;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    private ngZone: NgZone,
    private loading: LoadingController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private platform: Platform,
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.profileDetails = this.router.getCurrentNavigation().extras.state.profile;
    }
  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.REPORTS_USER_GROUP,
      Environment.USER
    );
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    let users, cUser, groups;
    this.populateUsers()
      .then(array => {
        cUser = array[0];
        users = array[1];
        return this.populateGroups();
      })
      .then(data => {
        groups = data;
        this.ngZone.run(async () => {
          this.groups = groups;
          this.otherUsers = users;
          this.currentUser = cUser;
          await loader.dismiss();
        });
      })
      .catch(async () => {
        await loader.dismiss();
      });
    this.enableBackBtn();
  }

  ionViewWillEnter() {
    this.headerService.hideHeader();
  }

  async populateUsers() {
    const that = this;
    return new Promise<Array<any>>((resolve, reject) => {
      const getAllProfileRequest: GetAllProfileRequest = {
        local: true
      };
      that.profileService.getAllProfiles(getAllProfileRequest).toPromise()
        .then((data: Profile[]) => {
          that.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
            .then((profile: Profile) => {
              if (this.profileDetails) {
                if (this.profileDetails.id === profile.uid) {
                  profile.handle = this.profileDetails.firstName;
                }
              }
              data = that.filterOutCurrentUser(data, profile);
              resolve([profile, data]);
            }).catch(error => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async populateGroups() {
    const that = this;

    return new Promise<any>((resolve) => {

      that.groupService.getAllGroups()
        .subscribe((groups: GroupDeprecated[]) => {
          if (groups) {
            resolve(groups);
          } else {
            resolve();
          }
        });
    });
  }

  filterOutCurrentUser(userList, currentUser) {
    return userList.filter(user => {
      return user.uid !== currentUser.uid;
    });
  }

  goToUserReportList(uid: string, handle: string) {

    const telemetryObject = new TelemetryObject(uid, ObjectType.USER, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.USER_CLICKED,
      Environment.USER,
      PageId.REPORTS_USER_GROUP,
      telemetryObject
    );

    const navigationExtras: NavigationExtras = { state: { isFromUsers: true, uids: [uid], handle: handle } };
    this.router.navigate([`/${RouterLinks.REPORTS}/${RouterLinks.REPORTS_LIST}`], navigationExtras);
  }

  goToGroupUserReportList(group) {
    const telemetryObject = new TelemetryObject(group.gid, ObjectType.GROUP, undefined);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.GROUP_CLICKED,
      Environment.USER,
      PageId.REPORTS_USER_GROUP,
      telemetryObject
    );
    const getAllProfileRequest: GetAllProfileRequest = { local: true, groupId: group.gid };
    this.profileService.getAllProfiles(getAllProfileRequest).toPromise()
      .then((result: Profile[]) => {
        const map = new Map<string, string>();
        const uids: Array<string> = [];
        result.forEach(user => {
          uids.push(user.uid);
          map.set(user.uid, user.handle);
        });

        const navigationExtras: NavigationExtras = { state: { isFromGroups: true, uids: uids, users: map, group: group } };
        this.router.navigate([`/${RouterLinks.REPORTS}/${RouterLinks.REPORTS_LIST}`], navigationExtras);
      });
  }


  onSegmentChange(data) {
    const subType = (data === 'users') ? InteractSubtype.USERS_TAB_CLICKED : InteractSubtype.GROUPS_TAB_CLICKED;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      subType,
      Environment.USER,
      PageId.REPORTS_USER_GROUP
    );

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.REPORTS_USER_GROUP,
      Environment.USER
    );
  }

  enableBackBtn() {
    this.deviceBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack();
    });
  }

  goBack() {
    this.location.back();
  }

  ionViewWillLeave() {
    this.deviceBackButton && this.deviceBackButton.unsubscribe();
    this.deviceBackButton = undefined;
  }

}
