import { Subscription } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  GroupService, GroupCreateRequest, GroupMembershipType,
  UpdateByIdRequest, CorrelationData
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { UtilityService } from '@app/services';
import { RouterLinks, GroupErrorCodes } from '@app/app/app.constant';
import {
  Environment, ID, ImpressionSubtype,
  ImpressionType, InteractType, PageId,
  TelemetryGeneratorService, InteractSubtype
} from '@app/services';
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
    private translate: TranslateService,
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

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();

    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });

    this.handleBackButtonEvents();
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });

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

  ionViewWillLeave() {
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });

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
        activePortal.dismiss();
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
      groupTerms: [(this.groupDetails && true || ''), Validators.required]
    });
  }

  get createGroupFormControls() {
    return this.createGroupForm.controls;
  }

  onSubmit() {
    this.createGroupFormSubmitted = true;
    const formVal = this.createGroupForm.value;
    if (!formVal.groupTerms) {
      this.createGroupForm.controls['groupTerms'].setErrors({ incorrect: true });
    }
    if (this.createGroupForm.valid) {
      if (this.groupDetails) {
        this.editGroup(formVal);
      } else {
        this.createGroup(formVal);
      }
    }
  }

  private async createGroup(formVal) {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.presentToastForOffline('YOU_ARE_NOT_CONNECTED_TO_THE_INTERNET');
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
        undefined,
        undefined,
        undefined,
        this.corRelationList,
        ID.CREATE_GROUP
      );
      this.location.back();
    }).catch(async (err) => {
      console.error(err);
      await loader.dismiss();
      // if (err.body && err.body.params && err.body.params.status === GroupErrorCodes.EXCEEDED_GROUP_MAX_LIMIT) {
      //   this.commonUtilService.showToast('ERROR_MAXIMUM_GROUP_COUNT_EXCEEDS');
      // } else {
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      // }
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
    switch ($event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.CREATE_GROUP,
          Environment.GROUP, true, undefined, this.corRelationList);
        this.location.back();
        break;
    }
  }
}
