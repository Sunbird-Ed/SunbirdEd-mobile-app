import { Component, Inject, OnInit } from '@angular/core';
import { AppGlobalService, CommonUtilService } from '@app/services';
import { PopoverController } from '@ionic/angular';
import { ProfileService } from 'sunbird-sdk';

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
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService
  ) { }
  ngOnInit(): void {
    this.initiateYearSelecter();
  }
  async submit() {
    const currentYear = new Date().getFullYear();
    const userAge = currentYear - this.selectedYearOfBirth;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const req = {
      userId: this.appGlobalService.getCurrentUser().uid,
      dob: this.selectedYearOfBirth.toString()
    };
    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        this.popOverCtrl.dismiss();
      }).catch(async () => {
        if (loader) {
          await loader.dismiss();
        }
        this.popOverCtrl.dismiss();
      });
  }

  initiateYearSelecter() {
    const endYear = new Date().getFullYear();
    for (let year = endYear; year > 1921; year--) {
      this.birthYearOptions.push(year);
    }
  }
}
