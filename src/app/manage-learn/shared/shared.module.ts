import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { UtilsService } from './services/utils.service';

@NgModule({
  declarations: [CamelToTitlePipe],
  imports: [
    CommonModule
  ],
  exports: [
    CamelToTitlePipe
  ],
  providers: [UtilsService]
})
export class SharedModule { }
