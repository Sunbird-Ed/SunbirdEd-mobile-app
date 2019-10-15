import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export enum TeacherIdPopupFlags {
  STATE_CONFIRMATION = 'stateConfirmation',
  STATE_ID_INPUT = 'stateIdInput',
  VERIFIED_STATE_ID = 'verifiedStateId',
  FAILED_STATE_ID = 'failedStateId'
}

@Component({
  selector: 'app-teacher-id-verification-popup',
  templateUrl: './teacher-id-verification-popup.component.html',
  styleUrls: ['./teacher-id-verification-popup.component.scss']
})

export class TeacherIdVerificationComponent implements OnInit {

  teacherIdPopupFlags = TeacherIdPopupFlags;
  showTeacherIdIncorrectErr = false;
  teacherIdFlag: string;
  teacherIdForm: FormGroup;

  constructor(private popOverCtrl: PopoverController) { }

  ngOnInit() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_CONFIRMATION;
  }

  async closePopup() {
    await this.popOverCtrl.dismiss();
  }

  teacherIdConfirmation(flag: boolean) {
    if (flag) {
      this.initializeFormFields();
    } else {
      this.closePopup();
    }
  }

  private initializeFormFields() {
    this.teacherIdFlag = TeacherIdPopupFlags.STATE_ID_INPUT;
    this.teacherIdForm = new FormGroup({
      teacherId: new FormControl('', Validators.required)
    });
  }

  submitTeacherId() {
    this.teacherIdFlag = TeacherIdPopupFlags.FAILED_STATE_ID;
  }

}
