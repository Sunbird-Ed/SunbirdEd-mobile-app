import { Component, Input } from '@angular/core';
 
@Component({
  selector: 'app-tutor-list',
  templateUrl: './tutor-list.component.html',
  styleUrls: ['./tutor-list.component.scss']
})
export class TutorListComponent {
  @Input() tutors: any[] = [];
}