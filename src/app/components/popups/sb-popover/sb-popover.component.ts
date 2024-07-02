import { Component, NgZone, OnDestroy } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CorrelationData, Rollup } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'sb-popover',
  templateUrl: 'sb-popover.component.html'
})
export class SbPopoverComponent implements OnDestroy {
  sbPopoverHeading: any;
  sbPopoverMainTitle: any;
  sbPopoverContent: any;
  sbPopoverHtmlContent?: string;
  sbPopoverInfo: any;
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
  img: any;
  disableDeviceBackButton: boolean;
  showCloseBtn = true;
  public objRollup: Rollup;

  public corRelationList: Array<CorrelationData>;
  public sbPopoverDynamicMainTitle$?: Observable<string>;
  public sbPopoverDynamicMainTitleSubscription?: Subscription;
  public sbPopoverDynamicContent$?: Observable<string>;
  public sbPopoverDynamicContentSubscription?: Subscription;
  public sbPopoverDynamicButtonDisabledSubscription?: Subscription;

  constructor(
    public navParams: NavParams,
    private platform: Platform,
    private ngZone: NgZone,
    private popoverCtrl: PopoverController,
  ) {
    this.content = this.navParams.get('content');
    this.actionsButtons = this.navParams.get('actionsButtons');
    this.icon = this.navParams.get('icon');
    this.metaInfo = this.navParams.get('metaInfo');
    this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    this.sbPopoverHtmlContent = this.navParams.get('sbPopoverHtmlContent');
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');
    this.showCloseBtn = this.navParams.get('showCloseBtn');
    this.sbPopoverInfo = this.navParams.get('sbPopoverInfo');


    this.content = this.navParams.get('content');
    this.data = this.navParams.get('data');
    this.batchDetails = this.navParams.get('batchDetails');
    this.pageName = this.navParams.get('pageName');
    this.objRollup = this.navParams.get('objRollup');
    this.corRelationList = this.navParams.get('corRelationList');
    this.img = this.navParams.get('img');
    this.disableDeviceBackButton = this.navParams.get('disableDeviceBackButton');

    // Dynamic
    this.sbPopoverDynamicMainTitle$ = this.navParams.get('sbPopoverDynamicMainTitle');
    this.sbPopoverDynamicContent$ = this.navParams.get('sbPopoverDynamicContent');


    if (this.navParams.get('isChild')) {
      this.isChild = true;
    }

    if (this.sbPopoverDynamicMainTitle$) {
      this.sbPopoverDynamicMainTitleSubscription = this.sbPopoverDynamicMainTitle$.pipe(
        tap((v) => {
          this.ngZone.run(() => {
            this.sbPopoverMainTitle = v;
          });
        })
      )
      .subscribe();
    }

    if (this.sbPopoverDynamicContent$) {
      this.sbPopoverDynamicContentSubscription = this.sbPopoverDynamicContent$.pipe(
        tap((v) => {
          this.ngZone.run(() => {
            this.sbPopoverContent = v;
          });
        })
      )
      .subscribe();
    }
    for (const actionsButton of this.actionsButtons) {
      if (actionsButton.btnDisabled$) {
        this.sbPopoverDynamicButtonDisabledSubscription = actionsButton.btnDisabled$.pipe(
          tap((v) => {
            // this.ngZone.run(() => {
            actionsButton.btnDisabled = v;
            // });
          })
        )
        .subscribe();
      }
    }

    this.contentId = (this.content && this.content.identifier) ? this.content.identifier : '';
  }

  ionViewWillEnter() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      if (this.disableDeviceBackButton) {
        return;
      }
      await this.popoverCtrl.dismiss();
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

  async closePopover(closeDeletePopOver: boolean) {
   await this.popoverCtrl.dismiss({closeDeletePopOver});
  }

  async deleteContent(canDelete: boolean = false, btn?) {
    await this.popoverCtrl.dismiss({ canDelete });
    if (this.navParams.get('handler')) {
      this.navParams.get('handler')(btn.btntext);
    }
  }
}
