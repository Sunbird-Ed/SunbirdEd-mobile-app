import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-signup-basic-info',
  templateUrl: './signup-basic-info.component.html',
  styleUrls: ['./signup-basic-info.component.scss'],
})
export class SignupBasicInfoComponent implements OnInit {

  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();

  public basicInfoForm: FormGroup;
  userData: any;
  appName = "";
  constructor(private _fb: FormBuilder, private commonUtilService: CommonUtilService) { }

   ngOnInit() {
    this.setappname();
    this.basicInfoForm = this._fb.group({
      name: ['', Validators.required],
      yearofbirth: ['', Validators.required]
    })
  }
  async setappname(){
    this.appName = await this.commonUtilService.getAppName();

  }
  continue() {
    if (this.basicInfoForm.valid) {
      this.userData = {
        name: this.basicInfoForm.controls.name.value,
        yearOFBirth: this.basicInfoForm.controls.yearofbirth.value,
        isMinor: true
      }
    }
    console.log(this.userData);

    this.subformInitialized.emit(this.userData);
    this.triggerNext.emit();
  }

}
