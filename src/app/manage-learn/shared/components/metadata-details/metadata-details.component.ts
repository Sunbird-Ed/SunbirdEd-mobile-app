import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-metadata-details',
  templateUrl: './metadata-details.component.html',
  styleUrls: ['./metadata-details.component.scss'],
})
export class MetadataDetailsComponent implements OnInit {
  @Input() data;
  constructor() { }

  ngOnInit() {}

}
