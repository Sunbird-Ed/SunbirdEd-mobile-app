import { Component, OnInit, Inject } from '@angular/core';
import {
  LocationSearchCriteria, ProfileService,
  SharedPreferences, Profile, DeviceRegisterRequest, DeviceRegisterService
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey, RouterLinks } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService } from '@app/services';
import { NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';

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
  isShowBackButton = true;
  source;
  backButtonFunc: Subscription;
  showNotNowFlag = false;
  availableLocationData: any;
  availableLocationDistrict: string;
  availableLocationState: string;
  isAutoPopulated = false;
  isLocationChanged = false;

  constructor(
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    public router: Router,
    public location: Location,
    public appGlobalService: AppGlobalService,
    public events: Events,
    public platform: Platform,
    public telemetryGeneratorService: TelemetryGeneratorService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.profile = this.router.getCurrentNavigation().extras.state.profile;
      this.isShowBackButton = this.router.getCurrentNavigation().extras.state.isShowBackButton;
      this.source = this.router.getCurrentNavigation().extras.state.source;
    }
  }

  ngOnInit() {
    this.handleDeviceBackButton();
    this.checkLocationMandatory();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.DISTRICT_MAPPING,
      Environment.HOME);
  }

  selectState(name, id, code) {
    this.showStates = false;
    this.stateName = name;
    this.districtName = '';
    this.stateCode = code;
    this.getDistrict(id);
    if (this.isAutoPopulated) { // TODO: Do we need this if.
      this.isLocationChanged = true;
    }
  }

  selectDistrict(name, code) {
    if (this.isAutoPopulated) { // TODO: Do we need this if.
      this.isLocationChanged = true;
    }
    this.districtName = name;
    this.districtCode = code;
    this.showDistrict = false;
  }

  stateIconClicked() {
    this.stateName = '';
  }

  districtIconClicked() {
    this.districtName = '';
  }

  goBack() {
    this.location.back();
  }

  async ionViewWillEnter() {
    this.headerService.hideHeader();
    await this.checkLocationAvailability();
    await this.getStates();
  }

  async checkLocationAvailability() {
    if (await this.commonUtilService.isDeviceLocationAvailable()) {
      this.isAutoPopulated = true;
      this.availableLocationData = JSON.parse(await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise());
      this.availableLocationState = this.availableLocationData.state;
      this.availableLocationDistrict = this.availableLocationData.district;
    } else if (await this.commonUtilService.isIpLocationAvailable()) {
      this.isAutoPopulated = true;
      this.availableLocationData = JSON.parse(await this.preferences.getString(PreferenceKey.IP_LOCATION).toPromise());
      this.availableLocationState = this.availableLocationData.state;
      this.availableLocationDistrict = this.availableLocationData.district;
    }
  }

  handleDeviceBackButton() {
    if (this.isShowBackButton) {
      this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
        this.goBack();
      });
    }
  }

  ionViewWillLeave(): void {
    this.backButtonFunc.unsubscribe();
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
      if (locations && Object.keys(locations).length) {
        this.stateList = locations;
        loader.dismiss();
        loader = undefined;
        if (this.availableLocationState) {
          let loaderState = await this.commonUtilService.getLoader();
          await loaderState.present();
          for (const element of this.stateList) {
            if (element.name === this.availableLocationState) {
              await loaderState.dismiss();
              loaderState = undefined;
              this.selectState(element.name, element.id, element.code);
              this.generateAutoPopulatedTelemetry();
              break;
            }
          }
        }
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

  async getDistrict(pid: string) {
    if (this.stateName) {
      // this.showDistrict = !this.showDistrict;
      let loader = await this.commonUtilService.getLoader();
      loader.present();
      const req: LocationSearchCriteria = {
        filters: {
          type: loc.TYPE_DISTRICT,
          parentId: pid
        }
      };
      this.profileService.searchLocation(req).subscribe(async (success) => {
        const districtsTemp = success;
        if (districtsTemp && Object.keys(districtsTemp).length) {
          this.districtList = districtsTemp;
          loader.dismiss();
          loader = undefined;
          if (this.availableLocationDistrict && this.availableLocationDistrict !== null) {
            for (const element of this.districtList) {
              if (element.name === this.availableLocationDistrict) {
                this.selectDistrict(element.name, element.code);
                break;
              }
            }
          }
        } else {
          loader.dismiss();
          loader = undefined;
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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.AUTO_POPULATED_LOCATION,
      Environment.HOME,
      PageId.DISTRICT_MAPPING,
      undefined,
      { isLocationChanged: this.isLocationChanged });

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBMIT_CLICKED,
      Environment.HOME,
      PageId.DISTRICT_MAPPING,
      undefined,
      );

    if (this.appGlobalService.isUserLoggedIn()) {
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes: [this.stateCode, this.districtCode]
      };
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.updateServerProfile(req).toPromise()
        .then(async () => {
          await loader.dismiss();
          this.generateLocationCaptured(false); // is dirtrict or location edit  = false
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
          this.events.publish('loggedInProfile:update', req);
          this.router.navigate([`/${RouterLinks.TABS}`]);
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
        });
    }

    if (this.source === PageId.GUEST_PROFILE) { // block for editing the device location

      this.generateLocationCaptured(true); // is dirtrict or location edit  = true

      await this.saveDeviceLocation();
      this.events.publish('refresh:profile');
      this.goBack();
    } else if (!(await this.commonUtilService.isDeviceLocationAvailable())) { // adding the device loc
      await this.saveDeviceLocation();
      const navigationExtras: NavigationExtras = {
        state: {
          loginMode: 'guest'
        }
      };
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    }
  }

  async saveDeviceLocation() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: DeviceRegisterRequest = {
      userDeclaredLocation: {
        state: this.stateName,
        district: this.districtName,
      }
    };
    this.deviceRegisterService.registerDevice(req).toPromise();

    const locationMap = new Map();
    locationMap['state'] = this.stateName;
    locationMap['district'] = this.districtName;
    await this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(locationMap)).toPromise();
    await loader.dismiss();
  }

  async checkLocationMandatory() {
    let isLocationMandatory = await this.preferences.getString(PreferenceKey.IS_LOCATION_MANDATORY).toPromise();

    this.showNotNowFlag = false;
    if (isLocationMandatory === null || isLocationMandatory === undefined || isLocationMandatory === '') {
      this.preferences.putString(PreferenceKey.IS_LOCATION_MANDATORY, 'TRUE').toPromise();
      isLocationMandatory = 'TRUE';
    }

    if (!(this.source === PageId.GUEST_PROFILE) && isLocationMandatory === 'FALSE') {
      this.showNotNowFlag = true;
    }
  }

  skipLocation() {
    this.router.navigate([`/${RouterLinks.TABS}`]);
  }

  generateAutoPopulatedTelemetry() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.AUTO_POPULATED_LOCATION,
      Environment.HOME,
      PageId.DISTRICT_MAPPING,
      undefined,
      { isAutoPopulated: this.isAutoPopulated });
  }

  generateLocationCaptured(isEdited: boolean) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOCATION_CAPTURED,
      Environment.HOME,
      PageId.DISTRICT_MAPPING,
      undefined,
      {
        isAutoPopulated: this.isAutoPopulated,
        isEdited
      });
  }
}
