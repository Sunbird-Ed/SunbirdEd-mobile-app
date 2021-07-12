import { Component, OnInit, Input } from '@angular/core';
import { popoverController } from '@ionic/core';
@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  @Input() menus;
  constructor(
  ) { }
  ngOnInit() {
  }
  onEvent(menu) {
    popoverController.dismiss(menu.VALUE);
  }
}
