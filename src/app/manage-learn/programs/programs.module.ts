import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ProgramListingComponent } from './program-listing/program-listing.component';
import { SolutionListingComponent } from './solution-listing/solution-listing.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { RouterLinks } from '@app/app/app.constant';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';

const routes: Routes = [
  {
    path: '',
    component: ProgramListingComponent,
  },
  {
    path: `${RouterLinks.SOLUTIONS}/:id`,
    component: SolutionListingComponent,
  },
];

@NgModule({
  declarations: [ProgramListingComponent, SolutionListingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule,
  ],
  entryComponents:[]
})
export class ProgramsModule {}
