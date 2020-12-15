import { Component, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-list-card',
  templateUrl: './common-list-card.component.html',
  styleUrls: ['./common-list-card.component.scss'],
})
export class CommonListCardComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;
  @Input() id: any;
  @Output() cardSelect = new EventEmitter();
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
  constructor(private commonUtilService: CommonUtilService) { }

  ngOnInit() {
  }


  programDetails(id){
   this.cardSelect.emit(id);
  }

}
