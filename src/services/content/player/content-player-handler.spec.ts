import { ContentPlayerHandler } from '../../../services/content/player/content-player-handler';
import {TelemetryGeneratorService, CommonUtilService, AppHeaderService, UtilityService} from '../../../services';
import { PlayerService, CourseService } from '@project-sunbird/sunbird-sdk';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { CanvasPlayerService } from '../../canvas-player.service';
import { Router } from '@angular/router';
import { of, identity } from 'rxjs';
import { mockPlayerConfigData, mockContent } from './content.player-handler.spec.data';
import { ContentInfo } from '../content-info';
import { ContentUtil } from '../../../util/content-util';

describe('ContentPlayerHandler', () => {
    let contentPlayerHandler: ContentPlayerHandler;
    const mockPlayerService: Partial<PlayerService> = {
        getPlayerConfig: jest.fn(() => of(mockPlayerConfigData))
    };
    const mockCourseService: Partial<CourseService> = {
        generateAssessmentAttemptId: jest.fn(() => '')
    };
    const mockCanvasPlayerService: Partial<CanvasPlayerService> = {
        xmlToJSon: jest.fn(() => Promise.resolve({})),
        readJSON: jest.fn(() => Promise.resolve({}))
    };
    const mockFile: Partial<File> = {
        checkFile: jest.fn(() => Promise.resolve(true)),
        readAsText: jest.fn(() => Promise.resolve(""))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn(() => '')
    };
    const mockCourse = {
        userId: '0123456789',
        identifier: 'do_1234',
        batchId: 'sample_batch_id'
    } as any;

    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    window.console.error = jest.fn()

    beforeAll(() => {
        contentPlayerHandler = new ContentPlayerHandler(
            mockPlayerService as PlayerService,
            mockCourseService as CourseService,
            mockCanvasPlayerService as CanvasPlayerService,
            mockFile as File,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRouter as Router,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService,
            mockUtilityService as UtilityService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ContentPlayerHandler', () => {
        expect(contentPlayerHandler).toBeTruthy();
    });

    it('should set lastPlayed contentId', () => {
        // arrange
        // act
        contentPlayerHandler.setLastPlayedContentId('do_1234');
        // assert
        expect(contentPlayerHandler.getLastPlayedContentId()).toEqual('do_1234');
    });

    it('should set content Played status', () => {
        // arrange
        // act
        contentPlayerHandler.setContentPlayerLaunchStatus(true);
        // assert
        expect(contentPlayerHandler.isContentPlayerLaunched()).toBeTruthy();
    });

    describe('launchContentPlayer()', () => {
        it('should check compatibilityLevel and check for immediate update', () => {
            // arrange
            const mockContent = {identifier :  'do_212936404296335360119' ,
                contentData : {
                    ownershipType : [
                        'createdBy'
                    ],
                    totalQuestions: 10,
                    mimeType : 'application/vnd.sunbird.questionset',
                    gradeLevel : [
                        'Class 9' ,
                        'Class 10 '
                    ],
                    version : 2,
                    streamingUrl : ' https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_212936404296335360119-latest' ,
                    medium : [
                        'English' ,
                        'Hindi'
                    ],
                    resourceType :  'Teach',
                    compatibilityLevel: '7'
                },
                    isUpdateAvailable : false,
                    mimeType :  'application/vnd.ekstep.ecml-archive' ,
                    basePath :  '/_app_file_' ,
                    contentType :  'resource' ,
                    isAvailableLocally : false,
                    rollup : {
                    l1 :  'do_212936404296335360119'
                }
            }
            cordova.plugins = {
                InAppUpdateManager: {
                    checkForImmediateUpdate: jest.fn((fn, fn1) => {
                        fn(),
                        fn1()
                    })
                }
            }
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));

            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse ,
                correlationList: [{id: '123456789', type: 'API' }]} as ContentInfo, true).then(() => {
            });
            // assert
        });
        
        it('should disbale the user switcher if content is being played from course', () => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));

            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse ,
                correlationList: [{id: '123456789', type: 'API' }]} as ContentInfo, true).then(() => {
                const navigateMock = jest.spyOn(mockRouter, 'navigate');
                expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['enableUserSwitcher']).toEqual(false);
                expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['showUser']).toEqual(false);
            });
            // assert
        });

        it('should enable the user switcher if content is not being played from course', () => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse } as any, false).then(() => {
                // assert
                const navigateMock = jest.spyOn(mockRouter, 'navigate');
                expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['enableUserSwitcher']).toEqual(true);
            });
        });

        it('should launch the content player if is Streaming false', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('4'));
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, false, true, { course: mockCourse } as any, false);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['player'],
                { state: { config: mockPlayerConfigData, course: mockCourse, isCourse: false } });
                done();
            }, 0);
        });

        it('should not launch the content player if is Streaming false and xmlToJSon() method fails', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));

            mockCanvasPlayerService.xmlToJSon = jest.fn(() => Promise.reject());
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, false, true, { course: mockCourse } as any, false);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).not.toHaveBeenCalledWith(['player'],
                { state: { config: mockPlayerConfigData, course: mockCourse, isCourse: false } });
                done();
            }, 0);
        });

        it('should launch the content player if is Streaming false and index.ecml is not available', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            // mockPlayerConfigData.metadata.mimeType = 'video/mp4';
            mockFile.checkFile = jest.fn(() => Promise.reject());
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, false, true, { course: mockCourse } as any, false);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['player'],
                { state: { config: mockPlayerConfigData, course: mockCourse, isCourse: false } });
                done();
            }, 0);
        });

        it('should not launch the content player if is Streaming false and index.ecml is not available and readJSON() fails', (done) => {
            // arrange
            mockFile.checkFile = jest.fn(() => Promise.reject());
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            mockCanvasPlayerService.readJSON = jest.fn(() => Promise.reject());
            mockFile.readAsText = jest.fn(() => Promise.reject());
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, false, true, { course: mockCourse } as any, false);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).not.toHaveBeenCalledWith(['player'],
                { state: { config: mockPlayerConfigData, course: mockCourse, isCourse: false } });
                done();
            }, 0);
        });

        it('should launch the content player if mimeType is not ecml', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            mockPlayerConfigData.metadata.mimeType = 'x-youtube';
            mockPlayerService.getPlayerConfig = jest.fn(() => of(mockPlayerConfigData));
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, false, true, { course: mockCourse } as any, false);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['player'],
                { state: {  contentToPlay : mockContent, config: mockPlayerConfigData, course: mockCourse, isCourse: false } });
                done();
            }, 0);
        });

        it('should launch the content player for mimetype video/mp4', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            mockPlayerConfigData.metadata.mimeType = 'video/mp4';
            mockPlayerService.getPlayerConfig = jest.fn(() => of(mockPlayerConfigData));
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, {course: {courseId: 'do_1234'}} as any, true, true, false, { isLastAttempt: true, isContentDisabled: false, currentAttempt: 2, maxAttempts: 5 }, jest.fn()).then(() => {
            });
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should launch the content player for mimetype video/webm', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            mockPlayerConfigData.metadata.mimeType = 'video/webm';
            mockPlayerService.getPlayerConfig = jest.fn(() => of(mockPlayerConfigData));
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, {course: {courseId: 'do_1234'}} as any, true, true, false, { isLastAttempt: true, isContentDisabled: false, currentAttempt: 2, maxAttempts: 5 },  jest.fn()).then(() => {
            });
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should disbale the user switcher if content is being played from course', () => {
            // arrange
            const mockContent = {identifier :  'do_212936404296335360119' ,
                contentData : {
                    ownershipType : [
                        'createdBy'
                    ],
                    mimeType : 'application/vnd.sunbird.questionset',
                    gradeLevel : [
                        'Class 9' ,
                        'Class 10 '
                    ],
                    version : 2,
                    streamingUrl : ' https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/ecml/do_212936404296335360119-latest' ,
                    medium : [
                        'English' ,
                        'Hindi'
                    ],
                    resourceType :  'Teach',
                },
                    isUpdateAvailable : false,
                    mimeType :  'application/vnd.sunbird.questionset' ,
                    basePath :  '/_app_file_' ,
                    contentType :  'resource' ,
                    isAvailableLocally : false,
                    rollup : {
                    l1 :  'do_212936404296335360119'
                }
            }
            const mockPlayerConfigData = {
                metadata : mockContent,
                config : {
                  showEndPage : false,
                  endPage : [
                   {
                      template :  'assessment' ,
                      contentType : [
                        'SelfAssess'
                     ]
                   }
                 ],
                  splash : {
                    webLink : ''  ,
                    text : ''  ,
                    icon : ''  ,
                    bgImage : ' assets/icons/splacebackground_1.png'
                 },
                  overlay : {
                    enableUserSwitcher : true,
                    showUser : false
                 },
                  plugins : [
                   {
                      id :  'org.sunbird.player.endpage' ,
                      ver :  '1.1' ,
                      type :  'plugin'
                   }
                 ]
               },
                context : {
                  did :  'ef37fc07aee31d87b386a408e0e4651e00486618' ,
                  origin :  'https://staging.ntp.net.in' ,
                  pdata : {
                    id :  'staging.sunbird.app' ,
                    pid :  'sunbird.app' ,
                    ver :  '2.7.197staging-debug'
                 },
                  objectRollup : {
                    l1 :  'do_212936404296335360119'
                 },
                  sid :  'e33e1b95-e6e5-400f-b438-35df4b65ee73' ,
                  actor : {
                    type :  'User' ,
                    id :  '7ebe9375-425e-4325-ba39-eac799871ed4'
                 },
                  deeplinkBasePath : ''   ,
                  cdata : [
                   {
                      id : ' 29c9c790-3845-11ea-8647-8b09062a2e3d' ,
                      type :  'API'
                   }
                 ],
                  channel :  '505c7c48ac6dc1edc9b08f21db5a571d'
               },
                appContext : {
                  local : true,
                  server : false,
                  groupId : ''
               },
                data : {},
                uid :  '7ebe9375-425e-4325-ba39-eac799871ed4'
            }
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('5'));
            mockPlayerService.getPlayerConfig = jest.fn(() => of(mockPlayerConfigData));

            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, {course: {courseId: 'do_1234'}} as any, true, true, false, { isLastAttempt: true, isContentDisabled: false, currentAttempt: 2, maxAttempts: 5 }).then(() => {
            });
            // assert
        });
    });

    describe('playContent', () => {
        it('should play the content from the Streaming url if the url is present and user is online ', () => {
            // arrange
            const content = {
                identifier: 'identifier',
                hierarchyInfo: [{ identifier: 'identifier1' }, { identifier: 'identifier1' }],
                contentType: 'contentType',
                pkgVersion: 'pkgVersion',
                contentData: {
                    streamingUrl: 'streamingUrl'
                },
                mimeType: ''
            };
            const navExtras = {};
            const telemetryDetails = {
                pageId: 'id',
                corRelationList: []
            };
            mockAppHeaderService.hideHeader = jest.fn();
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnThis();
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            contentPlayerHandler.launchContentPlayer = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true);

            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
            }, 0);
        });

        it('should play the content from the local, if the user is offline and content locally available', () => {
            // arrange
            const content = {
                identifier: 'identifier',
                hierarchyInfo: [{ identifier: 'identifier1' }, { identifier: 'identifier1' }],
                contentType: 'contentType',
                pkgVersion: 'pkgVersion',
                contentData: {
                    streamingUrl: 'streamingUrl'
                },
                mimeType: '',
                isAvailableLocally: true
            };
            const navExtras = {};
            const telemetryDetails = {
                pageId: 'id',
                corRelationList: []
            };
            mockAppHeaderService.hideHeader = jest.fn();
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnThis();
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            contentPlayerHandler.launchContentPlayer = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true);

            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
            }, 0);
        });

        it('should play the content from the local, if the user is online and content locally available', () => {
            // arrange
            const content = {
                identifier: 'identifier',
                hierarchyInfo: [{ identifier: 'identifier1' }, { identifier: 'identifier1' }],
                contentType: 'contentType',
                pkgVersion: 'pkgVersion',
                contentData: {
                },
                mimeType: '',
                isAvailableLocally: true
            };
            const navExtras = {};
            const telemetryDetails = {
                pageId: 'id',
                corRelationList: []
            };
            mockAppHeaderService.hideHeader = jest.fn();
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnValue(undefined);
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            contentPlayerHandler.launchContentPlayer = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true);

            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
            }, 0);
        });

        it('should navigate to content details page if the above conditions fail', () => {
            // arrange
            const content = {
                identifier: 'identifier',
                hierarchyInfo: [{ identifier: 'identifier1' }, { identifier: 'identifier1' }],
                contentType: 'contentType',
                pkgVersion: 'pkgVersion',
                contentData: {
                },
                mimeType: '',
                isAvailableLocally: false
            };
            const navExtras = {};
            const telemetryDetails = {
                pageId: 'id',
                corRelationList: []
            };
            mockAppHeaderService.hideHeader = jest.fn();
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnThis();
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true, false, false);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should navigate to content details page if the above conditions fail', () => {
            // arrange
            const content = {
                identifier: 'identifier',
                hierarchyInfo: [{ identifier: 'identifier1' }, { identifier: 'identifier1' }],
                contentType: 'contentType',
                pkgVersion: 'pkgVersion',
                contentData: {
                },
                mimeType: '',
                isAvailableLocally: false
            };
            const navExtras = { state: { course: {} } };
            const telemetryDetails = {
                pageId: 'id',
                corRelationList: []
            };
            mockAppHeaderService.hideHeader = jest.fn();
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnThis();
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true, false, false);

            // assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });
});
