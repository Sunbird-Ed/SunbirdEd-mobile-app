import { Component, OnInit, Inject } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService, UserFeed, UserMigrateRequest, HttpClientError } from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId
} from '@app/services/telemetry-constants';
import { map } from 'rxjs-compat/operator/map';

export enum TeacherIdPopupFlags {
  STATE_CONFIRMATION = 'stateConfirmation',
  STATE_ID_INPUT = 'stateIdInput',
  VERIFIED_STATE_ID = 'verifiedStateId',
  FAILED_STATE_ID = 'failedStateId',
  OK = 'ok',
  INVALIDEXTERNALID = 'invaliduserexternalid'
}

@Component({
  selector: 'app-teacher-id-verification-popup',
  templateUrl: './teacher-id-verification-popup.component.html',
  styleUrls: ['./teacher-id-verification-popup.component.scss']
})

export class TeacherIdVerificationComponent implements OnInit {
  teacherIdPopupFlags = TeacherIdPopupFlags;
  showTeacherIdIncorrectErr = false;
  teacherIdFlag: string;
  teacherIdForm: FormGroup;
  stateFlag = false;
  stateName: any;
  showStates: boolean;
  stateList: any;
  userFeed: any;
  count = 0;
  teacherModelId: string;

  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService) {
    if (this.navParams.data) {
      this.userFeed = this.navParams.data;
      this.stateList = this.userFeed.data.prospectChannels;
    }
  }

  ngOnInit() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_CONFIRMATION;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      Environment.HOME);
  }

  async closePopup() {
    this.generateTelemetryForClose();
    await this.popOverCtrl.dismiss();
  }

  teacherConfirmation(flag: boolean) {
    if (flag) {
      this.initializeFormFields();
      this.generateTelemetryForYesAndNo(InteractSubtype.YES_CLICKED);
    } else {
      this.generateTelemetryForYesAndNo(InteractSubtype.NO_CLICKED);
      const req: UserMigrateRequest = {
        userId: this.userFeed.userId,
        action: 'reject'
      };
      this.profileService.userMigrate(req).toPromise()
        .then(async (response) => {
          console.log('UserMigrateResponse', response);
          this.count = 0;
          if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.OK) {
            this.teacherIdFlag = TeacherIdPopupFlags.VERIFIED_STATE_ID;
            this.closePopup();
          }
        })
        .catch((error) => {
          this.closePopup();
        });
    }
  }

  private initializeFormFields() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_ID_INPUT;
    this.teacherIdForm = new FormGroup({
      teacherId: new FormControl('', Validators.requiredTrue)
    });
    console.log('teacherId initialise', this.teacherIdForm.value.teacherId);
  }

  submitTeacherId() {
    this.count++;
    // this.disableButton = true;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBMIT_CLICKED,
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined
    );
    if (this.teacherIdForm.value.teacherId) {
      const req: UserMigrateRequest = {
        userId: this.userFeed.userId,
        userExtId: this.teacherIdForm.value.teacherId,
        channel: this.stateName ? this.stateName : this.userFeed.data.prospectChannels[0],
        action: 'accept',
        feedId: this.userFeed.id
      };
      this.externalUserVerfication(req);
      console.log('UserMigrateRequest', req, this.count);
    }
  }

  externalUserVerfication(req) {
    this.profileService.userMigrate(req).toPromise()
      .then(async (response) => {
        console.log('UserMigrateResponse', response);
        this.count = 0;
        if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.INVALIDEXTERNALID) {
          this.showTeacherIdIncorrectErr = true;
          this.teacherModelId = '';
        } else if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.OK) {
          this.teacherIdFlag = TeacherIdPopupFlags.VERIFIED_STATE_ID;
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.USER_VERIFICATION_SUCCESS,
            Environment.HOME,
            PageId.EXTERNAL_USER_VERIFICATION_POPUP,
            undefined,
            undefined
          );
        }
      })
      .catch((error) => {
        console.log('error', error);
        if (error instanceof HttpClientError) {
          if (error.response.responseCode === 400) {
            this.generateTelemetryForFailedVerification();
            this.teacherIdFlag = TeacherIdPopupFlags.FAILED_STATE_ID;
          } else if (error.response.responseCode === 404) {
            this.generateTelemetryForFailedVerification();
            this.teacherIdFlag = TeacherIdPopupFlags.FAILED_STATE_ID;
          } else if (error.response.responseCode === 429) {
            this.closePopup();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_IS_NOT_VERIFIED'));
          } else if (error.response.responseCode === 401) {
            this.closePopup();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_IS_NOT_VERIFIED'));
          } else {
            this.closePopup();
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_IS_NOT_VERIFIED'));
          }
        }
      });
  }

  selectState(stateName) {
    this.stateName = stateName;
    this.showStates = false;
  }

  generateTelemetryForClose() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.POPUP_DISMISSED,
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined
     );
  }
  generateTelemetryForFailedVerification() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.USER_VERIFICATION_SUCCESS,
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined
    );
  }
  generateTelemetryForYesAndNo(subinteractType) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      subinteractType,
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined
    );
  }
  async cancelPopup(message) {
    const reason = new Map();
    reason['popup_close'] = message;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.POPUP_DISMISSED,
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      reason
     );
    await this.popOverCtrl.dismiss();
  }

}
