import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { SignInCardComponent} from './sign-in-card/sign-in-card.component';
import {TextBookCardComponent} from './text-book-card/text-book-card.component';
import {NewCourseCardComponent} from './new-course-card/new-course-card.component';
import { PipesModule } from 'src/pipes/pipes.module';
import {ViewAllCardComponent} from './view-all-card/view-all-card.component';
import {ViewMoreCardComponent} from './view-more-card/view-more-card.component';
import {PbHorizontalComponent} from './pb-horizontal/pb-horizontal.component';
import { SbGenericPopoverComponent } from './popups/sb-generic-popover/sb-generic-popover.component';


@NgModule({
  declarations: [ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    NewCourseCardComponent,
    ViewAllCardComponent,
    ViewMoreCardComponent,
    PbHorizontalComponent,
    SbGenericPopoverComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild()
  ],
  entryComponents: [
    ApplicationHeaderComponent,
    SignInCardComponent,
  ],
  exports: [
    ApplicationHeaderComponent,
    SignInCardComponent,
    TextBookCardComponent,
    NewCourseCardComponent,
    ViewAllCardComponent,
    ViewMoreCardComponent,
    PbHorizontalComponent,
    SbGenericPopoverComponent
  ]
})
export class ComponentsModule { }
