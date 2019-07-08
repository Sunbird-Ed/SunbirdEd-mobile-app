import { Component, Inject, OnInit } from '@angular/core';
import { SharedPreferences } from 'sunbird-sdk';
import { PreferenceKey } from '../../../app/app.constant';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss'],
})
export class BookmarkComponent implements OnInit {
  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public modalCtrl: ModalController) {

  }
  ngOnInit() {}

  updateBookmarkPreference() {
    this.preferences.putString(PreferenceKey.IS_BOOKMARK_VIEWED, 'true').toPromise().then();
    this.modalCtrl.dismiss();
  }
}
