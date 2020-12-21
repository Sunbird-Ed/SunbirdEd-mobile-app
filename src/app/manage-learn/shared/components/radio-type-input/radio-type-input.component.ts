import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { UtilsService } from '@app/app/manage-learn/core';

@Component({
  selector: 'app-radio-type-input',
  templateUrl: './radio-type-input.component.html',
  styleUrls: ['./radio-type-input.component.scss'],
})
export class RadioTypeInputComponent implements OnInit {
  @Input() inputIndex ;
  @Input() data:any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter()
  @Input() evidenceId: string;
  @Input() hideButton: boolean;
  @Input() schoolId: string;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;
  @Input() submissionId: any;
  @Input() enableQuestionReadOut: boolean;

  color: string = 'light';
  isComplete: boolean;

  constructor(
    private utils: UtilsService, 
    // private hintService: HintProvider
    ) {

    console.log('Hello RadioTypeComponent Component');

  }

  ngOnInit() {
    // console.log(JSON.stringify(this.data))
    this.data.startTime = this.data.startTime ? this.data.startTime : Date.now();
    if(!this.data.validation.required) {
      this.data.isCompleted = true;
    }
    console.log("Evidence id"+ this.evidenceId)
    

  }

  updateData(event){
    console.log(JSON.stringify(this.data));
    // this.data ={}
    // this.data = Object.assign({}, this.data)
    this.data.fileName = [...this.data.fileName]
  }
  next(status?:any) {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  back() {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.previousCallBack.emit();
  }

  checkForValidation(): void {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
  }

  openHint(hint){
    // this.hintService.presentHintModal({hint: hint});
  }

}
