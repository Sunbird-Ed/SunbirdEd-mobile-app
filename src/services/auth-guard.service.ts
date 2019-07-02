import { Injectable } from '@angular/core';
import { Router, CanLoad, ActivatedRouteSnapshot } from '@angular/router';
import { Route } from '@angular/compiler/src/core';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad {

  constructor(private router: Router) {

  }

  canLoad(route: Route): boolean {
    console.log('route : ', route);
    return true;
  }
}



