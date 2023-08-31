// // mentor-details.page.ts

// import { Component, OnInit } from '@angular/core';
// import { NavParams, ModalController } from '@ionic/angular';
// import { MentorService } from '../services/mentor.service';

// @Component({
//   selector: 'app-mentor-details',
//   templateUrl: './mentor-details.page.html',
//   styleUrls: ['./mentor-details.page.scss']
// })
// export class MentorDetailsPage implements OnInit {
//   mentor: any;
  
//   constructor(
//     private navParams: NavParams,
//     private modalCtrl: ModalController,
//     private mentorService: MentorService
//   ) {}
  
//   ngOnInit() {
//     const mentorId = this.navParams.get('mentorId');
//     this.loadMentorDetails(mentorId);
//   }
  
//   async loadMentorDetails(mentorId: string) {
//     this.mentor = await this.mentorService.getMentorDetails(mentorId);
//   }
  
//   close() {
//     this.modalCtrl.dismiss();
//   }
// }

import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorService } from '../services/mentor.service';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss']
})
export class MentorDetailsPage implements OnInit {

  mentors: any[] = []; // Initialize as an empty object
  mentor: any

  constructor(private route: ActivatedRoute, private mentorService: MentorService) {}

  ngOnInit() {
    // Get the mentor ID from the route parameter
    const mentorId = this.route.snapshot.paramMap.get('mentorId');
    console.log(mentorId)
    
    this.mentors = this.mentorService.getMentorsList()
    // console.log(`Mentors : ${JSON.stringify(this.mentors)}`)
    let res = this.mentors.find(i => i.mentor.id === mentorId)
    this.mentor = res.mentor
  }
}







