import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-project-metadata-card",
  templateUrl: "./project-metadata-card.component.html",
  styleUrls: ["./project-metadata-card.component.scss"],
})
export class ProjectMetadataCardComponent {
  @Input() project: any;
  @Input() viewOnlyMode: boolean;
  @Input() showDetails:boolean;
  @Input() statuses: any;
  @Output() toggleClick = new EventEmitter();
  @Output() openResourcesClick = new EventEmitter();
  constructor() {}

  toggle() {
    this.toggleClick.emit({});
  }

  openResources(){
    this.openResourcesClick.emit({});
  }

}
