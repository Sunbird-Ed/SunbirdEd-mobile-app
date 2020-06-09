import { SortByPipe } from './sortby/sortby.pipe';
import { MimeTypePipe } from './mime-type/mime-type';
import { NgModule } from '@angular/core';
import { FileSizePipe } from './file-size/file-size';
import { CSAPipe } from './csa/csa';
import { FilterPipe } from './filter/filter.pipe';
import { TranslateHtmlPipe } from './translate-html/translate-html';
@NgModule({
  declarations: [FileSizePipe, CSAPipe, MimeTypePipe , FilterPipe, SortByPipe, TranslateHtmlPipe],
  imports: [],
  exports: [FileSizePipe, CSAPipe, MimeTypePipe , FilterPipe, SortByPipe, TranslateHtmlPipe]
})
export class PipesModule {}
