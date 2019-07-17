import {Component, NgZone, OnDestroy} from '@angular/core';
import {Platform , NavParams , PopoverController} from '@ionic/angular';
import {CorrelationData, Rollup} from 'sunbird-sdk';
import {Observable, Subscription} from 'rxjs';

/**
 * Generated class for the PopupsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sb-popover',
  templateUrl: 'sb-popover.component.html'
})
export class SbPopoverComponent implements OnDestroy {
  sbPopoverHeading: any;
  sbPopoverMainTitle: any;
  sbPopoverContent: any;
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

  constructor(
    public navParams: NavParams,
    private platform: Platform,
    private ngZone: NgZone,
    private popoverCtrl: PopoverController
  ) {
    this.content = this.navParams.get('content');
    this.actionsButtons = this.navParams.get('actionsButtons');
    this.icon = this.navParams.get('icon');
    this.metaInfo = this.navParams.get('metaInfo');
    this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');

    this.content = this.navParams.get('content');
    this.data = this.navParams.get('data');
    this.batchDetails = this.navParams.get('batchDetails');
    this.pageName = this.navParams.get('pageName');
    this.objRollup = this.navParams.get('objRollup');
    this.corRelationList = this.navParams.get('corRelationList');
    this.img = this.navParams.get('img');

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

    this.contentId = (this.content && this.content.identifier) ? this.content.identifier : '';
    // migration-TODO
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.popoverCtrl.dismiss();
      // this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.sbPopoverDynamicMainTitleSubscription) {
      this.sbPopoverDynamicMainTitleSubscription.unsubscribe();
    }

    if (this.sbPopoverDynamicContentSubscription) {
      this.sbPopoverDynamicContentSubscription.unsubscribe();
    }
  }

  closePopover() {
    this.popoverCtrl.dismiss();
  }
  deleteContent(candelete: boolean = false, whichbtnClicked?) {
    // migration-TODO
    this.popoverCtrl.dismiss(candelete);
    if (this.navParams.get('handler')) {
      this.navParams.get('handler')(whichbtnClicked);
    }
  }

  ionViewWillLeave(): void {
    this.backButtonFunc.unsubscribe();
  }
}
