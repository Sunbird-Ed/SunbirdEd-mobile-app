import { Component, OnDestroy } from '@angular/core';
import { Platform, NavParams, PopoverController } from '@ionic/angular';
import { Subscription} from 'rxjs';

@Component({
  selector: 'app-toast-navigation',
  templateUrl: './toast-navigation.component.html',
  styleUrls: ['./toast-navigation.component.scss'],
})
export class ToastNavigationComponent implements OnDestroy {
  message: any;
  description: any;
  btnText: any;
  backButtonFunc: Subscription;

  constructor(
    public navParams: NavParams,
    private platform: Platform,
    private popoverCtrl: PopoverController,
  ) {
    this.message = this.navParams.get('message');
    this.description = this.navParams.get('description');
    this.btnText = this.navParams.get('btnText');
  }

  ionViewWillEnter() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  onSuccessClick() {
    this.popoverCtrl.dismiss(true);
  }
}
