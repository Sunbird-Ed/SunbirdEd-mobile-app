import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Platform } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    constructor(
        private platform: Platform,
        private appDetails: AppVersion,
        // private auth: AuthService,
        // private toast: ToastMessageService
    ) {
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // if (!window.navigator.onLine) {
        //     this.showToast('MESSAGES.OFFLINE', 'danger');
        // } else {
        //     return from(this.handle(request, next))
        // }
        return from(this.handle(request, next))
      
    }
    async handle(req: HttpRequest<any>, next: HttpHandler) {
        let authReq;
        const appVersion: string = await this.appDetails.getVersionNumber();
        const appName: string = await this.appDetails.getAppName();
        // send skip param as true in header to disable headers
        if (!req.headers.get("skip") || req.headers.get("skip") === 'false') {
                // const token: any = await this.auth.tokenValidation();
                authReq = req.clone({
                    setHeaders: {
                        // 'x-auth-token': token ? token.access_token : "",
                        // 'x-authenticated-user-token': token ? token.access_token: "",
                        'gpsLocation': '',
                        'appVersion': appVersion,
                        'appName': appName,
                        // 'appType': environment.appType,
                        'os': this.platform.is('ios') ? 'ios' : 'android'
                    }
                })
        } else {
            authReq = req.clone({
                headers: req.headers.delete('skip')
            })
        }
        return next.handle(authReq).toPromise()
    }

    showToast(msg, color) {
        // this.toast.showMessage(msg, color);
    }
}