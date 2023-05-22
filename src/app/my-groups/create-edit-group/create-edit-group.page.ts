import { Subscription } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../../../services/utility-service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
  GroupService, GroupCreateRequest, GroupMembershipType,
  UpdateByIdRequest, CorrelationData
} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { Location } from '@angular/common';
import { Environment, ID, ImpressionSubtype,
  ImpressionType, InteractType, PageId, InteractSubtype } from '../../../services/telemetry-constants';
import { RouterLinks, GroupErrorCodes } from '../../../app/app.constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-edit-group',
  templateUrl: './create-edit-group.page.html',
  styleUrls: ['./create-edit-group.page.scss'],
})
export class CreateEditGroupPage {

  corRelationList: Array<CorrelationData>;
  appName: string;
  createGroupFormSubmitted = false;
  createGroupForm: FormGroup;
  backButtonFunc: Subscription;
  hasFilledLocation = false;
  errorMessages = {
    groupName: {
      message: 'GROUP_NAME_IS_REQUIRED'
    },
    groupTerms: {
      message: 'GROUP_TERMS_IS_REQUIRED'
    }
  };
  headerObservable: Subscription;
  extras: any;
  groupDetails: any;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private headerService: AppHeaderService,
    private location: Location,
    private platform: Platform,
    private alertCtrl: AlertController,
    private utilityService: UtilityService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    if (extras && extras.groupDetails) {
      this.groupDetails = extras.groupDetails;
      this.corRelationList = extras.corRelation;
    }
    this.initializeForm();
  }

  async ionViewWillEnter() {
    await this.headerService.showHeaderWithBackButton();

    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.handleBackButtonEvents();
    this.appName = await this.commonUtilService.getAppName();

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, ImpressionSubtype.CREATE_GROUP_FORM, PageId.CREATE_GROUP, Environment.GROUP,
      undefined, undefined, undefined, undefined, this.corRelationList);

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.INITIATED,
      '',
      Environment.GROUP,
      PageId.CREATE_GROUP,
      undefined,
      undefined,
      undefined,
      this.corRelationList,
      ID.CREATE_GROUP
    );
  }

  async ionViewWillLeave() {
    this.appName = await this.commonUtilService.getAppName();

    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }

    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  handleBackButtonEvents() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(0, async () => {
      const activePortal = await this.alertCtrl.getTop();
      if (activePortal) {
        await activePortal.dismiss();
      } else {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CREATE_GROUP,
          Environment.GROUP, false, undefined, this.corRelationList);
        this.location.back();
      }
    });
  }

  initializeForm() {
    this.createGroupForm = this.fb.group({
      groupName: [(this.groupDetails && this.groupDetails.name) || '', Validators.required],
      groupDesc: (this.groupDetails && this.groupDetails.description) || '',
      groupTerms: [(this.groupDetails && true || undefined || null), Validators.required]
    });
  }

  get createGroupFormControls() {
    return this.createGroupForm.controls;
  }

  async onSubmit() {
    this.createGroupFormSubmitted = true;
    const formVal = this.createGroupForm.value;
    if (!formVal.groupTerms) {
      this.createGroupForm.controls['groupTerms'].setErrors({ incorrect: true });
    }
    if (this.createGroupForm.valid) {
      if (this.groupDetails) {
        await this.editGroup(formVal);
      } else {
        await this.createGroup(formVal);
      }
    }
  }

  private async createGroup(formVal) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CREATE_GROUP,
      InteractSubtype.CREATE_GROUP_CLICKED,
      Environment.GROUP, PageId.CREATE_GROUP,
      undefined, undefined, undefined, this.corRelationList,
      ID.CREATE_GROUP
    );
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      await this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
      return;
    }

    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const groupCreateRequest: GroupCreateRequest = {
      name: formVal.groupName,
      description: formVal.groupDesc,
      membershipType: GroupMembershipType.MODERATED
    };
    this.groupService.create(groupCreateRequest).toPromise().then(async (res) => {
      console.log('create suc');
      await loader.dismiss();
      this.commonUtilService.showToast('GROUP_CREATED');
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SUCCESS,
        '',
        Environment.GROUP,
        PageId.CREATE_GROUP,
        undefined, undefined, undefined, this.corRelationList,
        ID.CREATE_GROUP
      );
      this.location.back();
    }).catch(async (err) => {
      console.error(err);
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.FAILURE,
        '',
        Environment.GROUP,
        PageId.CREATE_GROUP,
        undefined, undefined, undefined, this.corRelationList,
        ID.CREATE_GROUP
      );
      await loader.dismiss();
      if (err.response && err.response.body && err.response.body.params
        && err.response.body.params.status === GroupErrorCodes.EXCEEDED_GROUP_MAX_LIMIT) {
        this.commonUtilService.showToast('ERROR_MAXIMUM_GROUP_COUNT_EXCEEDS');
      } else {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      }
    });
  }

  private async editGroup(formVal) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const updateCreateRequest: UpdateByIdRequest = {
      id: this.groupDetails.id,
      updateRequest: {
        name: formVal.groupName,
        description: formVal.groupDesc
      }
    };
    this.groupService.updateById(updateCreateRequest).toPromise().then(async (res) => {
      await loader.dismiss();
      this.commonUtilService.showToast('GROUP_UPDATE_SUCCESS');
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SUCCESS,
        '',
        Environment.GROUP,
        PageId.CREATE_GROUP,
        undefined,
        undefined,
        undefined,
        this.corRelationList,
        ID.CREATE_GROUP
      );
      this.location.back();
    }).catch(async (err) => {
      await loader.dismiss();
    });
  }

  async openTermsOfUse() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.TERMS_OF_USE_CLICKED,
      Environment.GROUP,
      PageId.CREATE_GROUP,
      undefined, undefined, undefined, this.corRelationList);
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE + '#groupGuidelines';
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back'){
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CREATE_GROUP,
        Environment.GROUP, true, undefined, this.corRelationList);
      this.location.back();
    }
  }
}
