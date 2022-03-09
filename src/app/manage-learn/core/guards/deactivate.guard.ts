import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot,CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface isDeactivatable {
  pageExitConfirm: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<isDeactivatable> {
  canDeactivate(
    component: isDeactivatable,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return component.pageExitConfirm ? component.pageExitConfirm() : true;
  }
}