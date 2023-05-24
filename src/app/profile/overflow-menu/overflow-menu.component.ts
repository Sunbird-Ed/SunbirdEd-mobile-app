import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-overflow-menu',
  templateUrl: './overflow-menu.component.html',
  styleUrls: ['./overflow-menu.component.scss'],
})
export class OverflowMenuComponent {

  items: Array<string>;
  profile: any = {};

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {
    this.items = this.navParams.get('list');
    this.profile = this.navParams.get('profile') || {};
  }

  showToast() {
    this.items = this.navParams.get('list') || [];
  }

  async open(event, item) {
    await this.popoverCtrl.dismiss({
      content: event.target.innerText,
      selectedItem: item
    });
  }
}
