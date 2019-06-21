import { Component,OnInit } from '@angular/core';
import {AppHeaderService} from '../../services';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  ngOnInit() {
    this.appHeaderService.showHeaderWithHomeButton();
  }
  constructor(private appHeaderService:AppHeaderService) {

  }
}
