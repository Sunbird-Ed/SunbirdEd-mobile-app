
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorService } from '../services/mentor.service';
import { ModalController } from '@ionic/angular';
import { BookingPopupPage } from '../booking-popup/booking-popup.page';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss']
})
export class MentorDetailsPage implements OnInit {

  mentors: any[] = []; // Initialize as an empty object
  mentor: any
  slots: any[] = []
  bookingSuccess: boolean = false; // Initialize as false


  constructor(private route: ActivatedRoute, private mentorService: MentorService, private modalController: ModalController) {}

  ngOnInit() {
    // Get the mentor ID from the route parameter
    const mentorId = this.route.snapshot.paramMap.get('mentorId');
    console.log(mentorId)
    
    this.mentors = this.mentorService.getMentorsList()
    // console.log(`Mentors : ${JSON.stringify(this.mentors)}`)
    let res = this.mentors.find(i => i.mentor.id === mentorId)
    this.mentor = res.mentor
    this.slots = res.slots
    console.log(res)
  }

  async openBookingPopup() {
    console.log('Opening booking popup...'); // Add this line for debugging
  
    const modal = await this.modalController.create({
      component: BookingPopupPage,
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.success) {
        // Handle successful booking here, e.g., display a success message
        console.log('Booking successful!');
        this.bookingSuccess = true; // Add this line for debugging
      }
    });
  
    return await modal.present();
  }
  
  
}







