import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-survey-msg',
  templateUrl: './survey-msg.component.html',
  styleUrls: ['./survey-msg.component.scss'],
})
export class SurveyMsgComponent implements OnInit {
  text: string;

  options = {
    surveyCompleted: { img: '../../assets/imgs/submitted.svg', msg: 'Your form is Submitted!' },
    surveyExpired: { img: '../../assets/imgs/survey-expired.svg', msg: 'Sorry! the form has expired.' },
    entityNotMapped: { img: '../../assets/imgs/entity-not-mapped.svg', msg: 'Sorry! You are not mapped to an entity' },
  };
  option: any;
  showClose: any;
  showMenu: any;

  constructor(public params: NavParams, public modal: ModalController) {
    this.option = this.params.get('option');
    this.showMenu = this.params.get('showMenu') || false;
    if (this.showMenu == false) {
      this.showClose = true; // if menu is not shown then close button is show on model
    }
  }
  close() {
    this.modal.dismiss()
  }
  ngOnInit(): void {}

  get data(): any {
    return this.options[this.option];
  }
}
