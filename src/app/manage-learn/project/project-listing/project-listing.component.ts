import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import {
  Events, Platform, PopoverController
} from '@ionic/angular';

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

  result = [
      {name: 'Project 1', description: 'Project 1 Desc', id: 1},
      {name: 'Project 2', description: 'Project 2 Desc', id: 2},
      {name: 'Project 3', description: 'Project 3 Desc', id: 3},
  ]

  constructor(private router: Router, private location:Location,
    private headerService: AppHeaderService, private platform: Platform) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.handleBackButton();
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

  selectedProgram(id){
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`]);
  }

  handleNavBackButton(){
    this.location.back();
  }

  loadMore(){

  }

}
