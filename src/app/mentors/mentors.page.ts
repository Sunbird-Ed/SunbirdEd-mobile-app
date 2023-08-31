// // mentors.page.ts

// import { Component, OnInit } from '@angular/core';
// import { ModalController } from '@ionic/angular';
// import { MentorService } from '../services/mentor.service';
// import { MentorDetailsPage } from '../mentor-details/mentor-details.page';
// import { MentorFiltersPage } from '../mentor-filters/mentor-filters.page';

// @Component({
//   selector: 'app-mentors',
//   templateUrl: './mentors.page.html',
//   styleUrls: ['./mentors.page.scss']
// })
// export class Mentors implements OnInit {
//   mentors: any[] = [];
  
//   constructor(
//     private mentorService: MentorService,
//     private modalCtrl: ModalController
//   ) {}
  
//   ngOnInit() {
//     this.loadMentors();
//   }
  
//   async loadMentors() {
//     this.mentorService.getMentors().subscribe(
//         (mentors) => {
//           this.mentors = mentors; // Assign the fetched mentors to the property
//         },
//         (error) => {
//           console.error('Error fetching mentors:', error);
//         }
//       );
//   }
  
//   async openMentorDetails(mentorId: string) {
//     const modal = await this.modalCtrl.create({
//       component: MentorDetailsPage,
//       componentProps: { mentorId }
//     });
//     await modal.present();
//   }
  
//   async openMentorFilters() {
//     const modal = await this.modalCtrl.create({
//       component: MentorFiltersPage
//     });
//     await modal.present();
//     const { data } = await modal.onWillDismiss();
//     if (data && data.isFilterApplied) {
//       this.loadMentors();
//     }
//   }
// }


// export class TutorListPage {
//     // Other properties and methods
    
//     selectedClass: string; // Initialize this with default class if needed
//     selectedMedium: string; // Initialize this with default medium if needed
//     selectedSubject: string; // Initialize this with default subject if needed
    
//     classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
//     mediums = ["Awadhi", "Bhojpuri", "Brij Bhasha", "English", "Hindi", "Marathi", "Sanskrit", "Tamil", "Telgu", "Urdu", "Other"];
//     subjects = [
//         "Accountancy", "Accountancy and Auditing", "Accountancy Volume 1", "Accountancy Volume 2", "Agriculture Science",
//         "Agriculture", "Assamese", "Ayush", "Basic Electronics Engineering", "Bengali", "Bio Chemistry", "Biology",
//         "Botany", "Bsg", "Buisness Studies", "Chemistry", "Civis", "Computer", "Computer Science", "Cpse",
//         "Creative Writing And Translations", "Defence Studies", "Economics", "English", "English Reader", "Environmental Science",
//         "Environmental Studies", "Environmental Study", "Evs", "Evs Part 1", "Fine Arts", "French", "General Science",
//         "Geography", "Graaphic Design", "Griha Shilpa", "Gujarati", "Health and Physical Science", "Heritage Crafts", "Hindi",
//         "History", "History and Civics", "Home Science", "Information Practices", "Ircs", "Kannada", "Koborok", "Konkani",
//         "Malayalam", "Marathi", "Mathematics", "Maths", "Meitei(Manipur)", "Mizo", "Mohfw", "Moral Education", "Moya", "Ncc",
//         "Nepali", "Nss", "Nyks", "Odia", "Others", "Physical Science", "Physics", "Political Science", "Psycology", "Punjabi",
//         "Sanskrit", "Science", "Sindhi", "Skills", "Sociology", "Statistics", "Tamil", "Telgu", "Tourism and Travel Management",
//         "Training", "Urdu", "Urdu Zuban", "Zoology"
//     ];
    
//     // Other methods and logic
//   }
  


import { Component } from '@angular/core';
import { MentorService } from '../services/mentor.service';
import { LoadingController } from '@ionic/angular';
import { MD5 } from 'crypto-js';



@Component({
  selector: 'app-mentors',
  templateUrl: 'mentors.page.html',
  styleUrls: ['mentors.page.scss']
})
export class MentorsPage {
  mentors: any[] = [];
  sessionTitles: { title: string; checked: boolean }[] = [
    { title: 'ClusterNumber1', checked: false },
    { title: 'ClusterNumber2', checked: false },
    { title: 'ClusterNumber3', checked: false },
    { title: 'ClusterNumber4', checked: false },
    { title: 'ClusterNumber5', checked: false },
    { title: 'ClusterNumber6', checked: false },
    { title: 'ClusterNumber7', checked: false },
    { title: 'ClusterNumber8', checked: false },
    { title: 'ClusterNumber9', checked: false },
  ];
  private loader: HTMLIonLoadingElement | null = null;

  constructor(
    private mentorService: MentorService,
    private loadingController: LoadingController
  ) {}

  async presentLoading() {
    this.loader = await this.loadingController.create({
      message: 'Fetching mentors...',
    });
    await this.loader.present();
  }

  async dismissLoading() {
    if (this.loader) {
      await this.loader.dismiss();
      this.loader = null;
    }
  }

  onSessionTitleChange(event: any) {
    const selectedSessionTitle = event.detail.value;
    this.searchMentorsBySelectedSessionTitle(selectedSessionTitle);
  }

  async searchMentorsBySelectedSessionTitle(sessionTitle: string) {
    if (!sessionTitle) {
      this.mentors = []; // Clear mentors if no session title selected
      return;
    }

    try {
      this.presentLoading();
      const resp = await this.mentorService.searchMentorsBySessionTitle(sessionTitle).toPromise();
      if (resp) { // Check if resp is not undefined
        this.mentors = resp;
        console.log(`Mentors for ${sessionTitle}:`, resp);
      } else {
        console.log(`No mentors found for ${sessionTitle}`);
      }
    } catch (error) {
      console.log(`Error fetching mentors for ${sessionTitle}:`, error);
    } finally {
      this.dismissLoading();
    }
  }

  getRandomImageURL(): string {
    // Generate a random email address for Gravatar
    const randomEmail = `${Math.random()
      .toString(36)
      .substring(7)}@example.com`;
  
    // Calculate the MD5 hash of the random email address
    const hash = MD5(randomEmail.trim().toLowerCase());
  
    // Construct the Gravatar URL
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash.toString()}?s=200&d=identicon`;
  
    return gravatarUrl;
  }
  
}