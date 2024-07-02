import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CreateEditGroupPage } from './create-edit-group.page';
import { DirectivesModule } from '../../../directives/directives.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

const routes: Routes = [
  {
    path: '',
    component: CreateEditGroupPage
  }
];

@NgModule({
  declarations: [CreateEditGroupPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DirectivesModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    CommonConsumptionModule
  ],
  exports: [CreateEditGroupPage]
})
export class CreateEditGroupPageModule { }
