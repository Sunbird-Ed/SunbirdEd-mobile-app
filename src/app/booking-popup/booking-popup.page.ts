// src/app/pages/booking-popup/booking-popup.page.ts

import { Component } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-booking-popup',
  templateUrl: './booking-popup.page.html',
  styleUrls: ['./booking-popup.page.scss'],
})
export class BookingPopupPage {
  email: string = '';
  bookingSuccess: boolean = false; // Initialize as false

  constructor(
    private modalController: ModalController,
  private loadingController: LoadingController,
  private toastController: ToastController
  ) {}

  closeModal() {
    this.modalController.dismiss();
  }

  async bookSession() {
    // Show a loading indicator while processing
    const loading = await this.loadingController.create({
      message: 'Booking the session...',
    });
    await loading.present();
  
    // Simulate a delay to mimic a booking process (you can replace this with your actual booking logic)
    setTimeout(async () => {
      await loading.dismiss();
  
      // Display a success toast message
      const toast = await this.toastController.create({
        message: 'Session booked successfully!',
        duration: 2000, // Duration in milliseconds (2 seconds in this case)
        position: 'top', // You can change the position as needed
        color: 'success', // Change the color for success messages
      });
      await toast.present();
  
      // Close the modal
      this.modalController.dismiss();
    }, 2000); // Simulated 2-second delay
  }
  

  // Add a simple email validation function (you can replace it with your own validation logic)
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
