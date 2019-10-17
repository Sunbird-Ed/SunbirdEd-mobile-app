import { Component, OnInit, Inject } from '@angular/core';
import { LocationSearchCriteria, ProfileService, SharedPreferences } from 'sunbird-sdk';
import { Location as loc, PreferenceKey } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { NavigationExtras, Router  } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage implements OnInit {
  state
  district
  showList
  cities
  stateList;
  districtList;
  showStates: boolean;
  showDistrict: boolean;
  constructor(
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public router: Router,
    public location : Location
  ) { }

  ngOnInit() {
    this.headerService.hideHeader();
    this.getStates();
  }
  selectState(name, id) {
    this.state = name;
    this.district = '';
    this.showStates = false;
    this.getDistrict(id);
  }

  selectDistrict(district) {
    this.district = district;
    this.showDistrict = false;
  }

  goBack(){
    this.location.back();
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
    if (this.state) {
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
  goToTabsPage() {
    const locationMap = new Map();
    const navigationExtras: NavigationExtras = {
      state: {
        loginMode: 'guest'
      }
    };
    locationMap['state'] = this.state;
    locationMap['district'] = this.district;
    this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(locationMap)).toPromise().then(() => {
      this.router.navigate(['/tabs'], navigationExtras);
    })
  }
}
