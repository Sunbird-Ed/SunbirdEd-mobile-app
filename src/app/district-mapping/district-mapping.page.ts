import { Component, Inject, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
import {
  LocationSearchCriteria,
  ProfileService,
  SharedPreferences,
  Profile,
  DeviceRegisterRequest,
  DeviceRegisterService,
  DeviceInfo,
  LocationSearchResult,
  CachedItemRequestSourceFrom,
  CorrelationData,
  AuditState
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey, RouterLinks, LocationConfig, RegexPatterns } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService, FormAndFrameworkUtilService } from '@app/services';
import { NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Events, IonSelect } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
  ID,
  CorReleationDataType,
  AuditType
} from '@app/services/telemetry-constants';
import { featureIdMap } from '@app/feature-id-map';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage {
  @ViewChild('stateSelect') stateSelect?: IonSelect;
  @ViewChild('districtSelect') districtSelect?: IonSelect;

  private _showStates?: boolean;
  private _showDistrict?: boolean;
  private _stateName: string;
  private _districtName: string;

  get profile(): Profile | undefined {
    return window.history.state.profile;
  }
  get isShowBackButton(): boolean {
    if (window.history.state.isShowBackButton === undefined) {
      return true;
    }
    return window.history.state.isShowBackButton;
  }
  get source() {
    return window.history.state.source;
  }



  get showStates(): boolean {
    return this._showStates;
  }

  set showStates(value: boolean) {
    this._showStates = value;

    if (this._showStates && this.stateSelect) {
      setTimeout(() => {
        this.stateSelect.open();
      }, 500);
    }
  }

  get showDistrict(): boolean {
    return this._showDistrict;
  }
  set showDistrict(value: boolean) {
    this._showDistrict = value;

    if (this._showDistrict && this.districtSelect) {
      setTimeout(() => {
        this.districtSelect.open();
      }, 500);
    }
  }


  get stateName(): string {
    return this._stateName;
  }
  set stateName(value: string) {
    this._stateName = value;

    if (this.stateSelect) {
      const selectedState = this.stateList.find((state) => state.name === this._stateName);
      this.stateSelect.selectedText = selectedState ? selectedState.name : '';
    }
  }

  get districtName(): string {
    return this._districtName;
  }
  set districtName(value: string) {
    this._districtName = value;

    if (this.districtSelect) {
      const selectedDistrict = this.districtList.find((district) => district.name === this._districtName);
      this.districtSelect.selectedText = selectedDistrict ? selectedDistrict.name : '';
    }
  }

  name;
  stateList: LocationSearchResult[] = [];
  districtList: LocationSearchResult[] = [];
  stateCode;
  districtCode;
  backButtonFunc: Subscription;
  showNotNowFlag = false;
  availableLocationData: any;
  availableLocationDistrict: string;
  availableLocationState: string;
  isAutoPopulated = false;
  isPopulatedLocationChanged = false;
  isKeyboardShown$;
  isLocationChanged = false;
  disableSubmitButton = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    public router: Router,
    public location: Location,
    public appGlobalService: AppGlobalService,
    public events: Events,
    public platform: Platform,
    public telemetryGeneratorService: TelemetryGeneratorService,
    private changeDetectionRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private externalIdVerificationService: ExternalIdVerificationService
  ) {
    this.appGlobalService.closeSigninOnboardingLoader();
    this.isKeyboardShown$ = deviceInfo.isKeyboardShown().pipe(
      tap(() => this.changeDetectionRef.detectChanges())
    );
  }

  selectState(name, id, code) {
    this.getState(name, id, code);
    this.districtName = '';
    this.districtCode = '';
    this.isLocationChanged = true;
    if (this.isAutoPopulated) {
      this.isPopulatedLocationChanged = true;
    }
    if (this.isPopulatedLocationChanged) {
      this.availableLocationDistrict = '';
    }
  }

  async getState(name, id, code) {
    this.ngZone.run(async () => {
      this.showStates = false;
      this.stateName = name;
      this.stateCode = code;
      this.generateTelemetryForCategorySelect(name, true);
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
      this.generateTelemetryForCategorySelect(name, false);
    });
  }

  stateIconClicked() {
    this.stateName = '';
  }

  districtIconClicked() {
    this.districtName = '';
    this.districtCode = '';
  }

  goBack(isNavClicked: boolean) {
    this.telemetryGeneratorService.generateBackClickedNewTelemetry(
      !isNavClicked,
      this.getEnvironment(),
      PageId.LOCATION
    );
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.DISTRICT_MAPPING, this.getEnvironment(),
      isNavClicked);
    this.location.back();
  }

  async ionViewWillEnter() {
    this.handleDeviceBackButton();
    this.checkLocationMandatory();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_REQUEST, '',
      PageId.LOCATION,
      this.getEnvironment()
    );
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.DISTRICT_MAPPING,
      this.getEnvironment(), '', '', '', undefined,
      featureIdMap.location.LOCATION_CAPTURE);

    this.headerService.hideHeader();
    await this.checkLocationAvailability();
    await this.getStates();
    const correlationList: Array<CorrelationData> = [];
    if (this.stateName) {
      correlationList.push({ id: this.stateName || '', type: CorReleationDataType.STATE });
      correlationList.push({ id: this.districtName || '', type: CorReleationDataType.DISTRICT });
    }
    this.telemetryGeneratorService.generatePageLoadedTelemetry(
      PageId.LOCATION,
      this.getEnvironment(),
      undefined,
      undefined,
      undefined,
      undefined,
      correlationList
    );
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
        this.goBack(false);
      });
    }
  }

  ionViewWillLeave(): void {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }


  // validates the name input feild
  validateName() {
    if (this.name) {
      // return !Boolean(this.name.match(/^[a-zA-Z0-9/./s]*$/));
      return false;
    }
  }

  async getStates() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      from: CachedItemRequestSourceFrom.SERVER,
      filters: {
        type: loc.TYPE_STATE
      }
    };
    this.profileService.searchLocation(req).subscribe(async (success) => {
      const locations = success;
      this.ngZone.run(async () => {
        if (locations && Object.keys(locations).length) {
          this.stateList = locations;
          if (this.availableLocationState) {
            const state = this.stateList.find(s => s.name === this.availableLocationState);
            if (state) {
              await this.getState(state.name, state.id, state.code);
            } else {
              this.stateName = '';
            }
            this.generateAutoPopulatedTelemetry();
          }
        } else {
          this.districtList = [];
          this.showDistrict = !this.showDistrict;
          this.commonUtilService.showToast('NO_DATA_FOUND');
        }
        await loader.dismiss();
      });
    }, async (error) => {
      await loader.dismiss();
    });
  }

  async getDistrict(pid: string) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      from: CachedItemRequestSourceFrom.SERVER,
      filters: {
        type: loc.TYPE_DISTRICT,
        parentId: pid
      }
    };
    this.profileService.searchLocation(req).subscribe(async (success) => {
      this.ngZone.run(async () => {
        if (success && Object.keys(success).length) {
          this.showDistrict = false;
          this.districtList = success;
          if (this.availableLocationDistrict) {
            this.districtName = this.availableLocationDistrict;
            const district = this.districtList.find(d => d.name.toLowerCase() === this.availableLocationDistrict.toLowerCase());
            await loader.dismiss();
            if (district) {
              await this.selectDistrict(district.name, district.code);
            } else {
              this.districtName = '';
            }
          } else if (this.districtList) {
            this.showDistrict = true;
            await loader.dismiss();
          }
        } else {
          this.availableLocationDistrict = '';
          await loader.dismiss();
          this.districtList = [];
          this.showDistrict = !this.showDistrict;
          this.commonUtilService.showToast('NO_DATA_FOUND');
        }
      });
    }, async (error) => {
      await loader.dismiss();
    });
  }

  isStateorDistrictChanged() {
    if (this.availableLocationState !== this.stateName && this.availableLocationDistrict === this.districtName) {
      return InteractSubtype.STATE_CHANGED;
    } else if (this.availableLocationDistrict !== this.districtName && this.availableLocationState === this.stateName) {
      return InteractSubtype.DIST_CHANGED;
    } else if (this.availableLocationState !== this.stateName && this.availableLocationDistrict !== this.districtName) {
      return InteractSubtype.STATE_DIST_CHANGED;
    } else {
      return '';
    }
  }

  async submit() {

    let isLocationUpdated = false;
    if (this.stateName !== this.availableLocationState ||
      this.districtName !== this.availableLocationDistrict) {
      isLocationUpdated = true;
    }
    const corReletionList: CorrelationData[] = [];
    corReletionList.push({ id: this.stateName, type: CorReleationDataType.STATE }),
      corReletionList.push({ id: this.districtName, type: CorReleationDataType.DISTRICT });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_SUBMIT, '',
      this.getEnvironment(),
      PageId.LOCATION,
      undefined,
      undefined,
      undefined,
      corReletionList
    );

    this.telemetryGeneratorService.generateInteractTelemetry(
      isLocationUpdated ? InteractType.LOCATION_CHANGED : InteractType.LOCATION_UNCHANGED,
      this.isStateorDistrictChanged(),
      this.getEnvironment(),
      PageId.DISTRICT_MAPPING,
      undefined,
      { isPopulatedLocation: this.isPopulatedLocationChanged },
      undefined,
      featureIdMap.location.LOCATION_CAPTURE,
      ID.SUBMIT_CLICKED
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
        req['firstName'] = (this.name.replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '')).trim();
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
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
          this.disableSubmitButton = true;
          this.events.publish('loggedInProfile:update', req);
          if (this.profile) {
            this.location.back();
          } else {
            if (this.appGlobalService.isJoinTraningOnboardingFlow) {
              window.history.go(-2);
            } else {
              this.router.navigate([`/${RouterLinks.TABS}`]);
            }
            this.externalIdVerificationService.showExternalIdVerificationPopup();
          }
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast('PROFILE_UPDATE_FAILED');
          if (this.profile) {
            this.location.back();
          } else {
            this.router.navigate([`/${RouterLinks.TABS}`]);
            this.externalIdVerificationService.showExternalIdVerificationPopup();
          }
        });
    } else if (this.source === PageId.GUEST_PROFILE) { // block for editing the device location

      this.generateLocationCaptured(true); // is dirtrict or location edit  = true

      await this.saveDeviceLocation();
      this.events.publish('refresh:profile');
      this.location.back();
    } else { // add or update the device loc
      await this.saveDeviceLocation();
      this.appGlobalService.setOnBoardingCompleted();
      const navigationExtras: NavigationExtras = {
        state: {
          loginMode: 'guest'
        }
      };
      this.telemetryGeneratorService.generateAuditTelemetry(
        this.getEnvironment(),
        AuditState.AUDIT_UPDATED,
        undefined,
        AuditType.SET_PROFILE,
        undefined,
        undefined,
        undefined,
        corReletionList
      );
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    }
  }

  async saveDeviceLocation() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: DeviceRegisterRequest = {
      userDeclaredLocation: {
        state: this.stateName,
        stateId: this.stateList.find((s) => s.name === this.stateName).id,
        district: this.districtName,
        districtId: this.districtList.find((d) => d.name === this.districtName).id,
        declaredOffline: !this.commonUtilService.networkInfo.isNetworkAvailable
      }
    };
    this.deviceRegisterService.registerDevice(req).toPromise();
    this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(req.userDeclaredLocation)).toPromise();
    this.commonUtilService.handleToTopicBasedNotification();
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
      this.isAutoPopulated ? InteractType.VISIBLE : InteractType.NOT_VISIBLE,
      '',
      this.getEnvironment(),
      PageId.DISTRICT_MAPPING,
      undefined,
      { isAutoPopulated: this.isAutoPopulated },
      undefined,
      featureIdMap.location.LOCATION_CAPTURE,
      ID.IP_BASED_LOCATION_SUGGESTION);
  }

  generateLocationCaptured(isEdited: boolean) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOCATION_CAPTURED,
      this.getEnvironment(),
      PageId.DISTRICT_MAPPING,
      undefined,
      {
        isAutoPopulated: this.isAutoPopulated,
        isEdited
      }, undefined,
      featureIdMap.location.LOCATION_CAPTURE);
  }

  getEnvironment(): string {
    return this.source === PageId.GUEST_PROFILE ? Environment.USER : Environment.ONBOARDING;
  }

  isValid(input: string, objects: any[], key: 'code' | 'name'): boolean {
    if (!objects) {
      return false;
    }
    return !!objects.find(o => o[key] === input);
  }

  resetDistrictCode() {
    this.districtCode = '';
  }

  cancelEvent(category?: string) {
    const correlationList: Array<CorrelationData> = [];
    /* New Telemetry */
    correlationList.push({ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CANCEL, '',
      this.getEnvironment(),
      PageId.LOCATION,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  onCategoryCliked(category: string) {
    const correlationList: Array<CorrelationData> = [];
    const correlationData: CorrelationData = new CorrelationData();
    switch (category) {
      case 'state':
        correlationData.id = this.stateList.length.toString();
        correlationData.type = CorReleationDataType.STATE;
        break;
      case 'district':
        correlationData.id = this.districtList.length.toString();
        correlationData.type = CorReleationDataType.DISTRICT;
        break;
    }
    correlationList.push(correlationData);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CATEGORY, '',
      this.getEnvironment(),
      PageId.LOCATION,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  generateTelemetryForCategorySelect(value, isState) {
    const corRelationList: CorrelationData[] = [{ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI }];
    corRelationList.push({
      id: value,
      type: isState ? CorReleationDataType.STATE : CorReleationDataType.DISTRICT
    });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_SUBMIT, '',
      this.getEnvironment(),
      PageId.LOCATION,
      undefined,
      undefined,
      undefined,
      corRelationList
    );
  }
}
