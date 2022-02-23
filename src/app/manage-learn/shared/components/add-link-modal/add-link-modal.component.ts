import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-link-modal',
  templateUrl: './add-link-modal.component.html',
  styleUrls: ['./add-link-modal.component.scss'],
})
export class AddLinkModalComponent implements OnInit {
  links;
  @Output() eventEmit = new EventEmitter();
  constructor() { }

  ngOnInit() {}
  cancel(){
    this.eventEmit.emit();
  }
  submit() {
    this.eventEmit.emit(this.links);
  }
}
