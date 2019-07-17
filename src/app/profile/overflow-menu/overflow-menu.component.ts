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
// import { SettingsPage } from '../../settings/settings';
// import { UserAndGroupsPage } from '../../user-and-groups/user-and-groups';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { RouterLinks } from '../../app.constant';
import { NavParams, PopoverController } from '@ionic/angular';
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
    private router: Router,
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {
    this.items = this.navParams.get('list');
    this.profile = this.navParams.get('profile') || {};
  }


  ngOnInit() { }

  showToast() {
    this.items = this.navParams.get('list') || [];

  }

  open(event) {
    this.popoverCtrl.dismiss({
      content: event.target.innerText,
    });
  }
}
