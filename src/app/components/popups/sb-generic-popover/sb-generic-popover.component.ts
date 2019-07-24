import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Events, Platform, ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sb-generic-popover',
  templateUrl: './sb-generic-popover.component.html',
  styleUrls: ['./sb-generic-popover.component.scss'],
})
export class SbGenericPopoverComponent implements OnInit, OnDestroy {

  // sbPopoverHeading: any;
  // sbPopoverMainTitle: any;
  // sbPopoverContent: any;
  // actionsButtons: any;
  // icon: any;
  // metaInfo: any;
  backButtonFunc = undefined;
  // showHeader: Boolean = true;
  // selectedContents: any;

  @Input() actionsButtons: any;
  @Input() icon: any;
  @Input() metaInfo: any;
  @Input() sbPopoverContent: any;
  @Input() sbPopoverHeading: any;
  @Input() sbPopoverMainTitle: any;
  @Input() selectedContents: any;
  @Input() showHeader = true;


  constructor(public popoverCtrl: PopoverController, private platform: Platform, private events: Events) { }

  ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.popoverCtrl.dismiss(null);
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
    this.popoverCtrl.dismiss(null);
  }

  deletecontent(btnIndex: number = 0) {
    if (btnIndex === 0) {
      this.popoverCtrl.dismiss(true);
    } else {
      this.popoverCtrl.dismiss(false);
    }
  }

}
