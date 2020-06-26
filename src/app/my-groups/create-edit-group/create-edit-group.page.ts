import { tap } from 'rxjs/operators';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Component, Inject, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { IonSelect, Platform, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Profile,
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ClassRoomService, ClassRoom, ClassRoomCreateRequest } from '@project-sunbird/sunbird-sdk';
import { RouterLinks } from '@app/app/app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';


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
    @Inject('CLASS_ROOM_SERVICE') public classRoomService: ClassRoomService,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private alertCtrl: AlertController,
    private appVersion: AppVersion,
  ) {
    this.initializeForm();
    this.getAppName();
  }

  ngOnInit() {
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
  getAppName() {
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
        console.log('this.appName', this.appName);
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
    const createClassRoomReq: ClassRoomCreateRequest = {
      name: formVal.groupName,
      board: 'formVal.boards[0]',
      medium: 'formVal.medium',
      gradeLevel: 'formVal.grades',
      subject: 'formVal.subjects',
      // groupDesc: formVal.groupDesc
    };
    this.classRoomService.create(createClassRoomReq).toPromise().then(async (res) => {
      await loader.dismiss();
      this.commonUtilService.showToast('GROUP_CREATED');
      this.location.back();
    }).catch(async (err) => {
      await loader.dismiss();
      this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
    });
  }

}
