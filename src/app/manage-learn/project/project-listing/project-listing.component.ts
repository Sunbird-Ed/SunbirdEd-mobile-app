import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import {
  Events, Platform, PopoverController
} from '@ionic/angular';
import { DbService } from '../../core/services/db.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-listing',
  templateUrl: './project-listing.component.html',
  styleUrls: ['./project-listing.component.scss'],
})
export class ProjectListingComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  projects;

  result = [
    { name: 'Project 1', description: 'Project 1 Desc', id: 1 },
    { name: 'Project 2', description: 'Project 2 Desc', id: 2 },
    { name: 'Project 3', description: 'Project 3 Desc', id: 3 },
  ]

  constructor(private router: Router, private location: Location,
    private headerService: AppHeaderService, private platform: Platform,
    private db: DbService, private http: HttpClient) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getProjectList();
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
  }

  getProjectList() {
    this.http.get('assets/dummy/projectList.json').subscribe((data: any) => {
      console.log(data);
      this.projects = data.result.data;
    });
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  selectedProgram(id) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`]);
  }
  handleNavBackButton() {
    this.location.back();
  }

  loadMore() {

  }

}
