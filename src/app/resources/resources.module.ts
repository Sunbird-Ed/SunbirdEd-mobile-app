import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../components/components.module';
import { ResourcesRoutingModule } from './resources-routing.module';
import { ResourcesComponent } from './resources.component';

@NgModule({
    declarations: [
        ResourcesComponent
    ],
    imports: [
        CommonModule,
        IonicModule.forRoot({
            scrollPadding: false,
            scrollAssist: true,
        }),
        TranslateModule.forChild(),
        ResourcesRoutingModule,
        ComponentsModule,
        DirectivesModule,
        ReactiveFormsModule,
        CommonConsumptionModule
    ],
    exports: [
        ResourcesComponent
    ]
})
export class ResourcesModule { }
