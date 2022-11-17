import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Pipe({
  name: 'imageContent',
  pure: true
})
export class ImageContentPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer,
    private platform: Platform,
  ) { }

  transform(content: any, ...args: any[]): any {
    if (this.platform.is('ios')) {
      return this.sanitizer.bypassSecurityTrustUrl(content.contentData.appIcon);
    } else {
      return content.contentData.appIcon;
    }
  }

}
