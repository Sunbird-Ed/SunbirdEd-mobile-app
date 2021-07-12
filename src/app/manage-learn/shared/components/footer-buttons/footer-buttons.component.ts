import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from "@angular/core";
import { UtilsService } from '@app/app/manage-learn/core';

@Component({
  selector: 'app-footer-buttons',
  templateUrl: './footer-buttons.component.html',
  styleUrls: ['./footer-buttons.component.scss'],
})
export class FooterButtonsComponent implements OnChanges {

  text: string;
  _data;

  @Input() updatedData;
  @Input()
  get data() {
    return this._data;
  }
  set data(data) {
    this._data = JSON.parse(JSON.stringify(data));
  }
  @Input() isFirst: boolean;
  @Input() isLast: boolean;
  @Output() nextAction = new EventEmitter();
  @Output() backAction = new EventEmitter();
  @Output() openSheetAction = new EventEmitter();
  @Input() completedQuestionCount = 0;
  @Input() questionCount = 0;
  @Input() isSubmitted;
  @Input() enableGps;
  @Input() showSubmit;


  percentage: number = 0;

  constructor(
    private utils: UtilsService
  ) { }
  ngOnChanges() {
    if (this.completedQuestionCount > 0) {
      this.percentage = this.questionCount ? (this.completedQuestionCount / this.questionCount) * 100 : 0;
      this.percentage = Math.trunc(this.percentage);
    } else {
      this.percentage = this.isSubmitted ? 100 : 0;
      this.completedQuestionCount = this.isSubmitted ? this.questionCount : 0;
    }
  }
  next(status?: string): void {
    this.nextAction.emit(status);
  }

  back(): void {
    this.backAction.emit();
  }

  gpsFlowChecks(action, status) {
    // console.log("GPS: "+this.enableGps)
    // console.log(JSON.stringify(this.data))
    if (this.updatedData.responseType.toLowerCase() === "slider") {
      if (
        !this.updatedData.gpsLocation ||
        JSON.stringify(this._data.value) !== JSON.stringify(this.updatedData.value)
      ) {
        // this.getGpsLocation(action, status);
      } else if (JSON.stringify(this._data.value) === JSON.stringify(this.updatedData.value)) {
        if (action === "next") {
          this.next(status);
        } else {
          this.back();
        }
      }
    } else if (this.updatedData.responseType.toLowerCase() === "pagequestions") {
      if (
        JSON.stringify(this._data.pageQuestions) !== JSON.stringify(this.updatedData.pageQuestions)
        // &&
        // this.utils.isPageQuestionComplete(this.updatedData)
      ) {
        // this.getGpsLocation(action, status);
      } else {
        if (action === "next") {
          this.next(status);
        } else {
          this.back();
        }
      }
    } else if (JSON.stringify(this._data.value) !== JSON.stringify(this.updatedData.value)) {
      // this.getGpsLocation(action, status);
    } else {
      if (action === "next") {
        this.next(status);
      } else {
        this.back();
      }
    }
  }

  // getGpsLocation(action, status) {
  //   this.utils.startLoader();
  //   this.ngps
  //     .getGpsStatus()
  //     .then((success) => {
  //       this.updatedData.gpsLocation = success;
  //       this.utils.stopLoader();
  //       if (action === "next") {
  //         this.next(status);
  //       } else {
  //         this.back();
  //       }
  //     })
  //     .catch((error) => {
  //       this.utils.stopLoader();
  //     });
  // }

  openAction() {
    this.openSheetAction.emit()
  }

}
