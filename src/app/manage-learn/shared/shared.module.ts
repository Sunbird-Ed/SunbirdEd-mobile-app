import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { UtilsService } from '../core/services/utils.service';
import { CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonListCardComponent } from './components';

@NgModule({
  
  declarations: [CamelToTitlePipe, CommonListCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CamelToTitlePipe, CommonListCardComponent ]
})
export class SharedModule { }
