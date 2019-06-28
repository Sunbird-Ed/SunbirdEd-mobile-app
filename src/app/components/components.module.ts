import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { SignInCardComponent} from './sign-in-card/sign-in-card.component';

@NgModule({
  declarations: [ApplicationHeaderComponent,
    SignInCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild()
  ],
  entryComponents: [
    ApplicationHeaderComponent,
    SignInCardComponent
  ],
  exports: [
    ApplicationHeaderComponent,
    SignInCardComponent
  ]
})
export class ComponentsModule { }
