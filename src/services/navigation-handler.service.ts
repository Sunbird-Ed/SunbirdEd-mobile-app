import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks, MimeType } from '@app/app/app.constant';
import { NavController } from '@ionic/angular';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { CsContentType } from '@project-sunbird/client-services/services/content';

@Injectable()
export class NavigationService {

    constructor(
        private router: Router,
        private navCtrl: NavController
    ) { }

    navigateToDetailPage(content, navExtras) {
        console.log('Navigation Service', content);
        content = !content.trackable ? (content.contentData.trackable ? content.contentData : content) : content;
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
        })
    }

}