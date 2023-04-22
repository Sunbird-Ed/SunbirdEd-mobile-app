import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { IonicRatingModule } from 'ionic4-rating';
import { TextbookTocService } from '../collection-detail-etb/textbook-toc-service';
import { ComponentsModule } from '../components/components.module';
import { EnrolledCourseDetailsPage } from './enrolled-course-details-page';

const routes: Routes = [
  {
    path: '',
    component: EnrolledCourseDetailsPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IonicRatingModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        CommonConsumptionModule,
    ],
    declarations: [EnrolledCourseDetailsPage],
    providers: [DatePipe, TextbookTocService]
})
export class EnrolledCourseDetailsPagePageModule { }
