import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';

@NgModule({
  declarations: [ApplicationHeaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  entryComponents: [
    ApplicationHeaderComponent
  ],
  exports: [
    ApplicationHeaderComponent
  ]
})
export class ComponentsModule { }
