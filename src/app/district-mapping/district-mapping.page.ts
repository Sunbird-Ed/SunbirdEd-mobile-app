import { Component, Inject } from '@angular/core';
import {
  ProfileService,
  SharedPreferences,
  Profile,
  DeviceRegisterRequest,
  DeviceRegisterService,
  DeviceInfo,
  LocationSearchResult,
  CorrelationData,
  FormService,
  FormRequest
} from 'sunbird-sdk';
import { PreferenceKey, RouterLinks, LocationConfig, RegexPatterns, ProfileConstants } from '../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService, FormAndFrameworkUtilService } from '@app/services';
import { NavigationExtras, Router } from '@angular/router';
import { Events, IonSelect } from '@ionic/angular';
import { concat, defer, of, Subscription } from 'rxjs';
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
import { delay, distinctUntilChanged, mergeMap, take, tap } from 'rxjs/operators';
import { FormLocationFactory } from '@app/services/form-location-factory/form-location-factory';
import { FieldConfig } from 'common-form-elements-v8';
import { FormConstants } from '../form.constants';
import { FormGroup } from '@angular/forms';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { Location } from '@angular/common';
import { LocationHandler } from '@app/services/location-handler';
import { ProfileHandler } from '@app/services/profile-handler';
@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage {
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
    this.initialiseFormData({
      ...FormConstants.LOCATION_MAPPING,
      subType: this.presetLocation['state'] ? this.presetLocation['state'].code : FormConstants.LOCATION_MAPPING.subType
    }, true);
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
    console.log(this.formGroup.value);
    this.saveDeviceLocation();
    if (this.appGlobalService.isUserLoggedIn()) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
        return;
      }
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
      const name = this.formGroup.value['name'].replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '').trim();
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes,
        ...((name ? { firstName: name } : {})),
        lastName: '',
        ...((this.formGroup.value['persona'] ? { userType: this.formGroup.value['persona'] } : {})),
        ...((this.formGroup.value.children['persona']['subPersona'] ?
          { subUserType: this.formGroup.value.children['persona']['subPersona'] } : {}))
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
          // this.generateLocationCaptured(false); // is dirtrict or location edit  = false
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
          //  this.disableSubmitButton = true;
          this.events.publish('loggedInProfile:update', req);
          if (this.profile && (this.source === PageId.PROFILE || this.source === PageId.GUEST_PROFILE)) {
            this.location.back();
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
      // this.generateLocationCaptured(true); // is dirtrict or location edit  = true
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
    return this.source === PageId.GUEST_PROFILE ? Environment.USER : Environment.ONBOARDING;
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
    formRequest: FormRequest,
    initial = false
  ) {
    let locationMappingConfig: FieldConfig<any>[];
    try {
      locationMappingConfig = await this.formAndFrameworkUtilService.getFormFields(formRequest);
    } catch (e) {
      locationMappingConfig = await this.formAndFrameworkUtilService.getFormFields(FormConstants.LOCATION_MAPPING);
    }
    const useCaseList =
      this.appGlobalService.isUserLoggedIn() ? ['SIGNEDIN_GUEST', 'SIGNEDIN'] : ['SIGNEDIN_GUEST', 'GUEST'];
    for (const config of locationMappingConfig) {
      if (config.code === 'name' && this.source === PageId.PROFILE) {
        config.templateOptions.hidden = false;
        config.default = this.profile.serverProfile ? this.profile.serverProfile.firstName : this.profile.handle;
      } else if (config.code === 'name' && this.source !== PageId.PROFILE) {
        config.validations = [];
      }
      if (config.code === 'persona') {
        config.default = this.profile.serverProfile ? this.profile.serverProfile.userType : this.profile.profileType;
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
              case 'STATE_LOCATION_LIST': {
                personaConfig.templateOptions.options = this.formLocationFactory.buildStateListClosure(personaConfig, initial);
                break;
              }
              case 'LOCATION_LIST': {
                personaConfig.templateOptions.options = this.formLocationFactory.buildLocationListClosure(personaConfig, initial);
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
  }

  async onFormValueChange(value: any) {
    // if (value['children'] && value['children']['persona']) {
    //   this.currentFormValue = value['children']['persona'];
    // }
  }

  async onDataLoadStatusChange($event) {
    if ('LOADING' === $event) {
      await this.loader.present();
    } else {
      await this.loader.dismiss();
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
}
