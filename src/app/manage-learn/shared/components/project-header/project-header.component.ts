import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-project-header',
  templateUrl: './project-header.component.html',
  styleUrls: ['./project-header.component.scss'],
})
export class ProjectHeaderComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;

  constructor() { }

  ngOnInit() {
  }

}
