import { Component } from '@angular/core';

@Component({
    selector: 'app-no-downloads',
    templateUrl: './no-downloads.component.html',
    styleUrls: ['./no-downloads.component.scss'],
    standalone: false
})
export class NoDownloadsComponent {

  constructor() { 
    console.log('no-downloads-component');  
  }


}
