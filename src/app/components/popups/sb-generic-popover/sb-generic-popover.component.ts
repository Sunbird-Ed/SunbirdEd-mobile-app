import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Events, Platform, ModalController, PopoverController } from '@ionic/angular';

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
  backButtonFunc = undefined;

  constructor(public popoverCtrl: PopoverController, private platform: Platform, private events: Events) { }

  ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
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

  closePopover() {
    this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
  }

  deleteContent(btnIndex: number = 0) {
    if (btnIndex === 0) {
      this.popoverCtrl.dismiss({ isLeftButtonClicked: true });
    } else {
      this.popoverCtrl.dismiss({ isLeftButtonClicked: false });
    }
  }

}
