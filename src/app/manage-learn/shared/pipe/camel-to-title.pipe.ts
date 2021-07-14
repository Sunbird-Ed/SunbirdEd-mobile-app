import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToTitle'
})
export class CamelToTitlePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let newStr = value.replace(/([A-Z])/g, " $1");
    return newStr.charAt(0).toUpperCase() + newStr.slice(1);;
  }

}
