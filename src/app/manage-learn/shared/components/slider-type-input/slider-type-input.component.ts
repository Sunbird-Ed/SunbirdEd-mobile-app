import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { UtilsService } from '@app/app/manage-learn/core';

@Component({
  selector: 'app-slider-type-input',
  templateUrl: './slider-type-input.component.html',
  styleUrls: ['./slider-type-input.component.scss'],
})
export class SliderTypeInputComponent implements OnInit {


  @Input() data: any;
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
  @Input() inputIndex;
  @Input() enableQuestionReadOut: boolean;
  color: string = 'light';
  isComplete: boolean;

  constructor(private utils: UtilsService) {
  }

  ngOnInit() {
    this.data.startTime = this.data.startTime ? this.data.startTime : Date.now();
    this.data.value = this.data.value !== "" ? this.data.value : this.data.validation.min;
    if (!this.data.validation.required) {
      this.data.isCompleted = true;
    }
    this.checkForValidation();
  }

  checkForValidation(): void {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
  }


}
