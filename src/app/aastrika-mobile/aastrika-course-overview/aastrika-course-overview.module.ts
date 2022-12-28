import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AastrikaCourseOverviewPageRoutingModule } from './aastrika-course-overview-routing.module';

import { AastrikaCourseOverviewPage } from './aastrika-course-overview.page';
import { AastrikaComponentModule } from '../aastrika-component/aastrika-component.module';
import { ComponentsModule } from '@app/app/components/components.module';

@NgModule({
    declarations: [AastrikaCourseOverviewPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        AastrikaComponentModule,
        AastrikaCourseOverviewPageRoutingModule
    ]
})
export class AastrikaCourseOverviewPageModule {}
