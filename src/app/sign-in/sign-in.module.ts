import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignInPageRoutingModule } from './sign-in-routing.module';

import { SignInPage } from './sign-in.page';
import {TranslateModule} from '@ngx-translate/core';
import { CommonFormElementsModule } from 'common-form-elements';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SignInPageRoutingModule,
        TranslateModule,
        CommonFormElementsModule
    ],
  declarations: [SignInPage]
})
export class SignInPageModule {}
