import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppHeaderService } from '@app/services';
import { AlertController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { ObservationService } from '../observation.service';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityfilterComponent } from '../../shared/components/entityfilter/entityfilter.component';
import { LoaderService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { StateModalComponent } from '../../shared/components/state-modal/state-modal.component';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss'],
})
export class ObservationDetailComponent implements OnInit {
  private backButtonFunc: Subscription;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
  };
  // programIndex: any;
  // solutionIndex: any;
  observationId: any;
  solutionId: any;
  programId: any;
  selectedSolution: any;
  submissionCount: any;
  solutionName: any;
  entityType: any;
  constructor(
    private location: Location,
    private headerService: AppHeaderService,
    private platform: Platform,
    private httpClient: HttpClient,
    private observationService: ObservationService,
    private router: Router,
    private popCtrl: PopoverController,
    private modalCtrl: ModalController,
    private routerParam: ActivatedRoute,
    private utils: UtilsService,
    private assessmentService: AssessmentApiService,
    private loader: LoaderService,
    private dhiti: DhitiApiService,
    private translate: TranslateService,
    private alertCntrl: AlertController,
    private toast: ToastService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.programId = params.programId;
      this.solutionName = params.solutionName;
    });
  }

  ionViewWillEnter() {
    this.getObservationEntities();
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  ngOnInit() {
    // this.programIndex = this.observationService.getProgramIndex();
    // this.solutionIndex = this.observationService.getSolutionIndex(); //
    // this.getLocalStorageData();
    // this.getObservationEntities();
  }

  async getObservationEntities() {
    let payload = await this.utils.getProfileInfo();
    if (payload) {
      const config = {
        url:
          urlConstants.API_URLS.GET_OBSERVATION_ENTITIES +
          `${this.observationId}?solutionId=${this.solutionId}&programId=${this.programId}`,
        payload: payload,
      };
      this.loader.startLoader();
      this.assessmentService.post(config).subscribe(
        (success) => {
          this.loader.stopLoader();
          console.log(success);
          if (success && success.result && success.result.entities) {
            this.selectedSolution = success.result.entities;
            this.entityType = success.result.entityType;
            if (!this.observationId) {
              this.observationId = success.result._id; // for autotargeted if get observationId
            }
            //   this.checkForAnySubmissionsMade(); TODO:Implement
          }
        },
        (error) => {
          this.selectedSolution = [];
          this.loader.stopLoader();
        }
      );
    }
  }

  async checkForAnySubmissionsMade() {
    let payload = await this.utils.getProfileInfo();
    payload.observationId = this.observationId;
    let url = urlConstants.API_URLS.GET_OBSERVATION_SUBMISSION_COUNT;
    const config = {
      url: url,
      payload: payload,
    };
    this.dhiti.post(config).subscribe(
      (success) => {
        this.submissionCount = success.data.noOfSubmissions;
      },
      (error) => {}
    );

    //   this.apiProviders.httpPost(
    //     AppConfigs.cro.observationSubmissionCount,
    //     payload,
    //     (success) => {
    //       this.submissionCount = success.data.noOfSubmissions;
    //     },
    //     (error) => {},
    //     { baseUrl: "dhiti" }
    //   );
    // }
  }

  goToObservationSubmission(entity) {
    // TODO : Changed logic to call 1st submission in the submission page only .
    this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`], {
      queryParams: {
        programId: this.programId,
        solutionId: this.solutionId,
        observationId: this.observationId,
        entityId: entity._id,
        entityName: entity.name,
      },
    });
    // TODO:till here
    // let entityIndex = this.selectedSolution.entities.findIndex((e) => e._id == entity._id);
    // if (
    //   this.selectedSolution.entities[entityIndex].submissions &&
    //   this.selectedSolution.entities[entityIndex].submissions.length
    // ) {
    //   // this.observationService.setIndex(this.programIndex, this.solutionIndex, entityIndex);
    //   this.router.navigate([`/${RouterLinks.OBSERVATION}/${RouterLinks.OBSERVATION_SUBMISSION}`]);
    // }
    /* else {
      let event = {
        programIndex: this.programIndex,
        solutionIndex: this.solutionIndex,
        entityIndex: entityIndex,
        submission: {
          submissionNumber: 1,
          observationId: this.selectedSolution._id,
        },
      };

      this.programService
        .getAssessmentDetailsForObservation(event, this.programs)
        .then(async (programs) => {
          this.utils.startLoader();
          await this.programService.refreshObservationList();
          await this.getLocalStorageData();
          this.utils.stopLoader();
          this.app.getRootNav().push(ProgramObservationSubmissionPage, { data });
        })
        .catch((err) => {});
    } */
  }

  async addEntity(...params) {
    // console.log(JSON.stringify(params))
    // const type = this.selectedSolution.entityType
    const type = this.entityType;
    let entityListModal;
    if (type == 'state') {
      // TODO:implement
      entityListModal = await this.modalCtrl.create({
        component: StateModalComponent,
        componentProps: {
          data: this.observationId,
          solutionId: this.solutionId,
        },
      });
    } else {
      entityListModal = await this.modalCtrl.create({
        component: EntityfilterComponent,
        componentProps: {
          data: this.observationId,
          solutionId: this.solutionId,
        },
      });
    }
    await entityListModal.present();

    await entityListModal.onDidDismiss().then(async (entityList) => {
      if (entityList) {
        let payload = await this.utils.getProfileInfo();

        payload.data = [];
        entityList.data.forEach((element) => {
          //if coming from state list page
          if (type == 'state') {
            element.selected ? payload.data.push(element._id) : null;
            return;
          }

          payload.data.push(element._id); // if coming from EntityListPage
        });

        const config = {
          url: urlConstants.API_URLS.MAP_ENTITY_TO_OBSERVATION + `${this.observationId}`,
          payload: payload,
        };
        this.assessmentService.post(config).subscribe(
          (success) => {
            console.log(success);
            if (success) {
              this.getObservationEntities();
            }
          },
          (error) => {}
        );
      }
    });
  }
  async removeEntity(entity) {
    // let entityIndex = this.selectedSolution.entities.findIndex((e) => e._id == entity._id);
    let entityId = entity._id;
    let translateObject;
    this.translate
      .get(['FRMELEMNTS_LBL_CONFIRM', 'FRMELEMNTS_LBL_DELETE_ENTITY', 'FRMELEMNTS_LBL_NO', 'FRMELEMNTS_LBL_YES'])
      .subscribe((translations) => {
        translateObject = translations;
        console.log(JSON.stringify(translations));
      });
    let alert = await this.alertCntrl.create({
      header: translateObject['FRMELEMNTS_LBL_CONFIRM'],
      message: translateObject['FRMELEMNTS_LBL_DELETE_ENTITY'],
      buttons: [
        {
          text: translateObject['FRMELEMNTS_LBL_NO'],
          role: 'cancel',
          handler: () => {},
        },
        {
          text: translateObject['FRMELEMNTS_LBL_YES'],
          handler: async () => {
            // let obj = {
            //   data: [this.selectedSolution.entities[entityIndex]._id],
            // };
            this.loader.startLoader();
            let payload = await this.utils.getProfileInfo();
            payload.data = entityId;

            const config = {
              url: urlConstants.API_URLS.UNMAP_ENTITY_TO_OBSERVATION + `${this.solutionId}`,
              payload: payload,
            };
            this.assessmentService.post(config).subscribe(
              (success) => {
                let okMessage;
                this.translate.get('FRMELEMNTS_LBL_OK').subscribe((translations) => {
                  okMessage = translations;
                });
                this.toast.openToast(success.message);

                this.loader.stopLoader();
                this.getObservationEntities();
              },
              (error) => {
                this.loader.stopLoader();
                console.log(JSON.stringify(error));
              }
            );
            // this.apiProviders.httpPost(
            //   AppConfigs.cro.unMapEntityToObservation + this.selectedSolution._id,
            //   obj,
            //   async (success) => {
            //     let okMessage;
            //     this.translate.get("toastMessage.ok").subscribe((translations) => {

            //       okMessage = translations;
            //     });
            //     this.toast.openToast(success.message);

            //     this.loader.stopLoader();
            //     console.log(JSON.stringify(success));

            //     await this.programService.refreshObservationList();
            //     this.getLocalStorageData();
            //   },
            //   (error) => {
            //     this.loader.stopLoader();

            //     console.log(JSON.stringify(error));
            //     console.log("error");
            //   }
            // );
          },
        },
      ],
    });
    alert.present();
  }
}
