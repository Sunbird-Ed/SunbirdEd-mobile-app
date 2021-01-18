import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesComponent } from './resources.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '@app/directives/directives.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption-v8';
import { ExploreBooksSortComponent } from './explore-books-sort/explore-books-sort.component';
import { ResourcesRoutingModule } from './resources-routing.module';

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
  ],
  entryComponents: []
})
export class ResourcesModule { }
