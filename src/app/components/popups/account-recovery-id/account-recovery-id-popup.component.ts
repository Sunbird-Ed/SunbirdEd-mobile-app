import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ImpressionType, Environment, PageId, InteractType } from '@app/services/telemetry-constants';
import { Profile, ProfileService } from 'sunbird-sdk';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { PopoverController, Platform,  MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-account-recovery-id-popup',
  templateUrl: './account-recovery-id-popup.component.html',
  styleUrls: ['./account-recovery-id-popup.component.scss']
})
export class AccountRecoveryInfoComponent implements OnInit {

  // Data passed in by componentProps
  @Input() recoveryPhone: any;
  @Input() recoveryEmail: any;

  recoveryIdType: string;
  recoveryEmailForm: FormGroup;
  recoveryPhoneForm: FormGroup;
  recoveryTypes = {
    PHONE: 'phone',
    EMAIL: 'email'
  };
  profile: Profile;
  unregisterBackButton: Subscription;

  constructor(@Inject('PROFILE_SERVICE') private profileService: ProfileService,
              private telemetryGeneratorService: TelemetryGeneratorService,
              private appGlobalService: AppGlobalService,
              private commonUtilService: CommonUtilService,
              private popOverCtrl: PopoverController,
              public platform: Platform,
              private menuCtrl: MenuController) { }

  ngOnInit() {
    this.recoveryIdType = this.recoveryPhone ? this.recoveryTypes.PHONE : this.recoveryTypes.EMAIL;
    this.initializeFormFields();
    this.profile = this.appGlobalService.getCurrentUser();
    this.generateRecoveryImpression();
    this.menuCtrl.enable(false);

    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.platform.backButton.unsubscribe();
    });
  }

  private initializeFormFields() {
    this.recoveryEmailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,4}$/)]),
    });
    this.recoveryPhoneForm = new FormGroup({
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
    });

    if (this.recoveryEmail && this.recoveryEmail !== '') {
      this.recoveryEmailForm.setValue({ email: this.recoveryEmail });
    }
    if (this.recoveryPhone && this.recoveryPhone !== '') {
      this.recoveryPhoneForm.setValue({ phone: this.recoveryPhone });
    }
  }

  async submitRecoveryId(type: string) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let loader = await this.commonUtilService.getLoader();
      const req = {
        profileSummary: 'Test to check for update',
        userId: this.profile.uid,
        recoveryEmail: '',
        recoveryPhone: ''
      };
      if (type === this.recoveryTypes.EMAIL) {
        req.recoveryEmail = this.recoveryEmailForm.value.email;
      }
      if (type === this.recoveryTypes.PHONE) {
        req.recoveryPhone = this.recoveryPhoneForm.value.phone;
      }
      await loader.present();
      this.profileService.updateServerProfile(req).subscribe(async (data: any) => {
        await loader.dismiss();
        console.log(data);
        if (data && data.response) {
          // TODO Response Handling

        }
        this.generateRecoveryTelemetry(type);
        this.popOverCtrl.dismiss({ isEdited: true, value: (req.recoveryEmail || req.recoveryPhone) });
      }, async (error) => {
          await loader.dismiss();
          // TODO Error Handling

      });
    }
  }

  private generateRecoveryImpression() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.RECOVERY_ACCOUNT_ID_POPUP,
      Environment.USER, '', '', '',
      undefined,
      undefined
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

}
