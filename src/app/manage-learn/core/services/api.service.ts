import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestParams } from '../interfaces/request-params';
import { ToastService } from './toast/toast.service';
const environment = {
  apiBaseUrl:''
}
@Injectable()
export class ApiService {
  baseUrl: string;
  constructor(public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController
  ) { }

  get(requestParam: RequestParams): Observable<any> {
    return this.http.get(environment.apiBaseUrl + this.baseUrl + requestParam.url).pipe(
      tap(data => {
        return data
      }, error => {
        catchError(this.handleError(error))
      }),
    )
  }

  post(requestParam: RequestParams): Observable<any> {
    return this.http.post(environment.apiBaseUrl + this.baseUrl + requestParam.url, requestParam.payload).pipe(
      tap(data => {
        return data
      }, error => {
        catchError(this.handleError(error))
      }),
    )
  }
  // post(): Observable<any> {

  // }

  private handleError(result) {
    switch (result.status) {
      case 0:
        this.toast.openToast('MESSAGES.YOU_ARE_WORKING_OFFLINE_TRY_AGAIN' , 'danger')
        break
      case 401:
        // this.auth.sessionExpired();
        break
      default:
        this.toast.openToast(result.error ? result.error.message : 'MESSAGES.SOMETHING_WENT_WRONG' , 'danger')

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
      //   this.toast.showMessage('MESSAGES.SOMETHING_WENT_WRONG', 'danger')
      // }
      return of(result);
    };
  }
}
