import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription } from 'rxjs';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-certificate-verification-popover',
  templateUrl: './certificate-verification-popup.component.html',
  styleUrls: ['./certificate-verification-popup.component.scss'],
})
export class CertificateVerificationPopoverComponent implements OnInit, OnDestroy {

  @Input() actionsButtons: any;
  @Input() certificateData: any;
  @Input() showHeader = true;
  @Input() isProject :boolean;
  backButtonFunc: Subscription;
  appName: string;
  content ='SUCCESSFULLY_COMPLETING_COURSE';
  constructor(
    private commonUtilService: CommonUtilService,
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private events: Events) { }

  ngOnInit() {
    this.content = this.isProject ? 'SUCCESSFULLY_COMPLETING_PROJECT' :'SUCCESSFULLY_COMPLETING_COURSE';
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
      this.backButtonFunc.unsubscribe();
    });
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
  }

  deleteContent(buttonIndex: number = 0) {
    this.popoverCtrl.dismiss({ isLeftButtonClicked: !Boolean(buttonIndex) });
  }

}
