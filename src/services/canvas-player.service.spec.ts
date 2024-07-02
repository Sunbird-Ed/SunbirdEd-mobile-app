import { CanvasPlayerService } from '../services/canvas-player.service';
import { HttpClient } from '@angular/common/http';
import { Events } from '../util/events';
import { of } from 'rxjs';
import * as X2JS from 'x2js';
import { ContentFeedbackService, ContentService, ProfileService, SunbirdSdk, TelemetryService } from '@project-sunbird/sunbird-sdk';
import { CourseService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey } from '../app/app.constant';
import { LocalCourseService } from './local-course.service';
import { CommonUtilService } from './common-util.service';
import { File } from '@awesome-cordova-plugins/file/ngx';


describe('CanvasPlayerService', () => {
    let canvasPlayerService: CanvasPlayerService;
    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockContentFeedbackService: Partial<ContentFeedbackService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockX2Js: Partial<X2JS> = {};
    const mockSunbirdSdk: Partial<SunbirdSdk> = {
        profileService: mockProfileService,
        contentService: mockContentService,
        contentFeedbackService: mockContentFeedbackService,
        telemetryService: mockTelemetryService,
        courseService: mockCourseService
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en' as any))
    };
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;

    const mockHttp: Partial<HttpClient> = {};
    const mockEvents: Partial<Events> = {};
    const mockFile: Partial<File> = {};
    beforeAll(() => {
        canvasPlayerService = new CanvasPlayerService(
            mockHttp as HttpClient,
            mockEvents as Events,
            mockPreferences as SharedPreferences,
            mockLocalCourseService as LocalCourseService,
            mockCommonUtilService as CommonUtilService,
            mockFile as File
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of canvasPlayerService', () => {
        // assert
        expect(canvasPlayerService).toBeTruthy();
    });

    describe('it should handle readJSON test suites', () => {
        it('should readJSON if path is available', () => {
            // arrange
            mockHttp.get = jest.fn(() => of({ sampleObject: 'sampleObject' }));
            // act
            canvasPlayerService.readJSON('sampleRandomPath');
            // assert
            expect(mockHttp.get).toHaveBeenCalled();
        });

        it('should readJSON if path is available and goes to catch part', () => {
            // arrange
            mockHttp.get = jest.fn(() => Promise.reject('Unable to read JSON'));
            // act
            canvasPlayerService.readJSON('sampleRandomPath');
            // assert
            expect(mockHttp.get).toHaveBeenCalled();
        });

        it('should not get inside if call, if path is undefined', () => {
            // arrange
            mockHttp.get = jest.fn(() => of({ sampleObject: 'sample' }));
            // act
            canvasPlayerService.readJSON('');
            // arrange
            expect(mockHttp.get).not.toHaveBeenCalled();
        });
    });

    describe('it should handle xmlToJSON test suites', () => {
        it('should readJSON if path is available', () => {
            const mockXMLContent = '<root><child><textNode>First &amp; ' +
                'Child</textNode></child><child><textNode>Second Child</textNode>' +
                '</child><testAttrs attr1=\'attr1Value\'/></root>';
            // arrange
            mockFile.readAsText = jest.fn(() => Promise.resolve(mockXMLContent));
            // act
            canvasPlayerService.xmlToJSon(mockXMLContent);
            // assert
            expect(mockFile.readAsText).toHaveBeenCalled();
        });

        it('should readJSON if path is available and goes to catch part', () => {
            // arrange
            mockFile.readAsText = jest.fn(() => Promise.reject('Unable to convert'));
            // act
            canvasPlayerService.xmlToJSon('sampleRandomPath');
            // assert
            expect(mockFile.readAsText).toHaveBeenCalled();
        });

        it('should not get inside if call, if path is undefined', () => {
            // arrange
            mockFile.readAsText = jest.fn(() => Promise.resolve(''));
            // act
            canvasPlayerService.xmlToJSon('');
            // arrange
            expect(mockFile.readAsText).not.toHaveBeenCalled();
        });
    });

    describe('it should handleAction based on the switchCases', () => {
        it('should handle action if method name equals getCurrentUser', () => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getCurrentUser', []);
            // assert
            expect(SunbirdSdk.instance.profileService.getActiveSessionProfile).toHaveBeenCalled();
        });

        it('should handle action if method name equals getAllUserProfile', () => {
            // arrange
            mockProfileService.getAllProfiles = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getAllUserProfile', []);
            // assert
            expect(SunbirdSdk.instance.profileService.getAllProfiles).toHaveBeenCalled();
        });

        it('should handle action if method name equals setUser', () => {
            // arrange
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('setUser', []);
            // assert
            expect(SunbirdSdk.instance.profileService.setActiveSessionForProfile).toHaveBeenCalled();
        });

        it('should handle action if method name equals getContent', () => {
            // arrange
            mockContentService.getContents = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getContent', []);
            // assert
            expect(SunbirdSdk.instance.contentService.getContents).toHaveBeenCalled();
        });

        it('should handle action if method name equals getContentList', () => {
            // arrange
            mockContentService.getContents = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getContentList', []);
            // assert
            expect(SunbirdSdk.instance.contentService.getContents).toHaveBeenCalled();
        });

        it('should handle action if method name equals sendFeedback', () => {
            // arrange
            mockContentFeedbackService.sendFeedback = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('sendFeedback', []);
            // assert
            expect(SunbirdSdk.instance.contentFeedbackService.sendFeedback).toHaveBeenCalled();
        });

        it('should handle action if method name equals to endGenieCanvas', () => {
            // arrange
            mockEvents.publish = jest.fn();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('endGenieCanvas', []);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith('endGenieCanvas', { showConfirmBox: false });
        });

        it('should handle action if method name equals to showExitConfirmPopup', () => {
            // arrange
            mockEvents.publish = jest.fn();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('showExitConfirmPopup', []);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith('endGenieCanvas', { showConfirmBox: true });
        });

        it('should handle action if method name equals send', () => {
            // arrange
            mockTelemetryService.saveTelemetry = jest.fn(() => of());
            // act
            canvasPlayerService.handleAction();
            window.handleAction('send', []);
            // assert
            expect(SunbirdSdk.instance.telemetryService.saveTelemetry).toHaveBeenCalled();
        });

        it('should handle action if method name equals getRelevantContent', () => {
            // arrange
            mockContentService.getRelevantContent = jest.fn(() => of({}));
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getRelevantContent', ['{"sampleKey": "sampleValue"}']);
            // assert
            expect(SunbirdSdk.instance.contentService.getRelevantContent).toHaveBeenCalled();
        });

        it('should handle action if method name equals checkMaxLimit and context is not defined', () => {
            // arrange
            let context;
            //const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            });
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));

            // act
            canvasPlayerService.handleAction();
            window.handleAction('checkMaxLimit', []);
            // assert
        });

        it('should handle action if method name equals checkMaxLimit and context is defined', () => {
            // arrange
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}';
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            });
            mockCourseService.getContentState = jest.fn(() => of({
                "userId": "userid", "courseId": "courseid", "batchId": "batchid", "isCertified": false, "leafNodeIds": ["id1"], "batchStatus": 2
            }));
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({
                isLastAttempt: true,
                isContentDisabled: true,
                currentAttempt: 0,
                maxAttempts: 5
            }));
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));

            // act
            canvasPlayerService.handleAction();
            window.handleAction('checkMaxLimit', []);
            // assert
        });

        it('should handle action if method name equals getRelatedContent', () => {
            // arrange
            jest.spyOn(console, 'log').mockImplementation();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('getRelatedContent', []);
            // assert
            expect(console.log).toHaveBeenCalledWith('getRelatedContent to be defined');
        });

        it('should handle action if method name equals languageSearch', () => {
            // arrange
            jest.spyOn(console, 'log').mockImplementation();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('languageSearch', []);
            // assert
            expect(console.log).toHaveBeenCalledWith('languageSearch to be defined');
        });

        it('should handle action if method name equals endContent', () => {
            // arrange
            jest.spyOn(console, 'log').mockImplementation();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('endContent', []);
            // assert
            expect(console.log).toHaveBeenCalledWith('endContent to be defined');
        });
        it('should handle action if method name equals launchContent', () => {
            // arrange
            jest.spyOn(console, 'log').mockImplementation();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('launchContent', []);
            // assert
            expect(console.log).toHaveBeenCalledWith('launchContent to be defined');
        });

        it('should handle action if method name equals default', () => {
            // arrange
            jest.spyOn(console, 'log').mockImplementation();
            // act
            canvasPlayerService.handleAction();
            window.handleAction('anything');
            // assert
            expect(console.log).toHaveBeenCalledWith('Please use valid method');
        });
    });
});
