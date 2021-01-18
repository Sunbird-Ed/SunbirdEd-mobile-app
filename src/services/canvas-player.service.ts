import { Inject, Injectable } from '@angular/core';
import { ContentStateResponse, GetContentStateRequest, SunbirdSdk, SharedPreferences } from 'sunbird-sdk';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as X2JS from 'x2js';
import { PreferenceKey, ProfileConstants } from '@app/app/app.constant';
import { Events } from '@ionic/angular';
import { LocalCourseService } from './local-course.service';
import { CommonUtilService } from './common-util.service';

declare global {
    interface Window {
        handleAction: (methodName, params) => void;
    }
}
@Injectable()

export class CanvasPlayerService {
    constructor(
        private _http: HttpClient,
        private events: Events,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private localCourseService: LocalCourseService,
        private commonUtilService: CommonUtilService,
    ) { }

    /**
     * This is the globally available method used by player to communicate with mobile
     */
    handleAction() {
        window.handleAction = (methodName: string, params = []) => {
            switch (methodName) {
                case 'getCurrentUser':
                    return SunbirdSdk.instance.profileService.getActiveSessionProfile({
                        requiredFields: ProfileConstants.REQUIRED_FIELDS
                    }).toPromise();
                case 'getAllUserProfile':
                    return SunbirdSdk.instance.profileService.getAllProfiles(params[0]).toPromise();
                case 'setUser':
                    return SunbirdSdk.instance.profileService.setActiveSessionForProfile(params[0]).toPromise();
                case 'getContent':
                    return SunbirdSdk.instance.contentService.getContents(params[0]).toPromise();
                case 'getRelevantContent':
                    const request = JSON.parse(params[0]);
                    request['shouldConvertBasePath'] = true;
                    return SunbirdSdk.instance.contentService.getRelevantContent(request).toPromise();
                case 'getRelatedContent':
                    console.log('getRelatedContent to be defined');
                    break;
                case 'getContentList':
                    return SunbirdSdk.instance.contentService.getContents(params[0]).toPromise();
                case 'sendFeedback':
                    return SunbirdSdk.instance.contentFeedbackService.sendFeedback(params[0]).toPromise();
                case 'languageSearch':
                    console.log('languageSearch to be defined');
                    break;
                case 'endGenieCanvas':
                    this.events.publish('endGenieCanvas', { showConfirmBox: false });
                    break;
                case 'showExitConfirmPopup':
                    this.events.publish('endGenieCanvas', { showConfirmBox: true });
                    break;
                case 'endContent':
                    console.log('endContent to be defined');
                    break;
                case 'launchContent':
                    console.log('launchContent to be defined');
                    break;
                case 'send':
                    return SunbirdSdk.instance.telemetryService.saveTelemetry(params[0]).subscribe();
                case 'checkMaxLimit':
                    const identifier = params[0].identifier;
                    return this.preferences.getString(PreferenceKey.CONTENT_CONTEXT).toPromise()
                        .then(async (context: string) => {
                            const courseContext = JSON.parse(context);
                            if (courseContext.courseId && courseContext.batchId && courseContext.leafNodeIds) {
                                const getContentStateRequest: GetContentStateRequest = {
                                    userId: courseContext.userId,
                                    courseId: courseContext.courseId,
                                    contentIds: courseContext.leafNodeIds,
                                    returnRefreshedContentStates: true,
                                    batchId: courseContext.batchId,
                                    fields: ['progress', 'score']
                                };

                                const contentStateResponse: ContentStateResponse = await SunbirdSdk.instance.courseService
                                    .getContentState(getContentStateRequest).toPromise();

                                const assessmentStatus = this.localCourseService.fetchAssessmentStatus(contentStateResponse, identifier);

                                const skipPlay = await this.commonUtilService.handleAssessmentStatus(assessmentStatus);
                                return skipPlay;
                            }
                            return false;
                        });
                default:
                    console.log('Please use valid method');
            }
        };
    }

    /**
     * This will convert xml to JSON
     * @param {string} path Path to the xml file
     */
    xmlToJSon(path: string): Promise<any> {
        if (path.length) {
            const _headers = new HttpHeaders();
            const headers = _headers.set('Content-Type', 'text/xml');
            return new Promise((resolve, reject) => {
                try {
                    this._http.get(path, { headers: _headers, responseType: 'text' }).subscribe((data) => {
                        const x2js = new X2JS();
                        const json = x2js.xml2js(data);
                        resolve(json);
                    });
                } catch (error) {
                    reject('Unable to convert');
                }
            });
        }
    }

    /**
     * This will read JSON file
     * @param {string} path Path to the JSON file
     * @returns {Promise} Returns JSON object
     */
    readJSON(path: string): Promise<any> {
        if (path.length) {
            const _headers = new HttpHeaders();
            const headers = _headers.set('Content-Type', 'text/javascript');
            return new Promise((resolve, reject) => {
                try {
                    this._http.get(path, { headers: _headers, responseType: 'json' }).subscribe((data) => {
                        resolve(data);
                    });
                } catch (error) {
                    reject('Unable to read JSON');
                }
            });
        }
    }

}
