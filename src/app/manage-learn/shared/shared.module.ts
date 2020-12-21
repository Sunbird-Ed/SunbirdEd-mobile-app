import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CamelToTitlePipe } from './pipe/camel-to-title.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonListCardComponent } from './components';
import { ItemListCardComponent } from './components/item-list-card/item-list-card.component';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { EntityfilterComponent } from './components/entityfilter/entityfilter.component';
import { UtilsService } from '../core/services/utils.service';
import { PopoverComponent } from './components/popover/popover.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CamelToTitlePipe,
    CommonListCardComponent,
    ItemListCardComponent,
    CommonHeaderComponent,
    EntityfilterComponent,
    PopoverComponent,
  ],

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule, //TODO:remove after api integration
    TranslateModule.forChild(),
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  exports: [
    CamelToTitlePipe,
    CommonListCardComponent,
    ItemListCardComponent,
    CommonHeaderComponent,
    EntityfilterComponent,
    PopoverComponent,
  ],
  entryComponents: [EntityfilterComponent, PopoverComponent],
})
export class SharedModule {}
