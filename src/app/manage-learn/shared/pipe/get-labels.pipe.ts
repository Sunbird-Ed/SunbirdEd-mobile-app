import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getLabels',
})
export class GetLabelsPipe implements PipeTransform {
  transform(value: string, ...args) {
    return this.getLabels(value);
  }
  getLabels(question) {
    const labels = [];
    for (const option of question.options) {
      if (question.value.indexOf(option.value) > -1) {
        labels.push(option.label);
      }
    }
    return labels;
  }
}
