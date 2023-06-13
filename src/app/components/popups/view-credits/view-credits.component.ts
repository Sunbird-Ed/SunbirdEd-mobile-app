import { Component, OnInit } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { Environment, InteractType, InteractSubtype } from '../../../../services/telemetry-constants';
import { ContentUtil } from '../../../../util/content-util';

@Component({
  selector: 'app-view-credits',
  templateUrl: './view-credits.component.html',
  styleUrls: ['./view-credits.component.scss'],
})
export class ViewCreditsComponent implements OnInit {

  userId = '';
  backButtonFunc = undefined;
  content: any;
  rollUp: any;
  correlation: any;
  pageId = '';

  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private popOverCtrl: PopoverController,
    private telemetrygeneratorService: TelemetryGeneratorService
  ) {}

  ngOnInit(): void {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  ionViewDidLoad(): void {
    this.content = this.navParams.get('content');
    this.pageId = this.navParams.get('pageId');
    this.rollUp = this.navParams.get('rollUp');
    this.correlation = this.navParams.get('correlation');
    const telemetryObject = ContentUtil.getTelemetryObject(this.content);

    this.telemetrygeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CREDITS_CLICKED,
      Environment.HOME,
      this.pageId,
      telemetryObject,
      undefined,
      this.rollUp,
      this.correlation
    );
  }

  mergeProperties(mergeProp) {
    return ContentUtil.mergeProperties(this.content, mergeProp);
  }

  async cancel() {
    await this.popOverCtrl.dismiss();
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
}
