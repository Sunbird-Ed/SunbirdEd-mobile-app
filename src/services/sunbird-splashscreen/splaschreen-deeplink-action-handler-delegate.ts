import { SplashscreenActionHandlerDelegate } from './splashscreen-action-handler-delegate';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentType, MimeType } from '../../app/app.constant';
// migration-TODO
// import { EnrolledCourseDetailsPage } from '@app/pages/enrolled-course-details';
// import { CollectionDetailsEtbPage } from '@app/pages/collection-details-etb/collection-details-etb';
// import { ContentDetailsPage } from '@app/pages/content-details/content-details';
// import { SearchPage } from '@app/pages/search';
import { ContentService, Content } from 'sunbird-sdk';
import { AppGlobalService } from '../app-global-service.service';


@Injectable()
export class SplaschreenDeeplinkActionHandlerDelegate implements SplashscreenActionHandlerDelegate {
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private appGlobalServices: AppGlobalService) {
  }

  onAction(type: string, { identifier }: any): Observable<undefined> {
    // migration-TODO
    // const navObj = this.app.getActiveNavs()[0];
    const navObj: any = {};
    switch (type) {
      case 'content': {
          return this.contentService.getContentDetails({
            contentId: identifier
          }).do(async (content: Content) => {
            if (content.contentType === ContentType.COURSE.toLowerCase()) {
              // migration-TODO
              // await navObj.push(EnrolledCourseDetailsPage, { content });
            } else if (content.mimeType === MimeType.COLLECTION) {
              // migration-TODO
              // await navObj.push(CollectionDetailsEtbPage, { content });
            } else {
              // migration-TODO
              // await navObj.push(ContentDetailsPage, { content });
            }
          }).mapTo(undefined) as any;
        }
      case 'dial': {
          // migration-TODO
          // navObj.push(SearchPage, { dialCode: identifier });
          return Observable.of(undefined);
      }
      default: {
        return Observable.of(undefined);
      }
    }
  }
}
