import {
  AppGlobalService,
  LogoutHandlerService,
  TelemetryGeneratorService,
  CommonUtilService,
  Environment,
  InteractSubtype,
  InteractType,
  PageId,
  ContainerService
} from './../../../services';
import { Component, ViewChild, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
// import { SettingsPage } from '../../settings/settings';
// import { UserAndGroupsPage } from '../../user-and-groups/user-and-groups';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { RouterLinks } from 'src/app/app.constant';
// import { ReportsPage } from '../../reports/reports';

@Component({
  selector: 'app-overflow-menu',
  templateUrl: './overflow-menu.component.html',
  styleUrls: ['./overflow-menu.component.scss'],
})
export class OverflowMenuComponent implements OnInit {

  items: Array<string>;
  profile: any = {};

  constructor(
    private logoutHandlerService: LogoutHandlerService,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private container: ContainerService,
    private commonUtilService: CommonUtilService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.items = this.router.getCurrentNavigation().extras.state.list;
    this.profile = this.router.getCurrentNavigation().extras.state.profile || {};

  }

  ngOnInit() { }

  showToast() {
    this.items = this.router.getCurrentNavigation().extras.state.list || [];

  }

  close(event, i) {
    // Migration todo
    /* this.viewCtrl.dismiss(JSON.stringify({
      'content': event.target.innerText,
      'index': i
    })); */
    switch (i) {
      case 'USERS_AND_GROUPS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.USER_GROUP_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );
        // this.app.getActiveNav().push(UserAndGroupsPage, { profile: this.profile });

        const navigationExtras: NavigationExtras = {
          state: {
            profile: this.profile
          }
        }

        this.router.navigate([RouterLinks.USER_AND_GROUPS], navigationExtras);
        break;

      case 'REPORTS':
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.REPORTS_CLICKED,
          Environment.USER,
          PageId.PROFILE
        );
        // this.app.getActiveNav().push(ReportsPage, { profile: this.profile });
        this.router.navigate([RouterLinks.REPORTS], {
          state: {
            profile: this.profile
          }
        });
        break;

      case 'SETTINGS': {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SETTINGS_CLICKED,
          Environment.USER,
          PageId.PROFILE,
          null,
          undefined,
          undefined
        );
        // this.app.getActiveNav().push(SettingsPage);

        const navigationExtras: NavigationExtras = {
          state: {
            profile: this.profile
          }
        }

        this.router.navigate([RouterLinks.USER_AND_GROUPS], navigationExtras);
        break;
      }
      case 'LOGOUT':
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
          this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        } else {
          this.logoutHandlerService.onLogout();
        }
        break;
    }
  }
}
