import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService } from "../../core";

import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService } from '../../core';
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
  page = 1;
  count = 0;
  description;
  limit = 25;
  searchText: string = '';
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  projects = [];
  result = [
    { name: 'Project 1', description: 'Project 1 Desc', id: 1 },
    { name: 'Project 2', description: 'Project 2 Desc', id: 2 },
    { name: 'Project 3', description: 'Project 3 Desc', id: 3 },
  ]

  constructor(private router: Router, private location: Location,
    private headerService: AppHeaderService, private platform: Platform,
    private unnatiService: UnnatiDataService,
    private loader: LoaderService,
    private db: DbService, private http: HttpClient, private utils: UtilsService, private kendraService: KendraApiService) { }

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

  // getProjectList() {
  //   this.http.get('assets/dummy/projectList.json').subscribe((data: any) => {
  //     console.log(data);
  //     this.projects = data.result.data;
  //   });
  // }

  async getProjectList() {
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.GET_PROJECTS + this.page + '&limit=' + this.limit + '&search=' + this.searchText,
      payload: payload
    }
    this.unnatiService.post(config).subscribe(success => {
      this.loader.stopLoader();
      this.projects = this.projects.concat(success.result.data);
      this.count = success.result.count;
      this.description = success.result.description;
    }, error => {
      this.loader.stopLoader();
    })
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

  selectedProgram(id, project) {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`, id, project.programId, project.solutionId]);
  }
  handleNavBackButton() {
    this.location.back();
  }

  loadMore() {
    this.page = this.page + 1;
    this.getProjectList();
  }

}
