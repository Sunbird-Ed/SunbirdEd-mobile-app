import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-project-details-card',
  templateUrl: './project-details-card.component.html',
  styleUrls: ['./project-details-card.component.scss'],
})
export class ProjectDetailsCardComponent implements OnInit {
@Input() data:any;
categories = [];
constructor() { }

  ngOnInit() {
    this.categories = [];
    if(this.data?.categories && this.data?.categories?.length){
      this.data.categories.forEach((category: any) => {
        category.label ? this.categories.push(category.label) : this.categories.push(category.name);
      });
    }
  }
}
