import {Inject, Injectable} from '@angular/core';
import { ModalController} from '@ionic/angular';
// import {TermsAndConditionsPage} from '@app/pages/terms-and-conditions/terms-and-conditions';
import {ProfileConstants} from '../app/app.constant';
import {AuthService, OAuthSession, ProfileService, ServerProfile, ServerProfileDetailsRequest} from 'sunbird-sdk';

@Injectable()
export class TncUpdateHandlerService {
  private modal?: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private modalCtrl: ModalController,
    @Inject('AUTH_SERVICE') private authService: AuthService
  ) {
  }

  public async checkForTncUpdate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.authService.getSession().toPromise().then((sessionData: OAuthSession) => {
        if (!sessionData) {
          resolve(false);
          return;
        }
        const request: ServerProfileDetailsRequest = {
          userId: sessionData.userToken,
          requiredFields: ProfileConstants.REQUIRED_FIELDS
        };
        this.profileService.getServerProfilesDetails(request).toPromise()
          .then((response) => {
            if (!this.hasProfileTncUpdated(response)) {
              resolve(false);
              return;
            }
            this.presentTncPage({response}).then(() => {
              resolve(true);
              return;
            }).catch(() => {
              reject();
            });
          });
      });
    });
  }

  public async onAcceptTnc(user: ServerProfile): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.profileService.acceptTermsAndConditions({version: user.tncLatestVersion})
        .toPromise()
        .then(() => {
          resolve();
        }).catch(() => {
        reject();
      });
    }))
    .then(() => {
      const reqObj = {
        userId: user.userId,
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
      };
      return new Promise<void>(((resolve, reject) => {
        this.profileService.getServerProfilesDetails(reqObj).toPromise()
        .then( res => {
            resolve();
          }).catch(e => {
            reject(e);
          });
      }));
    });
  }

  private async presentTncPage(navParams: any): Promise<undefined> {
    // migration-TODO
    // this.modal = this.modalCtrl.create(TermsAndConditionsPage, navParams);
    // return this.modal.present();
    return;
  }

  private hasProfileTncUpdated(user: ServerProfile): boolean {
    return !!(user.promptTnC && user.tncLatestVersion && user.tncLatestVersionUrl);
  }

  public async dismissTncPage(): Promise<void> {
    if (this.modal) {
      return this.modal.dismiss();
    }
  }
}
