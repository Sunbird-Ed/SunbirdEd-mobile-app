import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService, UtilsService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class MlGuard implements CanActivate {
  constructor(private utils: UtilsService, private toast: ToastService) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise((resolve, reject) => {
      if (this.utils.profile && this.utils.profile.userSubType) {
        resolve(true)
      } else {
        this.utils.getProfileData().then(data => {
          if (data.role) {
            resolve(true)
          } else {
            resolve(false);
          }
        }).catch(error => {
          this.toast.openToast("You do not have access", 'danger');
          resolve(false)
        })
      }
    })
  }

}
