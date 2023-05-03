import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';

import { SignInPage } from './sign-in.page';

const routes: Routes = [
  {
    path: '',
    component: SignInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SignInWithApple]
})
export class SignInPageRoutingModule {}
