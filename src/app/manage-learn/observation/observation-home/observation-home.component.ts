import { Component, OnInit } from "@angular/core";
import { RouterLinks } from "@app/app/app.constant";
import { AppHeaderService, CommonUtilService } from "@app/services";
import { Router } from "@angular/router";
import {
  LoaderService,
  UtilsService,
  ToastService,
  LocalStorageService
} from "../../core";
import { urlConstants } from "../../core/constants/urlConstants";
import { KendraApiService } from "../../core/services/kendra-api.service";
import { Subscription } from "rxjs";
import { storageKeys } from "../../storageKeys";
import { ObservationService } from "../observation.service";
@Component({
  selector: "app-observation-home",
  templateUrl: "./observation-home.component.html",
  styleUrls: ["./observation-home.component.scss"]
})
export class ObservationHomeComponent implements OnInit {
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: []
  };
  solutionList: any;
  downloadedSolutions: any;
  page = 1;
  limit = 10;
  count: any;
  searchText: string = "";
  generatedKey;
  profileInfo: any;
  networkFlag;
  private _networkSubscription?: Subscription;
  constructor(
    private headerService: AppHeaderService,
    private router: Router,
    private utils: UtilsService,
    private kendra: KendraApiService,
    private loader: LoaderService,
    private storage: LocalStorageService,
    public commonUtilService: CommonUtilService,
    public toast: ToastService,
    public obsService: ObservationService
  ) {
    this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(
      async (available: boolean) => {
        this.networkFlag = available;
        this.getProfileInfo();
      }
    );
  }

  ngOnInit() {
    this.solutionList = [];
  }

  async getProfileInfo() {
    this.profileInfo = await this.utils.setProfileData(
      storageKeys.observations
    );
    this.generatedKey = this.profileInfo.generatedKey;
    this.solutionList = [];
    this.page =1;
    this.networkFlag ? this.getPrograms() : this.getLocalData();
  }
  async getPrograms() {
    let payload = this.profileInfo.userData;
    if (payload) {
      this.loader.startLoader();
      const config = {
        url:
          urlConstants.API_URLS.GET_TARGETED_SOLUTIONS +
          `?type=observation&page=${this.page}&limit=${this.limit}&search=${this.searchText}`,
        payload: payload
      };
      this.kendra.post(config).subscribe(
        success => {
          this.loader.stopLoader();
          if (success && success.result && success.result.data) {
            this.count = success.result.count;
            this.solutionList = [...this.solutionList, ...success.result.data];
            this.storage.setLocalStorage(this.generatedKey, this.solutionList);
          }
        },
        error => {
          this.solutionList = [];
          this.loader.stopLoader();
        }
      );
    }
  }

  getLocalData() {
    this.storage.getLocalStorage(this.generatedKey).then(
      data => {
        this.solutionList = data;
      },
      error => {}
    );
    this.storage.getLocalStorage(storageKeys.downloadedObservations).then(
      data => {
        this.downloadedSolutions = data;
        if (this.downloadedSolutions) {
          this.checkLocalDownloadedSolutions();
        }
      },
      error => {
      }
    );
  }

  ionViewWillEnter() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
    this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    this.getProfileInfo();
  }

  observationDetails(solution) {
    let { programId, solutionId, _id: observationId, name: solutionName, programName } = solution;
    this.router
      .navigate(
        [`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_DETAILS}`],
        {
          queryParams: {
            programId: programId,
            solutionId: solutionId,
            observationId: observationId,
            solutionName: solutionName
          }
        }
      )
      .then(() => {
        this.obsService.obsTraceObj.programId = programId;
        this.obsService.obsTraceObj.solutionId = solutionId;
        this.obsService.obsTraceObj.name = solutionName;
        this.obsService.obsTraceObj.programName = programName;
      });
  }
  loadMore() {
    if (this.networkFlag) {
      this.page = this.page + 1;
      this.getPrograms();
    } else {
      this.toast.showMessage("FRMELEMENTS_MSG_FEATURE_USING_OFFLINE", "danger");
    }
  }
  onSearch(e) {
    if (this.networkFlag) {
      this.page = 1;
      this.solutionList = [];
      this.getPrograms();
    } else {
      this.toast.showMessage("FRMELEMENTS_MSG_FEATURE_USING_OFFLINE", "danger");
    }
  }

  ionViewWillLeave() {
    this.utils.closeProfileAlert();
    if (this._networkSubscription) {
      this._networkSubscription.unsubscribe();
    }
  }

  checkLocalDownloadedSolutions() {
    this.downloadedSolutions.forEach(ds => {
      if(this.solutionList){
        if (
          !this.solutionList.some(
            item =>
              item.solutionId == ds.solutionId && item.programId == ds.programId
          )
        ) {
          this.solutionList.push(ds);
        }
      }else{
        this.solutionList= this.downloadedSolutions;
      }
        
    });
  }
}
