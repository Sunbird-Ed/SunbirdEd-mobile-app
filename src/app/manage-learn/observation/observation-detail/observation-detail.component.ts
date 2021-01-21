import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppHeaderService } from '@app/services';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { ObservationService } from '../observation.service';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityfilterComponent } from '../../shared/components/entityfilter/entityfilter.component';
import { UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';

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
    private assessmentService: AssessmentApiService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.observationId = params.observationId;
      this.solutionId = params.solutionId;
      this.programId = params.programId;
      this.solutionName = params.solutionName;
    });
  }

  ionViewWillEnter() {
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
    this.getObservationEntities();
  }

  async getObservationEntities() {
    let payload = await this.utils.getProfileInfo();
    const config = {
      url:
        urlConstants.API_URLS.GET_OBSERVATION_ENTITIES +
        `${this.observationId}?solutionId=${this.solutionId}&programId=${this.programId}`,
      payload: payload,
    };
    this.assessmentService.post(config).subscribe(
      (success) => {
        console.log(success);
        if (success && success.result && success.result.entities) {
          this.selectedSolution = success.result.entities;
          //   this.checkForAnySubmissionsMade(); TODO:Implement
        }
      },
      (error) => {}
    );
  }

  checkForAnySubmissionsMade() {
    const payload = {
      observationId: this.selectedSolution._id,
    };
    this.httpClient.post('assets/dummy/submissionCount.json', payload).subscribe((success: any) => {
      console.log(success);
      this.submissionCount = success.data.noOfSubmissions;
    });

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
    const type = this.selectedSolution.entityType;
    let entityListModal;
    if (type == 'state') {
      // TODO:implement
      // entityListModal = await this.modalCtrl.create({
      //   component: StateModalComponent, componentProps: {
      //     data: this.observationId,
      //     solutionId: this.solutionId
      //   }
      // });
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
}
