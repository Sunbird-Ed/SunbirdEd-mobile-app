import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GenericPopUpService } from '../../generic.popup';

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
  previouStatus = ''

  constructor(private popupService: GenericPopUpService) { }

  ngOnInit() {
    this.popupService.consentStatus.subscribe((status) => {
      this.dataSharingStatus = status;
    });
  }

  toggleDataShare() {
    if(this.isDataShare){
      this.dataSharingStatus = this.previouStatus
    }
    this.isDataShare = !this.isDataShare;
    this.showShareData = false;
  }

  toggleEditSettings(){
    if(this.showShareData){
      this.dataSharingStatus = this.previouStatus
    }
    this.showShareData = !this.showShareData;
  }

  saveChanges(){
    this.isDataShare = false
    this.showShareData = false;
    this.save.emit(this.dataSharingStatus)

  }

  ngOnChanges(changes: SimpleChanges) {
    this.previouStatus = changes['dataSharingStatus']?.currentValue
}

}
