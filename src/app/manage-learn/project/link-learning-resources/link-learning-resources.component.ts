import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform, ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { urlConstants } from '../../core/constants/urlConstants';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { LoaderService } from '../../core';

@Component({
   selector: 'app-link-learning-resources',
   templateUrl: './link-learning-resources.component.html',
   styleUrls: ['./link-learning-resources.component.scss'],
})
export class LinkLearningResourcesComponent implements OnInit {
   private backButtonFunc: Subscription;
   selectedFilter;
   selectedResources;
   dataCount;
   page = 1;
   limit = 25;
   filters;
   resources = [];

   constructor(
      private location: Location,
      private platform: Platform,
      private modal: ModalController,
      private kendraApiService: KendraApiService,
      private loaderService: LoaderService
   ) { }

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
   close(data?) {
      this.modal.dismiss(data);
   }
   setFilter(filter) {
      this.filters.forEach((element: any) => {
         element.name == filter.name ? element.isActive = true : element.isActive = false;
         if (element.isActive) {
            this.selectedFilter = element;
            this.resources = [];
            this.getLearningResources();
         }
      });
   }

   getFilters() {
      this.loaderService.startLoader();
      const config = {
         url: urlConstants.API_URLS.GET_LEARNING_RESOURCES_FILTERS
      }
      this.kendraApiService.get(config).subscribe(data => {
         this.loaderService.stopLoader();
         console.log(data, "data");
         if (data.result && data.result.length) {
            this.filters = data.result;
            this.setFilter(this.filters[0]);
            // this.selectedResources ? this.validateCheckbox(data.result.content) : this.dataList = this.dataList.concat(data.result.content);
         }
      }, error => {
         this.loaderService.stopLoader();
      })
   }

   getLearningResources(searchText?) {
      searchText = searchText ? searchText : '';
      this.loaderService.startLoader();
      let type = {
         mimeType: this.selectedFilter.value
      }
      const config = {
         url: urlConstants.API_URLS.LEARNING_RESOURCES_LIST + 'search=' + searchText + '&page=' + this.page + "&limit=" + this.limit,
         payload: type
      }
      this.kendraApiService.post(config).subscribe(data => {
         this.loaderService.stopLoader();
         if (data.result && data.result.count) {
            this.dataCount = data.result.count;
            this.resources = this.resources.concat(data.result.content);
         }
      }, error => {
         this.loaderService.stopLoader();
      })
   }

   search(event) {
      this.page = 1;
      this.resources = [];
      this.getLearningResources(event.detail.value);
   }

   loadMoreData() {
      this.page = this.page + 1;
      this.getLearningResources();
   }

   addResources() {
      let selected = [];
      this.resources.forEach(list => {
         if (list.isChecked) {
            selected.push(list);
         }
      })
      if (selected) {
         this.close(selected);
      }
   }
   
   selectData(item) {
      item.isChecked = !item.isChecked;
   }
}
