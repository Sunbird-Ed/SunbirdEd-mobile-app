import { Component, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-aastrika-login',
  templateUrl: './aastrika-login.page.html',
  styleUrls: ['./aastrika-login.page.scss'],
})
export class AastrikaLoginPage implements OnInit {

  appName = '';

  constructor(
    private commonUtilService: CommonUtilService,
  ) { }

  ngOnInit() {
    console.log('############################################################################3')
  }

  async ionViewWillEnter() {
    this.appName = await this.commonUtilService.getAppName();
  }

}
