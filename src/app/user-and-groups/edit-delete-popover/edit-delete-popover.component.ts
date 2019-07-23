import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-edit-delete-popover',
  templateUrl: './edit-delete-popover.component.html',
  styleUrls: ['./edit-delete-popover.component.scss'],
})
export class EditDeletePopoverComponent implements OnInit {
  @Input('isCurrentUser') isCurrentUser = false;
  @Input('delete') delete: any;
  @Input('edit') edit: any;
  constructor() { }

  ngOnInit() { }

  deleteUser() {
    this.delete();
  }
  editUser() {
    this.edit();
  }

}
