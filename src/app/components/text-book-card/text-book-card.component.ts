import { Component, OnInit, Input } from '@angular/core';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-text-book-card',
  templateUrl: './text-book-card.component.html',
  styleUrls: ['./text-book-card.component.scss'],
})
export class TextBookCardComponent implements OnInit {
  defaultImg: string;

  @Input() content: any;
  @Input() layoutName: string;

  constructor(public commonUtilService: CommonUtilService) {
    this.defaultImg = 'assets/imgs/ic_launcher.png';
  }

  ngOnInit() { }

}
