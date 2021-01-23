import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '../../core';
import { urlConstants } from '../../core/constants/urlConstants';
import { KendraApiService } from '../../core/services/kendra-api.service';

@Component({
   selector: 'app-add-entity',
   templateUrl: './add-entity.component.html',
   styleUrls: ['./add-entity.component.scss'],
})
export class AddEntityComponent implements OnInit {
   title;
   subEntities;
   limit = 25;
   searchText;
   page = 1;
   profileData;
   stateId;
   entityType;
   childEntity;
   entityCount;
   selectedEntity;
   noSubEntity;
   entities = [];
   constructor(
      private modal: ModalController,
      private utils: UtilsService,
      private kendraApiService: KendraApiService
   ) { }

   ngOnInit() {
      this.checkUserMapping();
   }
   selectSubEntity(event) { }
   selectEntity(entity) { }

   async checkUserMapping() {
      let payload = await this.utils.getProfileInfo();
      console.log(payload, "payload");
      this.profileData = payload;
      this.stateId = this.profileData.state._id;
      this.title = this.profileData.state.name;
      this.getSubEntities(this.profileData.state._id);
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
   }

   getEntities(entityType) {
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
      this.modal.dismiss();
   }
   addEntity() {
      if (this.selectedEntity) {
         this.modal.dismiss(this.selectedEntity);
      }
   }
}