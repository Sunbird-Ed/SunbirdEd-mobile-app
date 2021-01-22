import { Component, OnInit } from '@angular/core';
import { LoaderService, UtilsService } from '@app/app/manage-learn/core';
import { urlConstants } from '@app/app/manage-learn/core/constants/urlConstants';
import { AssessmentApiService } from '@app/app/manage-learn/core/services/assessment-api.service';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-state-modal',
  templateUrl: './state-modal.component.html',
  styleUrls: ['./state-modal.component.scss'],
})
export class StateModalComponent implements OnInit {
  text: string;
  entityList: any;
  editData: any;
  selectAll: any;
  constructor(
    // public localStorage: LocalStorageProvider,
    // public apiProviders: ApiProvider,
    // public viewCntrl: ViewController,
    public navParams: NavParams,
    public utils: UtilsService,
    private loader: LoaderService,
    private assessment: AssessmentApiService,
    private modalCtrl: ModalController
  ) {
    this.editData = this.navParams.get('editData');
    // this.getAllStatesFromLocal();
    this.getAllStatesApi();
  }

  ngOnInit() {}

  async getAllStatesApi() {
    let url = urlConstants.API_URLS.ENTITY_LIST_BASED_ON_ENTITY_TYPE + 'state';
    this.loader.startLoader();
    let payload = await this.utils.getProfileInfo();
    const config = {
      url: url,
      payload: payload,
    };
    this.assessment.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();

        const allStates = success.result;
        this.entityList = allStates;
        // this.localStorage.setLocalStorage("allStates", allStates);//TODO:not storing in localStorage
        if (this.editData && this.editData.entities.length) {
          this.entityList.forEach((element) => {
            element['selected'] = this.editData.entities.includes(element._id) ? true : false;
          });
        } else {
          this.entityList.forEach((element) => {
            element['selected'] = this.selectAll ? true : false;
          });
        }
      },
      (error) => {
        this.loader.stopLoader();

        this.entityList = [];
      }
    );

    // this.loader.startLoader();
    // this.apiProviders.httpGet(
    //   AppConfigs.cro.entityListBasedOnEntityType + "state",
    //   (success) => {
    //     this.loader.stopLoader();

    //     const allStates = success.result;
    //     this.entityList = allStates;
    //     this.localStorage.setLocalStorage("allStates", allStates);
    //     if (this.editData && this.editData.entities.length) {
    //       this.entityList.forEach((element) => {
    //         element["selected"] = this.editData.entities.includes(element._id) ? true : false;
    //       });
    //     } else {
    //       this.entityList.forEach((element) => {
    //         element["selected"] = this.selectAll ? true : false;
    //       });
    //     }
    //   },
    //   (error) => {
    //     this.loader.stopLoader();

    //     this.entityList = [];
    //   }
    // );
  }

  countEntity(entity) {}

  addSchools() {
    this.modalCtrl.dismiss(this.entityList);
  }
  cancel() {
    this.modalCtrl.dismiss();
  }

  selectUnselectAllEntity(status) {
    for (const entity of this.entityList) {
      entity['selected'] = status;
    }
    // this.entityCount = status ? this.entityList.length : 0;
    this.selectAll = status;
  }
}
