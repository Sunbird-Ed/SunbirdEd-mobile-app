import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { CurriculumCoursesPage } from './curriculum-courses.page';

const routes: Routes = [
    {
        path: '',
        component: CurriculumCoursesPage
    },
    {
        path: RouterLinks.CHAPTER_DETAILS,
        loadChildren: () => import('./chapter-details/chapter-details.module').then(m => m.ChapterDetailsPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class CurriculumCoursesRoutingModule { }
