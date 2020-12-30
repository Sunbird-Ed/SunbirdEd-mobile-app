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
import { AttachmentComponent } from './attachment/attachment.component';
const routes: Routes = [
  {
    path: '',
    component: AllEvidenceListComponent,
  },
];

@NgModule({
  declarations: [AttachmentComponent, AllEvidenceListComponent],
  imports: [
    CommonModule,
    HttpClientModule, // TODO:remove after api integration
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
})
export class AllEvidenceListModule {}
