import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentType, MimeType, RouterLinks } from '../../app/app.constant';
import { ContentService, Content } from 'sunbird-sdk';
import { AppGlobalService } from '../app-global-service.service';
import { Router, RouterLink } from '@angular/router';


@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private appGlobalServices: AppGlobalService,
    private router: Router
  ) {
  }

  onAction(type: string, { identifier }: any): Observable<undefined> {
    const navObj: any = {};
    switch (type) {
      case 'content': {
        return this.contentService.getContentDetails({
          contentId: identifier
        }).do(async (content: Content) => {
          if (content.contentType === ContentType.COURSE.toLowerCase()) {
            this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], { state: { content } });
          } else if (content.mimeType === MimeType.COLLECTION) {
            this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], { state: { content } });
          } else {
            this.router.navigate([RouterLinks.CONTENT_DETAILS], { state: { content } });
          }
        }).mapTo(undefined) as any;
      }
      case 'dial': {
        this.router.navigate([RouterLinks.SEARCH], { state: { dialCode: identifier } });
        return Observable.of(undefined);
      }
      default: {
        return Observable.of(undefined);
      }
    }
  }
}
