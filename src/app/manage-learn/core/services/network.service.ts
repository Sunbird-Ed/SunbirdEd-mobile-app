import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  connectSubscription;
  disconnectSubscription;
  syncSettingData: any;
  $networkStatus = new Subject();
  isNetworkAvailable: boolean = false;
  constructor(

    private translate: TranslateService,
  ) { }

  async netWorkCheck() {
    this.getCurrentStatus();
    this.disconnectSubscription = Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        this.isNetworkAvailable = false;
        this.$networkStatus.next(this.isNetworkAvailable);
      }
    });

    this.connectSubscription = Network.addListener('networkStatusChange', (status) => {
      if (status.connected) {
        this.isNetworkAvailable = true;
        this.$networkStatus.next(this.isNetworkAvailable);
      }
    });
   
  }

  async getCurrentStatus() {
      const status = await Network.getStatus();
    let networkType = (await Network.getStatus()).connectionType;
    if (networkType == 'none') {
      this.isNetworkAvailable = false;
      this.$networkStatus.next(this.isNetworkAvailable);
    } else {
      this.isNetworkAvailable = true;
      this.$networkStatus.next(this.isNetworkAvailable);
    }
  }
  // method to handle on sync setting change
  checkSyncSettings(): Promise<any> {
    return new Promise((resolve, reject) => {   
    });
  }

}
