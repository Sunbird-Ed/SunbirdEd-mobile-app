import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-group-detail-nav-popover',
  templateUrl: './group-detail-nav-popover.html',
  styleUrls: ['./group-detail-nav-popover.scss'],
})
export class GroupDetailNavPopover {

  noUsers = false;
  isActiveGroup = false;
  constructor(private navParams: NavParams) {
    this.isActiveGroup = this.navParams.get('isActiveGroup');
    this.noUsers = Boolean(this.navParams.get('noUsers'));
  }

  goToEditGroup() {
    this.navParams.get('goToEditGroup')();
  }

  deleteGroup() {
    this.navParams.get('deleteGroup')();
  }

  addUsers() {
    this.navParams.get('addUsers')();
  }

  removeUser() {
    this.navParams.get('removeUser')();
  }


}
