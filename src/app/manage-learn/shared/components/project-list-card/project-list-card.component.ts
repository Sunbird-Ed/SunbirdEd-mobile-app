import { Component, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-project-list-card',
  templateUrl: './project-list-card.component.html',
  styleUrls: ['./project-list-card.component.scss'],
})
export class ProjectListCardComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;
  @Input() id: any;
  @Output() cardSelect = new EventEmitter();
  
  constructor(private commonUtilService: CommonUtilService) { }

  ngOnInit() {
  }


  programDetails(id){
   this.cardSelect.emit(id);
  }

}
