import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks, MimeType, ContentType} from '@app/app/app.constant';
import { NavController } from '@ionic/angular';
import { TrackingEnabled } from '@project-sunbird/client-services/models';
import { Content } from '@project-sunbird/sunbird-sdk';

@Injectable()
export class NavigationService {

    constructor(
        private router: Router,
        private navCtrl: NavController
    ) {}

    navigateToDetailPage(content, navExtras) {
        console.log('Navigation Service', content);
        if(content.trackable && content.trackable.enabled) {
            if(content.trackable.enabled === TrackingEnabled.YES) {
                // Trackable
                this.navigateToTrackableCollection(navExtras);
            } else if(content.mimeType === MimeType.COLLECTION) {
                // Collection
                this.navigateToCollection(navExtras);
            } else {
                // Content
                this.navigateToContent(navExtras);
            }
        } else { // for backward compatibility, remove once not requried
            if(content.contentType === ContentType.COURSE) {
                // Trackable
                this.navigateToTrackableCollection(navExtras);
            } else if(content.mimeType === MimeType.COLLECTION) {
                // Collection
                this.navigateToCollection(navExtras);
            } else {
                // Content
                this.navigateToContent(navExtras);
            }
        }
    }
    navigateToTrackableCollection(navExtras) {
        console.log('Navigation ServiceT');
        this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], {
            state: navExtras
        });
    }
    navigateToCollection(navExtras) {
        console.log('Navigation ServiceB');
        this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], {
            state: navExtras
        });
    }
    navigateToContent(navExtras) {
        console.log('Navigation ServiceC');
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