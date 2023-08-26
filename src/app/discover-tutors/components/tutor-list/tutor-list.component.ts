import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutor-list',
  templateUrl: './tutor-list.component.html',
  styleUrls: ['./tutor-list.component.scss']
})
export class TutorListComponent {
  @Input() tutors: any[] = [];

  constructor(private router: Router) {}

  onTutorClicked(tutor: any) {
    // Implement navigation to tutor details page
    this.router.navigate(['/tutor-details', tutor.id]);
  }
}
