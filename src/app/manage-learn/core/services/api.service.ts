import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestParams } from '../interfaces/request-params';
import { ToastService } from './toast/toast.service';
import { AuthService, DeviceInfo ,SharedPreferences} from 'sunbird-sdk';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { ApiUtilsService } from './api-utils.service';
import { HTTP } from '@ionic-native/http/ngx';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string;
  tokens;
  authToken;
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences : SharedPreferences,
    public apiUtils: ApiUtilsService,
    public ionicHttp:HTTP,
  ) { 
    // this.getToken();
  }

  get(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        let headers = {
            'Authorization': session ? '' :'',
             // 'x-auth-token': session ? session.access_token : '',
            'X-authenticated-user-token': session.access_token,
            'Content-Type':'application/json'
          }
        // const httpOptions = {
        //   headers: new HttpHeaders({
        //     'Authorization': session ? '' : '',
        //     // 'x-auth-token': session ? session.access_token : '',
        //     'X-authenticated-user-token': session.access_token,
        //     // 'X-App-Id': this.apiUtils.appName,
        //     // 'X-App-Ver': this.apiUtils.appVersion,
        //     // 'deviceId': this.deviceInfo.getDeviceID(),
        //   }),
        // };
    this.ionicHttp.setDataSerializer('json');
        return this.ionicHttp.get(this.baseUrl + requestParam.url,'', headers).then(
          data => {
            // return observableOf(JSON.parse(data.data))
            return JSON.parse(data.data);
          }, error => {
            catchError(this.handleError(error))
          },
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

  getToken(){
    this.preferences.getString('api_bearer_token_v2').subscribe(resp=>{
      this.authToken =  resp;
      console.log(resp,"this.authToken");
   });
  }
  post(requestParam: RequestParams): Observable<any> {

    return this.checkTokenValidation().pipe(
      // mergeMap(session => {
      //   const httpOptions = {
      //     headers: new HttpHeaders({
      //       'x-auth-token': session ? session.access_token : '',
      //       'x-authenticated-user-token': session ? session.access_token : '',
      //       'X-App-Id': this.apiUtils.appName,
      //       'X-App-Ver': this.apiUtils.appVersion,
      //       'deviceId': this.deviceInfo.getDeviceID(),
      //     }),
      //   };
      //   return this.http.post(this.baseUrl + requestParam.url, requestParam.payload, httpOptions).pipe(
      //     tap(data => {
      //       return data
      //     }, error => {
      //       catchError(this.handleError(error))
      //     }),
      //   );
      // })



      mergeMap(session => {
        let headers = {
          'Authorization': session ? '' : '',
            // 'Authorization': session ? 'Bearer '+ this.authToken : '',
            
           // 'x-auth-token': session ? session.access_token : '',
            'X-authenticated-user-token': session.access_token,
            'Content-Type':'application/json'
          }
        let body = requestParam.payload ? requestParam.payload : {};
        this.ionicHttp.setDataSerializer('json');
        return this.ionicHttp.post(this.baseUrl + requestParam.url,body, headers).then(
          data => {
            // return observableOf(JSON.parse(data.data));
            return JSON.parse(data.data);
          }, error => {
            catchError(this.handleError(error))
          });
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
      console.error(error, error.status, "status"); // log to console instead, 


      return observableOf(result);
    };
  }
}



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4OTU4MzIyNzkyMTE0MWJiYWE0MjA4ZTBkMjE3YmU0ZiJ9.t2OPiAMuongqwSQfdJAsokgt2Eur5t7RchNZmWOwNTg