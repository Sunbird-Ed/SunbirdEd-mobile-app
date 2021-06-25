import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  Platform,
  NavParams,
  PopoverController,
  MenuController,
} from "@ionic/angular";
import {
  GenerateOtpRequest,
  IsProfileAlreadyInUseRequest,
  ProfileService,
} from "sunbird-sdk";
import { ProfileConstants } from "@app/app/app.constant";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonUtilService } from "../../../../services/common-util.service";
import { Keyboard } from "@ionic-native/keyboard/ngx";

@Component({
  selector: "app-edit-contact-details-popup",
  templateUrl: "./edit-contact-details-popup.component.html",
  styleUrls: ["./edit-contact-details-popup.component.scss"],
})
export class EditContactDetailsPopupComponent implements OnInit  {
  // Data passed in by componentProps
  @Input() userId: string;
  @Input() title: string;
  @Input() description: string;
  @Input() type: string;

  err: boolean;
  personEditForm: FormGroup;
  isRequired = false;
  updateErr: boolean;
  blockedAccount: boolean;
  unregisterBackButton: any;
  loader: any;

  constructor(
    @Inject("PROFILE_SERVICE") private profileService: ProfileService,
    private navParams: NavParams,
    public platform: Platform,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private popOverCtrl: PopoverController,
    private keyboard: Keyboard,
    private menuCtrl: MenuController
  ) {
    this.userId = this.navParams.get("userId");
    this.title = this.navParams.get("title");
    this.description = this.navParams.get("description");
    this.type = this.navParams.get("type");

    this.initEditForm();
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(
      11,
      () => {
        this.popOverCtrl.dismiss();
      }
    );
  }

  initEditForm() {
    if (this.type === ProfileConstants.CONTACT_TYPE_EMAIL) {
      this.personEditForm = this.fb.group({
        email: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(
              "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}$"
            ),
          ]),
        ],
      });
    } else {
      this.personEditForm = this.fb.group({
        phone: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern("^[6-9]\\d{9}$"),
          ]),
        ],
      });
    }
  }

  async validate() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const formVal = this.personEditForm.value;
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      let req: IsProfileAlreadyInUseRequest;
      if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: formVal.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
        };
      } else {
        req = {
          key: formVal.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
        };
      }

      this.profileService.isProfileAlreadyInUse(req).subscribe(
        async (success: any) => {
          await this.loader.dismiss();
          this.loader = undefined;
          if (success && success.response) {
            if (success.response.id === this.userId) {
              this.updateErr = true;
            } else {
              this.err = true;
            }
          }
        },
        async (error) => {
          if (
            error.response &&
            error.response.body.params.err === "USER_NOT_FOUND"
          ) {
            this.generateOTP();
          } else if (
            error.response &&
            error.response.body.params.err === "USER_ACCOUNT_BLOCKED"
          ) {
            this.blockedAccount = true;
            if (this.loader) {
              await this.loader.dismiss();
              this.loader = undefined;
            }
          } else {
            if (this.loader) {
              await this.loader.dismiss();
              this.loader = undefined;
            }
          }
        }
      );
    } else {
      this.commonUtilService.showToast("INTERNET_CONNECTIVITY_NEEDED");
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
        type: ProfileConstants.CONTACT_TYPE_PHONE,
      };
    } else {
      req = {
        key: this.personEditForm.value.email,
        type: ProfileConstants.CONTACT_TYPE_EMAIL,
      };
    }

    this.profileService
      .generateOTP(req)
      .toPromise()
      .then(async () => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        if (this.type === ProfileConstants.CONTACT_TYPE_PHONE) {
          this.popOverCtrl.dismiss({
            isEdited: true,
            value: this.personEditForm.value.phone,
          });
        } else {
          this.popOverCtrl.dismiss({
            isEdited: true,
            value: this.personEditForm.value.email,
          });
        }
      })
      .catch(async (err) => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        this.popOverCtrl.dismiss({ isEdited: false });
        if (err.hasOwnProperty(err) === "ERROR_RATE_LIMIT_EXCEEDED") {
          this.commonUtilService.showToast(
            "You have exceeded the maximum limit for OTP, Please try after some time"
          );
        }
      });
  }

  async cancel(event) {
    if (event.sourceCapabilities) {
      await this.popOverCtrl.dismiss({ isEdited: false });
    } else {
      this.keyboard.hide();
    }
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }
}
