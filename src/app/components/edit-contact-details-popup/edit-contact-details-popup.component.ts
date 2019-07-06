import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Inject } from '@angular/core';
import { LoadingController, Platform, NavParams, ModalController } from '@ionic/angular';
import { GenerateOtpRequest, IsProfileAlreadyInUseRequest, ProfileService } from 'sunbird-sdk';
import { ProfileConstants } from '../../app.constant';
import { CommonUtilService } from '../../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-edit-contact-details-popup',
  templateUrl: './edit-contact-details-popup.component.html',
  styleUrls: ['./edit-contact-details-popup.component.scss'],
})
export class EditContactDetailsPopupComponent implements OnInit {

  phone: string;
  email: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  err: boolean;
  personEditForm: FormGroup;
  isRequired: boolean = false;
  updateErr: boolean;
  blockedAccount: boolean;
  constructor(
    private navParams: NavParams,
    public platform: Platform,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private loadingCtrl: LoadingController,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private keyboard: Keyboard
  ) {

    this.userId = this.navParams.get('userId');
    this.title = this.navParams.get('title');
    this.description = this.navParams.get('description');
    this.type = this.navParams.get('type');

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.modalCtrl.dismiss();
      this.platform.backButton.unsubscribe();
    });
    this.initEditForm();
  }

  ngOnInit() { }

  initEditForm() {
    if (this.type === ProfileConstants.CONTACT_TYPE_EMAIL) {
      this.personEditForm = this.fb.group({
        email: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$')])],
      });
    } else {
      this.personEditForm = this.fb.group({
        phone: ['', Validators.compose([Validators.required, Validators.pattern('^[6-9]\\d{9}$')])],
      });
    }
  }


  async validate() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const loader = await this.commonUtilService.getLoader();
      const formVal = this.personEditForm.value;
      await loader.present();
      let req: IsProfileAlreadyInUseRequest;
      if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: formVal.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE
        };
      } else {
        req = {
          key: formVal.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL
        };
      }

      this.profileService.isProfileAlreadyInUse(req).subscribe(async (success: any) => {
        await loader.dismiss();
        if (success && success.response) {
          if (success.response.id === this.userId) {
            this.updateErr = true;
          } else {
            this.err = true;
          }
        }
      }, async (error) => {
        await loader.dismiss();
        if (error.response.body.params.err === 'USER_NOT_FOUND') {
          this.generateOTP();
        } else if (error.response.body.params.err === 'USER_ACCOUNT_BLOCKED') {
          this.blockedAccount = true;
        }
      });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  refreshErr() {
    if (this.err || this.updateErr || this.blockedAccount) {
      this.err = false;
      this.updateErr = false;
      this.blockedAccount = false;
    }
  }

  async generateOTP() {
    let req: GenerateOtpRequest;
    if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
      req = {
        key: this.personEditForm.value.phone,
        type: ProfileConstants.CONTACT_TYPE_PHONE
      };
    } else {
      req = {
        key: this.personEditForm.value.email,
        type: ProfileConstants.CONTACT_TYPE_EMAIL
      };
    }
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    this.profileService.generateOTP(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
          this.modalCtrl.dismiss(true, this.personEditForm.value.phone);
        } else {
          this.modalCtrl.dismiss(true, this.personEditForm.value.email);
        }
      })
      .catch(async (err) => {
        await loader.dismiss();
        this.modalCtrl.dismiss(false);
        if (err.hasOwnProperty(err) === 'ERROR_RATE_LIMIT_EXCEEDED') {
          this.commonUtilService.showToast('You have exceeded the maximum limit for OTP, Please try after some time');
        }
      });
  }

  cancel(event) {
    if (event.sourceCapabilities) {
      this.modalCtrl.dismiss(false);
    } else {
      this.keyboard.hide();
    }
  }

}
