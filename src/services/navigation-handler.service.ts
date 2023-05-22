import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks, MimeType, EventTopics } from '../app/app.constant';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { CommonUtilService } from './common-util.service';
import { Environment, InteractSubtype, InteractType } from './telemetry-constants';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Events } from '../util/events';
@Injectable()
export class NavigationService {

    previousNavigationUrl;

    constructor(
        private router: Router,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService,
        private events: Events
    ) { }

    async navigateToDetailPage(content, navExtras) {
        content = !content.trackable ? ((content.contentData && content.contentData.trackable) ? content.contentData : content) : content;
        if (content.trackable && content.trackable.enabled) {
            if (content.trackable.enabled === TrackingEnabled.YES) {
                // Trackable
                await this.navigateToTrackableCollection(navExtras);
            } else if (content.mimeType === MimeType.COLLECTION) {
                // Collection
                await this.navigateToCollection(navExtras);
            } else {
                // Content
                await this.navigateToContent(navExtras);
            }
        } else {
            // for backward compatibility, remove once not requried
            if (content.content ? (content.content.contentType.toLowerCase()
                === CsContentType.COURSE.toLowerCase()) : content.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase()) {
                // Trackable
                await this.navigateToTrackableCollection(navExtras);
            } else if (content.mimeType === MimeType.COLLECTION) {
                // Collection
                await this.navigateToCollection(navExtras);
            } else {
                // Content
                await this.navigateToContent(navExtras);
            }
        }
    }

    async navigateToTrackableCollection(navExtras) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) !== -1) {
            this.events.publish(EventTopics.DEEPLINK_COURSE_PAGE_OPEN, navExtras);
        } else {
            await this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
                state: navExtras
            });
        }
    }

    async navigateToCollection(navExtras) {
        if (this.router.url && this.router.url.indexOf(RouterLinks.COLLECTION_DETAIL_ETB) !== -1) {
            this.events.publish(EventTopics.DEEPLINK_COLLECTION_PAGE_OPEN, navExtras);
        } else {
            await this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
                state: navExtras
            });
        }
    }

    async navigateToContent(navExtras) {
        await this.router.navigate([RouterLinks.CONTENT_DETAILS], {
            state: navExtras
        });
    }

    async navigateTo(path, navExtras) {
        await this.router.navigate(path, {
            state: navExtras
        });
    }

    async navigateToEditPersonalDetails(profile, pageId,payload?) {
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
            await this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        } else {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        }
    }

}
