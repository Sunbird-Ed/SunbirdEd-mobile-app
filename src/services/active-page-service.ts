import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { PageId } from './telemetry-constants';

export class ActivePageService {

  constructor() { }

  computePageId(url): string {
    const routeUrl = url;
    let pageId = '';

    if (routeUrl === RouterLinks.LIBRARY_TAB) {
      pageId = PageId.LIBRARY;
    } else if (routeUrl === RouterLinks.COURSE_TAB) {
      pageId = PageId.COURSES;
    } else if (routeUrl === RouterLinks.PROFILE_TAB) {
      pageId = PageId.PROFILE;
    } else if (routeUrl === RouterLinks.GUEST_PROFILE_TAB) {
      pageId = PageId.GUEST_PROFILE;
    } else if (routeUrl === RouterLinks.DOWNLOAD_TAB) {
      pageId = PageId.DOWNLOADS;
    } else if (routeUrl.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1) {
      pageId = PageId.COLLECTION_DETAIL;
    } else if (routeUrl.indexOf(RouterLinks.CONTENT_DETAILS) !== -1) {
      pageId = PageId.CONTENT_DETAIL;
    } else if (routeUrl.indexOf(RouterLinks.QRCODERESULT) !== -1) {
      pageId = PageId.DIAL_CODE_SCAN_RESULT;
    } else if (routeUrl.indexOf(RouterLinks.COLLECTION_DETAILS) !== -1) {
      pageId = PageId.COLLECTION_DETAIL;
    } else if (routeUrl.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
      pageId = PageId.COURSE_DETAIL;
    } else if (routeUrl.indexOf(RouterLinks.ACTIVE_DOWNLOADS) !== -1) {
      pageId = PageId.ACTIVE_DOWNLOADS;
    } else if (routeUrl.indexOf(RouterLinks.COURSE_BATCHES) !== -1) {
      pageId = PageId.COURSE_BATCHES;
    }

    return pageId;
  }

}
