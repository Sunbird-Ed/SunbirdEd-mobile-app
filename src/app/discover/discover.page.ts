import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  appLabel: string;

  constructor(
    private appVersion: AppVersion,
  ) {
    
  }

  ngOnInit() {
    this.appVersion.getAppName().then((appName: any) => {
      this.appLabel = appName;
    });
  }

}
