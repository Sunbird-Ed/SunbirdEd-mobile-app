import {Component, Inject, NgZone, ViewChild} from '@angular/core';
import {
  LocationSearchCriteria, ProfileService,
  SharedPreferences, Profile, LocationSearchResult, CachedItemRequestSourceFrom, FormRequest, FormService
} from 'sunbird-sdk';
import { Location as loc, PreferenceKey } from '../../../app/app.constant';
import { AppHeaderService, CommonUtilService, AppGlobalService } from '@app/services';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Events, IonSelect } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { CommonFormsComponent } from '@app/app/components/common-forms/common-forms.component';

@Component({
  selector: 'app-self-declared-teacher-edit',
  templateUrl: './self-declared-teacher-edit.page.html',
  styleUrls: ['./self-declared-teacher-edit.page.scss'],
})
export class SelfDeclaredTeacherEditPage {
  @ViewChild('stateSelect') stateSelect?: IonSelect;
  @ViewChild('districtSelect') districtSelect?: IonSelect;

  private _showStates?: boolean;
  private _showDistrict?: boolean;
  private _stateName: string;
  private _districtName: string;
  private formValue: any;

  private profile: any;
  rootOrgId = '';
  editType = 'add';
  isFormValid = false;
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
  isLocationChanged = false;
  disableSubmitButton = false;

  @ViewChild('commonForms') commonForms: CommonFormsComponent;
  teacherDetailsForm = [];
  formInitilized = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('FORM_SERVICE') private formService: FormService,
    public headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    public router: Router,
    public location: Location,
    public appGlobalService: AppGlobalService,
    public events: Events,
    public platform: Platform,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.profile = navigation.extras.state.profile;
    }
    this.editType = this.activatedRoute.snapshot.params['mode'];
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
    this.ngZone.run(async () => {
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

  async ionViewWillEnter() {
    this.handleDeviceBackButton();
    this.headerService.showHeaderWithBackButton();
    await this.checkLocationAvailability();
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
        this.rootOrgId = req.rootOrgId;
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
      this.profile.externalIds.forEach((externalData) => {
        this.teacherDetailsForm.forEach((formData) => {
          if (formData.code === externalData.idType) {
            this.commonForms.commonFormGroup.patchValue({
              [formData.code]: externalData.id
            });
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
    }
  }

  async checkLocationAvailability() {
    let stateId;
    if (this.profile) {
      this.isAutoPopulated = true;
      if (this.profile['userLocations'] && this.profile['userLocations'].length) {
        for (const ele of this.profile['userLocations']) {
          if (ele.type === 'district') {
            this.availableLocationDistrict = ele.name;

          } else if (ele.type === 'state') {
            stateId = ele.id || null;
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
        this.location.back();
      });
    }
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
              await this.getState(state.name, state.id, state.code);
            } else {
              this.stateName = '';
            }
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

          const formDistrictList = [];
          this.districtList.forEach(districtData => {
            formDistrictList.push({ label: districtData.name, value: districtData.id });
          });
          this.commonForms.initilizeFormData({ code: 'district', path: ['templateOptions', 'options'], value: formDistrictList });

          if (this.availableLocationDistrict) {
            this.districtName = this.availableLocationDistrict;
            const district = this.districtList.find(d => d.name === this.availableLocationDistrict);
            if (district) {
              this.commonForms.initilizeInputData({ code: 'district', value: district.id });
            } else {
              this.commonForms.initilizeInputData({ code: 'district', value: '' });
            }
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

  async submit() {
    try {

      if (!this.commonForms && !this.commonForms.commonFormGroup && !this.commonForms.commonFormGroup.value) {
        return;
      }
      const formValue = this.commonForms.commonFormGroup.value;

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
          if (!formValue[formData.code] && this.profile.externalIds.find(eid => {
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
      await this.profileService.updateServerProfile(req).toPromise();
      this.events.publish('loggedInProfile:update');
      this.location.back();
      const message = (this.editType === 'add') ? 'Added Successfully' : 'Updated Successfully'
      this.commonUtilService.showToast(message);
    } catch (err) {
      console.error(err);
      this.commonUtilService.showToast('Something went wrong.');

    }

  }

  onFormDataChange(event) {
    if (event) {
      if (event.value && this.formValue && event.value.state !== this.formValue.state) {
        this.getDistrict(event.value.state);
        this.getTeacherDetailsFormApi(event.value.state);
      }

      if (event.value) {
        this.formValue = event.value;
      }
      this.isFormValid = event.valid;
    }
  }

}
