import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FileSizePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {

  /**
   * Takes a size and return readable size.
   */
  transform(size: any, roundOf: number = 2) {
    if (size || size === 0) {
      if (isNaN(size)) {
        size = 0;
      }

      size /= 1024;

      if (size < 1024) {
        return size.toFixed(roundOf) + ' KB';
      }

      size /= 1024;

      if (size < 1024) {
        return size.toFixed(roundOf) + ' MB';
      }

      size /= 1024;

      if (size < 1024) {
        return size.toFixed(roundOf) + ' GB';
      }

      size /= 1024;

      return size.toFixed(roundOf) + ' TB';
    } else {
      return '0 KB';
    }
  }
}
