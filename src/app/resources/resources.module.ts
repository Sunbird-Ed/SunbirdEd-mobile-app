import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesComponent } from './resources.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '@app/directives/directives.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ExploreBooksSortComponent } from './explore-books-sort/explore-books-sort.component';

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
    RouterModule.forChild([
      {
        path: '',
        component: ResourcesComponent
      }
    ]),
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
