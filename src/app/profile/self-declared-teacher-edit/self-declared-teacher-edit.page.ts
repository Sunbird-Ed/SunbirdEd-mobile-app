import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormConstants } from '../../../app/form.constants';
import { FormAndFrameworkUtilService } from '../../../services/formandframeworkutil.service';
import {
  AuditType,
  CorReleationDataType, Environment,
  ID,
  ImpressionType, InteractSubtype, InteractType,
  PageId
} from '../../../services/telemetry-constants';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ConsentService } from '../../../services/consent-service';
import { FormValidationAsyncFactory } from '../../../services/form-validation-async-factory/form-validation-async-factory';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { ConsentStatus } from '@project-sunbird/client-services/models';
import { FieldConfig } from 'common-form-elements';
import { Subscription } from 'rxjs';
import {
  AuditState,
  Consent, CorrelationData, LocationSearchResult, ProfileService,
  ServerProfile, SharedPreferences,
  TelemetryObject, FrameworkService, OrganizationSearchCriteria
} from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, ProfileConstants } from '../../../app/app.constant';

@Component({
  selector: 'app-self-declared-teacher-edit',
  templateUrl: './self-declared-teacher-edit.page.html',
  styleUrls: ['./self-declared-teacher-edit.page.scss'],
})
export class SelfDeclaredTeacherEditPage {

  private profile: ServerProfile | any;
  private backButtonFunc: Subscription;
  private availableLocationDistrict: string;
  private availableLocationState: string;
  private declaredLatestFormValue: any;
  private tenantPersonaLatestFormValue: any;
  private selectedStateCode: any;

