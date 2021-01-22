import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoaderService, LocalStorageService, NetworkService, ToastService, UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { KendraApiService } from '../../core/services/kendra-api.service';
import * as _ from 'underscore';

@Component({
   selector: 'app-add-entity',
   templateUrl: './add-entity.component.html',
   styleUrls: ['./add-entity.component.scss'],
})
export class AddEntityComponent implements OnInit {
   subEntities;
   noSubEntity: boolean = false;
   entities = [];
   page = 1;
   limit = 20;
   childEntity;
   searchText = "";
   profileData;
   stateId;
   selectedEntity;
   title;
   entityCount
   @Input() entityType: any;
   constructor(
      private loader: LoaderService,
      private toast: ToastService,
      private storage: LocalStorageService,
      private kendraApiService: KendraApiService,
      private modalCtrl: ModalController,
      private networkService: NetworkService,
      private utils: UtilsService
   ) {
      this.onSearch = _.debounce(this.onSearch, 500);
   }

   ngOnInit() {
      this.checkUserMapping();
   }

   selectEntity(event) {
      this.selectedEntity = event;
   }
   selectSubEntity(subEntity) {
      this.childEntity = subEntity.detail.value;
      this.entities = [];
      this.page = 1;
      this.getEntities(subEntity.detail.value);
   }
   getEntities(entityType) {
      if (this.networkService.isNetworkAvailable) {
         // this.loader.startLoader();
         const config = {
            url:
               urlConstants.API_URLS.GET_ENTITY_LIST +
               this.stateId +
               "?type=" +
               entityType +
               "&search=" +
               this.searchText +
               "&page=" +
               this.page +
               "&limit=" +
               this.limit,
         };
         this.kendraApiService.get(config).subscribe(
            (data) => {
               // this.loader.stopLoader();
               if (data.result.data && data.result.data.length) {
                  this.entities = this.entities.concat(data.result.data);
                  this.entityCount = data.result.count;
                  this.noSubEntity = false;
               } else {
                  this.noSubEntity = true;
               }
            },
            (error) => {
               // this.loader.stopLoader();
            }
         );
      } else {
         this.toast.showMessage("MESSAGES.YOU_ARE_WORKING_OFFLINE_TRY_AGAIN", "danger");
      }
   }
   checkUserMapping() {
      // this.storage.getLocalStorage("profileData").then((data) => {
      //    this.profileData = data;
      //    this.stateId = this.profileData.state._id;
      //    this.title = this.profileData.state.name;
      //    this.getSubEntities(this.profileData.state._id);
      // });

      this.utils.getProfileData().then(profileData => {
         this.profileData = profileData;
         this.stateId = this.profileData.state;
         this.getSubEntities(this.stateId);
      }).catch(error => {

      })

   }

   loadMoreEntities() {
      this.page++;
      this.getEntities(this.childEntity);
   }
   getSubEntities(stateId) {

      // to select entityType if already provided
      if (this.entityType) {
         let selist = [];
         let entity = {
            name: this.entityType,
            value: this.entityType,
         };
         selist.push(entity);
         this.subEntities = selist.reverse();
         this.selectedEntity = this.subEntities[0];
         this.childEntity = this.subEntities[0].value;
         this.getEntities(this.subEntities[0].value);

         return
      }

      if (this.networkService.isNetworkAvailable) {
         // this.loader.startLoader();
         const config = {
            url: urlConstants.API_URLS.GET_SUBENTITIES + stateId,
         };
         this.kendraApiService.get(config).subscribe(
            (data) => {
               // this.loader.stopLoader();
               if (data.result) {
                  let selist = [];
                  data.result.forEach((se) => {
                     let entity = {
                        name: se,
                        value: se,
                     };
                     selist.push(entity);
                  });
                  this.subEntities = selist.reverse();
                  this.selectedEntity = this.subEntities[0];
                  this.childEntity = this.subEntities[0].value;
                  this.getEntities(this.subEntities[0].value);
               }
            },
            (error) => {
               // this.loader.stopLoader();
            }
         );
      } else {
         this.toast.showMessage("MESSAGES.YOU_ARE_WORKING_OFFLINE_TRY_AGAIN", "danger");
      }
   }

   onSearch(event) {
      this.entities = [];
      this.page = 1;
      this.searchText = event.detail ? event.detail.data : "";
      if (event.detail && event.detail.data == null) {
         this.searchText = "";
      }
      this.getEntities(this.childEntity);
   }
   close() {
      this.modalCtrl.dismiss();
   }
   addEntity() {
      if (this.selectedEntity) {
         this.modalCtrl.dismiss(this.selectedEntity);
      }
   }

}
