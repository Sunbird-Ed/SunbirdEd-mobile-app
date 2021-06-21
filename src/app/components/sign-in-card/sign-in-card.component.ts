import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import {RouterLinks} from '@app/app/app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  selector: 'app-sign-in-card',
  templateUrl: './sign-in-card.component.html',
  styleUrls: ['./sign-in-card.component.scss'],
})
export class SignInCardComponent {

  @Input() source = '';
  @Input() title = 'OVERLAY_LABEL_COMMON';
  @Input() description = 'OVERLAY_INFO_TEXT_COMMON';
  @Output() valueChange = new EventEmitter();
  appName = '';

  constructor(
    private appVersion: AppVersion,
    private router: Router
  ) {

    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  async signIn(skipNavigation?) {
    if (this.source) {
      skipNavigation['source'] = this.source;
    }
    this.router.navigate([RouterLinks.SIGN_IN], {state: skipNavigation});
  }
}
