// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Routes, RouterModule } from '@angular/router';

// import { IonicModule } from '@ionic/angular';

// import { Mentors } from './mentors.page';
// import { ComponentsModule } from '../components/components.module';
// import { PipesModule } from '../../pipes/pipes.module';
// import { DirectivesModule } from '../../directives/directives.module';
// import { TranslateModule } from '@ngx-translate/core';
// import { CommonConsumptionModule } from '@project-sunbird/common-consumption';


// const routes: Routes = [
//   {
//     path: '',
//     component: Mentors
//   }
// ];

// @NgModule({
//     imports: [
//         CommonModule,
//         FormsModule,
//         IonicModule,
//         RouterModule.forChild(routes),
//         TranslateModule.forChild(),
//         PipesModule,
//         DirectivesModule,
//         ComponentsModule,
//         CommonConsumptionModule
//     ],
//     declarations: [
//         Mentors
//     ]
// })
// export class MentorsModule {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { MentorsPage } from './mentors.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: MentorsPage
      }
    ])
  ],
  declarations: [MentorsPage]
})
export class MentorsPageModule {}
