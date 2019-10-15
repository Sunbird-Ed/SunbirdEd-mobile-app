import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(list: any, searchKey: string): any {
    if (!searchKey || !list) {
      return list;
    }
    const filteredList = [];
    for (let item of list) {
      if (item.name.toLowerCase().includes(searchKey.toLowerCase())) {
        filteredList.push(item);
      }
    }

    return filteredList;
  }
}
