import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-edit-delete-popover',
  templateUrl: './edit-delete-popover.component.html',
  styleUrls: ['./edit-delete-popover.component.scss'],
})
export class EditDeletePopoverComponent implements OnInit {
  isCurrentUser = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.isCurrentUser = Boolean(this.navParams.get('isCurrentUser'));
  }

  ngOnInit() { }

  delete() {
    this.navParams.get('delete')();
  }
  edit() {
    this.navParams.get('edit')();
  }

}
