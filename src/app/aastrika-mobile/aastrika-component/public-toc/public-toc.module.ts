import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PublicTocComponent } from './public-toc.component'
import { AastrikaComponentModule } from '../aastrika-component.module'

@NgModule({
  declarations: [PublicTocComponent],
  imports: [
    CommonModule,
    AastrikaComponentModule
  ],
  exports: [PublicTocComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class PublicTocModule { }
