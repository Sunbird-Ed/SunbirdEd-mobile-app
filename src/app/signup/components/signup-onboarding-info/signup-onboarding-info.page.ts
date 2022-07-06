import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup-onboarding-info',
  templateUrl: './signup-onboarding-info.page.html',
  styleUrls: ['./signup-onboarding-info.page.scss'],
})
export class SignupOnboardingInfoPage implements OnInit {

  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerPrev: EventEmitter<boolean> = new EventEmitter<boolean>();
  public onboardInfoForm: FormGroup;
  userData: any;
  datapass = 'google';
  constructor(private _fb: FormBuilder) { }

  ngOnInit() {
    this.onboardInfoForm = this._fb.group({
      state: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      cluster: [''],
      school: [''],
    })
  }
  back() {
    console.log('basckward emiting');

    this.triggerPrev.emit();
  }
  continue() {
    if (this.onboardInfoForm.valid) {
      this.subformInitialized.emit({
        state: this.onboardInfoForm.controls.state.value,
        district: this.onboardInfoForm.controls.district.value,
        block: this.onboardInfoForm.controls.block.value,
        cluster: this.onboardInfoForm.controls.cluster.value,
        school: this.onboardInfoForm.controls.school.value
      })
      this.triggerNext.emit();
    }

  }

}
