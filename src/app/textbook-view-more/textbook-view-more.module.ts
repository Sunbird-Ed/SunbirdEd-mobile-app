import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TextbookViewMorePage } from './textbook-view-more.page';
import { ComponentsModule } from '../components/components.module';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';

const routes: Routes = [
  {
    path: '',
    component: TextbookViewMorePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    CommonConsumptionModule
  ],
  declarations: [TextbookViewMorePage]
})
export class TextbookViewMorePageModule { }
