import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsListingComponent } from './reports-listing/reports-listing.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ReportsListingComponent,
  },
];
@NgModule({
  declarations: [ReportsListingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class ReportsModule {}
