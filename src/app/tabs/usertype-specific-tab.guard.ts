import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { ProfileType, SharedPreferences } from '@project-sunbird/sunbird-sdk';
​
​
@Injectable()
export class UserTypeSpecificTabGuard implements CanActivate {
  constructor(@Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
              private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
    if (selectedUserType === ProfileType.ADMIN) {
        return this.router.createUrlTree([RouterLinks.HOME_TAB]);
    }
    return true;
  }
}
