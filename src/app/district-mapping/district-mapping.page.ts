import { Component, OnInit, Inject } from '@angular/core';
import { LocationSearchCriteria, ProfileService, SharedPreferences, Profile } from 'sunbird-sdk';
import { Location as loc, PreferenceKey, RouterLinks } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService } from '@app/services';
import { NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage implements OnInit {
  stateName;
  districtName;
  stateList;
  districtList;
  profile: Profile;
  showStates: boolean;
  showDistrict: boolean;
  stateCode;
  districtCode;

  constructor(
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public router: Router,
    public location: Location,
    public appGlobalService: AppGlobalService,
    public events: Events
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.profile = this.router.getCurrentNavigation().extras.state.profile;
    }
  }

  ngOnInit() {
    this.headerService.hideHeader();
    this.getStates();
  }

  selectState(name, id, code) {
    this.stateName = name;
    this.districtName = '';
    this.showStates = false;
    this.getDistrict(id);
    this.stateCode = code;
  }

  selectDistrict(name, code) {
    this.districtName = name;
    this.showDistrict = false;
    this.districtCode = code;
  }

  goBack() {
    this.location.back();
  }

  showStateList() {
    this.districtName = '';
    this.showStates = true;
  }

  async getStates() {
    let loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      filters: {
        type: loc.TYPE_STATE
      }
    };
    this.profileService.searchLocation(req).subscribe(async (success) => {
      const locations = success;
      loader.dismiss();
      loader = undefined;
      if (locations && Object.keys(locations).length) {
        this.stateList = locations;
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
      }
    }, async (error) => {
      if (loader) {
        loader.dismiss();
        loader = undefined;
      }
    });
  }

  async getDistrict(parentId: string) {
    if (this.stateName) {
      this.showDistrict = !this.showDistrict;
      let loader = await this.commonUtilService.getLoader();
      loader.present();
      const req: LocationSearchCriteria = {
        filters: {
          type: loc.TYPE_DISTRICT,
          parentId
        }
      };
      this.profileService.searchLocation(req).subscribe(async (success) => {
        const districtsTemp = success;
        loader.dismiss();
        loader = undefined;
        if (districtsTemp && Object.keys(districtsTemp).length) {
          this.districtList = districtsTemp;
        } else {
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
        }
      }, async (error) => {
        if (loader) {
          loader.dismiss();
          loader = undefined;
        }
      });
    }
  }

  async submit() {

    if (this.appGlobalService.isUserLoggedIn()) {
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes: [this.stateCode, this.districtCode]
      };
      let loader = await this.commonUtilService.getLoader();
      this.profileService.updateServerProfile(req).toPromise()
        .then(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
          this.events.publish('loggedInProfile:update', req);
          this.router.navigate(['/tabs']);
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
        });
    }

    this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise()
      .then(deviceLoc => {
        if (!deviceLoc) {
          const locationMap = new Map();
          const navigationExtras: NavigationExtras = {
            state: {
              loginMode: 'guest'
            }
          };
          locationMap['state'] = this.stateName;
          locationMap['district'] = this.districtName;
          this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(locationMap)).toPromise()
            .then(() => {
              this.router.navigate(['/tabs'], navigationExtras);
            });
        }
      });
  }
}
