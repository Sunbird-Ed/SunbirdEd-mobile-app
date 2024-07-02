import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType, InteractSubtype,
  InteractType,
  PageId
} from '../../../../services/telemetry-constants';
import { CommonUtilService } from '../../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-my-groups-popover.component.html',
  styleUrls: ['./sb-my-groups-popover.component.scss'],
})
export class MyGroupsPopoverComponent implements OnInit {

  title: string;
  body: any;
  buttonText: string;
  isFromAddMember = false;
  appName: string;
  backButtonFunc: Subscription;

  constructor(
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  async ionViewWillEnter() {
    this.buttonText = this.navParams.get('buttonText');
    this.isFromAddMember = this.navParams.get('isFromAddMember');
    this.appName = await this.commonUtilService.getAppName();

    if (this.isFromAddMember) {
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
        ImpressionSubtype.DISPLAY_SUNBIRD_ID_TUTORIAL, PageId.ADD_MEMBER, Environment.GROUP);
    } else {
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
        ImpressionSubtype.GROUP_TUTORIAL, PageId.MY_GROUP, Environment.GROUP);
    }
  }

  async close(getStartedClicked: boolean) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      getStartedClicked ? InteractSubtype.TUTORIAL_CONTINUE_CLICKED : InteractSubtype.CLOSE_CLICKED,
      Environment.GROUP,
      this.isFromAddMember ? PageId.ADD_MEMBER : PageId.MY_GROUP
    );
    await this.popOverCtrl.dismiss();
  }

  async getStarted() {
    console.log('get started clicked');
    await this.close(true);
  }
}
