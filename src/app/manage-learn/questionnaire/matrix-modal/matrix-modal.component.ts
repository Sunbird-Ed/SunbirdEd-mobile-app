import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '../../core';

@Component({
  selector: 'app-matrix-modal',
  templateUrl: './matrix-modal.component.html',
  styleUrls: ['./matrix-modal.component.scss'],
})
export class MatrixModalComponent  {

  @Input() inputIndex: any;
  instanceDetails: any;
  @Input() selectedIndex: any;
  @Input() data: any;
  @Input() schoolId: string;
  @Input() evidenceId: string;
  @Input() generalQuestion: boolean;
  @Input() submissionId: string;
  @Input() enableQuestionReadOut: boolean;

  constructor(
    private modal: ModalController,
    private utils: UtilsService
  ) {
  }




  update(): void {
    for (const question of this.data.value[this.selectedIndex]) {
      // Do check only for questions without visibleif. For visibleIf questions isCompleted property is set in  checkForVisibility()
      if (!question.visibleIf) {
        question.isCompleted = this.utils.isQuestionComplete(question);
      }
    }
    const instanceValue = JSON.parse(JSON.stringify(this.data.value[this.selectedIndex]))
    this.modal.dismiss(instanceValue)
  }

  cancel(): void {
    this.modal.dismiss();
  }

  checkForVisibility(currentQuestionIndex) {
    let visibility = false;
    const currentQuestion = this.data.value[this.selectedIndex][currentQuestionIndex];
    let display = true;
    for (const question of this.data.value[this.selectedIndex]) {
      for (const condition of currentQuestion.visibleIf) {
        if (condition._id === question._id) {
          let expression = [];
          if (condition.operator != "===") {
            if (question.responseType === 'multiselect') {
              for (const parentValue of question.value) {
                for (const value of condition.value) {
                  expression.push("(", "'" + parentValue + "'", "===", "'" + value + "'", ")", condition.operator);
                }
              }
            } else {
              for (const value of condition.value) {
                expression.push("(", "'" + question.value + "'", "===", "'" + value + "'", ")", condition.operator)
              }
            }
            expression.pop();
          } else {
            if (question.responseType === 'multiselect') {
              for (const value of question.value) {
                expression.push("(", "'" + condition.value + "'", "===", "'" + value + "'", ")", "||");
              }
              expression.pop();
            } else {
              expression.push("(", "'" + question.value + "'", condition.operator, "'" + condition.value + "'", ")")
            }
          }
          if (!eval(expression.join(''))) {
            this.data.value[this.selectedIndex][currentQuestionIndex].isCompleted = true;
            return false
          } else {
            this.data.value[this.selectedIndex][currentQuestionIndex].isCompleted = this.utils.isQuestionComplete(currentQuestion);
          }
        }
      }
    }
    return display
  }

  checkForDependentVisibility(qst, allQuestion): boolean {
    let display = true;
    for (const question of allQuestion) {
      for (const condition of qst.visibleIf) {
        if (condition._id === question._id) {
          let expression = [];
          if (condition.operator != "===") {
            if (question.responseType === 'multiselect') {
              for (const parentValue of question.value) {
                for (const value of condition.value) {
                  expression.push("(", "'" + parentValue + "'", "===", "'" + value + "'", ")", condition.operator);
                }
              }
            } else {
              for (const value of condition.value) {
                expression.push("(", "'" + question.value + "'", "===", "'" + value + "'", ")", condition.operator)
              }
            }
            expression.pop();
          } else {
            if (question.responseType === 'multiselect') {
              for (const value of question.value) {
                expression.push("(", "'" + condition.value + "'", "===", "'" + value + "'", ")", "||");
              }
              expression.pop();
            } else {
              expression.push("(", "'" + question.value + "'", condition.operator, "'" + condition.value + "'", ")")
            }
          }
          if (!eval(expression.join(''))) {
            return false
          }
        }
      }
    }
    return display
  }

}
