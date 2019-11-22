import { Component, OnInit, Inject, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  LocationSearchCriteria, ProfileService,
  SharedPreferences, Profile, DeviceRegisterRequest, DeviceRegisterService, DeviceInfo
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey, RouterLinks, LocationConfig } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService, FormAndFrameworkUtilService } from '@app/services';
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
  name;
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
  isPopulatedLocationChanged = false;
  isKeyboardShown$;
  isLocationChanged = false;

  constructor(
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    public router: Router,
    public location: Location,
    public appGlobalService: AppGlobalService,
    public events: Events,
    public platform: Platform,
    public telemetryGeneratorService: TelemetryGeneratorService,
    private changeDetectionRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.profile = this.router.getCurrentNavigation().extras.state.profile;
      this.isShowBackButton = this.router.getCurrentNavigation().extras.state.isShowBackButton;
      this.source = this.router.getCurrentNavigation().extras.state.source;
    }
    this.isKeyboardShown$ = deviceInfo.isKeyboardShown().do(() => this.changeDetectionRef.detectChanges());
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
    this.getState(name, id, code);
    this.districtName = '';
    this.districtCode = '';
    this.isLocationChanged = true;
    if (this.isAutoPopulated) { // TODO: Do we need this if.
      this.isPopulatedLocationChanged = true;
    }
    if (this.isPopulatedLocationChanged) {
      this.availableLocationDistrict = '';
    }
  }

  async getState(name, id, code) {
    this.ngZone.run( async () => {
      this.showStates = false;
      this.stateName = name;
      this.stateCode = code;
      await this.getDistrict(id);
    });
  }

  async selectDistrict(name, code) {
    this.ngZone.run(() => {
      if (this.isAutoPopulated && this.availableLocationDistrict) { // TODO: Do we need this if.
        this.isPopulatedLocationChanged = true;
      }
      this.isLocationChanged = true;
      this.districtName = name;
      this.districtCode = code;
      this.showDistrict = false;
    });
  }

  stateIconClicked() {
    this.stateName = '';
  }

  districtIconClicked() {
    this.districtName = '';
    this.districtCode = '';
  }

  goBack() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.DISTRICT_MAPPING, Environment.HOME,
      true);
    this.location.back();
  }

  async ionViewWillEnter() {
    this.headerService.hideHeader();
    await this.checkLocationAvailability();
    await this.getStates();
  }

  async checkLocationAvailability() {
    if (this.profile) {
      this.isAutoPopulated = true;
      this.name = this.profile['firstName'];
      if (this.profile['lastName']) {
        this.name = this.profile['firstName'] + this.profile['lastName'];
      }
      if (this.profile['userLocations'] && this.profile['userLocations'].length) {
        for (const ele of this.profile['userLocations']) {
          if (ele.type === 'district') {
            this.availableLocationDistrict = ele.name;

          } else if (ele.type === 'state') {
            this.availableLocationState = ele.name;
          }
        }
      }

    } else if (await this.commonUtilService.isDeviceLocationAvailable()) {
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
  showDistrictList() {
    this.showDistrict = true;
  }
  // validates the name input feild
  validateName() {
    if (this.name) {
      return !Boolean(this.name.match(/^[a-zA-Z ]*$/));
    }
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
      this.ngZone.run(async () => {
        if (locations && Object.keys(locations).length) {
          this.stateList = locations;
          loader.dismiss();
          loader = undefined;
          if (this.availableLocationState) {
            let loaderState = await this.commonUtilService.getLoader();
            await loaderState.present();
            const state = this.stateList.find(s => s.name === this.availableLocationState);
            if (state) {
              await loaderState.dismiss();
              loaderState = undefined;
              await this.getState(state.name, state.id, state.code);
              this.generateAutoPopulatedTelemetry();
            } else {
              this.stateName = '';
            }
          }
        } else {
          this.districtList = '';
          this.showDistrict = !this.showDistrict;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
          loader.dismiss();
          loader = undefined;
        }
      });
    }, async (error) => {
      if (loader) {
        loader.dismiss();
        loader = undefined;
      }
    });
  }

  async getDistrict(pid: string) {
    if (this.stateName) {
      let loader = await this.commonUtilService.getLoader();
      loader.present();
      const req: LocationSearchCriteria = {
        filters: {
          type: loc.TYPE_DISTRICT,
          parentId: pid
        }
      };
      this.profileService.searchLocation(req).subscribe(async (success) => {
        this.ngZone.run(async () => {
          if (success && Object.keys(success).length) {
            this.districtList = success;
            if (this.availableLocationDistrict) {
              this.districtName = this.availableLocationDistrict;
              const district = this.districtList.find(d => d.name === this.availableLocationDistrict);
              if (district) {
                await this.selectDistrict(district.name, district.code);
                loader.dismiss();
                loader = undefined;
              } else {
                this.districtName = '';
                loader.dismiss();
                loader = undefined;
              }
            }
          } else {
            this.availableLocationDistrict = '';
            loader.dismiss();
            loader = undefined;
            this.districtList = [];
            this.showDistrict = !this.showDistrict;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
          }
        });
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
      { isPopulatedLocation: this.isPopulatedLocationChanged });

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBMIT_CLICKED,
      Environment.HOME,
      PageId.DISTRICT_MAPPING,
      undefined,
    );

    if (this.appGlobalService.isUserLoggedIn()) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
        return;
      }
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes: [this.stateCode, this.districtCode]
      };
      if (this.profile) {
        req['firstName'] = this.name.trim();
        req['lastName'] = '';
      }
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.updateServerProfile(req).toPromise()
        .then(async () => {
          await loader.dismiss();

          if (!(await this.commonUtilService.isDeviceLocationAvailable())) { // adding the device loc if not available
            await this.saveDeviceLocation();
          }
          this.generateLocationCaptured(false); // is dirtrict or location edit  = false
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
          this.events.publish('loggedInProfile:update', req);
          if (this.profile) {
            this.goBack();
          } else {
            this.router.navigate([`/${RouterLinks.TABS}`]);
          }
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
          if (this.profile) {
            this.goBack();
          } else {
            this.router.navigate([`/${RouterLinks.TABS}`]);
          }
        });
    } else if (this.source === PageId.GUEST_PROFILE) { // block for editing the device location

      this.generateLocationCaptured(true); // is dirtrict or location edit  = true

      await this.saveDeviceLocation();
      this.events.publish('refresh:profile');
      this.goBack();
    } else { // add or update the device loc
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
    locationMap['state'] = this.stateName ? this.stateName : this.availableLocationState;
    locationMap['district'] = this.districtName ? this.districtName : this.availableLocationDistrict;
    await this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(locationMap)).toPromise();
    await loader.dismiss();
  }

  async checkLocationMandatory() {
    let skipValues = [];
    await this.formAndFrameworkUtilService.getLocationConfig()
      .then((locationConfig) => {
        for (const field of locationConfig) {
          if (field.code === LocationConfig.CODE_SKIP) {
            skipValues = field.values;
            break;
          }
        }
      });

    for (const value of skipValues) {
      if (this.appGlobalService.isUserLoggedIn()) {
        if (!this.profile && value === LocationConfig.SKIP_USER) {
          this.showNotNowFlag = true;
        }
      } else if (!(this.source === PageId.GUEST_PROFILE) && value === LocationConfig.SKIP_DEVICE) {
        this.showNotNowFlag = true;
      }
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

  resetDistrictCode() {
    this.districtCode = '';
  }
}
