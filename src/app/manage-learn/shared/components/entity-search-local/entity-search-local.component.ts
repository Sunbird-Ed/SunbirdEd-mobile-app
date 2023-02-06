import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
@Component({
  selector: 'app-entity-search-local',
  templateUrl: './entity-search-local.component.html',
  styleUrls: ['./entity-search-local.component.scss'],
})
export class EntitySearchLocalComponent implements OnInit {

  data :any =[];
  searchText : string;
  searchQuery : string;
  
    constructor(
      private navParams: NavParams,
      private modalCtrl: ModalController,
    ) { 
      this.data = this.navParams.get('data');
    }
  
    ngOnInit() {}
  
    entityClickAction(entity,action){
      this.modalCtrl.dismiss({action:action, entity:entity});
    }
    onSearch(){
      this.searchText = this.searchQuery;
    }
    addEntity(){
      this.modalCtrl.dismiss({action:'addEntity'});
    }
    close(){
      this.modalCtrl.dismiss();
    }

}
