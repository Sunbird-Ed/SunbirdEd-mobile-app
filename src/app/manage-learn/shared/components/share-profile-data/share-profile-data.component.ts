import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-share-profile-data',
  templateUrl: './share-profile-data.component.html',
  styleUrls: ['./share-profile-data.component.scss'],
})
export class ShareProfileDataComponent implements OnInit {
  @Input() dataSharingStatus
  @Input() type
  @Input() lastUpdatedOn
  @Output() save = new EventEmitter()
  showShareData = false;
  isDataShare = false;

  constructor() { }

  ngOnInit() {}

  toggleDataShare() {
    this.isDataShare = !this.isDataShare;
    this.showShareData = false;
  }

  toggleEditSettings(){
    this.showShareData = !this.showShareData;
  }

  saveChanges(){
    this.isDataShare = false
    this.showShareData = false;
    this.save.emit(this.dataSharingStatus)

  }

}
