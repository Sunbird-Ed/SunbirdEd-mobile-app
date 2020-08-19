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
import { CommonFormsComponent } from '@app/app/components/common-forms/common-forms.component';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { FieldConfig, FieldConfigOptionsBuilder, FieldConfigOption } from '@app/app/components/common-forms/field-config';
import { FormValidationAsyncFactory } from '@app/services/form-validation-async-factory/form-validation-async-factory';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-self-declared-teacher-edit',
  templateUrl: './self-declared-teacher-edit.page.html',
  styleUrls: ['./self-declared-teacher-edit.page.scss'],
})
export class SelfDeclaredTeacherEditPage {

  private profile: ServerProfile;
  private initialExternalIds: any = {};
  private backButtonFunc: Subscription;
  private availableLocationDistrict: string;
  private availableLocationState: string;
  private latestFormValue: any;
  private selectedStateCode: any;

  editType = 'add';
  isFormValid = false;
  stateList: LocationSearchResult[] = [];
  districtList: LocationSearchResult[] = [];
  teacherDetailsForm: FieldConfig<any>[] = [];
  appName = '';

  @ViewChild('commonForms') commonForms: CommonFormsComponent;

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
    this.getTeacherDetailsFormApi(undefined, false);
  }

  async getTeacherDetailsFormApi(rootOrgId?, isFormLoaded?) {

    const req: FormRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      type: 'user',
      subType: 'teacherDetails_v2',
      action: 'submit',
      rootOrgId: rootOrgId || '*',
      component: 'app'
    };

    let formData: any = await this.fetchFormApi(req);
    if (!formData) {
      req.rootOrgId = '*';
      formData = await this.fetchFormApi(req);
    }

    if (formData && formData.form && formData.form.data) {
      const formConfig = formData.form.data.fields;
      if (formConfig.length) {
        this.initializeFormData(formConfig, isFormLoaded);
      }
    }

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
        config.children = config.children.map((childConfig: FieldConfig<any>) => {

          if (childConfig.templateOptions['dataSrc'] && childConfig.templateOptions['dataSrc'].marker === 'LOCATION_LIST') {
            if (childConfig.templateOptions['dataSrc'].params.id === 'state') {
              let stateCode;
              if (this.selectedStateCode) {
                stateCode = this.selectedStateCode;
              } else {
                let stateDetails;
                if (this.profile.externalIds && this.profile.externalIds.length) {
                  stateDetails = this.profile.externalIds.find(eId => eId.idType === childConfig.code);
                }
                stateCode = stateDetails && stateDetails.id;
              }
              if (!isFormLoaded) {
                this.initialExternalIds[childConfig.code] = {
                  name: this.commonUtilService.translateMessage(childConfig.templateOptions.label) || '',
                  value: stateCode
                };
              }
              childConfig.templateOptions.options = this.buildStateListClosure(stateCode);
            } else if (childConfig.templateOptions['dataSrc'].params.id === 'district') {
              let districtDetails;
              if (this.profile.externalIds && this.profile.externalIds.length) {
                districtDetails = this.profile.externalIds.find(eId => eId.idType === childConfig.code);
              }

              if (!isFormLoaded) {
                this.initialExternalIds[childConfig.code] = {
                  name: this.commonUtilService.translateMessage(childConfig.templateOptions.label) || '',
                  value: districtDetails && districtDetails.id
                } ;
              }
              childConfig.templateOptions.options = this.buildDistrictListClosure(districtDetails && districtDetails.id, isFormLoaded);
            }
            return childConfig;
          }

          if (childConfig.asyncValidation) {
            childConfig = this.assignDefaultValue(childConfig, isFormLoaded);

            const telemetryData = {
              type: InteractType.TOUCH,
              subType: '',
              env: Environment.USER,
              pageId: PageId.TEACHER_SELF_DECLARATION,
              id: ''
            };
            const initialValue = this.initialExternalIds[childConfig.code] && this.initialExternalIds[childConfig.code].value;

            if (childConfig.asyncValidation.marker === 'MOBILE_OTP_VALIDATION') {
              telemetryData['id'] = ID.VALIDATE_MOBILE;

              childConfig.asyncValidation.asyncValidatorFactory =
                this.formValidationAsyncFactory.mobileVerificationAsyncFactory(
                  childConfig, this.profile, initialValue, telemetryData
                );
            } else if (childConfig.asyncValidation.marker === 'EMAIL_OTP_VALIDATION') {
              telemetryData['id'] = ID.VALIDATE_EMAIL;
              childConfig.asyncValidation.asyncValidatorFactory =
                this.formValidationAsyncFactory.emailVerificationAsyncFactory(
                  childConfig, this.profile, initialValue, telemetryData
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
        if (this.editType === 'edit') {
          return undefined;
        }
        if (config.templateOptions && config.templateOptions.labelHtml &&
          config.templateOptions.labelHtml.contents) {
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
      if (this.latestFormValue && this.latestFormValue.children.externalIds) {
        childConfig.default = this.latestFormValue.children.externalIds[childConfig.code];
      }
      return childConfig;
    }
    if (this.profile.externalIds && this.profile.externalIds.length) {
      this.profile.externalIds.forEach(eId => {
        if (childConfig.code === eId.idType) {
          childConfig.default = eId.id;
        }
      });
    }

    if (this.editType === 'add') {
      if (childConfig.code === 'declared-phone') {
        childConfig.default = this.profile['maskedPhone'];
      }

      if (childConfig.code === 'declared-email') {
        childConfig.default = this.profile['maskedEmail'];
      }
    }

    if (!isFormLoaded) {
      this.initialExternalIds[childConfig.code] = {
        name: this.commonUtilService.translateMessage(childConfig.templateOptions.label) || '',
        value: childConfig.default || undefined
      };
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

      if (!this.latestFormValue) {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
        return;
      }

      const formValue = this.latestFormValue.children.externalIds;
      const selectdState = this.getStateIdFromCode(formValue['declared-state']);
      const orgDetails: any = await this.frameworkService.searchOrganization({
        filters: {
          locationIds: [selectdState && selectdState.id],
          isRootOrg: true
        }
      }).toPromise();
      if (!orgDetails || !orgDetails.content || !orgDetails.content.length || !orgDetails.content[0].channel) {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
        return;
      }

      const rootOrgId = orgDetails.content[0].channel;

      await loader.present();

      const externalIds = this.removeExternalIdsOnStateChange(rootOrgId);
      this.teacherDetailsForm.forEach(config => {
        if (config.code === 'externalIds' && config.children) {
          config.children.forEach(formData => {

            // no externalIds declared
            if (!this.profile.externalIds || !this.profile.externalIds.length || !this.profile.externalIds.find(eid => {
              return eid.idType === formData.code;
            })) {
              if (formValue[formData.code]) {
                externalIds.push({
                  id: formValue[formData.code],
                  operation: 'add',
                  idType: formData.code,
                  provider: rootOrgId
                });
                return;
              }
            }

            // externalIds declared but removed
            if (!formValue[formData.code] && this.profile.externalIds && this.profile.externalIds.find(eid => {
              return eid.idType === formData.code;
            })) {
              externalIds.push({
                id: 'remove',
                operation: 'remove',
                idType: formData.code,
                provider: rootOrgId
              });
              return;
            }

            // external id declared and modified
            if (formValue[formData.code]) {
              externalIds.push({
                id: formValue[formData.code],
                operation: 'edit',
                idType: formData.code,
                provider: rootOrgId
              });
            }
          });
        }
      });
      const req = {
        userId: this.profile.userId,
        externalIds
      };

      if (this.profile.externalIds && this.profile.externalIds.length) {
        telemetryValue = this.getUpdatedValues(formValue);
      }

      await this.profileService.updateServerProfile(req).toPromise();
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

    for (const data in this.initialExternalIds) {
      if (this.initialExternalIds[data] && this.initialExternalIds[data].value !== null &&
        this.initialExternalIds[data].value !== undefined && this.initialExternalIds[data].value !== formVal[data]) {
        telemetryValue.push(this.initialExternalIds[data].name);
      }
    }

    const fieldsChanged = { fieldsChanged: telemetryValue };

    return fieldsChanged;
  }

  private removeExternalIdsOnStateChange(rootOrgId) {
    const externalIds = [];

    if (this.profile && this.profile.externalIds && this.profile.externalIds.length &&
      this.profile.externalIds[0].provider && this.profile.externalIds[0].provider !== rootOrgId) {
      this.profile.externalIds.forEach(externalId => {
        externalIds.push({ ...externalId, operation: 'remove' });
      });
      this.profile.externalIds = [];
    }

    return externalIds;
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

  private buildStateListClosure(stateCode?): FieldConfigOptionsBuilder<string> {
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

  private buildDistrictListClosure(districtCode?, isFormLoaded?): FieldConfigOptionsBuilder<string> {
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

  formValueChanges(event) {
    this.latestFormValue = event;
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

  formStatusChanges(event) {
    this.isFormValid = event.isValid;
  }

  private getStateIdFromCode(code) {
    if (this.stateList && this.stateList.length) {
      const selectedState = this.stateList.find(state => state.code === code);
      return selectedState;
    }
    return null;
  }

}
