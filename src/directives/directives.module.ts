import { NgModule } from '@angular/core';
import { ReadMoreDirective } from './read-more/read-more';
import { HideHeaderFooterDirective } from './hide-header-footer/hide-header-footer';

@NgModule({
  declarations: [ReadMoreDirective,
    HideHeaderFooterDirective,
  ],
  imports: [],
  exports: [ReadMoreDirective,
    HideHeaderFooterDirective,
  ]
})
export class DirectivesModule {}
