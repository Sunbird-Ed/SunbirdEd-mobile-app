import {Observable} from 'rxjs';

export interface SplashscreenActionHandlerDelegate {
  onAction(type: string, payload: any): Observable<undefined>;
}
