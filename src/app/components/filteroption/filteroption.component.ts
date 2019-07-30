import { Component , ViewEncapsulation  } from '@angular/core';
import { NavParams, PopoverController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-filteroption',
  templateUrl: './filteroption.component.html',
  styleUrls: ['./filteroption.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilteroptionComponent {

  facets: any;
  backButtonFunc: Subscription;

  constructor(
    private navParams: NavParams,
    private popCtrl: PopoverController,
    private platform: Platform
    ) {
    this.facets = this.navParams.get('facet');
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.popCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
  }

  confirm() {
    this.popCtrl.dismiss();
  }

}
