import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';


@Component({
  selector: 'app-aastrika-header',
  templateUrl: './aastrika-header.component.html',
  styleUrls: ['./aastrika-header.component.scss'],
})
export class AastrikaHeaderComponent implements OnInit {

  constructor(
    private headerService: AppHeaderService,
    private router: Router,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.headerService.hideHeader();
  }


  navigateToLogin() {
    this.router.navigate([RouterLinks.AASTRIKA_LOGIN]);
  }

}
