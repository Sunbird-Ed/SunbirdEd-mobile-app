import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe(
    { name: 'translateJson' }
)

export class TranslateJsonPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(value: string): string {
    try {
      const availableTranslation = JSON.parse(value);
      return (availableTranslation.hasOwnProperty(this.translate.currentLang)) ? availableTranslation[this.translate.currentLang] :
              availableTranslation['en'];
    } catch (e) {
      return value;
    }
  }
}
