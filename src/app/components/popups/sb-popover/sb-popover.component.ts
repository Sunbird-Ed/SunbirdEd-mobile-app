import {Component, NgZone, OnDestroy} from '@angular/core';
// import {NavParams, Platform, ViewController} from 'ionic-angular';
import {Platform} from '@ionic/angular';
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
    // migration-TODO
    // public viewCtrl: ViewController,
    // public navParams: NavParams,
    private platform: Platform,
    private ngZone: NgZone
  ) {
    // migration-TODO
    // this.content = this.navParams.get('content');
    // this.actionsButtons = this.navParams.get('actionsButtons');
    // this.icon = this.navParams.get('icon');
    // this.metaInfo = this.navParams.get('metaInfo');
    // this.sbPopoverContent = this.navParams.get('sbPopoverContent');
    // this.sbPopoverHeading = this.navParams.get('sbPopoverHeading');
    // this.sbPopoverMainTitle = this.navParams.get('sbPopoverMainTitle');

    // this.content = this.navParams.get('content');
    // this.data = this.navParams.get('data');
    // this.batchDetails = this.navParams.get('batchDetails');
    // this.pageName = this.navParams.get('pageName');
    // this.objRollup = this.navParams.get('objRollup');
    // this.corRelationList = this.navParams.get('corRelationList');
    // this.img = this.navParams.get('img');

    // // Dynamic
    // this.sbPopoverDynamicMainTitle$ = this.navParams.get('sbPopoverDynamicMainTitle');
    // this.sbPopoverDynamicContent$ = this.navParams.get('sbPopoverDynamicContent');


    // if (this.navParams.get('isChild')) {
    //   this.isChild = true;
    // }

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
    // this.backButtonFunc = this.platform.registerBackButtonAction(() => {
    //   // this.viewCtrl.dismiss();
    this.backButtonFunc.unsubscribe();
    // }, 20);
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
    // migration-TODO
    // this.viewCtrl.dismiss();
  }
  deleteContent(candelete: boolean = false, whichbtnClicked?) {
    // migration-TODO
    // this.viewCtrl.dismiss(candelete);
    // if (this.navParams.get('handler')) {
      // this.navParams.get('handler')(whichbtnClicked);
    // }
  }

  ionViewWillLeave(): void {
    this.backButtonFunc.unsubscribe();
  }
}
