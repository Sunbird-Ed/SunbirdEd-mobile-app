import { Component, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
})
export class ProgramCardComponent implements OnInit {
  @Input() programListDetails: any;
  @Output() programSelect = new EventEmitter();
  defaultImg = this.commonUtilService.convertFileSrc('assets/imgs/ic_launcher.png');
  constructor(private commonUtilService: CommonUtilService) { }

  ngOnInit() {
  }


  programDetails(data){
   this.programSelect.emit(data);
  }


}
