import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeeplinkRedirectComponent } from './deeplink-redirect/deeplink-redirect.component';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
const routes: Routes = [
  {
    path: '',
    component: DeeplinkRedirectComponent,
  },
 
];

@NgModule({
  declarations: [DeeplinkRedirectComponent],
  imports: [
   CommonModule,
    TranslateModule.forChild(),
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    CoreModule,
  ]
})
export class DeeplinkRedirectModule { }
