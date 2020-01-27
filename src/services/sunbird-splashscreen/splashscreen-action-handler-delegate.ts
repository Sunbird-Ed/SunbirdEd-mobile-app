import { Observable } from 'rxjs';

export interface SplashscreenActionHandlerDelegate {
  onAction(payload: any): Observable<undefined>;
}
