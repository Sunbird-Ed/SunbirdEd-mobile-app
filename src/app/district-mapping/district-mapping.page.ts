import { Location } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { featureIdMap } from '@app/feature-id-map';
import { AppGlobalService, AppHeaderService, CommonUtilService, FormAndFrameworkUtilService } from '@app/services';
import { FormLocationFactory } from '@app/services/form-location-factory/form-location-factory';
import { LocationHandler } from '@app/services/location-handler';
import { ProfileHandler } from '@app/services/profile-handler';
import {
  AuditType, CorReleationDataType, Environment,
  ID, ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { FieldConfig } from 'common-form-elements-v8';
import { concat, defer, of, Subscription } from 'rxjs';
import { delay, distinctUntilChanged, filter, mergeMap, pairwise, take, tap } from 'rxjs/operators';
import {
  AuditState, CorrelationData, DeviceInfo, DeviceRegisterRequest,
  DeviceRegisterService,
  FormRequest, LocationSearchResult, Profile, ProfileService,
  SharedPreferences
} from 'sunbird-sdk';
import { LocationConfig, PreferenceKey, ProfileConstants, RegexPatterns, RouterLinks } from '../../app/app.constant';
import { FormConstants } from '../form.constants';
import {ProfileType} from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage implements OnDestroy {
  get isShowBackButton(): boolean {
    if (window.history.state.isShowBackButton === undefined) {
      return true;
    }
    return window.history.state.isShowBackButton;
  }
  get source() {
    return window.history.state.source;
  }
  formGroup?: FormGroup;
  showNotNowFlag = false;
  locationFormConfig: FieldConfig<any>[] = [];
  profile?: Profile;
  private name: string;
  private backButtonFunc: Subscription;
  private presetLocation: { [locationType: string]: LocationSearchResult } = {};
  private loader?: any;
  private stateChangeSubscription?: Subscription;
  private prevFormValue: any = {};
  private formValueSubscription?: Subscription;
  private initialFormLoad = true;
  private isLocationUpdated = false;
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
    private formLocationFactory: FormLocationFactory,
    private locationHandler: LocationHandler,
    private profileHandler: ProfileHandler
  ) {
    this.appGlobalService.closeSigninOnboardingLoader();
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
    this.profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    this.presetLocation = (await this.locationHandler.getAvailableLocation(
      this.profile.serverProfile ? this.profile.serverProfile : this.profile))
      .reduce<{ [code: string]: LocationSearchResult }>((acc, loc) => {
        if (loc) { acc[loc.type] = loc; }
        return acc;
      }, {});
    try {
        this.initialiseFormData({
          ...FormConstants.LOCATION_MAPPING,
          subType: this.presetLocation['state'] ? this.presetLocation['state'].code : FormConstants.LOCATION_MAPPING.subType
        });
      } catch (e) {
        this.initialiseFormData(FormConstants.LOCATION_MAPPING);
      }
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
    // await this.checkLocationAvailability();
    const correlationList: Array<CorrelationData> = [];
    // if (this.stateName) {
    //   correlationList.push({ id: this.stateName || '', type: CorReleationDataType.STATE });
    //   correlationList.push({ id: this.districtName || '', type: CorReleationDataType.DISTRICT });
    // }
    this.telemetryGeneratorService.generatePageLoadedTelemetry(
      PageId.LOCATION,
      this.getEnvironment(),
      undefined,
      undefined,
      undefined,
      undefined,
      correlationList
    );
    this.initializeLoader();
  }

  async initializeLoader() {
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
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

  async submit() {
    this.saveDeviceLocation();
    const locationCodes = [];
    (Object.keys(this.formGroup.value.children['persona']).map((acc, key) => {
      if (this.formGroup.value.children['persona'][acc]) {
        const location: SbLocation = this.formGroup.value.children['persona'][acc] as SbLocation;
        if (location.type) {
          locationCodes.push({
            type: location.type,
            code: location.code
          });
        }
      }
    }, {}));
    const corRelationList: CorrelationData[] =  locationCodes.map(r => ({ type: r.type, id: r.code || '' }));
    this.generateSubmitInteractEvent(corRelationList);
    this.telemetryGeneratorService.generateInteractTelemetry(
      this.isLocationUpdated ? InteractType.LOCATION_CHANGED : InteractType.LOCATION_UNCHANGED,
      this.isStateorDistrictChanged(locationCodes),
      this.getEnvironment(),
      PageId.DISTRICT_MAPPING,
      undefined,
      undefined,
      undefined,
      featureIdMap.location.LOCATION_CAPTURE,
      ID.SUBMIT_CLICKED
    );
    if (this.appGlobalService.isUserLoggedIn()) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
        return;
      }
      const name = this.formGroup.value['name'].replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '').trim();
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes,
        ...((name ? { firstName: name } : {})),
        lastName: '',
        ...((this.formGroup.value['persona'] ? { userType: this.formGroup.value['persona'] } : {})),
        ...((this.formGroup.value.children['persona']['subPersona'] ?
          { userSubType: this.formGroup.value.children['persona']['subPersona'] } : {}))
      };
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.updateServerProfile(req).toPromise()
        .then(async () => {
          await loader.dismiss();
          this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, this.formGroup.value.persona).toPromise().then();
          if (!(await this.commonUtilService.isDeviceLocationAvailable())) { // adding the device loc if not available
            await this.saveDeviceLocation();
          }
          this.isLocationUpdated = false;
          this.generateLocationCaptured(false);
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
          this.events.publish('loggedInProfile:update', req);
          if (this.profile && (this.source === PageId.GUEST_PROFILE || this.source === PageId.PROFILE_NAME_CONFIRMATION_POPUP)) {
              this.location.back();
          } else if (this.profile && this.source === PageId.PROFILE) {
              this.location.back();
              this.events.publish('UPDATE_TABS', {type: 'SWITCH_TABS_USERTYPE'});
          } else {
            if (this.appGlobalService.isJoinTraningOnboardingFlow) {
              window.history.go(-2);
            } else {
              this.router.navigate([`/${RouterLinks.TABS}`]);
            }
          }
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast('PROFILE_UPDATE_FAILED');
          if (this.profile) {
            this.location.back();
          } else {
            this.router.navigate([`/${RouterLinks.TABS}`]);
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
        corRelationList
      );
      this.router.navigate([`/${RouterLinks.TABS}`], navigationExtras);
    }
  }

  private async saveDeviceLocation() {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: DeviceRegisterRequest = {
      userDeclaredLocation: {
        ...(Object.keys(this.formGroup.value.children['persona']).reduce((acc, key) => {
          if (this.formGroup.value.children['persona'][key]) {
            acc[key] = (this.formGroup.value.children['persona'][key] as SbLocation).name;
            acc[key + 'Id'] = (this.formGroup.value.children['persona'][key] as SbLocation).id;
          }
          return acc;
        }, {})),
        declaredOffline: !this.commonUtilService.networkInfo.isNetworkAvailable
      }
    } as any;
    this.deviceRegisterService.registerDevice(req).toPromise();
    this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(req.userDeclaredLocation)).toPromise();
    this.commonUtilService.handleToTopicBasedNotification();
    await loader.dismiss();
  }

  private async checkLocationMandatory() {
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

  private skipLocation() {
    this.router.navigate([`/${RouterLinks.TABS}`]);
  }

  private getEnvironment(): string {
    return (this.source === PageId.GUEST_PROFILE || this.source === PageId.PROFILE) ? Environment.USER : Environment.ONBOARDING;
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

  private async initialiseFormData(
    formRequest: FormRequest
  ) {
    let locationMappingConfig: FieldConfig<any>[];
    try {
      locationMappingConfig = await this.formAndFrameworkUtilService.getFormFields(formRequest);
    } catch (e) {
      locationMappingConfig = await this.formAndFrameworkUtilService.getFormFields(FormConstants.LOCATION_MAPPING);
    }
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    const useCaseList =
      this.appGlobalService.isUserLoggedIn() ? ['SIGNEDIN_GUEST', 'SIGNEDIN'] : ['SIGNEDIN_GUEST', 'GUEST'];
    for (const config of locationMappingConfig) {
      if (config.code === 'name' && (this.source === PageId.PROFILE || this.source === PageId.PROFILE_NAME_CONFIRMATION_POPUP)) {
        config.templateOptions.hidden = false;
        config.default = (this.profile && this.profile.serverProfile && this.profile.serverProfile.firstName) ?
        this.profile.serverProfile.firstName : this.profile.handle;
      } else if (config.code === 'name' && this.source !== PageId.PROFILE) {
        config.validations = [];
      }
      if (config.code === 'persona') {
        config.default = (this.profile && this.profile.serverProfile
        && this.profile.serverProfile.userType && (this.profile.serverProfile.userType !== ProfileType.OTHER.toUpperCase())) ?
        this.profile.serverProfile.userType : selectedUserType;
        if (this.source === PageId.PROFILE) {
          config.templateOptions.hidden = false;
        }
      }

      config.default = this.prevFormValue[config.code] || config.default;

      if (config.templateOptions['dataSrc'] && config.templateOptions['dataSrc']['marker'] === 'SUPPORTED_PERSONA_LIST') {
        config.templateOptions.options = (await this.profileHandler.getSupportedUserTypes())
          .map(p => ({
            label: p.name,
            value: p.code
          }));
        Object.keys(config.children).forEach((persona) => {
          config.children[persona].map((personaConfig) => {
            if (!useCaseList.includes(personaConfig.templateOptions['dataSrc']['params']['useCase'])) {
              personaConfig.templateOptions['hidden'] = true;
              personaConfig.validations = [];
            }
            if (!personaConfig.templateOptions['dataSrc']) {
              return personaConfig;
            }
            personaConfig.default = this.setDefaultConfig(personaConfig);
            switch (personaConfig.templateOptions['dataSrc']['marker']) {
              case 'SUBPERSONA_LIST': {
                if (this.profile.serverProfile) {
                  personaConfig.default = this.profile.serverProfile.userSubType;
                }
                break;
              }
              case 'STATE_LOCATION_LIST': {
                personaConfig.templateOptions.options = this.formLocationFactory.buildStateListClosure(personaConfig, this.initialFormLoad);
                break;
              }
              case 'LOCATION_LIST': {
                personaConfig.templateOptions.options = this.formLocationFactory.buildLocationListClosure(personaConfig,
                  this.initialFormLoad);
                break;
              }
            }

            personaConfig.default = (this.prevFormValue && this.prevFormValue.children && this.prevFormValue.children.persona) ?
              this.prevFormValue.children.persona[personaConfig.code] :
              personaConfig.default;

            return personaConfig;
          });
        });
      }
    }
    this.initialFormLoad = false;
    this.locationFormConfig = locationMappingConfig;
  }

  private setDefaultConfig(fieldConfig: FieldConfig<any>): SbLocation {
    if (this.presetLocation[fieldConfig.code]) {
      return this.presetLocation[fieldConfig.code];
    }
    return null;
  }

  async onFormInitialize(formGroup: FormGroup) {
    this.formGroup = formGroup;
    if (this.formValueSubscription) {
      this.formValueSubscription.unsubscribe();
    }
    this.formValueSubscription = this.formGroup.valueChanges.pipe(
      filter((v) => v['children'] && !!Object.keys(v['children']).length),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      pairwise(),
      delay(100),
      filter(() => this.formGroup.dirty),
      tap(([prev, curr]) => {
        const changeField = this.isChangedLocation(prev, curr);
        if (changeField) {
          this.isLocationUpdated = true;
          this.generateTelemetryForCategoryClicked(changeField);
        }
      })
    ).subscribe();
  }

  async onFormValueChange(value: any) {
  }

  async onDataLoadStatusChange($event) {
    if ('LOADING' === $event) {
      await this.loader.present();
    } else {
      await this.loader.dismiss();
      const subPersonaFormControl = this.formGroup.get('children.persona.subPersona');
      if (subPersonaFormControl && !subPersonaFormControl.value) {
        subPersonaFormControl.patchValue(this.profile.serverProfile.userSubType || null);
      }
      if (!this.stateChangeSubscription) {
        this.stateChangeSubscription = concat(
          of(this.formGroup.get('persona').value),
          this.formGroup.get('persona').valueChanges
        ).pipe(
          distinctUntilChanged(),
          delay(100),
          mergeMap(() => defer(() => {
            return this.formGroup.get('children.persona.state').valueChanges.pipe(
              distinctUntilChanged(),
              take(1)
            );
          }))
        ).subscribe(async (newStateValue) => {
          if (!newStateValue) { return; }
          this.locationFormConfig = undefined;
          this.stateChangeSubscription = undefined;
          this.loader.present();
          this.prevFormValue = { ...this.formGroup.value };
          this.initialiseFormData({
            ...FormConstants.LOCATION_MAPPING,
            subType: (newStateValue as SbLocation).code,
          }).catch((e) => {
            console.error(e);
            this.initialiseFormData(FormConstants.LOCATION_MAPPING);
          });
        });
      }
    }
  }

  generateTelemetryForCategorySelect(value, isState) {
    const corRelationList: CorrelationData[] = [{ id: PageId.POPUP_CATEGORY, type: CorReleationDataType.CHILD_UI }];
    corRelationList.push({
      id: value || '',
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

  clearUserLocationSelections() {
    const stateFormControl = this.formGroup.get('children.persona.state');
    /* istanbul ignore else */
    if (stateFormControl) {
      stateFormControl.patchValue(null);
    }
    const correlationList: Array<CorrelationData> = [];
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

  generateSubmitInteractEvent(corReletionList) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_SUBMIT, '',
      this.getEnvironment(),
      PageId.LOCATION,
      undefined,
      undefined,
      undefined,
      corReletionList
    );
  }

  ngOnDestroy() {
    if (this.formValueSubscription) {
      this.formValueSubscription.unsubscribe();
    }
  }

  isChangedLocation(prev, curr) {
    let newLocation;
    Object.keys(curr['children']['persona']).forEach((key) => {
      if (curr['children']['persona'][key] && (!prev['children']['persona'][key] ||
       (curr['children']['persona'][key].code !== prev['children']['persona'][key].code))) {
        newLocation = curr['children']['persona'][key];
      }
    });
    return newLocation;
  }

  generateTelemetryForCategoryClicked(location) {
    const correlationList: Array<CorrelationData> = [];
    correlationList.push({
    id: location.name,
    type: location.type.charAt(0).toUpperCase() + location.type.slice(1)
    });
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

  isStateorDistrictChanged(locationCodes) {
    let changeStatus;
    locationCodes.forEach((d) => {
      if (!changeStatus && d.type === 'state' && this.presetLocation['state']
      && (d.code !== this.presetLocation['state'].code)) {
        changeStatus = InteractSubtype.STATE_DIST_CHANGED;
      } else if (!changeStatus && d.type === 'district' && this.presetLocation['district']
      && (d.code !== this.presetLocation['district'].code)) {
        changeStatus = InteractSubtype.DIST_CHANGED;
      }
    });
    return changeStatus;
  }

  generateLocationCaptured(isEdited: boolean) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOCATION_CAPTURED,
      this.getEnvironment(),
      PageId.DISTRICT_MAPPING,
      undefined,
      {
        isEdited
      }, undefined,
      featureIdMap.location.LOCATION_CAPTURE);
  }

}
