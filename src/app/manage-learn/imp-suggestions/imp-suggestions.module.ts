import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImpSuggestionsPageRoutingModule } from './imp-suggestions-routing.module';

import { ImpSuggestionsPage } from './imp-suggestions.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImpSuggestionsPageRoutingModule,
    TranslateModule.forChild(),

  ],
  declarations: [ImpSuggestionsPage]
})
export class ImpSuggestionsPageModule {}
