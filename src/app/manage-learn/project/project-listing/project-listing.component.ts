import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService } from "../../core";

import { urlConstants } from '../../core/constants/urlConstants';
import { UtilsService } from '../../core';
import { Platform } from '@ionic/angular';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption-v8';
import { TranslateService } from '@ngx-translate/core';
import { SyncService } from '../../core/services/sync.service';

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
  limit = 10;
  searchText: string = '';
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  projects = [];
  // filters = [{
  //   name: 'FRMELEMNTS_LBL_ASSIGNED_TO_ME',
  //   parameter: 'assignedToMe',
  //   selected: true
  // },
  // {
  //   name: 'FRMELEMNTS_LBL_CREATED_BY_ME',
  //   parameter: 'createdByMe',
  //   selected: false
  // }];
  filters = [];
  selectedFilterIndex = 0;
  selectedFilter;
  layout = LibraryFiltersLayout.ROUND;
  payload;

  constructor(
    private router: Router,
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private unnatiService: UnnatiDataService,
    private loader: LoaderService,
    private translate: TranslateService,
    private utils: UtilsService,
    private commonUtilService: CommonUtilService,
    private syncService: SyncService
  ) {
    this.translate.get(['FRMELEMNTS_LBL_ASSIGNED_TO_ME', 'FRMELEMNTS_LBL_CREATED_BY_ME']).subscribe(translations => {
      this.filters = [translations['FRMELEMNTS_LBL_CREATED_BY_ME'], translations['FRMELEMNTS_LBL_ASSIGNED_TO_ME']];
      this.selectedFilter = this.filters[0];
    })
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.projects = [];
    this.page = 1;
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
  getDataByFilter(filter) {
    this.projects = [];
    // this.filters.forEach(element => {
    //   element.selected = element.parameter == parameter.parameter ? true : false;
    // });
    // this.selectedFilter = parameter.parameter;
    this.selectedFilter = filter ? filter.data.text : this.selectedFilter;
    this.selectedFilterIndex = filter ? filter.data.index : this.selectedFilterIndex;
    this.searchText = "";
    this.getProjectList();
  }
  async getProjectList() {
    this.loader.startLoader();
    const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
    if (selectedFilter == 'assignedToMe') {
      this.payload = !this.payload ? await this.utils.getProfileInfo() : this.payload;
    }
    const config = {
      url: urlConstants.API_URLS.GET_PROJECTS + this.page + '&limit=' + this.limit + '&search=' + this.searchText + '&filter=' + selectedFilter,
      payload: selectedFilter == 'assignedToMe' ? this.payload : ''
    }
    this.unnatiService.post(config).subscribe(success => {
      this.loader.stopLoader();
      this.projects = this.projects.concat(success.result.data);
      this.count = success.result.count;
      this.description = success.result.description;
    }, error => {
      this.projects = [];
      this.loader.stopLoader();
    })
  }


  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  public handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  selectedProgram(id, project) {
    const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      queryParams: {
        projectId: id,
        programId: project.programId,
        solutionId: project.solutionId,
        type: selectedFilter
      }
    });
  }

  loadMore() {
    this.page = this.page + 1;
    this.getProjectList();
  }
  onSearch(e) {
    this.projects = [];
    this.getProjectList();
  }

  createProject(data) {
    this.router.navigate([`${RouterLinks.CREATE_PROJECT_PAGE}`], {
      queryParams: { hasAcceptedTAndC: data }
    })
  }
  doAction(id?, project?) {
    if (project) {
      const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
      if (!project.hasAcceptedTAndC && selectedFilter == 'createdByMe') {
        this.commonUtilService.showPPPForProjectPopUp().then((data: any) => {
          if (!data.isLeftButtonClicked) {
            let payload = {
              _id: id,
              lastDownloadedAt: project.lastDownloadedAt,
              hasAcceptedTAndC: !data.isLeftButtonClicked ? true : false
            }
            this.syncService.syncApiRequest(payload, false).then(resp => {
              this.selectedProgram(id, project);
            })
          } else {
            this.selectedProgram(id, project);
          }
        })
      } else {
        this.selectedProgram(id, project);
      }
    } else {
      this.commonUtilService.showPPPForProjectPopUp().then(data => {
        !data.isLeftButtonClicked ? this.createProject(true) : this.createProject(false)
      })
    }
  }
}