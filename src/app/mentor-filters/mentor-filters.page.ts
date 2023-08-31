// mentor-filters.page.ts

import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-mentor-filters',
  templateUrl: './mentor-filters.page.html',
  styleUrls: ['./mentor-filters.page.scss']
})
export class MentorFiltersPage {
  selectedClass: string;
  selectedMedium: string;
  selectedSubject: string;
  
  constructor(private modalCtrl: ModalController) {}
  
  applyFilter() {
    const filterOptions = {
      class: this.selectedClass,
      medium: this.selectedMedium,
      subject: this.selectedSubject
    };
    this.modalCtrl.dismiss({ isFilterApplied: true, filterOptions });
  }
  
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
