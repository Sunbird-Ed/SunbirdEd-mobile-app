import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
})
export class CommonHeaderComponent {
  @Input() title: any;
  @Input() subTitle: any;

  constructor() { }



}
