import {Component, Inject, ViewChild} from '@angular/core';
import {
  LocationSearchCriteria,
  ProfileService,
  SharedPreferences,
  LocationSearchResult,
  CachedItemRequestSourceFrom,
  FormRequest,
  FormService,
  FrameworkService,
  AuditState,
  CorrelationData,
  TelemetryObject,
  ServerProfile
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey } from '../../../app/app.constant';
import {
  AppHeaderService,
  CommonUtilService,
  AppGlobalService,
  ID,
  TelemetryGeneratorService,
  InteractType,
  Environment,
  InteractSubtype,
  PageId,
  ImpressionType,
  AuditType,
  CorReleationDataType
} from '@app/services';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Events, PopoverController } from '@ionic/angular';
import { Subscription, of, defer } from 'rxjs';
import { Platform } from '@ionic/angular';
// import { CommonFormsComponent } from '@app/app/components/common-forms/common-forms.component';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { FormValidationAsyncFactory } from '@app/services/form-validation-async-factory/form-validation-async-factory';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { FieldConfig, FieldConfigOptionsBuilder, FieldConfigOption } from 'common-form-elements/lib/common-form-config';

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
  selectedTenant: string = '';
  

  // @ViewChild('commonForms') commonForms: CommonFormsComponent;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('FORM_SERVICE') private formService: FormService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private location: Location,
    private events: Events,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formValidationAsyncFactory: FormValidationAsyncFactory,
    private appVersion: AppVersion
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.profile = navigation.extras.state.profile;
    }
    this.editType = this.activatedRoute.snapshot.params['mode'];
  }

  async ionViewWillEnter() {
    this.handleDeviceBackButton();
    this.headerService.showHeaderWithBackButton();
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
    this.appName = await this.appVersion.getAppName();
    this.getTenantPersonaForm();
  }

  async getTenantPersonaForm() {
    const personaTenantFormData: FieldConfig<any>[] = await this.getFormApiData('user', 'personaTenant', 'list');
    if (this.profile && this.profile.declarations && this.profile.declarations.length) {
      this.selectedTenant = this.profile.declarations[0].orgId;

      personaTenantFormData.forEach(config => {
        if (config.code === 'persona') {
          config.default = this.profile.declarations[0].persona;
        } else if (config.code === 'tenant') {
          config.default = this.profile.declarations[0].orgId;
        } else if (config.code === 'name') {
          config.templateOptions.labelHtml.values['$1'] = this.profile.firstName;
        } else if (config.code === 'state') {
          config.templateOptions.labelHtml.values['$1'] = this.availableLocationState || 'Enter location from Profile page'
        } else if (config.code === 'district') {
          config.templateOptions.labelHtml.values['$1'] = this.availableLocationDistrict || 'Enter location from Profile page'
        }
      });
    }

    this.tenantPersonaForm = personaTenantFormData;

    console.log(this.tenantPersonaForm);
    this.getTeacherDetailsFormApi(this.selectedTenant, false);
  }

  async getTeacherDetailsFormApi(rootOrgId?, isFormLoaded?) {
    const formConfig = await this.getFormApiData('user', 'teacherDetails_v3', 'submit', rootOrgId);
    this.translateLabels(formConfig as any);
    if (formConfig.length) {
      this.initializeFormData(formConfig, isFormLoaded);
    }
  }

  private translateLabels(fieldConfig: FieldConfig<any>[]) {
    fieldConfig.forEach((config) => {
      if (config.templateOptions) {
        config.templateOptions.label = config.templateOptions.label ? this.commonUtilService.translateMessage(config.templateOptions.label) : '';
        config.templateOptions.placeHolder = config.templateOptions.placeHolder ? this.commonUtilService.translateMessage(config.templateOptions.placeHolder) : '';
      }

      if (config.validations && config.validations.length) {
        config.validations.forEach(validation => {
          validation.message = validation.message ? this.commonUtilService.translateMessage(validation.message) : '';
        });
      }

      if (config.asyncValidation && config.asyncValidation.message) {
        config.asyncValidation.message = this.commonUtilService.translateMessage(config.asyncValidation.message)
      }

      if (config.children && config.children.length) {
        this.translateLabels(config.children as FieldConfig<any>[]);
      }
    });
  }

  private async fetchFormApi(req) {
    return await this.formService.getForm(req).toPromise().then(res => {
      return res;
    }).catch(err => {
      return null;
    });
  }

  async initializeFormData(formConfig, isFormLoaded) {

    this.teacherDetailsForm = formConfig.map((config: FieldConfig<any>) => {
      if (config.code === 'externalIds' && config.children) {
        config.children = (config.children as FieldConfig<any>[]).map((childConfig: FieldConfig<any>) => {

          if (childConfig.templateOptions['dataSrc'] && childConfig.templateOptions['dataSrc'].marker === 'LOCATION_LIST') {
            if (childConfig.templateOptions['dataSrc'].params.id === 'state') {
              let stateCode;
              if (this.selectedStateCode) {
                stateCode = this.selectedStateCode;
              } else {
                let stateDetails;
                if(this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].info &&
                  this.profile.declarations[0].info[childConfig.code]) {
                  stateDetails = this.profile.declarations[0].info[childConfig.code]
                }
                stateCode = stateDetails && stateDetails.id;
              }
              childConfig.templateOptions.options = this.buildStateListClosure(stateCode);
            } else if (childConfig.templateOptions['dataSrc'].params.id === 'district') {
              let districtDetails;
              if(this.profile.declarations && this.profile.declarations.length && this.profile.declarations[0].info &&
                this.profile.declarations[0].info[childConfig.code]) {
                  districtDetails = this.profile.declarations[0].info[childConfig.code]
              }
              childConfig.templateOptions.options = this.buildDistrictListClosure(districtDetails && districtDetails.id, isFormLoaded);
            }
            return childConfig;
          }

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

      if (config.code === 'tnc') {
        // if (this.editType === 'edit') {
        //   return undefined;
        // }
        if (config.templateOptions && config.templateOptions.labelHtml &&
          config.templateOptions.labelHtml.contents) {
          for (let key in config.templateOptions.labelHtml.values) {
            config.templateOptions.labelHtml.values[key] =
              this.commonUtilService.translateMessage(config.templateOptions.labelHtml.values[key]);
          }
          config.templateOptions.labelHtml.values['$url'] = this.profile.tncLatestVersionUrl;
          config.templateOptions.labelHtml.values['$appName'] = ' ' + this.appName + ' ';
          return config;
        }
        return config;
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
      childConfig.default = this.profile.declarations[0].info[childConfig.code]
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
    let stateId;
    let availableLocationData;
    if (this.profile && this.profile['userLocations'] && this.profile['userLocations'].length) {
      for (const ele of this.profile['userLocations']) {
        if (ele.type === 'district') {
          this.availableLocationDistrict = ele.name;

        } else if (ele.type === 'state') {
          stateId = ele.id || null;
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

      const formValue = this.declaredLatestFormValue.children.externalIds;

      await loader.present();

      const declarations = [];
      const declaredDetails = this.declaredLatestFormValue.children && this.declaredLatestFormValue.children.externalIds;
      let operation = '';
      if (!this.profile.declarations || !this.profile.declarations.length) {
        operation = 'add'
      } else if (this.tenantPersonaLatestFormValue.tenant === this.profile.declarations[0].orgId) {
        operation = 'edit'
      } else if (this.tenantPersonaLatestFormValue.tenant !== this.profile.declarations[0].orgId) {
        const tenantPersonaData = { persona: this.profile.declarations[0].persona, tenant: this.profile.declarations[0].orgId }
        declarations.push(this.getDeclarationReqObject('remove', this.profile.declarations[0].info, tenantPersonaData));
        operation = 'add'
      }
      declarations.push(this.getDeclarationReqObject(operation, declaredDetails, this.tenantPersonaLatestFormValue));

      const req = { declarations };

      if (operation === 'edit' || declarations.length === 2) {
        telemetryValue = this.getUpdatedValues(declaredDetails);
      }

      await this.profileService.updateServerProfileDeclarations(req).toPromise();
      this.events.publish('loggedInProfile:update');

      this.generateTelemetryInteract(InteractType.SUBMISSION_SUCCESS, ID.TEACHER_DECLARATION, telemetryValue);
      this.location.back();
      if (this.editType === 'add') {
        this.generateTncAudit();
        this.showAddedSuccessfullPopup();
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('UPDATED_SUCCESSFULLY'));
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
    }
  }

  async showAddedSuccessfullPopup() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverHeading: this.commonUtilService.translateMessage('THANK_YOU_FOR_SUBMITTING_YOUR_DETAILS'),
        sbPopoverInfo: this.commonUtilService.translateMessage('YOU_CAN_EDIT_TEACHER_INFO'),
        showCloseBtn: false,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OK'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover success',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();

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

  private buildStateListClosure(stateCode?): any {
    return (formControl: FormControl, _: FormControl, notifyLoading, notifyLoaded) => {
      return defer(async () => {

        const formStateList: FieldConfigOption<string>[] = [];
        let selectedState;

        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        const req: LocationSearchCriteria = {
          from: CachedItemRequestSourceFrom.SERVER,
          filters: {
            type: loc.TYPE_STATE
          }
        };
        try {
          const locations = await this.profileService.searchLocation(req).toPromise();

          if (locations && Object.keys(locations).length) {
            this.stateList = locations;

            this.stateList.forEach(stateData => {
              formStateList.push({ label: stateData.name, value: stateData.code });
            });

            if (this.editType === 'add' && this.availableLocationState) {
              selectedState = this.stateList.find(s =>
                (s.name === this.availableLocationState)
              );
            }

            setTimeout(() => {
              formControl.patchValue(stateCode || (selectedState && selectedState.code) || null);
            }, 0);

          } else {
            this.commonUtilService.showToast('NO_DATA_FOUND');
          }
        } catch (e) {
          console.log(e);
        } finally {
          loader.dismiss();
        }
        return formStateList;
      });
    };
  }

  private buildDistrictListClosure(districtCode?, isFormLoaded?): any {
    return (formControl: FormControl, contextFormControl: FormControl, notifyLoading, notifyLoaded) => {
      if (!contextFormControl) {
        return of([]);
      }

      return contextFormControl.valueChanges.pipe(
        distinctUntilChanged(),
        tap(() => {
          formControl.patchValue(null);
        }),
        switchMap((value) => {
          return defer(async () => {
            const formDistrictList: FieldConfigOption<string>[] = [];
            let selectedDistrict;

            const loader = await this.commonUtilService.getLoader();
            await loader.present();

            const selectdState = this.getStateIdFromCode(contextFormControl.value);

            const req: LocationSearchCriteria = {
              from: CachedItemRequestSourceFrom.SERVER,
              filters: {
                type: loc.TYPE_DISTRICT,
                parentId: selectdState && selectdState.id
              }
            };
            try {
              const districtList = await this.profileService.searchLocation(req).toPromise();

              if (districtList && Object.keys(districtList).length) {
                this.districtList = districtList;

                this.districtList.forEach(districtData => {
                  formDistrictList.push({ label: districtData.name, value: districtData.code });
                });

                if (!isFormLoaded) {
                  if (this.editType === 'add' && this.availableLocationDistrict) {
                    selectedDistrict = this.districtList.find(s =>
                      (s.name === this.availableLocationDistrict)
                    );
                  }

                  setTimeout(() => {
                    formControl.patchValue(districtCode || (selectedDistrict && selectedDistrict.code) || null);
                  }, 0);
                } else {
                  setTimeout(() => {
                    formControl.patchValue(null);
                  }, 0);
                }

              } else {
                this.availableLocationDistrict = '';
                this.districtList = [];
                this.commonUtilService.showToast('NO_DATA_FOUND');
              }
            } catch (e) {
              console.log(e);
            } finally {
              loader.dismiss();
            }
            return formDistrictList;
          });
        })
      );
    };
  }

  private getStateIdFromCode(code) {
    if (this.stateList && this.stateList.length) {
      const selectedState = this.stateList.find(state => state.code === code);
      return selectedState;
    }
    return null;
  }

  tenantPersonaFormValueChanges(event) {
    this.tenantPersonaLatestFormValue = event;
    console.log(event);
    if (event.tenant && event.tenant !== this.selectedTenant) {
      this.selectedTenant = event.tenant;
      this.getTeacherDetailsFormApi(this.selectedTenant, true);
    }
  }

  declarationFormValueChanges(event) {
    this.declaredLatestFormValue = event;
    if (event && event.children && event.children.externalIds) {
      if (!this.selectedStateCode && event.children.externalIds['declared-state']) {
        this.selectedStateCode = event.children.externalIds['declared-state'];
      }
      if (event.children.externalIds['declared-state'] && this.selectedStateCode && this.selectedStateCode !== event.children.externalIds['declared-state']) {
        this.selectedStateCode = event.children.externalIds['declared-state'];
        const selectedState = this.getStateIdFromCode(this.selectedStateCode);
        this.getTeacherDetailsFormApi(selectedState && selectedState.id, true);
      }
    }
  }

  tenantPersonaFormStatusChanges(event) {
    this.isTenantPersonaFormValid = event.isValid;
    console.log('TENANT_FORM', event && event.isValid);
  }

  declarationFormStatusChanges(event) {
    this.isDeclarationFormValid = event.isValid;
    console.log('DECLARE_FORM', event && event.isValid);
  }

  linkClicked(event) {
    console.log(event);
    this.commonUtilService.openLink(event);
  }

  async getFormApiData(type: string, subType: string, action: string, rootOrgId?: string) {
    const formReq: FormRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      type,
      subType,
      action,
      rootOrgId: rootOrgId || '*',
      component: 'app'
    };

    let formData: any = await this.fetchFormApi(formReq);
    if (!formData) {
      formReq.rootOrgId = '*';
      formData = await this.fetchFormApi(formReq);
    }
    return (formData && formData.form && formData.form.data) || [];
  }

}
