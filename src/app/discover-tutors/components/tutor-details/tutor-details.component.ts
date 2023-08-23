import { Component, Input } from '@angular/core';
 
@Component({
  selector: 'app-tutor-details',
  templateUrl: './tutor-details.component.html',
  styleUrls: ['./tutor-details.component.scss']
})
export class TutorDetailsComponent {
  @Input() tutor: any;
}