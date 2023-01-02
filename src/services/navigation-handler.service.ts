import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks, MimeType, EventTopics } from '@app/app/app.constant';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { CommonUtilService } from './common-util.service';
import { Environment, InteractSubtype, InteractType } from './telemetry-constants';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Events } from '@app/util/events';
@Injectable()
export class NavigationService {

    previousNavigationUrl;

    constructor(
        private router: Router,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService,
        private events: Events
    ) { }

    navigateToDetailPage(content, navExtras) {
        content = !content.trackable ? ((content.contentData && content.contentData.trackable) ? content.contentData : content) : content;
        if (content.trackable && content.trackable.enabled) {
            if (content.trackable.enabled === TrackingEnabled.YES) {
                // Trackable
                this.navigateToTrackableCollection(navExtras);
            } else if (content.mimeType === MimeType.COLLECTION) {
                // Collection
                this.navigateToCollection(navExtras);
            } else {
                // Content
                this.navigateToContent(navExtras);
            }
        } else {
            // for backward compatibility, remove once not requried
            if (content.content ? (content.content.contentType.toLowerCase()
                === CsContentType.COURSE.toLowerCase()) : content.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase()) {
                // Trackable
                this.navigateToTrackableCollection(navExtras);
            } else if (content.mimeType === MimeType.COLLECTION) {
                // Collection
                this.navigateToCollection(navExtras);
            } else {
                // Content
                this.navigateToContent(navExtras);
            }
        }
    }

    navigateToTrackableCollection(navExtras) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
            this.events.publish(EventTopics.DEEPLINK_COURSE_PAGE_OPEN, navExtras);
        } else {
            this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
                state: navExtras
            });
        }
    }

    navigateToCollection(navExtras) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1) {
            this.events.publish(EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN, navExtras);
        } else {
            this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
                state: navExtras
            });
        }
    }

    navigateToContent(navExtras) {
        this.router.navigate([RouterLinks.CONTENT_DETAILS], {
            state: navExtras
        });
    }

    navigateTo(path, navExtras) {
        this.router.navigate(path, {
            state: navExtras
        });
    }

    navigateToEditPersonalDetails(profile, pageId,payload?) {
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.EDIT_CLICKED,
                Environment.HOME,
                pageId, null);

            const navigationExtras: NavigationExtras = {
                state: {
                    profile,
                    isShowBackButton: true,
                    source: pageId,
                    payload
                }
            };
            this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        } else {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        }
    }

}
