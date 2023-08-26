// import { Component, EventEmitter, Output } from '@angular/core';
// import { ModalController } from '@ionic/angular';
// import { FilterModalPage } from '../../components/filter-modal/filter-modal.page'; // Replace with your actual path

// @Component({
//   selector: 'app-tutor-filter',
//   templateUrl: './tutor-filter.component.html',
//   styleUrls: ['./tutor-filter.component.scss']
// })
// export class TutorFilterComponent {
//   @Output() filterChange = new EventEmitter<any>();

//   constructor(private modalController: ModalController) {}

//   openFilterPage() {
//     this.modalController.create({
//       component: FilterModalPage, // Create FilterModalPage
//       componentProps: {
//         // Pass initial filter options if needed
//       }
//     }).then(modal => {
//       modal.onDidDismiss().then(result => {
//         if (result.data) {
//           this.filterChange.emit(result.data);
//         }
//       });
//       modal.present();
//     });
//   }
// }
