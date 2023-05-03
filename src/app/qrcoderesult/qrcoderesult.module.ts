import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../components/components.module';
import { QrcoderesultPage } from './qrcoderesult.page';

const routes: Routes = [
  {
    path: '',
    component: QrcoderesultPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    PipesModule,
    ComponentsModule,
    DirectivesModule
  ],
  providers: [],
  declarations: [QrcoderesultPage],
  exports: [
    QrcoderesultPage
  ]
})
export class QrcoderesultPageModule {}
