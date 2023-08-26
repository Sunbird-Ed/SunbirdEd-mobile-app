// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { TutorService } from '../services/dsep.service'; // Import your tutor service

// @Component({
//   selector: 'app-tutor-details',
//   templateUrl: './tutor-details.page.html',
//   styleUrls: ['./tutor-details.page.scss'],
// })
// export class TutorDetailsPage implements OnInit {
//   tutor: Tutor;

//   constructor(
//     private route: ActivatedRoute,
//     private tutorService: TutorService
//   ) {}

//   ngOnInit() {
//     const tutorId = this.route.snapshot.paramMap.get('id'); // Get tutor ID from route parameter
//     this.tutor = this.tutorService.getTutorById(+tutorId); // Fetch tutor data by ID
//   }
// }
