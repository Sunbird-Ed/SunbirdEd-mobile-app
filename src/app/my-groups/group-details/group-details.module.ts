import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GroupDetailsPage } from './group-details.page';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { ComponentsModule } from '../../components/components.module';
import { OverflowMenuComponent } from '../../profile/overflow-menu/overflow-menu.component';
import { PipesModule } from '@app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: GroupDetailsPage
  }
];

@NgModule({
  declarations: [GroupDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    CommonConsumptionModule,
    ComponentsModule,
    PipesModule
  ],
  exports: [GroupDetailsPage],
  entryComponents: [OverflowMenuComponent]
})
export class GroupDetailsPageModule {}
