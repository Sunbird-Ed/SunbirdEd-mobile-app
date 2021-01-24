import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllEvidenceListComponent } from './all-evidence-list/all-evidence-list.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
const routes: Routes = [
  {
    path: '',
    component: AllEvidenceListComponent,
  },
];

@NgModule({
  declarations: [ AllEvidenceListComponent],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
})
export class AllEvidenceListModule {}
