import { NgModule } from '@angular/core';
import { FileSizePipe } from './file-size/file-size';
import { CSAPipe } from './csa/csa';
@NgModule({
  declarations: [FileSizePipe, CSAPipe],
  imports: [],
  exports: [FileSizePipe, CSAPipe]
})
export class PipesModule {}
