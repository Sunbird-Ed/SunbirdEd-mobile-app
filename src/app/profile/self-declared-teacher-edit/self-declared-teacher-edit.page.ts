import {Component, Inject, NgZone, ViewChild} from '@angular/core';
import {
  LocationSearchCriteria, ProfileService,
  SharedPreferences, Profile, LocationSearchResult, CachedItemRequestSourceFrom, FormRequest, FormService, FrameworkService
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey } from '../../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService, ID, TelemetryGeneratorService, InteractType, Environment, InteractSubtype, PageId, ImpressionType } from '@app/services';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Events, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { CommonFormsComponent } from '@app/app/components/common-forms/common-forms.component';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';

@Component({
  selector: 'app-self-declared-teacher-edit',
  templateUrl: './self-declared-teacher-edit.page.html',
  styleUrls: ['./self-declared-teacher-edit.page.scss'],
})
export class SelfDeclaredTeacherEditPage {

  private formValue: any;
  private profile: any;
  private initialExternalIds: any;
  private backButtonFunc: Subscription;
  private availableLocationDistrict: string;
  private availableLocationState: string;

  editType = 'add';
  isFormValid = false;
  stateList: LocationSearchResult[] = [];
  districtList: LocationSearchResult[] = [];
  teacherDetailsForm = [];
  formInitilized = false;

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
    private appGlobalService: AppGlobalService,
    private events: Events,
    private platform: Platform,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
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

  ionViewDidEnter() {
    this.getTeacherDetailsFormApi();
  }

  async getTeacherDetailsFormApi(rootOrgId?) {

    const req: FormRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      type: 'user',
      subType: 'teacherDetails',
      action: 'submit',
      rootOrgId: rootOrgId || '*'
    };

    let formData: any = await this.fetchFormApi(req);
    if (!formData) {
      req.rootOrgId = '*';
      formData = await this.fetchFormApi(req);
    }

