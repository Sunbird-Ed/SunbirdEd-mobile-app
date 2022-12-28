import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeDurationTransformPipe } from './pipe-duration-transform.pipe'

@NgModule({
  declarations: [PipeDurationTransformPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeDurationTransformPipe],
})
export class PipeDurationTransformModule { }
