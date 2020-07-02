import { Subscription } from 'rxjs';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Profile, GroupService, GroupCreateRequest, GroupJoinStrategy, GroupMemberRole
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-edit-group',
  templateUrl: './create-edit-group.page.html',
  styleUrls: ['./create-edit-group.page.scss'],
})
export class CreateEditGroupPage implements OnInit, OnDestroy {

  appName: string;
  createGroupFormSubmitted = false;
  profile: Profile;
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
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private location: Location,
    private platform: Platform,
    private alertCtrl: AlertController,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.profile = this.appGlobalService.getCurrentUser();
  }

  ngOnDestroy() {
    // this.formControlSubscriptions.unsubscribe();
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.handleBackButtonEvents();
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }

    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
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

  async createGroup(formVal) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const groupCreateRequest: GroupCreateRequest = {
      joinStrategy: GroupJoinStrategy.MODERATED,
      name: formVal.groupName,
      description: formVal.groupDesc,
      members: [{
        memberId: this.profile.uid,
        role: GroupMemberRole.ADMIN
      }]
    };
    this.groupService.create(groupCreateRequest).toPromise().then(async (res) => {
      await loader.dismiss();
      this.commonUtilService.showToast('GROUP_CREATED');
      this.location.back();
    }).catch(async (err) => {
      await loader.dismiss();
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
    });
  }

}