    if (formData && formData.form && formData.form.data) {
      const data = formData.form.data.fields;
      if (data.length) {
        this.formInitilized = false;
        setTimeout(() => {
          this.teacherDetailsForm = data;
          this.formInitilized = true;
        }, 100);
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

  async onCommonFormInitialized(event) {
    this.initializeFormData();
    if (!this.stateList || !this.stateList.length) {
      await this.getStates();
    }
  }

  initializeFormData() {
    if (this.profile && this.profile.externalIds && this.profile.externalIds.length) {
      this.initialExternalIds = {};
      this.profile.externalIds.forEach((externalData) => {
        this.teacherDetailsForm.forEach((formData) => {
          this.initialExternalIds[formData.code] = {
            name: this.commonUtilService.translateMessage(formData.templateOptions.label) || '',
            value: (this.initialExternalIds[formData.code] && this.initialExternalIds[formData.code].value) ?
            this.initialExternalIds[formData.code].value : '',
          };
          if (formData.code === externalData.idType) {
            this.commonForms.commonFormGroup.patchValue({
              [formData.code]: externalData.id
            });
            this.initialExternalIds[formData.code] = {
              name: formData.templateOptions.label || '',
              value: externalData.id
            };
          }
        });
      });
    }
    if (this.stateList && this.stateList.length && this.formValue.state) {
      const formStateList = [];
      this.stateList.forEach(stateData => {
        formStateList.push({ label: stateData.name, value: stateData.id });
      });
      this.commonForms.initilizeFormData({ code: 'state', path: ['templateOptions', 'options'], value: formStateList });
      this.commonForms.commonFormGroup.patchValue({
        state: this.formValue.state
      });
      this.getDistrict(this.formValue.state);
    }
  }

  async checkLocationAvailability() {
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

          const formStateList = [];
          this.stateList.forEach(stateData => {
            formStateList.push({ label: stateData.name, value: stateData.id });
          });

          this.commonForms.initilizeFormData({ code: 'state', path: ['templateOptions', 'options'], value: formStateList });

          if ((this.formValue && this.formValue.state) || this.availableLocationState) {
            const state = this.stateList.find(s => (s.id === (this.formValue && this.formValue.state) || s.name === this.availableLocationState));
            this.commonForms.initilizeInputData({ code: 'state', value: state.id });
            if (state) {
              await this.getDistrict(state.id);
            }
          }
        } else {
          this.districtList = [];
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
          this.districtList = success;

          const formDistrictList = [];
          this.districtList.forEach(districtData => {
            formDistrictList.push({ label: districtData.name, value: districtData.id });
          });
          this.commonForms.initilizeFormData({ code: 'district', path: ['templateOptions', 'options'], value: formDistrictList });

          if (this.availableLocationDistrict) {
            const district = this.districtList.find(d => d.name === this.availableLocationDistrict);
            if (district) {
              this.commonForms.initilizeInputData({ code: 'district', value: district.id });
            } else {
              this.commonForms.initilizeInputData({ code: 'district', value: '' });
            }
          }
          await loader.dismiss();
        } else {
          this.availableLocationDistrict = '';
          await loader.dismiss();
          this.districtList = [];
          this.commonUtilService.showToast('NO_DATA_FOUND');
        }
      });
    }, async (error) => {
      await loader.dismiss();
    });
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

      if (!this.commonForms && !this.commonForms.commonFormGroup && !this.commonForms.commonFormGroup.value) {
        return;
      }

      await loader.present();
      const formValue = this.commonForms.commonFormGroup.value;
      const orgDetails = this.frameworkService.searchOrganization({ filters: { locationIds: [formValue.state] } }).toPromise();

      console.log(orgDetails);
      const stateCode = this.stateList.find(state => state.id === formValue.state).code;
      const districtCode = this.districtList.find(district => district.id === formValue.district).code;

      const externalIds = [];
      this.teacherDetailsForm.forEach(formData => {
        if (formData.code !== 'state' && formData.code !== 'district') {
          // no externalIds declared
          if (!this.profile.externalIds || !this.profile.externalIds.length || !this.profile.externalIds.find(eid => {
            return eid.idType === formValue[formData.code];
          })) {
            if (formValue[formData.code]) {
              externalIds.push({
                id: formValue[formData.code],
                operation: 'add',
                idType: formData.code,
                provider: 'ROOT_ORG'
              });
              return;
            }
          }

          // externalIds declared but removed
          if (!formValue[formData.code] && this.profile.externalIds && this.profile.externalIds.find(eid => {
            return eid.idType === formValue[formData.code];
          })) {
            externalIds.push({
              id: 'abc',
              operation: 'remove',
              idType: formData.code,
              provider: 'ROOT_ORG'
            });
            return;
          }

          // external id declared and modified
          if (formValue[formData.code]) {
            externalIds.push({
              id: formValue[formData.code],
              operation: 'edit',
              idType: formData.code,
              provider: 'ROOT_ORG'
            });
          }
        }
      });
      const req = {
        userId: this.profile.userId || this.profile.id,
        locationCodes: [stateCode, districtCode],
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
        this.showAddedSuccessfullPopup();
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('UPDATED_SUCCESSFULLY'));
      }
    } catch (err) {
      console.error(err);
      this.generateTelemetryInteract(InteractType.SUBMISSION_FAILURE, ID.TEACHER_DECLARATION, telemetryValue);
      this.commonUtilService.showToast('Something went wrong.');
    } finally{
      await loader.dismiss();
    }
  }

  onFormDataChange(event) {
    if (event) {
      if (event.value && this.formValue && event.value.state !== this.formValue.state) {
        this.getTeacherDetailsFormApi(event.value.state);
      }

      if (event.value) {
        this.formValue = event.value;
      }
      this.isFormValid = event.valid;
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

    if (data && data.canDelete) {
      console.log(data);
    }
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
    const map = new Map();

    this.profile.userLocations.forEach(ele => {
      if (ele.type === 'state' && ele.id !== formVal.state) {
        telemetryValue.push('State');
      }
      if (ele.type === 'district' && ele.id !== formVal.district) {
        telemetryValue.push('District');
      }
    });

    console.log(this.initialExternalIds);
    for (const data in this.initialExternalIds) {
      if (data !== 'state' && data !== 'district' && this.initialExternalIds[data].value !== formVal[data]) {
        telemetryValue.push(this.initialExternalIds[data].name);
      }
    }

    return telemetryValue.length ? map.set('fieldsChanged', telemetryValue) : undefined;
  }

}
