import {Component, Input} from '@angular/core';
import {PopoverController} from '@ionic/angular';

export interface KebabMenuOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-application-header-kebab-menu',
  template: `
      <ion-list lines="none">
          <ion-item *ngFor="let option of options" (click)="onOptionSelect($event, option)">{{ option.label | translate }}</ion-item>
      </ion-list>
  `,
  styleUrls: ['./application-header-kebab-menu.component.scss']
})
export class ApplicationHeaderKebabMenuComponent {
  @Input() options: KebabMenuOption[] = [];
  
  constructor(
    private popOverCtrl: PopoverController
  ) {
  }

  public async onOptionSelect($event: MouseEvent, option: KebabMenuOption) {
    await this.popOverCtrl.dismiss({ option });
  }
}
