import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {


  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerPrev: EventEmitter<boolean> = new EventEmitter<boolean>();
  public otpInfoForm: FormGroup;
  userData: any;
  appName = "";
  constructor(private _fb: FormBuilder, private commonUtilService: CommonUtilService) { }

  back() {
    this.triggerPrev.emit();
  }
  continue() {
    // this.triggerNext.emit();
    // alert('otp submited')

    this.subformInitialized.emit({ otp: this.otpInfoForm.controls['otp'].value });
    this.triggerNext.emit();
  }

  async ngOnInit() {
    this.otpInfoForm =
      this._fb.group({
        otp: ['', Validators.required],
      })

    this.appName = await this.commonUtilService.getAppName();
  }

}
