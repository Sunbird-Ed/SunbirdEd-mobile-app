import { Component } from '@angular/core';

@Component({
  selector: 'app-discover-mentors',
  templateUrl: './discover-mentors.page.html',
  styleUrls: ['./discover-mentors.page.scss']
})
export class DiscoverMentorsPage {
  searchInfoVisibility = 'hide'; // Set this value based on your logic
  appName = 'Your App Name';
  searchKeywords: string = '';

  handleSearch() {
    // Implement your search logic here
    console.log('Search triggered:', this.searchKeywords);
  }
}
