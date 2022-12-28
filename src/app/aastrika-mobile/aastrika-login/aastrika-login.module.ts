import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AastrikaLoginPageRoutingModule } from './aastrika-login-routing.module';

import { AastrikaLoginPage } from './aastrika-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AastrikaLoginPageRoutingModule
  ],
  declarations: [AastrikaLoginPage]
})
export class AastrikaLoginPageModule {}
