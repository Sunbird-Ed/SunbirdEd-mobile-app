import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { ImpressionType, Environment, PageId, InteractType } from '../../../../services/telemetry-constants';
import { Profile, ProfileService, UpdateServerProfileInfoRequest } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../../../services/app-global-service.service';
import { CommonUtilService } from '../../../../services/common-util.service';
import { PopoverController, Platform, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

enum RecoveryType {
  PHONE = 'phone',
  EMAIL = 'email'
}

@Component({
  selector: 'app-account-recovery-id-popup',
  templateUrl: './account-recovery-id-popup.component.html',
  styleUrls: ['./account-recovery-id-popup.component.scss']
})
export class AccountRecoveryInfoComponent implements OnInit {

  RecoveryType = RecoveryType;

  // Data passed in by componentProps
  @Input() recoveryPhone: string;
  @Input() recoveryEmail: string;

  recoveryIdType: string;
  recoveryEmailForm: FormGroup;
  recoveryPhoneForm: FormGroup;
  private profile: Profile;
  private unregisterBackButton: Subscription;
  sameEmailErr = false;
  samePhoneErr = false;

  constructor(@Inject('PROFILE_SERVICE') private profileService: ProfileService,
              private telemetryGeneratorService: TelemetryGeneratorService,
              private appGlobalService: AppGlobalService,
              private commonUtilService: CommonUtilService,
              private popOverCtrl: PopoverController,
              public  platform: Platform,
              private menuCtrl: MenuController) { }

  async ngOnInit() {
    this.recoveryIdType = (this.recoveryPhone.length > 0) ? RecoveryType.PHONE : RecoveryType.EMAIL;
    this.initializeFormFields();
    this.profile = this.appGlobalService.getCurrentUser();
    this.generateRecoveryImpression();
    await this.menuCtrl.enable(false);
  }

  ionViewWillEnter() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popOverCtrl.dismiss();
    });
  }

  async ionViewWillLeave() {
    await this.menuCtrl.enable(true);
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  private initializeFormFields() {
    this.recoveryEmailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,4}$/)]),
    });
    this.recoveryPhoneForm = new FormGroup({
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
    });
  }

  async submitRecoveryId(type: RecoveryType) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let loader = await this.commonUtilService.getLoader();
      const req: UpdateServerProfileInfoRequest = this.getReqPayload(type);
      await loader.present();
      this.profileService.updateServerProfile(req).pipe(
        finalize(async () => {
          if (loader) {
            await loader.dismiss();
            loader = undefined;
          }
        })
      )
      .subscribe((data: any) => {
        if (data && data.response === 'SUCCESS') {
          this.popOverCtrl.dismiss({ isEdited: true });
          this.generateRecoveryTelemetry(type);
        }
        }, (error) => {
          if (error && error.response && error.response.body && error.response.body.params &&
            error.response.body.params.err === 'UOS_USRUPD0062') {
            if (type === RecoveryType.EMAIL) { this.sameEmailErr = true; }
            if (type === RecoveryType.PHONE) { this.samePhoneErr = true; }
          } else {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
          }
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  private getReqPayload(type: string): UpdateServerProfileInfoRequest {
    const req = {
      userId: this.profile.uid,
      recoveryEmail: '',
      recoveryPhone: ''
    };
    if (type === RecoveryType.EMAIL) { req.recoveryEmail = this.recoveryEmailForm.value.email.toLowerCase(); }
    if (type === RecoveryType.PHONE) { req.recoveryPhone = this.recoveryPhoneForm.value.phone; }
    return req;
  }

  private generateRecoveryImpression() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.RECOVERY_ACCOUNT_ID_POPUP,
      Environment.USER
    );
  }

  private generateRecoveryTelemetry(type: string) {
    const valueMap = { recoveryType: type };
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      '',
      Environment.USER,
      PageId.RECOVERY_ACCOUNT_ID_POPUP, undefined, valueMap
    );
  }

  removeSameRecoveryIdErr(type: string) {
    if (this.sameEmailErr && type === RecoveryType.EMAIL) { this.sameEmailErr = false; }
    if (this.samePhoneErr && type === RecoveryType.PHONE) { this.samePhoneErr = false; }
  }

  async cancel() {
    await this.popOverCtrl.dismiss({ isEdited: false });
  }

}
