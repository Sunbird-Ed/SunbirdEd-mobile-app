import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ecm-listing',
  templateUrl: './ecm-listing.component.html',
  styleUrls: ['./ecm-listing.component.scss'],
})
export class EcmListingComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  ionViewWillEnter() {
    

    // console.log(JSON.stringify(this.recentlyUpdatedEntity));

    // console.log('ionViewDidLoad EvidenceListPage');
    // this.utils.startLoader();
    // this.localStorage
    //   .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.entityId))
    //   .then((successData) => {
    //     this.utils.stopLoader();
    //     this.entityData = successData;

    //     this.checkAllEvidenceSubmitted();
    //     console.log('123124124134');
    //     console.log(JSON.stringify(successData));
    //     this.entityEvidences = this.updateTracker.getLastModifiedInEvidences(
    //       this.entityData['assessment']['evidences'],
    //       this.recentlyUpdatedEntity
    //     );
    //     this.mapCompletedAndTotalQuestions();
    //     this.checkForProgressStatus();
    //     this.localStorage
    //       .getLocalStorage('generalQuestions_' + this.entityId)
    //       .then((successData) => {
    //         this.generalQuestions = successData;
    //       })
    //       .catch((error) => {});
    //   })
    //   .catch((error) => {
    //     this.utils.stopLoader();
    //   });
  }
}
