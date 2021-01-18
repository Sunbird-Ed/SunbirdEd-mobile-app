import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LoaderService, LocalStorageService, UtilsService } from '@app/app/manage-learn/core';
import { urlConstants } from '@app/app/manage-learn/core/constants/urlConstants';
import { AssessmentApiService } from '@app/app/manage-learn/core/services/assessment-api.service';
import { UtilityService } from '@app/services';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-entityfilter',
  templateUrl: './entityfilter.component.html',
  styleUrls: ['./entityfilter.component.scss'],
})
export class EntityfilterComponent implements OnInit {
  @ViewChild('selectStateRef') selectStateRef;
  entityList;
  observationId;
  searchUrl;
  limit = 50;
  page = 1;
  totalCount = 0;
  searchValue = '';
  selectableList: any = [];
  index: any = 50;
  arr = [];
  selectedListCount = {
    count: 0,
  };
  solutionId: any;
  searchQuery;
  allStates: Array<Object>;
  profileMappedState: any;
  isProfileAssignedWithState: boolean;
  profileData: any;
  selectedState;
  loading: boolean = false;
  constructor(
    private localStorage: LocalStorageService,
    private navParams: NavParams,
    private loader: LoaderService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private assessmentService: AssessmentApiService,
    private utils: UtilsService
  ) {
    // this.searchUrl = AppConfigs.cro.searchEntity;//TODO:uncomment
    this.observationId = this.navParams.get('data');
    this.solutionId = this.navParams.get('solutionId');
    this.localStorage
      .getLocalStorage('profileRole')
      .then((success) => {
        this.profileData = success;
        if (success && success.relatedEntities && success.relatedEntities.length) {
          for (const entity of success.relatedEntities) {
            if (entity.entityType === 'state') {
              this.profileMappedState = entity._id;
              this.selectedState = entity._id;
              this.isProfileAssignedWithState = true;
              break;
            }
          }
          this.isProfileAssignedWithState = this.profileMappedState ? true : false;
        } else {
          this.isProfileAssignedWithState = false;
        }
        this.getAllStatesFromLocal();
      })
      .catch((error) => {
        this.getAllStatesFromLocal();
      });
    console.log(this.observationId);
  }

  getAllStatesFromLocal() {
    // this.utils.startLoader();
    this.loader.startLoader();
    this.localStorage
      .getLocalStorage('allStates')
      .then((data) => {
        // this.utils.stopLoader();
        this.loader.stopLoader();
        data ? (this.allStates = data) : this.getAllStatesApi();
        if (data && data.length) {
          this.selectedState = this.profileData.stateSelected
            ? this.profileData.stateSelected
            : this.profileMappedState;
          this.openSelect();
        }
      })
      .catch((error) => {
        this.getAllStatesApi();
      });
  }

