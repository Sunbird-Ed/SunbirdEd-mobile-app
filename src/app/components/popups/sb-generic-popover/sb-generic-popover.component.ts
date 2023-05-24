import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../../util/events';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sb-generic-popover',
  templateUrl: './sb-generic-popover.component.html',
  styleUrls: ['./sb-generic-popover.component.scss'],
})
export class SbGenericPopoverComponent implements OnInit, OnDestroy {

  @Input() actionsButtons: any;
  @Input() icon: any;
  @Input() metaInfo: any;
  @Input() sbPopoverContent: any;
  @Input() sbPopoverHeading: any;
  @Input() sbPopoverMainTitle: any;
  @Input() selectedContents: any;
  @Input() showHeader = true;
  backButtonFunc: Subscription;

  constructor(
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private events: Events) { }

  ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
      this.backButtonFunc.unsubscribe();
    });

    this.events.subscribe('selectedContents:changed', (data) => {
      this.selectedContents = data.selectedContents;
    });
  }

  ngOnDestroy(): void {
    this.events.unsubscribe('selectedContents:changed');
    this.backButtonFunc.unsubscribe();
  }

  async closePopover() {
    await this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
  }

  async deleteContent(buttonIndex: number = 0) {
    await this.popoverCtrl.dismiss({ isLeftButtonClicked: !Boolean(buttonIndex) });
  }

}