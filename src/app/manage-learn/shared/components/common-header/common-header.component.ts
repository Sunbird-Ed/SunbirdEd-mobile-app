import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
})
export class CommonHeaderComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;

  constructor() { }

  ngOnInit() {
  }

}
