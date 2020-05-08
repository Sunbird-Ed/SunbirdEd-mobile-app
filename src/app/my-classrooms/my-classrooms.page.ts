import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { AppHeaderService } from '@app/services/app-header.service';
import { RouterLinks } from '../app.constant';
import { AuthService } from '@project-sunbird/sunbird-sdk';
import { LoginHandlerService } from '@app/services/login-handler.service';

@Component({
  selector: 'app-my-classrooms',
  templateUrl: './my-classrooms.page.html',
  styleUrls: ['./my-classrooms.page.scss'],
})
export class MyClassroomsPage implements OnInit {
  isGuestUser: boolean;

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private headerService: AppHeaderService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
  ) {  }

  ngOnInit() {
    this.checkUserLoggedIn();
  }

  async checkUserLoggedIn() {
    const session = await this.authService.getSession().toPromise();
    this.isGuestUser = !session;
  }

  ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
  }

  createClassroom() {
    this.router.navigate([`/${RouterLinks.MY_CLASSROOMS}/${RouterLinks.CREATE_EDIT_CLASSROOM}`]);
  }

  login() {
    this.loginHandlerService.signIn({skipRootNavigation: true});
  }

}
