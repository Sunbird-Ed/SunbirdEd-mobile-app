import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AastrikaHomePageRoutingModule } from './aastrika-home-routing.module';

import { AastrikaHomePage } from './aastrika-home.page';
import { AastrikaComponentModule } from '../aastrika-component/aastrika-component.module';
import { PipeDurationTransformModule } from '../library/ws-widget/utils/src/public-api';

@NgModule({
    declarations: [AastrikaHomePage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PipeDurationTransformModule,
        AastrikaComponentModule,
        AastrikaHomePageRoutingModule
    ]
})
export class AastrikaHomePageModule {}
