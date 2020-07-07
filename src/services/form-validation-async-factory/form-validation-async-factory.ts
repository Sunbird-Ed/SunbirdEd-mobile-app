import { Injectable, QueryList, Inject } from '@angular/core';
import { FormControl, ValidationErrors } from '@angular/forms';
import { IonButton, PopoverController } from '@ionic/angular';
import { GenerateOtpRequest, ProfileService, ServerProfile } from '@project-sunbird/sunbird-sdk';
import { ProfileConstants } from '@app/app/app.constant';
import { CommonUtilService } from '../common-util.service';
import { EditContactVerifyPopupComponent } from '@app/app/components/popups/edit-contact-verify-popup/edit-contact-verify-popup.component';
import { FieldConfig } from '@app/app/components/common-forms/field-config';

@Injectable({ providedIn: 'root' })
export class FormValidationAsyncFactory {

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private popoverCtrl: PopoverController
  ) { }

  mobileVerificationAsyncFactory(formElement: FieldConfig<any>, profile: ServerProfile) {
    return (marker: string, triggers: QueryList<any>) => {
      if (marker === 'MOBILE_OTP_VALIDATION') {
        return async (control: FormControl) => {
          if (control && !control.value) {
            return null;
          }
          return new Promise<ValidationErrors | null>(resolve => {
            const trigger: IonButton = triggers.find(e => e['el'].getAttribute('data-marker') === 'MOBILE_OTP_VALIDATION');
            if (trigger) {
              const that = this;
              trigger['el'].onclick = (async () => {
                try {
                  const isOtpVerified: boolean = await that.generateAndVerifyOTP(profile, control, ProfileConstants.CONTACT_TYPE_PHONE);
                  if (isOtpVerified) {
                    resolve(null);
                  } else {
                    resolve({ asyncValidation: 'error' });
                  }
                } catch (e) {
                  console.log(e);
                }
              }).bind(this);
              return;
            }
            resolve(null);
          });
        };
      }
      return async () => null;
    };
  }

  emailVerificationAsyncFactory(formElement: FieldConfig<any>, profile: ServerProfile) {
    return (marker: string, triggers: QueryList<any>) => {
      if (marker === 'EMAIL_OTP_VALIDATION') {
        return async (control: FormControl) => {
          if (control && !control.value) {
            return null;
          }
          return new Promise<ValidationErrors | null>(resolve => {
            const trigger: IonButton = triggers.find(e => e['el'].getAttribute('data-marker') === 'EMAIL_OTP_VALIDATION');
            if (trigger) {
              const that = this;
              trigger['el'].onclick = (async () => {
                try {
                  const isOtpVerified: boolean = await that.generateAndVerifyOTP(profile, control, ProfileConstants.CONTACT_TYPE_EMAIL);
                  if (isOtpVerified) {
                    resolve(null);
                  } else {
                    resolve({ asyncValidation: 'error' });
                  }
                } catch (e) {
                  console.error(e);
                }
              }).bind(this);
              return;
            }
            resolve(null);
          });
        };
      }
      return async () => null;
    };
  }

  private async generateAndVerifyOTP(profile, control, type): Promise<boolean> {
    const loader = await this.commonUtilService.getLoader();
    try {
      const req: GenerateOtpRequest = {
        key: control.value,
        type
      };

      await loader.present();
      await this.profileService.generateOTP(req).toPromise();

      await loader.dismiss();

      const isOtpVerified = await this.checkOtpVerification(profile, type, control.value);
      if (isOtpVerified) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      if (e.hasOwnProperty(e) === 'ERROR_RATE_LIMIT_EXCEEDED') {
        this.commonUtilService.showToast('You have exceeded the maximum limit for OTP, Please try after some time.');
      } else if (e.message === 'CANCEL') {
        throw e;
      }
      return false;
    } finally {
      if (loader) {
        await loader.dismiss();
      }
    }
  }

  private async checkOtpVerification(profile, type: string, key: any): Promise<boolean> {
    if (type === ProfileConstants.CONTACT_TYPE_PHONE) {
      const componentProps = {
        key,
        phone: profile.phone,
        title: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_TITLE'),
        description: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_PHONE,
        userId: profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (data && data.OTPSuccess) {
        return true;
      } else if (!data || !data.OTPSuccess) {
        throw new Error('CANCEL');
      }
      return false;
    } else {
      const componentProps = {
        key,
        phone: profile.email,
        title: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_TITLE'),
        description: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_EMAIL,
        userId: profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (data && data.OTPSuccess) {
        return true;
      } else if (!data || !data.OTPSuccess) {
        throw new Error('CANCEL');
      }
      return false;
    }
  }

  private async openContactVerifyPopup(component, componentProps, cssClass) {
    const popover = await this.popoverCtrl.create({ component, componentProps, cssClass });
    await popover.present();
    const { data } = await popover.onDidDismiss();

    return data;
  }

}
