import { Component, OnInit, Input, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { LoaderService } from '../../core';
import * as _ from 'underscore';
import { ContentService, SearchType, ContentSearchResult } from 'sunbird-sdk';
import { NavigationService } from '@app/services/navigation-handler.service';
@Component({
  selector: 'app-link-learning-resources',
  templateUrl: './link-learning-resources.component.html',
  styleUrls: ['./link-learning-resources.component.scss'],
})
export class LinkLearningResourcesComponent implements OnInit {
  private backButtonFunc: Subscription;
  selectedFilter;
  @Input() selectedResources = [];
  dataCount;
  page = 0;
  limit = 25;
  filters;
  resources = [];
  searchText: any;

  constructor(
    private location: Location,
    private platform: Platform,
    private modal: ModalController,
    private kendraApiService: KendraApiService,
    private loaderService: LoaderService,
    private navigateService: NavigationService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService
  ) {
    this.search = _.debounce(this.search, 500);
  }

  ngOnInit() {
    this.getFilters();
  }
  ionViewWillEnter() {
    this.handleBackButton();
  }
  private handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }
  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
  close() {
    this.modal.dismiss();
  }
  setFilter(filter) {
    this.filters.forEach((element: any) => {
      element.name == filter.name ? (element.isActive = true) : (element.isActive = false);
      if (element.isActive) {
        this.selectedFilter = element;
        this.page = 0;
        this.limit = 25;
        this.resources = [];
        this.getLearningResources();
      }
    });
  }

  getFilters() {
    this.filters = [
      {
        name: 'All',
        icon: '',
        value: [],
      },
    /*   {
        name: 'Audios',
        icon: '',
        value: ['audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/mpeg', 'audio/ogg'],
      }, */
      {
        name: 'Documents',
        icon: 'insert_drive_file',
        value: ['application/pdf', 'application/epub'],
      },
      {
        name: 'video',
        icon: 'play_circle_outline',
        value: ['video/mp4', 'video/x-youtube', 'video/webm', 'video/3gpp', 'video/mpeg', 'video/quicktime'],
      },
      {
        name: 'interactive',
        icon: 'touch_app',
        value: [
          'application/vnd.ekstep.ecml-archive',
          'application/vnd.ekstep.h5p-archive',
          'application/vnd.ekstep.html-archive',
          'application/vnd.ekstep.content-archive',
        ],
      },
    ];
    this.setFilter(this.filters[0]);
  }


  getLearningResources() {
    const contentSearchCriteria = {
      name: 'Resource',
      source: 'web',
      limit: this.limit,
      searchType: SearchType.SEARCH,
      contentTypes: ['Resource'],
      mimeType: this.selectedFilter.value,
      mode: 'hard',
      offset: this.page * this.limit,
      query: this.searchText,
    };
    this.loaderService.startLoader();

    this.contentService
      .searchContent(contentSearchCriteria)
      .toPromise()
      .then((responseData: ContentSearchResult) => {
        this.loaderService.stopLoader();
        console.log(responseData);
        let data;
        if (responseData.contentDataList) {
          data = responseData.contentDataList.map((list) => ({ name: list.name, id: list.identifier }));
          this.dataCount = true;
        } else {
          data = [];
          this.dataCount = false;
        }

        this.selectedResources ? this.validateCheckbox(data) : (this.resources = this.resources.concat(data));
        if (responseData.contentDataList && responseData.contentDataList.length < contentSearchCriteria.limit) {
          this.dataCount = false;
        }
      })
      .catch((err) => {
        this.loaderService.stopLoader();
        console.log(err);
      });
  }

  validateCheckbox(data) {
    this.selectedResources.forEach((selectedResource) => {
      selectedResource.isChecked = true;
      data.forEach((resource) => {
        if (selectedResource.id == resource.id) {
          resource.isChecked = true;
        }
      });
    });
    this.resources = this.resources.concat(data);
  }
  search(event) {
    this.page = 0;
    this.limit = 25;
    this.resources = [];
    this.searchText = event.detail.data;
    this.getLearningResources();
  }

  loadMoreData() {
    this.page = this.page + 1;
    this.getLearningResources();
  }

  addResources() {
    let selected = [];
    this.selectedResources.forEach((list) => {
      if (list.isChecked) {
        selected.push(list);
      }
    });
    if (selected) {
      this.modal.dismiss(selected);
    }
  }

  selectData(item) {
    item.isChecked = !item.isChecked;
    let index = _.findIndex(this.selectedResources, (resource) => {
      return resource.id == item.id;
    });
    if (item.isChecked)
      index > -1 ? (this.selectedResources[index].isChecked = item.isChecked) : this.selectedResources.push(item);
    else this.selectedResources = this.selectedResources.filter((r) => r.id !== item.id);
  }

  openResource(link) {
  }
}
