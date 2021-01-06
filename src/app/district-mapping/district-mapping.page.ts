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
import { distinctUntilChanged, take, tap } from 'rxjs/operators';
import { FormLocationFactory } from '@app/services/form-location-factory/form-location-factory';
import { FieldConfig } from 'common-form-elements';
import { FormConstants } from '../form.constants';
import { FormGroup } from '@angular/forms';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { Location } from '@angular/common';
import { LocationHandler } from '@app/services/location-handler';
import { locationMapping } from './location_mapping';

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

  showNotNowFlag = false;
  locationFormConfig: FieldConfig<any>[] = [];
  formGroup?: FormGroup;

  private backButtonFunc: Subscription;
  private profile: Profile;
  private presetLocation: { [locationType: string]: LocationSearchResult } = {};
  private currentFormValue = {};
  private loader?: any;

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
    private locationHandler: LocationHandler
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
    this.presetLocation = (await this.locationHandler.getAvailableLocation(this.profile))
      .reduce<{ [code: string]: LocationSearchResult }>((acc, loc) => {
        acc[loc.type] = loc;
        return acc;
      }, {});
    this.initialiseFormData(undefined, true);
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
      const reqs: DeviceRegisterRequest = {
        userDeclaredLocation: {
          ...(Object.keys(this.formGroup.value).reduce((acc, key) => {
            if (this.formGroup.value[key]) {
              locationCodes.push((this.formGroup.value[key] as SbLocation).code);
            }
            return locationCodes;
          }, {})),
        }
      } as any;
      const req = {
        userId: this.appGlobalService.getCurrentUser().uid || this.profile.uid,
        locationCodes
      };
      // if (this.profile) {
      //   req['firstName'] = (this.name.replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '')).trim();
      //   req['lastName'] = '';
      // }
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.updateServerProfile(req).toPromise()
        .then(async () => {
          await loader.dismiss();

          if (!(await this.commonUtilService.isDeviceLocationAvailable())) { // adding the device loc if not available
            await this.saveDeviceLocation();
          }
         // this.generateLocationCaptured(false); // is dirtrict or location edit  = false
          this.commonUtilService.showToast('PROFILE_UPDATE_SUCCESS');
        //  this.disableSubmitButton = true;
          this.events.publish('loggedInProfile:update', req);
          if (this.profile) {
            this.location.back();
          } else {
            if (this.appGlobalService.isJoinTraningOnboardingFlow) {
              window.history.go(-2);
            } else {
                this.router.navigate([`/${RouterLinks.TABS}`]);
            }
         //   this.externalIdVerificationService.showExternalIdVerificationPopup();
          }
        }).catch(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast('PROFILE_UPDATE_FAILED');
          if (this.profile) {
            this.location.back();
          } else {
            this.router.navigate([`/${RouterLinks.TABS}`]);
          //  this.externalIdVerificationService.showExternalIdVerificationPopup();
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
        ...(Object.keys(this.formGroup.value).reduce((acc, key) => {
          if (this.formGroup.value[key]) {
            acc[key] = (this.formGroup.value[key] as SbLocation).name;
            acc[key + 'Id'] = (this.formGroup.value[key] as SbLocation).id;
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
    formRequest: FormRequest = FormConstants.LOCATION_MAPPING,
    initial = false
  ) {
    const personaLocationConfigs: {
      persona: string,
      config: FieldConfig<any>[]
    }[] = await this.formAndFrameworkUtilService.getFormFields(formRequest);
    this.locationFormConfig = [
      {
        "code": "name",
        "type": "input",
        "templateOptions": {
            "placeHolder": "Enter Name",
            "disabled": true,
            "multiple": false
        }
      },
      {
        "code": "persona",
        "type": "nested_select",
        "templateOptions": {
            "placeHolder": "Select Persona",
            "multiple": false,
            "options": personaLocationConfigs.map((c) => ({
              label: c.persona,
              value: c.persona
            }))
        },
        "validations": [
            {
                "type": "required"
            }
        ],
        "children": personaLocationConfigs.reduce<{[persona: string]: FieldConfig<any>[]}>((acc, c) => {
          acc[c.persona] = (c.config || []).map((config) => {
            if (!config.templateOptions['dataSrc']) {
              return config;
            }
            config.default = this.setDefaultConfig(config);
            switch (config.templateOptions['dataSrc']['marker']) {
              case 'STATE_LOCATION_LIST': {
                config.templateOptions.options = this.formLocationFactory.buildStateListClosure(config, initial);
                break;
              }
              case 'LOCATION_LIST': {
                config.templateOptions.options = this.formLocationFactory.buildLocationListClosure(config, initial);
                break;
              }
            }
            return config;
          });

          return acc;
        }, {})
      }
    ] as any;
  }

  private setDefaultConfig(fieldConfig: FieldConfig<any>): SbLocation {
    if (this.currentFormValue[fieldConfig.code]) {
      return this.currentFormValue[fieldConfig.code];
    }
    if (this.presetLocation[fieldConfig.code]) {
      return this.presetLocation[fieldConfig.code];
    }
    return null;
  }

  onFormInitialize(formGroup: FormGroup) {
    this.formGroup = formGroup;
    // formGroup.controls['state'].valueChanges.pipe(
    //   distinctUntilChanged(),
    //   take(1)
    // ).subscribe((value) => {
    //   if (!value) { return; }
    //   this.locationFormConfig = undefined;
    //   this.initialiseFormData({
    //     ...FormConstants.LOCATION_MAPPING,
    //     subType: (value as SbLocation).id,
    //   }).catch((e) => {
    //     console.error(e);
    //     this.initialiseFormData();
    //   });
    // });
  }

  onFormValueChange(value: any) {
    this.currentFormValue = value;
  }

  async onDataLoadStatusChange($event) {
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
    }
    if ('LOADING' === $event) {
      this.loader.present();
    } else {
      this.loader.dismiss();
    }
  }
}
