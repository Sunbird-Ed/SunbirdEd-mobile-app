
import { Subscription } from 'rxjs';
import { Component, Inject, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  Profile,
  ProfileService,
  SharedPreferences,
  CorrelationData,
  FormService,
  CachedItemRequestSourceFrom,
} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { Location } from '@angular/common';
import { AddManagedProfileRequest } from '@project-sunbird/sunbird-sdk/profile/def/add-managed-profile-request';
import { CommonFormsComponent } from '../../../app/components/common-forms/common-forms.component';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { Environment, InteractType, ID, PageId, CorReleationDataType, ImpressionType } from '../../../services/telemetry-constants';
import { ProfileConstants } from '../../../app/app.constant';
import {LocationHandler} from '../../../services/location-handler';
import { FormAndFrameworkUtilService } from '../../../services/formandframeworkutil.service';
import { FormConstants } from '../../../app/form.constants';

@Component({
  selector: 'app-sub-profile-edit',
  templateUrl: './sub-profile-edit.page.html',
  styleUrls: ['./sub-profile-edit.page.scss'],
  providers: [LocationHandler]
})
export class SubProfileEditPage {

  private profile: Profile;
  private appName = '';
  private formValue: any;
  private backButtonFunc: Subscription;
  private headerObservable: any;

  public isFormValid = false;

  formInitilized = false;

  @ViewChild('commonForms', { static: false }) commonForms: CommonFormsComponent;

  managedUserFormList: any = [];

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    @Inject('FORM_SERVICE') private formService: FormService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private location: Location,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private locationHandler: LocationHandler,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService
  ) {
    this.profile = this.appGlobalService.getCurrentUser();

    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    }).catch(() => {});
  }

  async ionViewWillEnter() {
    await this.headerService.showHeaderWithBackButton();
    this.handleBackButtonEvents();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.CREATE_MANAGED_USER,
      Environment.USER,
    );
  }

  ionViewWillLeave() {
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  ionViewDidEnter() {
    this.getCreateManagedUserFormApi();
  }

  getCreateManagedUserFormApi() {
    this.formAndFrameworkUtilService.getFormFields(FormConstants.MANAGED_USER).then((data) => {
      if (data.length) {
        this.managedUserFormList = data;
        this.initializeFormData();
        console.log('this.managedUserFormList', this.managedUserFormList);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  initializeFormData() {
    for (let index = 0; index < this.managedUserFormList.length; index++) {
      const formDetails: any = this.managedUserFormList[index];
      if (formDetails.code === 'tnc' && formDetails.templateOptions && formDetails.templateOptions.labelHtml &&
        formDetails.templateOptions.labelHtml.contents) {
          formDetails.templateOptions.labelHtml.values['$url'] = this.profile.serverProfile.tncLatestVersionUrl;
          formDetails.templateOptions.labelHtml.values['$appName'] = this.appName + ' ';
      }
    }
    this.formInitilized = true;
  }

  handleBackButtonEvents() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(0, async () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.CREATE_MANAGED_USER,
        Environment.USER,
        false
      );
      this.location.back();
    });
  }

  async submitForm() {

    if (!this.profile || !this.profile.serverProfile || !this.formValue || !this.formValue.name ) {
      return;
    }

    const cData: Array<CorrelationData> = [
      { id: this.formValue.name, type: CorReleationDataType.NAME },
      { id: this.profile.serverProfile.tncLatestVersion || '', type: CorReleationDataType.TNC_VERSION },
      { id: this.profile.serverProfile['managedBy'] || this.profile.uid || '', type: CorReleationDataType.LIUA }
    ];
    this.generateTelemetryInteract(InteractType.SELECT_ADD, ID.BTN_ADD);

    const loader = await this.commonUtilService.getLoader();
    try {
      await loader.present();
      let parentProfile;
      if (this.profile.serverProfile.managedBy) {
        parentProfile = await this.profileService.getServerProfilesDetails({
          from: CachedItemRequestSourceFrom.CACHE,
          userId: this.profile.serverProfile.managedBy,
          requiredFields: ProfileConstants.REQUIRED_FIELDS
        }).toPromise();
      } else {
        parentProfile = this.profile.serverProfile;
      }
      const userDetails: AddManagedProfileRequest = {
        firstName: this.formValue.name,
        managedBy: parentProfile.userId,
        framework: parentProfile['framework'] || undefined
      };
      const profileLocation = (await this.locationHandler.getAvailableLocation(parentProfile));
      if (userDetails && userDetails.framework && userDetails.framework.subject) {
        userDetails.framework.subject = [];
      }
      if (profileLocation && profileLocation.length) {
        userDetails.profileLocation =  profileLocation;
      }
      const response = await this.profileService.managedProfileManager.addManagedProfile(userDetails).toPromise();
      if (response) {
        this.commonUtilService.showToast('SUCCESSFULLY_ADDED_USER', null, null, null, null, this.formValue.name);
        this.location.back();
      }
      this.generateTelemetryInteract(InteractType.CREATE_SUCCESS, ID.MUA_USER_CREATION);

    } catch (err) {
      this.generateTelemetryInteract(InteractType.CREATE_FAILURE, ID.MUA_USER_CREATION);
      if (err.response.body && err.response.body.params && err.response.body.params.err === 'UOS_USRCRT0066') {
        this.commonUtilService.showToast('FRMELEMNTS_MSG_USER_CREATION_LIMIT_EXCEEDED');
      } else {
        this.commonUtilService.showToast('ERROR_WHILE_ADDING_USER');
      }
    } finally {
      await loader.dismiss();
    }
  }

  onCancel() {
    this.location.back();
    this.generateTelemetryInteract(InteractType.SELECT_CANCEL, ID.BTN_CANCEL);
  }

  showTncDetails() {
    this.commonUtilService.openLink(this.profile.serverProfile.tncLatestVersionUrl);
  }

  handleHeaderEvents($event) {
    if($event.name === 'back')
    {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        PageId.CREATE_MANAGED_USER,
        Environment.USER,
        true
        );
    }
  }

  generateTelemetryInteract(type, id?) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      type,
      '',
      Environment.USER,
      PageId.CREATE_MANAGED_USER,
      undefined,
      undefined,
      undefined,
      undefined,
      id
    );
  }

  formValueChanges(event) {
    this.formValue = event;
  }

  formStatusChanges(event) {
    this.isFormValid = event.isValid;
  }

}
