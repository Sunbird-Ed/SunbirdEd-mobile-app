import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '@app/app/manage-learn/core';

@Component({
  selector: 'app-text-type-input',
  templateUrl: './text-type-input.component.html',
  styleUrls: ['./text-type-input.component.scss'],
})
export class TextTypeInputComponent implements OnInit {

  @Input() inputIndex;
  @Input() data: any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter()
  @Input() evidenceId: string;
  @Input() hideButton: boolean;
  @Input() submissionId: any;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;
  @Input() schoolId;
  @Input() enableQuestionReadOut: boolean;
  notNumber: boolean;
  questionValid: boolean;

  constructor(private utils: UtilsService) { }

  ngOnInit() {
    debugger
    this.isaNumber();
    this.data.startTime = this.data.startTime ? this.data.startTime : Date.now();
    if (!this.data.validation.required) {
      this.data.isCompleted = true;
    }
    this.getErrorMsg();
    // this.checkForValidation();
  }

  next(status?: any) {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  isaNumber() {
    this.notNumber = this.utils.testRegex(this.data.validation.regex, this.data.value);
  }

  back() {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.previousCallBack.emit('previous');
  }

  // checkForValidation(): void {
  //   this.questionValid = this.utils.isQuestionComplete(this.data);
  // }
  checkForValidation(): void {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
    this.isaNumber();
  }

  getErrorMsg() {
    if (this.data.validation.regex) {
      let string = this.data.validation.regex.split("[");
      string = string[1].split("]")[0];
      return "Should contain only values " + string;
    }
  }

}
