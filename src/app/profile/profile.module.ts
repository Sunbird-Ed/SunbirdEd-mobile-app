import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ProfilePage } from '../../app/profile/profile.page';
import { ProfileRoutingModule } from '../../app/profile/profile-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../app/components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CertificateDirectivesModule } from '@project-sunbird/sb-svg2pdf';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProfileRoutingModule,
        TranslateModule,
        ComponentsModule,
        DirectivesModule,
        PipesModule,
        CertificateDirectivesModule
    ],
    declarations: [ProfilePage]
})
export class ProfilePageModule { }
