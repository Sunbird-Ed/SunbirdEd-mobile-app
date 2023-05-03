import { Pipe, PipeTransform } from '@angular/core';
import { CommonUtilService } from '@app/services/common-util.service';

@Pipe(
    { name: 'translateHtml' }
)

export class TranslateHtmlPipe implements PipeTransform {

  constructor(private commonUtilService: CommonUtilService) {}

  transform(value: { contents: string, values: string[] }): string {

    return Object.keys(value.values).reduce((acc, val) => {
      return acc.replace(val, value.values[val] ? this.commonUtilService.translateMessage(value.values[val]) : '');
    }, value.contents);

  }
}
