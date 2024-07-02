import { Content, ContentStateResponse } from '@project-sunbird/sunbird-sdk';
import { Navigation } from '@angular/router';

export const mockChildContentData: Content = {
    identifier: 'do_21274246255366963214046',
    basePath: 'samplePath',
    contentData: {
        name: 'sample_name',
        appIcon: 'sample_icon'
    },
    hierarchyInfo: [{
        identifier: 'do_123',
        contentType: 'textbook'
    }, {
        identifier: 'do098',
        contentType: 'resources'
    }],

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

