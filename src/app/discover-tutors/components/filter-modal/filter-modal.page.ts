import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.page.html',
  styleUrls: ['./filter-modal.page.scss']
})
export class FilterModalPage {
  classes = [
    { name: 'Class 9', selected: false },
    { name: 'Class 10', selected: false },
    { name: 'Class 11', selected: false }
    // Add more classes
  ];

  subjects = [
    { name: 'Science', selected: false },
    { name: 'Mathematics', selected: false },
    { name: 'Social Studies', selected: false }
    // Add more subjects
  ];

  mediums = [
    { name: 'English', selected: false },
    { name: 'Hindi', selected: false }
    // Add more mediums
  ];

  constructor(private modalController: ModalController) {}

  toggleClass(classItem: any) {
    classItem.selected = !classItem.selected;
  }

  toggleSubject(subjectItem: any) {
    subjectItem.selected = !subjectItem.selected;
  }

  toggleMedium(mediumItem: any) {
    mediumItem.selected = !mediumItem.selected;
  }
  // Similar methods for toggling subjects and mediums

  applyFilter() {
    const filterOptions = {
      classes: this.getSelectedItems(this.classes),
      subjects: this.getSelectedItems(this.subjects),
      mediums: this.getSelectedItems(this.mediums)
    };
    this.modalController.dismiss(filterOptions);
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  private getSelectedItems(items: any[]): string[] {
    return items.filter(item => item.selected).map(item => item.name);
  }
}
