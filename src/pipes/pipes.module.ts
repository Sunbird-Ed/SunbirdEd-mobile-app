import { MimeTypePipe } from './mime-type/mime-type';
import { NgModule } from '@angular/core';
import { FileSizePipe } from './file-size/file-size';
import { CSAPipe } from './csa/csa';
@NgModule({
  declarations: [FileSizePipe, CSAPipe, MimeTypePipe],
  imports: [],
  exports: [FileSizePipe, CSAPipe, MimeTypePipe]
})
export class PipesModule {}
