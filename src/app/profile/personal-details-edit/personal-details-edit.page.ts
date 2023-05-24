import { Router } from '@angular/router';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Events } from '../../../util/events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location as loc } from '../../app.constant';
import { LocationSearchCriteria, ProfileService } from '@project-sunbird/sunbird-sdk';
import { Location } from '@angular/common';

@Component({
  selector: 'app-personal-details-edit',
  templateUrl: './personal-details-edit.page.html',
  styleUrls: ['./personal-details-edit.page.scss'],
})
export class PersonalDetailsEditPage implements OnInit {

  private _stateList = [];
  private _districtList = [];

  get stateList() {
    return this._stateList;
  }

  set stateList(v) {
    this._stateList = v;
    this.changeDetectionRef.detectChanges();
  }

  get districtList() {
    return this._districtList;
  }

  set districtList(v) {
    this._districtList = v;
    this.changeDetectionRef.detectChanges();
  }

  profile: any;
  profileEditForm: FormGroup;
  frameworkId: string;
  categories = [];
  btnColor = '#8FC4FF';
  showOnlyMandatoryFields = true;
  editData = true;

  /* Custom styles for the select box popup */
  stateOptions = {
    title: this.commonUtilService.translateMessage('STATE').toLocaleUpperCase(),
    cssClass: 'select-box'
  };
  districtOptions = {
    title: this.commonUtilService.translateMessage('DISTRICT').toLocaleUpperCase(),
    cssClass: 'select-box'
  };
  disableSubmitFlag = false;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    public commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private events: Events,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.profile = this.router.getCurrentNavigation().extras.state.profile;
    }
  }

  async ngOnInit() {
    await this.getStates();
    await this.initializeForm();
  }

  /**
   * Ionic life cycle event - Fires every time page visits
   */
  async ionViewWillEnter() {
    await this.headerService.showHeaderWithBackButton();
  }

  /**
   * Initializes form with default values or empty values
   */

  async initializeForm() {
    let profileName = this.profile.firstName;
    const userState = [];
    const userDistrict = [];
    if (this.profile.lastName) {
      profileName = this.profile.firstName + this.profile.lastName;
    }
    if (this.profile && this.profile.userLocations && this.profile.userLocations.length) {
      for (let i = 0, len = this.profile.userLocations.length; i < len; i++) {
        if (this.profile.userLocations[i].type === 'state') {
          userState.push(this.profile.userLocations[i].id);
          await this.getDistrict(this.profile.userLocations[i].id);
        } else {
          userDistrict.push(this.profile.userLocations[i].id);
        }
      }
    }
    this.profileEditForm = this.fb.group({
      states: userState || [],
      districts: userDistrict || [],
      name: [profileName.trim(), Validators.required],
    });
    this.enableSubmitButton();
  }

  async getStates() {
    let loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      filters: {
        type: loc.TYPE_STATE
      }
    };
    this.profileService.searchLocation(req).subscribe(async (success) => {
      const locations = success;
      loader.dismiss();
      loader = undefined;
      if (locations && Object.keys(locations).length) {
        this.stateList = locations;
      } else {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
      }
    }, async (error) => {
      if (loader) {
        loader.dismiss();
        loader = undefined;
      }
    });
  }

  async getDistrict(parentId: string, resetDistrictFlag?: boolean) {
    let loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req: LocationSearchCriteria = {
      filters: {
        type: loc.TYPE_DISTRICT,
        parentId
      }
    };
    this.profileService.searchLocation(req).subscribe(async (success) => {
      const districtsTemp = success;
      loader.dismiss();
      loader = undefined;
      if (districtsTemp && Object.keys(districtsTemp).length) {
        this.districtList = districtsTemp;
      } else {
        this.districtList = [];
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
      }
      if (resetDistrictFlag) {
        this.profileEditForm.patchValue({
          districts: []
        });
      }
      this.enableSubmitButton();
    }, async (error) => {
      if (loader) {
        loader.dismiss();
        loader = undefined;
      }
    });
  }

  /**
   * It will validate the forms and internally call submit method
   */
  async onSubmit() {
    const formVal = this.profileEditForm.getRawValue();
    if (!formVal.name.trim().length) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NAME_INVALID'), false, 'redErrorToast');
    } else {
      await this.submitForm();
    }
  }

  enableSubmitButton() {
    const formValues = this.profileEditForm.value;
    if ((formValues.states && formValues.states.length && formValues.districts && formValues.districts.length) ||
      (formValues.states && !formValues.states.length && formValues.districts && !formValues.districts.length)) {
      this.disableSubmitFlag = false;
    } else if (formValues.states && formValues.states.length && formValues.districts && !formValues.districts.length) {
      this.disableSubmitFlag = true;
    }
  }

  /**
   * It makes an update API call.
   */
  async submitForm() {
    let loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req = {
      userId: this.profile.userId,
      lastName: ' ',
      firstName: this.validateName(),
      locationCodes: []
    };

    if (this.profileEditForm.value.states && this.profileEditForm.value.states.length) {
      const tempState = this.stateList.find(state => state.id === this.profileEditForm.value.states);
      req.locationCodes.push(tempState.code);
    }
    if (this.profileEditForm.value.districts && this.profileEditForm.value.districts.length) {
      const tempDistrict = this.districtList.find(district => district.id === this.profileEditForm.value.districts);
      if (tempDistrict) {
        req.locationCodes.push(tempDistrict.code);
      }
    }

    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        loader = undefined;
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
        this.events.publish('loggedInProfile:update', req);
        this.location.back();
      }).catch(async () => {
        if (loader) {
          await loader.dismiss();
          loader = undefined;
        }
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
      });
  }

  /**
   *  It will validate the name field.
   */
  validateName() {
    const name = this.profileEditForm.getRawValue().name;
    return name.trim();
  }

}
