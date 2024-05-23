import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-start-improvement',
  templateUrl: './start-improvement.component.html',
  styleUrls: ['./start-improvement.component.scss'],
})
export class StartImprovementComponent {

  @Input() header;
  @Input() message;
  @Input() message1;
  @Input() button;
  constructor(
    private popOverCtrl: PopoverController,
  ) { }
  start() {
    this.popOverCtrl.dismiss(true);
  }
}
