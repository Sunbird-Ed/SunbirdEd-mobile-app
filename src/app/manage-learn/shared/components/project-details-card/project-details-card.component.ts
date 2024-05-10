import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-project-details-card',
  templateUrl: './project-details-card.component.html',
  styleUrls: ['./project-details-card.component.scss'],
})
export class ProjectDetailsCardComponent implements OnInit {
@Input() data:any;
@Input() categories = [];
constructor() {}

  ngOnInit() {}
}
