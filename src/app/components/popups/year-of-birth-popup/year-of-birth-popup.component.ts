import { Component, Inject, OnInit } from '@angular/core';
import { CommonUtilService } from '../../../../services/common-util.service';
import { NavParams, PopoverController } from '@ionic/angular';
import { ProfileService } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-year-of-birth-popup',
  templateUrl: './year-of-birth-popup.component.html',
  styleUrls: ['./year-of-birth-popup.component.scss'],
})
export class YearOfBirthPopupComponent implements OnInit {
  selectedYearOfBirth: number;
  birthYearOptions: Array<number> = [];
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private popOverCtrl: PopoverController,
    private navParams: NavParams,
    private commonUtilService: CommonUtilService
  ) { }
  ngOnInit(): void {
    this.initiateYearSelecter();
  }
  async submit() { 
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const uid = this.navParams.get('uid');
    const req = {
      userId: uid,
      dob: this.selectedYearOfBirth.toString()
    };
    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        await this.popOverCtrl.dismiss();
      }).catch(async () => {
        if (loader) {
          await loader.dismiss();
        }
        await this.popOverCtrl.dismiss();
      });
  }

  initiateYearSelecter() {
    const endYear = new Date().getFullYear();
    for (let year = endYear; year > 1921; year--) {
      this.birthYearOptions.push(year);
    }
  }
}
