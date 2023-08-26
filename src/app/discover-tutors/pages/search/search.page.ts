import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
})

export class DiscoverTutorsPage {
  searchQuery: string = '';
  tutors: any[] = [
    { name: 'Tutor 1', class: '9', medium: 'English', subject: 'Science' },
    { name: 'Tutor 2', class: '10', medium: 'Hindi', subject: 'Mathematics' },
    { name: 'Tutor 3', class: '8', medium: 'English', subject: 'Social Studies' },
    { name: 'Tutor 4', class: '11', medium: 'English', subject: 'History' },
    { name: 'Tutor 5', class: '12', medium: 'Hindi', subject: 'Physics' },
    { name: 'Tutor 6', class: '9', medium: 'English', subject: 'Biology' },
    { name: 'Tutor 7', class: '10', medium: 'Hindi', subject: 'Chemistry' },
    { name: 'Tutor 8', class: '11', medium: 'English', subject: 'Geography' },
    { name: 'Tutor 9', class: '12', medium: 'Hindi', subject: 'Economics' },
    // Add more tutors here
  ];
  
  filteredTutors: any[] = [];

  onSearchChange(event: any) {
    const searchTerm = event.detail.value.toLowerCase();
    this.filteredTutors = this.tutors.filter(tutor =>
      tutor.name.toLowerCase().includes(searchTerm)
    );
  }

  onFilterChange(filterOptions: any) {
    this.filteredTutors = this.tutors.filter(tutor => {
      return (
        (filterOptions.medium === '' || tutor.medium === filterOptions.medium) &&
        (filterOptions.subject === '' || tutor.subject === filterOptions.subject) &&
        (filterOptions.class === '' || tutor.class === filterOptions.class)
      );
    });
  }
  
}
