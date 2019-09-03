import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesComponent } from './resources.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '@app/directives/directives.module';
import { ExploreBooksSortComponent } from './explore-books-sort/explore-books-sort.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExploreBooksPageModule } from './explore-books/explore-books.module';

@NgModule({
  declarations: [
    ResourcesComponent,
    ExploreBooksSortComponent
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
    ReactiveFormsModule
  ],
  entryComponents: [ExploreBooksSortComponent],
  exports: [
    ResourcesComponent,
    ExploreBooksSortComponent
  ]
})
export class ResourcesModule { }
