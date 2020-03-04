import { CustomIonSelectDirective } from './custom-ion-select/custom-ion-select.directive';
import { NgModule } from '@angular/core';
import { ReadMoreDirective } from './read-more/read-more';
import { HideHeaderFooterDirective } from './hide-header-footer/hide-header-footer';

@NgModule({
  declarations: [
    ReadMoreDirective,
    HideHeaderFooterDirective,
    CustomIonSelectDirective
  ],
  imports: [],
  exports: [
    ReadMoreDirective,
    HideHeaderFooterDirective,
    CustomIonSelectDirective
  ]
})
export class DirectivesModule {}
