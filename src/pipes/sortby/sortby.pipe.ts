/*
 *ngFor="let c of arrayOfObjects | sortBy: 'propertyName' : 'asc'"
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    { name: 'sortBy' }
)

export class SortByPipe implements PipeTransform {

  transform(value: any[], property: string = '', order = ''): any[] {
    if (!value || !order || order === '' || !property) { return value; } // no array or order or property
    if (value.length <= 1) { return value; } // array with only one item
    // return _.orderBy(value, [property], [order]);

    // ascending
    const sort = (key) => {
        return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
    };

    // decending
    const reverseSort = (key) => {
        return (a, b) => (a[key] > b[key]) ? -1 : ((b[key] > a[key]) ? 1 : 0);
    };

    if (order && order === 'asc') {
        return value.concat().sort(sort(property));
    } else if (order && order === 'desc') {
        return value.concat().sort(reverseSort(property));
    } else {
        return value;
    }
  }
}
