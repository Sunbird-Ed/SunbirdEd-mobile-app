import { Component, OnInit, Inject, NgZone, OnDestroy } from '@angular/core';
import {
  GetAllProfileRequest,
  GroupServiceDeprecated,
  GroupDeprecated,
  ProfilesToGroupRequestDeprecated,
  Profile,
  ProfileService,
  ProfileType
} from 'sunbird-sdk';
import {
  CommonUtilService,
  TelemetryGeneratorService,
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
  AppHeaderService
} from '../../../services';
import { NavigationExtras, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.page.html',
  styleUrls: ['./group-members.page.scss'],
})
export class GroupMembersPage implements OnInit {
  ProfileType = ProfileType;
  group: GroupDeprecated;
  userList: Array<Profile> = [];
  userSelectionMap: Map<string, boolean> = new Map();
  lastCreatedProfileData: any;
  loading: boolean;
  backButtonFunc: Subscription;

  constructor(
    @Inject('GROUP_SERVICE_DEPRECATED') private groupService: GroupServiceDeprecated,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private zone: NgZone,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private location: Location
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.group = this.router.getCurrentNavigation().extras.state.group;
    }
  }

  ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.CREATE_GROUP_USER_SELECTION,
      Environment.USER, this.group.gid ? this.group.gid : '', this.group.gid ? ObjectType.GROUP : ''
    );
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
      this.backButtonFunc = undefined;
    }
  }

  ionViewWillEnter() {
    this.loading = true; // present only loader, untill users are fetched from service
    this.headerService.hideHeader();
    this.getAllProfile();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
    });
  }

  // method below fetches the last created user
  getLastCreatedProfile() {
    return new Promise((resolve, reject) => {
      const req: GetAllProfileRequest = {
        local: true
      };
      this.profileService.getAllProfiles(req).pipe(
        map((profiles) => profiles.filter((profile) => !!profile.handle))
      ).toPromise().then((lastCreatedProfile: any) => {
        this.lastCreatedProfileData = lastCreatedProfile;
        resolve(lastCreatedProfile);
      }).catch(() => {
        reject(null);
      });
    });
  }

  getAllProfile() {
    const profileRequest: GetAllProfileRequest = {
      local: true
    };

    this.zone.run(() => {
      this.profileService.getAllProfiles(profileRequest).pipe(
        map((profiles) => profiles.filter((profile) => !!profile.handle))
      ).toPromise().then(async (profiles) => {
        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        this.zone.run(async () => {
          if (profiles && profiles.length) {
            this.userList = profiles;
            await loader.dismiss();
            this.loading = false;
          }
        });
      });
    });
  }

  toggleSelect(index: number) {
    let value = this.userSelectionMap.get(this.userList[index].uid);
    if (value) {
      value = false;
    } else {
      value = true;
    }

    this.userSelectionMap.set(this.userList[index].uid, value);
  }

  isUserSelected(index: number) {
    return Boolean(this.userSelectionMap.get(this.userList[index].uid));
  }

  selectAll() {
    this.userSelectionMap.clear();
    // this.zone.run(() => {
    for (let i = 0; i < this.userList.length; i++) {
      this.userSelectionMap.set(this.userList[i].uid, true);
      console.log(this.userSelectionMap.get(this.userList[i].uid));
      console.log(this.userSelectionMap);
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SELECT_ALL_CLICKED,
      Environment.USER,
      PageId.CREATE_GROUP,
      undefined
    );
    // });
  }


  goTOGuestEdit() {
    this.getLastCreatedProfile().then((response) => {
      const navigationExtras: NavigationExtras = {
        state: {
          isNewUser: true,
          lastCreatedProfile: this.lastCreatedProfileData
        }
      };
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], navigationExtras);
    }).catch((error) => {
      const navigationExtras: NavigationExtras = { state: { isNewUser: true } };
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.GUEST_EDIT}`], navigationExtras);
    });
  }

  /**
 * Internally call create Group
 */
  async createGroup() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();

    const selectedUids: Array<string> = [];
    this.userSelectionMap.forEach((value: Boolean, key: string) => {
      if (value === true) {
        selectedUids.push(key);
      }
    });
    this.groupService.createGroup(this.group)
      .toPromise().then(res => {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.CREATE_GROUP_SUCCESS,
          Environment.USER,
          PageId.CREATE_GROUP
        );
        const req: ProfilesToGroupRequestDeprecated = {
          groupId: res.gid,
          uidList: selectedUids
        };
        return this.groupService.addProfilesToGroup(req).toPromise();
      })
      .then(success => {
        loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('GROUP_CREATE_SUCCESS'));
        window.history.go(-2); // will navigate back to Users and group page;
      })
      .catch(error => {
        loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
        loader.dismiss();
      });
  }


  getGradeNameFromCode(data: Profile | GroupDeprecated): string {
    if (data.grade && data.grade.length > 0) {
      const gradeName = [];
      data.grade.forEach(code => {

        if (data['gradeValue'] && data['gradeValue'][code]) {
          gradeName.push(data['gradeValue'][code]);
        }
      });

      if (gradeName.length === 0) {
        return data.grade.join(',');
      }

      return gradeName.join(',');
    }

    return '';
  }

  goBack() {
    this.location.back();
  }

}
