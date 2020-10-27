import { SortByPipe } from './sortby/sortby.pipe';
import { MimeTypePipe } from './mime-type/mime-type';
import { NgModule } from '@angular/core';
import { FileSizePipe } from './file-size/file-size';
import { CSAPipe } from './csa/csa';
import { FilterPipe } from './filter/filter.pipe';
import { TranslateHtmlPipe } from './translate-html/translate-html';
import { DateAgoPipe } from '@app/pipes/date-ago/date-ago.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { InitialPipe } from '@app/pipes/initial/initial';
import { CategoryKeyTranslator } from './category-key-translator/category-key-translator-pipe';
import {AliasBoardName} from './alias-board-name/alias-board-name';
@NgModule({
  declarations: [FileSizePipe,
    CSAPipe,
    MimeTypePipe,
    FilterPipe,
    SortByPipe,
    TranslateHtmlPipe,
    DateAgoPipe,
    InitialPipe,
    CategoryKeyTranslator,
    AliasBoardName
  ],
  imports: [CommonModule],
  exports: [FileSizePipe,
    CSAPipe,
    MimeTypePipe,
    FilterPipe,
    SortByPipe,
    TranslateHtmlPipe,
    DateAgoPipe,
    InitialPipe,
    CategoryKeyTranslator,
    AliasBoardName
  ],
  providers: [DatePipe, CategoryKeyTranslator]
})
export class PipesModule {
}
