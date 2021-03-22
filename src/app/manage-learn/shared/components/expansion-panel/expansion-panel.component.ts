import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
})
export class ExpansionPanelComponent implements OnInit {
  text: string;
  @Input() datas;
  isOpenIndex;

  constructor() {}

  ngOnInit() {}
}
