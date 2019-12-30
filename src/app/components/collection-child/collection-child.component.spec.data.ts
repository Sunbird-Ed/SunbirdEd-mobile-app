import { Content, ContentStateResponse } from 'sunbird-sdk';
import { Navigation } from '@angular/router';

export const mockChildContentData: Content = {
    identifier: 'do_21274246255366963214046',
    contentData: {}
};

export const mockCompletedContentStatusData: ContentStateResponse = {
   contentList: [{
       contentId: 'do_21274246255366963214046',
       status: 2
   }]
};

export const mockInCompleteContentStatusData: ContentStateResponse = {
    contentList: [{
        contentId: 'do_21274246255366963214046',
        status: 1
    }]
 };

