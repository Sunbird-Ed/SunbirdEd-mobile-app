import { Component, OnInit, Inject } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService, UserMigrateRequest, HttpClientError } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { featureIdMap } from '../../../../feature-id-map';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
  ID
} from '../../../../services/telemetry-constants';

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
  tenantMessages: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private events: Events
  ) {
    if (this.navParams.data) {
      this.userFeed = this.navParams.data.userFeed;
      this.stateList = this.userFeed.data.prospectChannels;
      this.tenantMessages = this.navParams.data.tenantMessages;
    }
  }

  ngOnInit() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_CONFIRMATION;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      Environment.HOME, '', '', '', undefined, featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION);
  }

  async closePopup() {
    this.generateTelemetryForClose();
    await this.popOverCtrl.dismiss();
  }

  teacherConfirmation(flag: boolean) {
    if (flag) {
      this.initializeFormFields();
      this.generateTelemetryForYesAndNo(ID.USER_VERIFICATION_CONFIRMED);
    } else {
      this.generateTelemetryForYesAndNo(ID.USER_VERIFICATION_REJECTED);
      const req: UserMigrateRequest = {
        userId: this.userFeed.userId,
        action: 'reject',
        channel: this.stateName ? this.stateName : this.userFeed.data.prospectChannels[0],
        feedId: this.userFeed.id
      };
      this.profileService.userMigrate(req).toPromise()
        .then(async (response) => {
          this.count = 0;
          if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.OK) {
            this.teacherIdFlag = TeacherIdPopupFlags.VERIFIED_STATE_ID;
            await this.closePopup();
          }
        })
        .catch(async (error) => {
          await this.closePopup();
        });
    }
  }

   initializeFormFields() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_ID_INPUT;
    this.teacherIdForm = new FormGroup({
      teacherId: new FormControl('', Validators.requiredTrue)
    });
  }

  submitTeacherId() {
    this.count++;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      '',
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined,
      undefined,
      featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
      ID.USER_VERIFICATION_SUBMITED
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
    }
  }

  externalUserVerfication(req) {
    this.profileService.userMigrate(req).toPromise()
      .then(async (response) => {
        this.count = 0;
        if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.INVALIDEXTERNALID) {
          this.showTeacherIdIncorrectErr = true;
          this.teacherModelId = '';
        } else if ((response.responseCode).toLowerCase() === TeacherIdPopupFlags.OK) {
          this.teacherIdFlag = TeacherIdPopupFlags.VERIFIED_STATE_ID;
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            '',
            Environment.USER,
            PageId.EXTERNAL_USER_VERIFICATION_POPUP,
            undefined,
            undefined,
            undefined,
            featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
            ID.USER_VERIFICATION_SUCCESS
          );
          this.events.publish('loggedInProfile:update');
        }
      })
      .catch(async (error) => {
        if (HttpClientError.isInstance(error)) {
          if (error.response.responseCode === 400) {
            this.generateTelemetryForFailedVerification();
            this.teacherIdFlag = TeacherIdPopupFlags.FAILED_STATE_ID;
          } else if (error.response.responseCode === 404) {
            this.generateTelemetryForFailedVerification();
            this.teacherIdFlag = TeacherIdPopupFlags.FAILED_STATE_ID;
          } else if (error.response.responseCode === 429) {
            await this.closePopup();
            this.commonUtilService.showToast('USER_IS_NOT_VERIFIED');
          } else if (error.response.responseCode === 401) {
            await this.closePopup();
            this.commonUtilService.showToast('USER_IS_NOT_VERIFIED');
          } else {
            await this.closePopup();
            this.commonUtilService.showToast('USER_IS_NOT_VERIFIED');
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
      undefined,
      undefined,
      featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION
     );
  }
  generateTelemetryForFailedVerification() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      '',
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined,
      undefined,
      featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
      ID.USER_VERIFICATION_FAILED
    );
  }
  generateTelemetryForYesAndNo(id) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      '',
      Environment.HOME,
      PageId.EXTERNAL_USER_VERIFICATION_POPUP,
      undefined,
      undefined,
      undefined,
      featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
      id
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
      reason,
      undefined,
      featureIdMap.userVerification.EXTERNAL_USER_VERIFICATION,
     );
    await this.popOverCtrl.dismiss();
  }

}
