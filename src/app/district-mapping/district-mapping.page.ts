import { Component, OnInit } from '@angular/core';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-district-mapping',
  templateUrl: './district-mapping.page.html',
  styleUrls: ['./district-mapping.page.scss'],
})
export class DistrictMappingPage implements OnInit {
  state
  district
  showList
  cities

  constructor(
    public headerService: AppHeaderService
  ) { }

  ngOnInit() {
    this.headerService.hideHeader()
    
  }
  selectCity(state) {
    this.state= state;
    this.showList = false;
  }
  getCities() {
    this.showList = !this.showList;
    return this.cities = [
      {
        "name": "Bangalore",
      }, {
        "name": "Kolkata",
      }, {
        "name": "Ranchi",
      }, {
        "name": "Delhi"
      },{
        "name": "Kanpur"
      },{
        "name" : "Chattisgarh"
      },{
        "name" : "Raipur"
      },{
        "name" : "Rajasthan"
      },{
        "name" : "Jaipur"
      },{
        "name" : "kashmir"
      },{
        "name" : "Jammu"
      },{
        "name" : "jharkhand"
      },{
        "name" : "Mumbai"       
      }
    ];
  }

}
