import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SharedPreferences, ProfileType } from 'sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../app.constant';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    const isAdminUser = (await this.sharedPreferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise() === ProfileType.ADMIN);
    let routePath = `${RouterLinks.HOME_TAB}/${RouterLinks.HOME_USER}`;
    if (isAdminUser) {
        routePath = `${RouterLinks.HOME_TAB}/${RouterLinks.HOME_ADMIN}`;
    }
    this.router.navigate([routePath]);

  }

}