  editType = 'add';
  isDeclarationFormValid = false;
  isTenantPersonaFormValid = false;
  stateList: LocationSearchResult[] = [];
  districtList: LocationSearchResult[] = [];
  teacherDetailsForm: FieldConfig<any>[] = [];
  tenantPersonaForm: FieldConfig<any>[] = [];
  appName = '';
  selectedTenant = '';
  isTenantChanged = false;
  previousOrgId;
  organisationList = [];

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private location: Location,
    private events: Events,
    public platform: Platform,
    private activatedRoute: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formValidationAsyncFactory: FormValidationAsyncFactory,
    private formnFrameworkService: FormAndFrameworkUtilService,
    private consentService: ConsentService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.profile = navigation.extras.state.profile;
    }
    this.editType = this.activatedRoute.snapshot.params['mode'];
  }

  async ionViewWillEnter() {
    this.handleDeviceBackButton();
    await this.headerService.showHeaderWithBackButton();
    await this.checkLocationAvailability();

    this.generateTelemetryInteract(InteractType.SUBMISSION_INITIATED, ID.TEACHER_DECLARATION);

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.TEACHER_SELF_DECLARATION,
      Environment.USER,
    );
  }

  async ionViewDidEnter() {
    this.appName = await this.commonUtilService.getAppName();
    await this.getTenantPersonaForm();
  }

  async getTenantPersonaForm() {
    const searchOrganizationReq: OrganizationSearchCriteria<{ orgName: string, rootOrgId: string}> = {
      filters: {
          isTenant: true
      },
      fields: ['orgName', 'rootOrgId']
  };
    const organisations = (await this.frameworkService.searchOrganization(searchOrganizationReq).toPromise()).content;
    let index = 0;
    this.organisationList = organisations.map((org) => ({
      value: org.rootOrgId,
      label: org.orgName,
      index: index++
    }));
    index = 0;
    const personaTenantFormData: FieldConfig<any>[] = await this.formnFrameworkService.getFormFields(FormConstants.TENANT_PERSONAINFO,
      this.profile.rootOrg.rootOrgId);

    this.selectedTenant = (this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].orgId) || '';

    personaTenantFormData.forEach(config => {
      if (config.code === 'persona') {
        config.default = this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].persona;
      } else if (config.code === 'tenant') {
        config.default = this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].orgId;
      }
    });

    this.tenantPersonaForm = personaTenantFormData;
    this.tenantPersonaForm[0].templateOptions.options = this.organisationList;
    if (this.selectedTenant) {
      await this.initTenantSpecificForm(this.selectedTenant, false);
    }
  }

  async initTenantSpecificForm(rootOrgId?, isFormLoaded?) {
    const formConfig = await this.formnFrameworkService.getFormFields(FormConstants.SELF_DECLARATION, rootOrgId);
    this.translateLabels(formConfig as any);
    if (formConfig.length) {
      await this.initializeFormData(formConfig, isFormLoaded);
    }
  }

  private translateLabels(fieldConfig: FieldConfig<any>[]) {
    fieldConfig.forEach((config) => {
      if (config.templateOptions) {
        config.templateOptions.label = config.templateOptions.label
          ? this.commonUtilService.translateMessage(config.templateOptions.label) : '';
        config.templateOptions.placeHolder = config.templateOptions.placeHolder
          ? this.commonUtilService.translateMessage(config.templateOptions.placeHolder) : '';
      }

      if (config.validations && config.validations.length) {
        config.validations.forEach(validation => {
          validation.message = validation.message ? this.commonUtilService.translateMessage(validation.message) : '';
        });
      }

      if (config.asyncValidation && config.asyncValidation.message) {
        config.asyncValidation.message = this.commonUtilService.translateMessage(config.asyncValidation.message);
      }

      if (config.templateOptions && config.templateOptions.labelHtml && config.templateOptions.labelHtml.values) {
        for (const key in config.templateOptions.labelHtml.values) {
          if (config.templateOptions.labelHtml.values[key]) {
            if (config.code === 'tnc' && key === '$tnc') {
              config.templateOptions.labelHtml.values[key] =
                this.commonUtilService.translateMessage(config.templateOptions.labelHtml.values[key], { '%appName': this.appName });
            }
            if (config.code === 'tnc' && key === '$url') {
              config.templateOptions.labelHtml.values[key] = this.profile.tncLatestVersionUrl || 'TNC_URL';
            }
            config.templateOptions.labelHtml.values[key] =
              this.commonUtilService.translateMessage(config.templateOptions.labelHtml.values[key]);
          }
        }
      }

      if (config.children && config.children.length) {
        this.translateLabels(config.children as FieldConfig<any>[]);
      }
    });
  }

  async initializeFormData(formConfig, isFormLoaded) {

    this.teacherDetailsForm = formConfig.map((config: FieldConfig<any>) => {
      if (config.code === 'externalIds' && config.children) {
        config.children = (config.children as FieldConfig<any>[]).map((childConfig: FieldConfig<any>) => {
          if (childConfig.asyncValidation) {
            childConfig = this.assignDefaultValue(childConfig, false);

            const telemetryData = {
              type: InteractType.TOUCH,
              subType: '',
              env: Environment.USER,
              pageId: PageId.TEACHER_SELF_DECLARATION,
              id: ''
            };

            if (childConfig.asyncValidation.marker === 'MOBILE_OTP_VALIDATION') {
              telemetryData['id'] = ID.VALIDATE_MOBILE;
              childConfig.asyncValidation.asyncValidatorFactory =
                this.formValidationAsyncFactory.mobileVerificationAsyncFactory(
                  childConfig, this.profile, 'initialValue', telemetryData
                );
            } else if (childConfig.asyncValidation.marker === 'EMAIL_OTP_VALIDATION') {
              telemetryData['id'] = ID.VALIDATE_EMAIL;
              childConfig.asyncValidation.asyncValidatorFactory =
                this.formValidationAsyncFactory.emailVerificationAsyncFactory(
                  childConfig, this.profile, 'initialValue', telemetryData
                );
            }
            return childConfig;
          }

          this.assignDefaultValue(childConfig, isFormLoaded);

          return childConfig;
        });
        return config;
      }

      if (config.code === 'tnc' || config.code === 'consentInfo') {
        if (this.editType === 'edit') {
          return undefined;
        }
        return config;
      }

      if (config.code === 'name') {
        config.templateOptions.labelHtml.values['$1'] = this.profile.firstName;
      } else if (config.code === 'state') {
        config.templateOptions.labelHtml.values['$1'] =
          this.availableLocationState || this.commonUtilService.translateMessage('ENTER_LOCATION_FROM_PROFILE_PAGE');
      } else if (config.code === 'district') {
        config.templateOptions.labelHtml.values['$1'] =
          this.availableLocationDistrict || this.commonUtilService.translateMessage('ENTER_LOCATION_FROM_PROFILE_PAGE');
      }

      return config;
    }).filter((formData) => formData);

  }

  private assignDefaultValue(childConfig: FieldConfig<any>, isFormLoaded) {
    if (isFormLoaded) {
      if (this.declaredLatestFormValue && this.declaredLatestFormValue.children.externalIds) {
        childConfig.default = '';
      }
      return childConfig;
    }
    if (this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].info &&
      this.profile.declarations[0].info[childConfig.code]) {
      childConfig.default = this.profile.declarations[0].info[childConfig.code];
    }

    if (this.editType === 'add') {
      if (childConfig.code === 'declared-phone') {
        childConfig.default = this.profile['maskedPhone'];
      }

      if (childConfig.code === 'declared-email') {
        childConfig.default = this.profile['maskedEmail'];
      }
    }

    return childConfig;
  }

  private async checkLocationAvailability() {
    let availableLocationData;
    if (this.profile && this.profile['userLocations'] && this.profile['userLocations'].length) {
      for (const ele of this.profile['userLocations']) {
        if (ele.type === 'district') {
          this.availableLocationDistrict = ele.name;

        } else if (ele.type === 'state') {
          this.availableLocationState = ele.name;
        }
      }
    } else if (await this.commonUtilService.isDeviceLocationAvailable()) {
      availableLocationData = JSON.parse(await this.preferences.getString(PreferenceKey.DEVICE_LOCATION).toPromise());
      this.availableLocationState = availableLocationData.state;
      this.availableLocationDistrict = availableLocationData.district;
    } else if (await this.commonUtilService.isIpLocationAvailable()) {
      availableLocationData = JSON.parse(await this.preferences.getString(PreferenceKey.IP_LOCATION).toPromise());
      this.availableLocationState = availableLocationData.state;
      this.availableLocationDistrict = availableLocationData.district;
    }
  }

  handleDeviceBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
    });
  }

  ionViewWillLeave(): void {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async submit() {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }

    const id = this.editType === 'add' ? ID.SUBMIT_CLICKED : ID.BTN_UPDATE;
    this.generateTelemetryInteract(InteractType.TOUCH, id);

    const loader = await this.commonUtilService.getLoader();
    let telemetryValue;
    try {

      if (!this.declaredLatestFormValue || !this.tenantPersonaLatestFormValue) {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
        return;
      }

      await loader.present();

      const declarations = [];
      const declaredDetails = this.declaredLatestFormValue.children && this.declaredLatestFormValue.children.externalIds;
      Object.keys(declaredDetails).forEach((key) => {
        if (typeof declaredDetails[key] === 'string') {
          declaredDetails[key] = declaredDetails[key].trim();
        }
        if (declaredDetails[key].length === 0 || declaredDetails[key] === null) {
          delete declaredDetails[key];
        }
      });

      let operation = '';
      if (!this.profile.declarations || !this.profile.declarations.length) {
        operation = 'add';
      } else if (this.tenantPersonaLatestFormValue.tenant === this.profile.declarations[0].orgId) {
        operation = 'edit';
      } else if (this.tenantPersonaLatestFormValue.tenant !== this.profile.declarations[0].orgId) {
        const tenantPersonaData = { persona: this.profile.declarations[0].persona, tenant: this.profile.declarations[0].orgId };
        declarations.push(this.getDeclarationReqObject('remove', this.profile.declarations[0].info, tenantPersonaData));
        operation = 'add';
      }
      declarations.push(this.getDeclarationReqObject(operation, declaredDetails, this.tenantPersonaLatestFormValue));

      const req = { declarations };

      if (operation === 'edit' || declarations.length === 2) {
        telemetryValue = this.getUpdatedValues(declaredDetails);
      }

      try {
        await this.profileService.updateServerProfileDeclarations(req).toPromise();
      } catch (e) {

      }

      this.events.publish('loggedInProfile:update');

      this.generateTelemetryInteract(InteractType.SUBMISSION_SUCCESS, ID.TEACHER_DECLARATION, telemetryValue);
      this.location.back();
      const userDetails = await this.profileService.getActiveSessionProfile(
          { requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      if (this.editType === 'add') {
        this.generateTncAudit();
        this.commonUtilService.showToast('THANK_YOU_FOR_SUBMITTING_YOUR_DETAILS');
        this.updateConsent(userDetails, declarations[0].orgId);
      } else if (this.editType === 'edit' && this.isTenantChanged) {
        this.generateTncAudit();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('FRMELEMNTS_MSG_UPDATED_SUCCESSFULLY'));
        this.updateConsent(userDetails, declarations[1].orgId, this.previousOrgId);
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('FRMELEMNTS_MSG_UPDATED_SUCCESSFULLY'));
      }
    } catch (err) {
      console.error(err);
      this.generateTelemetryInteract(InteractType.SUBMISSION_FAILURE, ID.TEACHER_DECLARATION, telemetryValue);
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
    } finally {
      await loader.dismiss();
    }
  }

  private getDeclarationReqObject(operation, declaredDetails, tenantPersonaDetails) {
    return {
      operation,
      userId: this.profile.userId,
      orgId: tenantPersonaDetails.tenant,
      persona: tenantPersonaDetails.persona,
      info: declaredDetails
    };
  }

  generateTelemetryInteract(type, id, value?) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      type,
      this.editType === 'add' ? InteractSubtype.NEW : InteractSubtype.EXISTING,
      Environment.USER,
      PageId.TEACHER_SELF_DECLARATION,
      undefined,
      value || undefined,
      undefined,
      undefined,
      id
    );
  }

  getUpdatedValues(formVal) {
    const telemetryValue = [];

    for (const key in formVal) {
      if (this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].info &&
        this.profile.declarations[0].info[key] !== formVal[key]) {
        telemetryValue.push(key);
      }
    }

    const fieldsChanged = { fieldsChanged: telemetryValue };

    return fieldsChanged;
  }

  private generateTncAudit() {
    const corRelationList: Array<CorrelationData> = [{ id: PageId.TEACHER_SELF_DECLARATION, type: CorReleationDataType.FROM_PAGE }];
    const telemetryObject = new TelemetryObject(ID.DATA_SHARING, 'TnC', this.profile.tncLatestVersion);
    this.telemetryGeneratorService.generateAuditTelemetry(
      Environment.USER,
      AuditState.AUDIT_UPDATED,
      [],
      AuditType.TNC_DATA_SHARING,
      telemetryObject.id,
      telemetryObject.type,
      telemetryObject.version,
      corRelationList
    );
  }

  private getStateIdFromCode(code) {
    if (this.stateList && this.stateList.length) {
      const selectedState = this.stateList.find(state => state.code === code);
      return selectedState;
    }
    return null;
  }

  async tenantPersonaFormValueChanges(event) {
    this.tenantPersonaLatestFormValue = event;
    if (event && event.tenant) {
      if (!this.selectedTenant) {
        this.selectedTenant = event.tenant;
        await this.initTenantSpecificForm(this.selectedTenant, false);
      } else if (event.tenant !== this.selectedTenant) {
        this.previousOrgId = this.selectedTenant;
        this.selectedTenant = event.tenant;
        this.isTenantChanged = true;
        await this.initTenantSpecificForm(this.selectedTenant, true);
      }
    }
  }

  async declarationFormValueChanges(event) {
    this.declaredLatestFormValue = event;
    if (event && event.children && event.children.externalIds) {
      if (!this.selectedStateCode && event.children.externalIds['declared-state']) {
        this.selectedStateCode = event.children.externalIds['declared-state'];
      }
      if (event.children.externalIds['declared-state'] &&
        this.selectedStateCode && this.selectedStateCode !== event.children.externalIds['declared-state']) {
        this.selectedStateCode = event.children.externalIds['declared-state'];
        const selectedState = this.getStateIdFromCode(this.selectedStateCode);
        await this.initTenantSpecificForm(selectedState && selectedState.id, true);
      }
    }
  }

  tenantPersonaFormStatusChanges(event) {
    this.isTenantPersonaFormValid = event.isValid || event.valid;
  }

  declarationFormStatusChanges(event) {
    this.isDeclarationFormValid = event.isValid;
  }

  linkClicked(event) {
    this.commonUtilService.openLink(event);
  }
  public updateConsent(profileDetails, currentOrgId, previousOrgId?) {
    // for edit and if tenantChanged
    if (this.isTenantChanged) {
      const req: Consent = {
        status: ConsentStatus.REVOKED,
        userId: profileDetails.uid,
        consumerId: previousOrgId,
        objectId: previousOrgId,
        objectType: 'Organisation'
      };
      this.profileService.updateConsent(req).toPromise()
          .then((response) => {
            if (response && response.consent) {
              const request: Consent = {
                status: ConsentStatus.ACTIVE,
                userId: profileDetails.uid,
                consumerId: currentOrgId,
                objectId: currentOrgId,
                objectType: 'Organisation'
              };
              this.profileService.updateConsent(request).toPromise()
                  .catch((e) => {
                    if (e.code === 'NETWORK_ERROR') {
                      this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
                    }
                  });
            }
          })
          .catch((e) => {
            if (e.code === 'NETWORK_ERROR') {
              this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
            }
          });
    } else {
      // for add and updateConsent first time
      const request: Consent = {
        status: ConsentStatus.ACTIVE,
        userId: profileDetails.uid,
        consumerId: currentOrgId,
        objectId: currentOrgId,
        objectType: 'Organisation'
      };
      this.profileService.updateConsent(request).toPromise()
          .catch((e) => {
            if (e.code === 'NETWORK_ERROR') {
              this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
            }
          });
    }
  }
}
