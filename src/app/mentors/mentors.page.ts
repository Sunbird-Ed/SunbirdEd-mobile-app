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
  mentors: any[] = []; // Array to store mentor data
  subjects: string[] = [
    'Accountancy',
    'Agriculture Science',
    'Economics',
    'Environmental Science',
    'General Science',
    'Geography',
    'Sociology',
    'Tourism and Travel Management',
    'Zoology',
  ];
  languageOptions: string[] = ['English', 'Hindi', 'Tamil', 'Telgu'];
  classes: string[] = [
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
  ];
  selectedClass: string | undefined;
  selectedSubject: string | undefined;
  selectedLanguage: string | undefined;
  private loader: HTMLIonLoadingElement | null = null;

  constructor(
    private mentorService: MentorService,
    private loadingController: LoadingController
  ) {}

  async presentLoading() {
    // Create and present a loading indicator
    this.loader = await this.loadingController.create({
      message: 'Fetching mentors...',
    });
    await this.loader.present();
  }

  async dismissLoading() {
    if (this.loader) {
      // Dismiss the loading indicator if it exists
      await this.loader.dismiss();
      this.loader = null;
    }
  }

  onClassChange(event: any) {
    this.selectedClass = event.detail.value;
    this.searchMentors();
  }

  onSubjectChange(event: any) {
    this.selectedSubject = event.detail.value;
    this.searchMentors();
  }

  onLanguageChange(event: any) {
    this.selectedLanguage = event.detail.value;
    this.searchMentors();
  }

  async searchMentors() {
    if (!this.selectedClass || !this.selectedSubject || !this.selectedLanguage) {
      // If any of the selection criteria is missing, reset the mentors array and return
      this.mentors = [];
      return;
    }

    // Format the criteria as Class9ZoologyTamilOLT
    const criteria = `${this.selectedClass.replace(' ', '')}${this.selectedSubject}${this.selectedLanguage}OLT`;

    try {
      this.presentLoading(); // Show loading indicator
      const resp = await this.mentorService.searchMentorsByCriteria(criteria).toPromise();
      if (resp) {
        this.mentors = resp;
        console.log(`Mentors for Criteria ${criteria}:`, resp);
      } else {
        console.log(`No mentors found for Criteria ${criteria}`);
      }
    } catch (error) {
      console.log(`Error fetching mentors for Criteria ${criteria}:`, error);
    } finally {
      this.dismissLoading(); // Dismiss loading indicator whether successful or not
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
