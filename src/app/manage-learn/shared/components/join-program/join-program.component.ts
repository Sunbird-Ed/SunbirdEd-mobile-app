import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-join-program',
  templateUrl: './join-program.component.html',
  styleUrls: ['./join-program.component.scss'],
})
export class JoinProgramComponent implements OnInit {

  @Input() header
  @Input() name
  @Input() type
  @Input() button
  @Input() message?

  constructor(private popOverCtrl:PopoverController) { }

  ngOnInit() {}

  start(){
    this.popOverCtrl.dismiss(true)
  }

}