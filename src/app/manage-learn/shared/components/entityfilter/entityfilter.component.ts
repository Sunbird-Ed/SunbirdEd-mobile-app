import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { LoaderService, LocalStorageService, UtilsService } from '@app/app/manage-learn/core';
import { urlConstants } from '@app/app/manage-learn/core/constants/urlConstants';
import { AssessmentApiService } from '@app/app/manage-learn/core/services/assessment-api.service';
import { KendraApiService } from '@app/app/manage-learn/core/services/kendra-api.service';
import { IonInfiniteScroll, ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-entityfilter',
  templateUrl: './entityfilter.component.html',
  styleUrls: ['./entityfilter.component.scss'],
})
export class EntityfilterComponent implements OnInit {
  @ViewChild('selectStateRef', { static: true }) selectStateRef;
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;
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
  payload;
  entityType;
  selectedItems: any = [];
  constructor(
    private localStorage: LocalStorageService,
    private navParams: NavParams,
    private loader: LoaderService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private assessmentService: AssessmentApiService,
    private utils: UtilsService,
    private ref: ChangeDetectorRef,
    private kendra: KendraApiService
  ) {
    this.searchUrl = urlConstants.API_URLS.SEARCH_ENTITY;
    this.observationId = this.navParams.get('data');
    this.solutionId = this.navParams.get('solutionId');
    // this.localStorage
    //   .getLocalStorage('profileRole')
  }

  async getTargettedEntityType() {
    this.payload = await this.utils.getProfileInfo();
    const config = {
      url: urlConstants.API_URLS.TARGETTED_ENTITY_TYPES + this.solutionId,
      payload: this.payload,
    };

    this.kendra.post(config).subscribe(success => {
      this.entityType = success.result ? success.result._id : null;
      this.search();
    }, error => {

    })
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
    if (this.profileData) {
      this.profileData.stateSelected = event;
    }
    this.searchQuery = '';
  }
  addSchools() {
    this.modalCtrl.dismiss(this.selectedItems);
    this.selectedItems = [];
  }
  clearEntity() {
    this.selectableList = [];
  }
  cancel() {
    this.modalCtrl.dismiss();
  }
  checkItem(listItem) {
    if (!listItem.selected) {
      this.selectedItems.push(listItem)
    } else {
      let indexToRemove = this.selectedItems.indexOf(listItem)
      this.selectedItems.splice(indexToRemove, 1)
    }
    listItem.selected = !listItem.selected;
    listItem.selected ? this.selectedListCount.count++ : this.selectedListCount.count--;
  }

  async search(event?) {
    let payload = await this.utils.getProfileInfo();

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
        this.entityType
        // this.isProfileAssignedWithState ? this.profileMappedState : this.selectedState
      )}`;
    this.loading = true;

    const config = {
      url: apiUrl,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        this.loading = false;
        this.selectableList = !event ? [] : this.selectableList;
        for (let i = 0; i < success.result[0].data.length; i++) {
          success.result[0].data[i].isSelected = success.result[0].data[i].selected;
          success.result[0].data[i].preSelected = success.result[0].data[i].selected ? true : false;
        }
        this.totalCount = success.result[0].count;
        if (this.selectedItems.length) {
          if (!event) {
            if (this.searchQuery === "") {
              this.selectableList = [...this.selectedItems, ...success.result[0].data];
            } else {
              this.selectableList = [...this.selectableList, ...success.result[0].data];
            }
          } else {
            this.selectableList.forEach((element) => {
              this.selectedItems.forEach((item) => {
                if (element._id === item._id) {
                  let indexToReplace = this.selectableList.indexOf(element);
                  this.selectableList.splice(indexToReplace, 1, item)
                }
              })
            })
            this.selectableList = [...this.selectableList, ...success.result[0].data];
          }
        } else {
          this.selectableList = [...this.selectableList, ...success.result[0].data];
        }
        !event ? this.loader.stopLoader() : this.toggleInfiniteScroll(event);
      },
      (error) => {
        this.loading = false;
        !event ? this.loader.stopLoader() : this.toggleInfiniteScroll(event);
      }
    );
  }

  toggleInfiniteScroll(e) {
    e.target.complete()
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.search(infiniteScroll);
    }, 500);
  }
  searchEntity() {
    this.selectableList = [];
    this.search();
  }

  ngOnInit() {
    this.getTargettedEntityType();
  }
}
