import { Component, Inject, ChangeDetectorRef, NgZone, ViewChild, AfterViewInit } from '@angular/core';
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
  AuditState,
  ProfileType,
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
import { ContainerService } from '@app/services/container.services';
import { FormLocationFactory } from '@app/services/form-location-factory/form-location-factory';
import { FieldConfig } from 'common-form-elements';
import { FormConstants } from '../form.constants';
import { ProfileHandler } from '@app/services/profile-handler';
import { FormGroup } from '@angular/forms';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { Location } from '@angular/common';
import { FieldConfigOption } from '../components/common-forms/field-config';

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
  private backButtonFunc: Subscription;
  private profile: Profile;
  private currentFormValue = {};

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('FORM_SERVICE') private formService: FormService,
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
    this.initialiseFormData();
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

  private async initialiseFormData(formRequest: FormRequest = {
    type: 'profileConfig',
    subType: 'default',
    action: 'get'
  }) {
    const personaLocationConfigs: {
      persona: string,
      config: FieldConfig<any>[]
    }[] = await this.formService.getForm(formRequest).toPromise().then((v) => v['form']['data']['fields']);
    const personaLocationConfig = personaLocationConfigs.find((c) => c.persona === this.profile.profileType);
    this.locationFormConfig = (personaLocationConfig.config || []).map((c) => {
      if (!c.templateOptions['dataSrc']) {
        return c;
      }

      switch (c.templateOptions['dataSrc']['marker']) {
        case 'STATE_LOCATION_LIST': {
          c.templateOptions.options = this.formLocationFactory.buildStateListClosure();
          break;
        }
        case 'LOCATION_LIST': {
          c.templateOptions.options = this.formLocationFactory.buildLocationListClosure(c.templateOptions['dataSrc']['params']['id']);
          break;
        }
      }
      c.default = this.buildFieldConfigDefault(c);
      return c;
    });
  }

  private buildFieldConfigDefault(fieldConfig: FieldConfig<any>): FieldConfigOption<any> {
    // switch (fieldConfig.code) {
    //   default
    // }
    if (this.currentFormValue[fieldConfig.code]) {
      return this.currentFormValue[fieldConfig.code];
    }
    return null;
  }

  onFormInitialize(formGroup: FormGroup) {
    formGroup.controls['state'].valueChanges.pipe(
      distinctUntilChanged(),
      take(1)
    ).subscribe((value) => {
      if (!value) { return; }
      this.locationFormConfig = undefined;
      this.initialiseFormData({
        type: 'profileConfig',
        subType: (value as SbLocation).id,
        action: 'get'
      }).catch((e) => {
        console.error(e);
        this.initialiseFormData();
      });
    });
  }

  onFormValueChange(value: any) {
    this.currentFormValue = value;
  }

}
