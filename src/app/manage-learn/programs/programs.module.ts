import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';


import { ProgramListingComponent } from './program-listing/program-listing.component';
import { SolutionListingComponent } from './solution-listing/solution-listing.component';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: ProgramListingComponent
  },
  {
    path: 'solutions',
    component: SolutionListingComponent
  }
];

@NgModule({
  declarations: [
    ProgramListingComponent,
    SolutionListingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule
  ]
})
export class ProgramsModule { }
