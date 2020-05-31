
import { Subscription } from 'rxjs';
import { Component, Inject, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  Profile,
  ProfileService,
  SharedPreferences,
  CorrelationData,
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { AddManagedProfileRequest } from '@project-sunbird/sunbird-sdk/profile/def/add-managed-profile-request';
import { CommonFormsComponent } from '@app/app/components/common-forms/common-forms.component';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, InteractType, ID, PageId, CorReleationDataType, ImpressionType } from '@app/services/telemetry-constants';

@Component({
  selector: 'app-sub-profile-edit',
  templateUrl: './sub-profile-edit.page.html',
  styleUrls: ['./sub-profile-edit.page.scss'],
})
export class SubProfileEditPage {

  private profile: Profile;
  private appName = '';
  private formValue: any;
  private backButtonFunc: Subscription;
  private headerObservable: any;

  public isFormValid = false;

  formInitilized = false;

  @ViewChild('commonForms') commonForms: CommonFormsComponent;

  formApiList: any = [
    {
      key: 'name',
      type: 'input',
      templateOptions: {
        label: 'FULL_NAME',
        placeholder: 'ENTER_USER_NAME'
      },
      validations: [
        { type: 'required', value: true, message: 'NAME_IS_REQUIRED' },
      ]
    }, {
      key: 'updatePreference',
      type: 'label',
      templateOptions: {
        label: 'PREFERENCES_CAN_BE_UPDATED'
      },
    }, {
      key: 'tnc',
      type: 'checkbox',
      templateOptions: {
        labelHtml: {
          contents: `<span> $0 <a href=$url><u> $appName $1 </u></a></span>`,
          values: {
            $0: 'I_UNDERSTAND_AND_ACCEPT',
            $1: 'TERMS_OF_USE'
          }
        },
      },
      validations: [
        { type: 'required', value: true, message: '' }
      ]
    }
  ];

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private location: Location,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
    this.profile = this.appGlobalService.getCurrentUser();

    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    });
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
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
    this.initializeFormData();
  }

  initializeFormData() {
    for (let index = 0; index < this.formApiList.length; index++) {
      const formDetails: any = this.formApiList[index];
      if (formDetails.key === 'tnc' && formDetails.templateOptions && formDetails.templateOptions.labelHtml &&
        formDetails.templateOptions.labelHtml.contents) {
          formDetails.templateOptions.labelHtml.values['$url'] = this.profile.serverProfile.tncLatestVersionUrl;
          formDetails.templateOptions.labelHtml.values['$appName'] = this.appName;
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
      { id: this.profile.serverProfile['managedBy'] || this.profile.serverProfile.userId || '', type: CorReleationDataType.LIUA }
    ];
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ADD,
      '',
      Environment.USER,
      PageId.CREATE_MANAGED_USER,
      undefined,
      undefined,
      undefined,
      cData,
      ID.BTN_ADD
    );
    const loader = await this.commonUtilService.getLoader();
    try {
      await loader.present();
      const userDetails: AddManagedProfileRequest = {
        firstName: this.formValue.name,
        managedBy: this.profile.uid,
        framework: this.profile.serverProfile['framework'] || undefined,
        locationIds: this.profile.serverProfile['locationIds'] ||
          (this.profile.serverProfile['userLocations'] && this.profile.serverProfile['userLocations'].map(i => i.id)) || undefined,
      };
      if (userDetails && userDetails.framework && userDetails.framework.subject) {
        userDetails.framework.subject = [];
      }
      const createdUser = await this.profileService.managedProfileManager.addManagedProfile(userDetails).toPromise();
      if (createdUser) {
        this.commonUtilService.showToast('SUCCESSFULLY_ADDED_USER', null, null, null, null, createdUser.handle || '');
        this.location.back();
      }

    } catch (e) {
      this.commonUtilService.showToast('ERROR_WHILE_ADDING_USER');
      console.error(e);
    } finally {
      await loader.dismiss();
    }
  }

  onCancel() {
    this.location.back();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CANCEL,
      '',
      Environment.USER,
      PageId.CREATE_MANAGED_USER,
      undefined,
      undefined,
      undefined,
      undefined,
      ID.BTN_CANCEL
    );
  }

  showTncDetails() {
    this.commonUtilService.openLink(this.profile.serverProfile.tncLatestVersionUrl);
  }

  onFormDataChange(event) {
    if (event) {
      this.isFormValid = event.valid;
      this.formValue = event.value || undefined;
    }
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(
          PageId.CREATE_MANAGED_USER,
          Environment.USER,
          true
        );
        break;
    }
  }

}
