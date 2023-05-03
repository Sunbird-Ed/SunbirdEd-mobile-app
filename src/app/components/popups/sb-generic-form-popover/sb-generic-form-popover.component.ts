import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sb-generic-form-popover',
  templateUrl: './sb-generic-form-popover.component.html'
})
export class SbGenericFormPopoverComponent implements OnInit, OnDestroy {

  @Input() actionsButtons: any;
  @Input() icon: any;
  @Input() metaInfo: any;
  @Input() sbPopoverContent: any;
  @Input() sbPopoverHeading: any;
  @Input() sbPopoverMainTitle: any;
  @Input() selectedContents: any;
  @Input() showHeader = true;
  @Input() formItems: any;
  backButtonFunc: Subscription;
  selectedVal: string;

  constructor(
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private events: Events) { }

  ngOnInit() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  closePopover() {
    this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
  }

  submit(buttonIndex: number = 0) {
    if (this.selectedVal) {
      this.popoverCtrl.dismiss(
        {
          isLeftButtonClicked: !Boolean(buttonIndex),
          selectedVal: this.formItems[parseInt(this.selectedVal, 10)]
        }
      );
    }
  }

}
