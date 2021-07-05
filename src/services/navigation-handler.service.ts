import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks, MimeType } from '@app/app/app.constant';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { CommonUtilService } from './common-util.service';
import { Environment, InteractSubtype, InteractType } from './telemetry-constants';
import { TelemetryGeneratorService } from './telemetry-generator.service';
@Injectable()
export class NavigationService {

    previousNavigationUrl;

    constructor(
        private router: Router,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService
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
            if (content.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase()) {
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
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
            state: navExtras
        });
    }

    navigateToCollection(navExtras) {
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
            state: navExtras
        });
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

    navigateToEditPersonalDetails(profile, pageId) {
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
                    source: pageId
                }
            };
            this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
        } else {
            this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
        }
    }

    setNavigationUrl(navigationUrl: string) {
        this.previousNavigationUrl = navigationUrl;
    }

    navigateToLastUrl(){
        this.router.navigate([this.previousNavigationUrl], {replaceUrl: true});
    }

}
