import { MimeType } from './../../app/app.constant';
import { Content } from '@project-sunbird/sunbird-sdk';
import { Pipe, PipeTransform } from '@angular/core';
/*
  Contents are filtered based on given mimetype
*/
@Pipe({
  name: 'hasMimeType',
})
export class MimeTypePipe implements PipeTransform {
  transform(item: Content, mimeTypes: string[] = ['all'], isTextbookTocPage: boolean = false): boolean {
    if (!mimeTypes) {
      return true;
    } else {
      if (isTextbookTocPage && mimeTypes.indexOf('all') > -1) {
        return true;
      } else if (!isTextbookTocPage && mimeTypes.indexOf('all') > -1) {
        if (item.mimeType !== MimeType.COLLECTION && !item.children) {
          return true;
        } else {
          return this.getFilteredItems(item.children, MimeType.ALL);
        }
      }
      if (item.mimeType !== MimeType.COLLECTION && !item.children) {
        return this.getFilteredItems([item], mimeTypes);
      }
      return this.getFilteredItems(item.children, mimeTypes);
    }
  }

  getFilteredItems(contents: Content[] = [], mimeTypes: string[]): boolean {
    const t = this.flattenDeep(contents)
      .some((c) => !!mimeTypes.find(m => m === c.contentData.mimeType));
    return t;
  }

  private flattenDeep(contents: Content[]): Content[] {
    return contents.reduce((acc, val) => {
      if (val.children) {
        acc.push(val);
        return acc.concat(this.flattenDeep(val.children));
      } else {
        return acc.concat(val);
      }
    }, []);
  }
}
