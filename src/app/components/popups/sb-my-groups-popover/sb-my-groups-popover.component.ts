import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import {
  CommonUtilService,
  Environment,
  ImpressionSubtype,
  ImpressionType, InteractSubtype,
  InteractType,
  PageId,
  TelemetryGeneratorService
} from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-groups-popover',
  templateUrl: './sb-my-groups-popover.component.html',
  styleUrls: ['./sb-my-groups-popover.component.scss'],
})
export class MyGroupsPopoverComponent implements OnInit{

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
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  ionViewWillEnter() {
    this.buttonText = this.navParams.get('buttonText');
    this.isFromAddMember = this.navParams.get('isFromAddMember');
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });

    if (this.isFromAddMember) {
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
          ImpressionSubtype.DISPLAY_DIKSHA_ID_TUTORIAL, PageId.ADD_MEMBER, Environment.GROUP);
    } else {
      this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
          ImpressionSubtype.GROUP_TUTORIAL, PageId.MY_GROUP, Environment.GROUP);
    }
  }

  close(getStartedClicked: boolean) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        getStartedClicked ? InteractSubtype.TUTORIAL_CONTINUE_CLICKED : InteractSubtype.CLOSE_CLICKED,
        Environment.GROUP,
        PageId.MY_GROUP
    );
    this.popOverCtrl.dismiss();
  }

  getStarted() {
    console.log('get started clicked');
    this.close(true);
  }
}
