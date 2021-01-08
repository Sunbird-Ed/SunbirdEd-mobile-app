import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
   selector: 'app-add-entity',
   templateUrl: './add-entity.component.html',
   styleUrls: ['./add-entity.component.scss'],
})
export class AddEntityComponent implements OnInit {
   title;
   subEntities;
   childEntity;
   entityCount;
   selectedEntity;
   noSubEntity;
   entities = {
      "count": 34,
      "content": [
         {
            "name": " Practice time_Hindi ",
            "id": "do_31302446154579968014349",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_31302446154579968014349"
         },
         {
            "name": "\"Disadvantaged group\" in Right To Education act (RTE) : Did You Know?",
            "id": "do_3128812241620254721830",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_3128812241620254721830"
         },
         {
            "name": "1 Perspectives on teacher development",
            "id": "do_312465053341499392115349",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312465053341499392115349"
         },
         {
            "name": "1 Prioritising your work and managing your time effectively as a school leader",
            "id": "do_312470257401192448118336",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312470257401192448118336"
         },
         {
            "name": "1 Promoting equity and inclusion through leadership",
            "id": "do_312461472596566016113394",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312461472596566016113394"
         },
         {
            "name": "1 The change context",
            "id": "do_31247931680157696011191",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_31247931680157696011191"
         },
         {
            "name": "1 The importance of addressing diversity issues",
            "id": "do_312472438186647552219068",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312472438186647552219068"
         },
         {
            "name": "1 The importance of addressing diversity issues - Activity 1",
            "id": "do_312472448124387328219071",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312472448124387328219071"
         },
         {
            "name": "1 The importance of addressing diversity issues - Activity 4",
            "id": "do_312472459926659072219077",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312472459926659072219077"
         },
         {
            "name": "1 Types of resources within and outside the school",
            "id": "do_312461634252070912213326",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312461634252070912213326"
         },
         {
            "name": "1 Understanding formative and summative assessment",
            "id": "do_312460764300263424113062",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312460764300263424113062"
         },
         {
            "name": "1 What a school self-review is, and its advantages and challenges",
            "id": "do_312473169978834944119574",
            "link": "https://qa.bodh.shikshalokam.org/resources/play/content/do_312473169978834944119574"
         }
      ]
   }
   constructor(
      private modal: ModalController
   ) { }

   ngOnInit() {
      let subEntities = ["district", "block", "cluster", "school"];
      let selist = [];
      subEntities.forEach((se) => {
         let entity = {
            name: se,
            value: se,
         };
         selist.push(entity);
      });
      this.subEntities = selist.reverse();
      this.selectedEntity = this.subEntities[0];
      this.childEntity = this.subEntities[0].value;
   }
   close() {
      this.modal.dismiss();
   }
   onSearch(event) { }
   selectSubEntity(event) { }
   selectEntity(entity) { }
   addEntity() {
      
   }
}
