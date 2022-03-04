import { Injectable } from '@angular/core';

import {  ActivatedRouteSnapshot,CanDeactivate, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { AddFilePage } from '../../project/add-file/add-file.page';
 
@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<any> 
{
    component: Object;
    route: ActivatedRouteSnapshot;
 
   constructor(){
   }
 
   canDeactivate(component:AddFilePage,
                route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot,
                nextState: RouterStateSnapshot) : Observable<any> | Promise<any> | any {
        return !component.exitPage ? component.pageExitConfirm() : true;
 
  }
  
}