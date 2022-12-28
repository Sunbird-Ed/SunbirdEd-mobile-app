import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-aastrika-footer',
  templateUrl: './aastrika-footer.component.html',
  styleUrls: ['./aastrika-footer.component.scss'],
})
export class AastrikaFooterComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}


signup() {
  this.router.navigate([RouterLinks.AASTRIKA_SIGNUP]);
  }
}
