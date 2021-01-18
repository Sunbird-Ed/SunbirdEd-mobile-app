import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss'],
})
export class NoDataComponent implements OnInit {
  @Input() message = 'FRMELEMNTS_LBL_NO_DATA_FOUND'
  constructor() { }

  ngOnInit() { }

}
