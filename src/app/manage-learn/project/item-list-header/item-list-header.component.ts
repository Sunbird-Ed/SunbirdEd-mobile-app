import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-list-header',
  templateUrl: './item-list-header.component.html',
  styleUrls: ['./item-list-header.component.scss'],
})
export class ItemListHeaderComponent implements OnInit {
  @Input() headerLabel: any;
  constructor() { }

  ngOnInit() {}

}
