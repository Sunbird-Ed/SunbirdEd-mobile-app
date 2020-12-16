import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { UtilsService } from '../core/services/utils.service';
import { CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonListCardComponent } from './components';
import { ItemListCardComponent } from './components/item-list-card/item-list-card.component';
import { CommonHeaderComponent } from './components/common-header/common-header.component';

@NgModule({
  
  declarations: [CamelToTitlePipe, CommonListCardComponent, ItemListCardComponent, CommonHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [CamelToTitlePipe, CommonListCardComponent, ItemListCardComponent, CommonHeaderComponent ]
})
export class SharedModule { }
