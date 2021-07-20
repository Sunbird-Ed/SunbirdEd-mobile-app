import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestParams } from '../interfaces/request-params';
import { ToastService } from './toast/toast.service';
import { AuthService, DeviceInfo } from 'sunbird-sdk';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { ApiUtilsService } from './api-utils.service';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string;
  tokens;
  constructor(public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    public apiUtils: ApiUtilsService
  ) { }

  get(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const httpOptions = {
          headers: new HttpHeaders({
            'x-auth-token': session ? session.access_token : '',
            'x-authenticated-user-token': session ? session.access_token : '',
            'X-App-Id': this.apiUtils.appName,
            // 'X-App-Ver': this.apiUtils.appVersion,
            // 'deviceId': this.deviceInfo.getDeviceID(),
          }),
        };
        return this.http.get(this.baseUrl + requestParam.url, httpOptions).pipe(
          tap(data => {
            return observableOf(data)
          }, error => {
            catchError(this.handleError(error))
          }),
        );
      })
    )
  }


  checkTokenValidation(): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap(tokens => {
        const token = jwt_decode(tokens.access_token);
        const tokenExpiryTime = moment(token.exp * 1000);
        const currentTime = moment(Date.now());
        const duration = moment.duration(tokenExpiryTime.diff(currentTime));
        const hourDifference = duration.asHours();
        if (hourDifference < 2) {
          return this.authService.refreshSession().pipe(
            mergeMap(refreshData => {
              return this.authService.getSession()
            })
          )
        } else {
          return this.authService.getSession()
        }
      })
    )
  }

  post(requestParam: RequestParams): Observable<any> {

    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const httpOptions = {
          headers: new HttpHeaders({
            'x-auth-token': session ? session.access_token : '',
            'x-authenticated-user-token': session ? session.access_token : '',
            'X-App-Id': this.apiUtils.appName,
            // 'X-App-Ver': this.apiUtils.appVersion,
            // 'deviceId': this.deviceInfo.getDeviceID(),
          }),
        };
        return this.http.post(this.baseUrl + requestParam.url, requestParam.payload, httpOptions).pipe(
          tap(data => {
            return data
          }, error => {
            catchError(this.handleError(error))
          }),
        );
      })
    )
  }

  delete(requestParam: RequestParams): Observable<any> {

    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const httpOptions = {
          headers: new HttpHeaders({
            'x-auth-token': session ? session.access_token : '',
            'x-authenticated-user-token': session ? session.access_token : '',
            'X-App-Id': this.apiUtils.appName,
            // 'X-App-Ver': this.apiUtils.appVersion,
            // 'deviceId': this.deviceInfo.getDeviceID()
          }),
          body: requestParam.payload,
        };
        return this.http.delete(this.baseUrl + requestParam.url, httpOptions).pipe(
          tap(data => {
            return data
          }, error => {
            catchError(this.handleError(error))
          }),
        );
      })
    )
  }



  private handleError(result) {
    switch (result.status) {
      case 0:
        this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
        break
      case 401:
        this.toast.showMessage('Session expired', 'danger')
        break
      default:
        this.toast.showMessage(result.error ? result.error.message : 'FRMELEMNTS_MSG_SOMETHING_WENT_WRONG', 'danger')

    }
    return (error: any): Observable<any> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error, error.status, "status"); // log to console instead, 

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      // if (error.status === 401) {
      //   this.auth.sessionExpired();
      // } else {
      //   this.toast.showMessage('FRMELEMNTS_MSG_SOMETHING_WENT_WRONG', 'danger')
      // }
      return observableOf(result);
    };
  }
}
