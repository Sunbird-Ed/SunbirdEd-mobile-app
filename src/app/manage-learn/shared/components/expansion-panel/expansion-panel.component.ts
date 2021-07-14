import { Component, Input } from '@angular/core';

@Component({
  selector: 'expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelComponent {
  text: string;
  @Input() datas;
  isOpenIndex;

  constructor() {}

}
