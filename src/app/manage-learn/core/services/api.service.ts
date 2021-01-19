import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestParams } from '../interfaces/request-params';
import { ToastService } from './toast/toast.service';
import { AuthService } from 'sunbird-sdk';
const environment = {
  apiBaseUrl: 'https://survey.preprod.ntp.net.in/'
}
@Injectable()
export class ApiService {
  baseUrl: string;
  tokens;
  constructor(public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,

  ) { }

  get(requestParam: RequestParams): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap((session) => {
        const httpOptions = {
          headers: new HttpHeaders({
            'x-auth-token': session ? session.access_token + "tt" : "",
            'x-authenticated-user-token': session ? session.access_token + "ii" : "",
          })
        };
        return this.http.get(environment.apiBaseUrl + this.baseUrl + requestParam.url).pipe(
          tap(data => {
            return observableOf(data)
          }, error => {
            catchError(this.handleError(error))
          }),
        );
      })
    );
  }

  post(requestParam: RequestParams): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap((session) => {
        const httpOptions = {
          headers: new HttpHeaders({
            'x-auth-token': session ? session.access_token + "tt" : "",
            'x-authenticated-user-token': session ? session.access_token + "ii" : "",
          })
        };
        return this.http.post(environment.apiBaseUrl + this.baseUrl + requestParam.url, requestParam.payload, httpOptions).pipe(
          tap(data => {
            return data
          }, error => {
            catchError(this.handleError(error))
          }),
        );
      })
    );
  }


  

  private handleError(result) {
    debugger
    switch (result.status) {
      case 0:
        this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
        break
      case 401:
        // this.auth.sessionExpired();
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
