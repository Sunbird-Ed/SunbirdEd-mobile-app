import { Subscription } from 'rxjs';
import { Component, Inject } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  GroupService, GroupCreateRequest, GroupMembershipType
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { UtilityService } from '@app/services';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-create-edit-group',
  templateUrl: './create-edit-group.page.html',
  styleUrls: ['./create-edit-group.page.scss'],
})
export class CreateEditGroupPage {

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

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private headerService: AppHeaderService,
    private location: Location,
    private platform: Platform,
    private alertCtrl: AlertController,
    private utilityService: UtilityService
  ) {
    this.initializeForm();
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.handleBackButtonEvents();
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  ionViewWillLeave() {
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
        this.location.back();
      }
    });
  }

  initializeForm() {
    this.createGroupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupDesc: '',
      groupTerms: ['', Validators.required]
    });
  }

  get createGroupFormControls() {
    return this.createGroupForm.controls;
  }

  onSubmit() {
    this.createGroupFormSubmitted = true;
    const formVal = this.createGroupForm.value;
    if (this.createGroupForm.valid) {
      this.createGroup(formVal);
    }
  }

  private async createGroup(formVal) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const groupCreateRequest: GroupCreateRequest = {
      name: formVal.groupName,
      description: formVal.groupDesc,
      membershipType: GroupMembershipType.MODERATED
    };
    this.groupService.create(groupCreateRequest).toPromise().then(async (res) => {
      await loader.dismiss();
      this.commonUtilService.showToast('GROUP_CREATED');
      this.location.back();
    }).catch(async (err) => {
      console.error(err);
      await loader.dismiss();
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
    });
  }

  async openTermsOfUse() {
    // this.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.TERMS_OF_USE_CLICKED);
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE;
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }

}
