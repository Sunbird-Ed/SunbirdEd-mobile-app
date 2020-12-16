import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramSolutionComponent } from './program-solution/program-solution.component';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [ProgramSolutionComponent],
  imports: [
    CommonModule,
    HttpClientModule, //TODO:remove
    IonicModule
  ],
  exports: [
    ProgramSolutionComponent,HttpClientModule
  ]
})
export class SharedModule { }