  async getAllStatesApi() {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.ENTITY_LIST_BASED_ON_ENTITY_TYPE + 'state',
      payload: payload,
    };
    this.loader.startLoader()
    this.assessmentService.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        this.allStates = success.result;
        if (this.allStates && this.allStates.length) {
          this.selectedState = this.profileData.stateSelected
            ? this.profileData.stateSelected
            : this.profileMappedState;
          this.openSelect();
        }
        this.localStorage.setLocalStorage('allStates', this.allStates);
      },
      (error) => {
        this.loader.stopLoader();
        this.allStates = [];
      }
    )
    // this.apiProviders.httpGet(
    //   AppConfigs.cro.entityListBasedOnEntityType + 'state',
    //   (success) => {
    //     this.utils.stopLoader();
    //     this.allStates = success.result;
    //     if (this.allStates && this.allStates.length) {
    //       this.selectedState = this.profileData.stateSelected
    //         ? this.profileData.stateSelected
    //         : this.profileMappedState;
    //       this.openSelect();
    //     }
    //     this.localStorage.setLocalStorage('allStates', this.allStates);
    //   },
    //   (error) => {
    //     this.utils.stopLoader();
    //     this.allStates = [];
    //   }
    // );
  }

  openSelect() {
    this.profileData.stateSelected || this.profileMappedState ? this.search() : null;
    this.selectedState
      ? null
      : setTimeout(() => {
          this.selectStateRef.open();
        }, 100);
  }

  onStateChange(event) {
    this.profileData.stateSelected = event;
    this.localStorage.setLocalStorage('profileRole', this.profileData);
    this.searchQuery = '';
  }
  // addSchools() {
  //   let selectedSchools = [];
  //   this.selectableList.forEach((element) => {
  //     if (element.selected && !element.preSelected) {
  //       selectedSchools.push(element);
  //     }
  //   });

  //   console.log(selectedSchools.length);
  //   this.viewCntrl.dismiss(selectedSchools);
  // }
  // clearEntity() {
  //   this.selectableList = [];
  // }
  // cancel() {
  //   this.viewCntrl.dismiss();
  // }
  // checkItem(listItem) {
  //   listItem.selected = !listItem.selected;
  //   listItem.selected ? this.selectedListCount.count++ : this.selectedListCount.count--;
  // }

  search(event?) {
    // !event ? this.utils.startLoader() : ''; //TODO:uncomment

    !event ? this.loader.startLoader() : '';
    this.page = !event ? 1 : this.page + 1;
    let apiUrl =
      this.searchUrl +
      '?observationId=' +
      this.observationId +
      '&search=' +
      encodeURIComponent(this.searchQuery ? this.searchQuery : '') +
      '&page=' +
      this.page +
      '&limit=' +
      this.limit;
    apiUrl =
      apiUrl +
      `&parentEntityId=${encodeURIComponent(
        this.isProfileAssignedWithState ? this.profileMappedState : this.selectedState
      )}`;
    this.loading = true;
    //TODO:uncomment
    // this.apiProviders.httpGet(
    //   apiUrl,
    //   (success) => {
    //     this.loading = false;
    //     this.selectableList = !event ? [] : this.selectableList;
    //     for (let i = 0; i < success.result[0].data.length; i++) {
    //       success.result[0].data[i].isSelected = success.result[0].data[i].selected;
    //       success.result[0].data[i].preSelected = success.result[0].data[i].selected ? true : false;
    //     }
    //     this.totalCount = success.result[0].count;
    //     this.selectableList = [...this.selectableList, ...success.result[0].data];
    //     !event ? this.utils.stopLoader() : event.complete();
    //   },
    //   (error) => {
    //     this.loading = false;
    //     !event ? this.utils.stopLoader() : event.complete();
    //   },
    //   { version: 'v2' }
    // );
    //TODO:remove
    this.httpClient.get('assets/dummy/entity.json').subscribe((success: any) => {
      this.loading = false;
      this.selectableList = !event ? [] : this.selectableList;
      for (let i = 0; i < success.result[0].data.length; i++) {
        success.result[0].data[i].isSelected = success.result[0].data[i].selected;
        success.result[0].data[i].preSelected = success.result[0].data[i].selected ? true : false;
      }
      this.totalCount = success.result[0].count;
      this.selectableList = [...this.selectableList, ...success.result[0].data];
      // !event ? this.utils.stopLoader() : event.complete();
      !event ? this.loader.stopLoader() : event.complete();
    });
    //TODO:till here
  }

  // doInfinite(infiniteScroll) {
  //   setTimeout(() => {
  //     this.search(infiniteScroll);
  //   }, 500);
  // }
  searchEntity() {
    this.selectableList = [];
    this.search();
  }
  cancel() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}
  addSchools() {
    let selectedSchools = [];
    this.selectableList.forEach((element) => {
      if (element.selected && !element.preSelected) {
        selectedSchools.push(element);
      }
    });

    console.log(selectedSchools.length);
    this.modalCtrl.dismiss(selectedSchools);
  }
}
