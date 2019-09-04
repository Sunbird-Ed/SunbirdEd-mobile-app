import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ImpressionType, Environment, PageId, InteractType } from '@app/services/telemetry-constants';
import { Profile, ProfileService } from 'sunbird-sdk';
import { AppGlobalService } from '@app/services/app-global-service.service';

@Component({
  selector: 'app-account-recovery-id-popup',
  templateUrl: './account-recovery-id-popup.component.html',
  styleUrls: ['./account-recovery-id-popup.component.scss']
})
export class AccountRecoveryInfoComponent implements OnInit {

  recoveryIdType: string;
  recoveryEmailForm: FormGroup;
  recoveryPhoneForm: FormGroup;
  recoveryTypes = {
    PHONE: 'phone',
    EMAIL: 'email'
  };
  profile: Profile;

  constructor(@Inject('PROFILE_SERVICE') private profileService: ProfileService,
              private telemetryGeneratorService: TelemetryGeneratorService,
              private appGlobalService: AppGlobalService) { }

  ngOnInit() {
    this.recoveryIdType = this.recoveryTypes.EMAIL;
    this.initializeFormFields();
    this.profile = this.appGlobalService.getCurrentUser();
    this.generateRecoveryImpression();
  }

  private initializeFormFields() {
    this.recoveryEmailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,4}$/)]),
    });
    this.recoveryPhoneForm = new FormGroup({
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
    });
    console.log(this.recoveryEmailForm);
  }

  submitRecoveryId(type: string) {
    const req = {
      profileSummary: 'Test to check for update',
      userId: this.profile.uid,
      recoveryEmail: null,
      recoveryPhone: null
    };
    if (type === this.recoveryTypes.EMAIL) {
      req.recoveryEmail = this.recoveryEmailForm.value.email;
    }
    if (type === this.recoveryTypes.PHONE) {
      req.recoveryPhone = this.recoveryPhoneForm.value.phone;
    }

    this.profileService.updateServerProfile(req).subscribe((res: any) => {
      console.log(res);
      // TODO Response Handling

      this.generateRecoveryTelemetry(type);
    });

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
