import { Inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  AuthService, OAuthSession, ProfileService,
  ServerProfile, ServerProfileDetailsRequest, CachedItemRequestSourceFrom
} from 'sunbird-sdk';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { TermsAndConditionsPage } from '@app/app/terms-and-conditions/terms-and-conditions.page';
import { Router, NavigationExtras } from '@angular/router';
import { CommonUtilService } from '../common-util.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';

@Injectable({
  providedIn: 'root'
})
export class TncUpdateHandlerService {

  modal: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private commonUtilService: CommonUtilService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  public async checkForTncUpdate(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const sessionData = await this.authService.getSession().toPromise();
      if (!sessionData) {
        resolve(false);
        return;
      }
      const request: ServerProfileDetailsRequest = {
        userId: sessionData.userToken,
        requiredFields: ProfileConstants.REQUIRED_FIELDS,
        from: CachedItemRequestSourceFrom.SERVER
      };
      this.profileService.getServerProfilesDetails(request).toPromise()
        .then((profile) => {
          if (!this.hasProfileTncUpdated(profile)) {
            if (this.commonUtilService.networkInfo.isNetworkAvailable) {
              this.formAndFrameworkUtilService.getCustodianOrgId()
                .then((custodianOrgId: string) => {
                  const isCustodianOrgId = profile.rootOrg.rootOrgId === custodianOrgId;

                  if (isCustodianOrgId
                    && !this.commonUtilService.isUserLocationAvalable(profile)) {
                    const navigationExtras: NavigationExtras = {
                      state: {
                        isShowBackButton: false
                      }
                    };
                    this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras)
                      .then(() => resolve(false));
                    return;
                  } else {
                    resolve(false);
                    return;
                  }
                })
                .catch((error) => {
                  console.error('Error:', error);
                  reject();
                });
            }
            resolve(false);
            return;
          }
          this.presentTncPage({ profile })
            .then(() => {
              resolve(true);
              return;
            })
            .catch((error) => {
              console.error('Error:', error);
              reject();
            });
        });
    });
  }

  public async onAcceptTnc(user: ServerProfile): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.profileService.acceptTermsAndConditions({ version: user.tncLatestVersion })
        .toPromise()
        .then(() => {
          resolve();
        })
        .catch(() => {
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
            .then(res => {
              resolve();
            })
            .catch(e => {
              reject(e);
            });
        }));
      });
  }

  async presentTncPage(navParams: any): Promise<undefined> {
    this.modal = await this.modalCtrl.create({
      component: TermsAndConditionsPage,
      componentProps: navParams
    });
    return await this.modal.present();
  }

  private hasProfileTncUpdated(user: ServerProfile): boolean {
    return !!(user.promptTnC && user.tncLatestVersion && user.tncLatestVersionUrl);
  }

  public async dismissTncPage(): Promise<void> {
    if (this.modal) {
      return await this.modal.dismiss();
    }
  }
}
