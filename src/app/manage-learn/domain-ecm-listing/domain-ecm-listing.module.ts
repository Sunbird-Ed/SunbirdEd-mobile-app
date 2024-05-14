import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainEcmLsitingComponent } from './domain-ecm-lsiting/domain-ecm-lsiting.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: DomainEcmLsitingComponent,
  },
];

@NgModule({
  declarations: [DomainEcmLsitingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class DomainEcmListingModule {}
