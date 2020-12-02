import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouterLinks } from '../app.constant';
import { ResourcesComponent } from './resources.component';

const routes: Routes = [
    { path: '', component: ResourcesComponent, },
    { path: RouterLinks.RELEVANT_CONTENTS, loadChildren: './relevant-contents/relevant-contents.module#RelevantContentsPageModule' },
    { path: 'home-page', loadChildren: './home-page/home-page.module#HomePagePageModule' },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class ResourcesRoutingModule { }
