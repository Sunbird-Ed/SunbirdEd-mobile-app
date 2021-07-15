import { Component, Input } from '@angular/core';
import { popoverController } from '@ionic/core';
@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent {
  @Input() menus;
  constructor(
  ) { }
  onEvent(menu) {
    popoverController.dismiss(menu.VALUE);
  }
}
