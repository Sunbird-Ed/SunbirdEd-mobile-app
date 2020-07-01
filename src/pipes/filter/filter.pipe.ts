import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(list: any, searchKey: string, searchValue: string): any {
    if (!searchKey || !searchValue || !list) {
      return list;
    }
    return list.filter((item) => item[searchKey].toLowerCase().includes(searchValue.toLowerCase()));
  }
}
