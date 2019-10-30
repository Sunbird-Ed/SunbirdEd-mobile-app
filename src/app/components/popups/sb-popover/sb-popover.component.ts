import { Component, NgZone, OnDestroy } from '@angular/core';
import { Platform, NavParams, PopoverController } from '@ionic/angular';
import { CorrelationData, Rollup, TelemetryObject } from 'sunbird-sdk';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';

import {Environment, InteractSubtype, InteractType, PageId} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';

@Component({
  selector: 'sb-popover',
  templateUrl: 'sb-popover.component.html'
})
export class SbPopoverComponent implements OnDestroy {
  sbPopoverHeading: any;
  sbPopoverMainTitle: any;
  sbPopoverContent: any;
  sbPopoverHtmlContent?: string;
  actionsButtons: any;
  icon: any;
  metaInfo: any;
  content: any;
  data: any;
  isChild = false;
  contentId: string;
  batchDetails: any;
  backButtonFunc = undefined;
  userId = '';
  pageName = '';
  showFlagMenu = true;
  img: string;
  public objRollup: Rollup;
  private corRelationList: Array<CorrelationData>;
  private sbPopoverDynamicMainTitle$?: Observable<string>;
  private sbPopoverDynamicMainTitleSubscription?: Subscription;
  private sbPopoverDynamicContent$?: Observable<string>;
  private sbPopoverDynamicContentSubscription?: Subscription;
  private sbPopoverDynamicButtonDisabledSubscription?: Subscription;
  public telemetryObject: TelemetryObject;
  constructor(
    public navParams: NavParams,
    private platform: Platform,
    private ngZone: NgZone,
    private popoverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
    this.content = this.navParams.get('content');
    this.actionsButtons = this.navParams.get('actionsButtons');
    this.icon = this.navParams.get('icon');
    this.metaInfo = this.navParams.get('metaInfo');
    this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    this.sbPopoverHtmlContent = this.navParams.get('sbPopoverHtmlContent');
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');

    this.content = this.navParams.get('content');
    this.data = this.navParams.get('data');
    this.batchDetails = this.navParams.get('batchDetails');
    this.pageName = this.navParams.get('pageName');
    this.objRollup = this.navParams.get('objRollup');
    this.corRelationList = this.navParams.get('corRelationList');
    this.img = this.navParams.get('img');
    this.telemetryObject = ContentUtil.getTelemetryObject(this.content);

    // Dynamic
    this.sbPopoverDynamicMainTitle$ = this.navParams.get('sbPopoverDynamicMainTitle');
    this.sbPopoverDynamicContent$ = this.navParams.get('sbPopoverDynamicContent');


    if (this.navParams.get('isChild')) {
      this.isChild = true;
    }

    if (this.sbPopoverDynamicMainTitle$) {
      this.sbPopoverDynamicMainTitleSubscription = this.sbPopoverDynamicMainTitle$
        .do((v) => {
          this.ngZone.run(() => {
            this.sbPopoverMainTitle = v;
          });
        })
        .subscribe();
    }

    if (this.sbPopoverDynamicContent$) {
      this.sbPopoverDynamicContentSubscription = this.sbPopoverDynamicContent$
        .do((v) => {
          this.ngZone.run(() => {
            this.sbPopoverContent = v;
          });
        })
        .subscribe();
    }
    for (const actionsButton of this.actionsButtons) {
      if (actionsButton.btnDisabled$) {
        this.sbPopoverDynamicButtonDisabledSubscription = actionsButton.btnDisabled$
          .do((v) => {
            // this.ngZone.run(() => {
            actionsButton.btnDisabled = v;
            // });
          })
          .subscribe();
      }
    }

    this.contentId = (this.content && this.content.identifier) ? this.content.identifier : '';
  }

  ionViewWillEnter() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.sbPopoverDynamicMainTitleSubscription) {
      this.sbPopoverDynamicMainTitleSubscription.unsubscribe();
    }

    if (this.sbPopoverDynamicContentSubscription) {
      this.sbPopoverDynamicContentSubscription.unsubscribe();
    }
    if (this.sbPopoverDynamicButtonDisabledSubscription) {
      this.sbPopoverDynamicButtonDisabledSubscription.unsubscribe();
    }

    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  closePopover() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CLOSE_CLICKED,
      Environment.HOME,
      PageId.COLLECTION_DETAIL, this.telemetryObject,undefined,
      this.objRollup,
      this.corRelationList);
    this.popoverCtrl.dismiss();
  }

  async deleteContent(canDelete: boolean = false, clickedButtonText?) {
    this.popoverCtrl.dismiss({ canDelete });
    if (this.navParams.get('handler')) {
      this.navParams.get('handler')(clickedButtonText);
    }
  }
}
