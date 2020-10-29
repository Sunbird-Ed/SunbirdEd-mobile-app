import { ContentPlayerHandler } from '../../../services/content/player/content-player-handler';
import { TelemetryGeneratorService, CommonUtilService, AppHeaderService } from '../../../services';
import { PlayerService, CourseService } from 'sunbird-sdk';
import { File } from '@ionic-native/file/ngx';
import { CanvasPlayerService } from '../../canvas-player.service';
import { Router } from '@angular/router';
import { of, identity } from 'rxjs';
import { mockPlayerConfigData, mockContent } from './content.player-handler.spec.data';
import { ContentInfo } from '../content-info';
import { ContentUtil } from '@app/util/content-util';

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
        checkFile: jest.fn(() => Promise.resolve(true))
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

    beforeAll(() => {
        contentPlayerHandler = new ContentPlayerHandler(
            mockPlayerService as PlayerService,
            mockCourseService as CourseService,
            mockCanvasPlayerService as CanvasPlayerService,
            mockFile as File,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRouter as Router,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService
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
        it('should navigate to PlayerPage to launch Content  if isStreaming false', () => {
            // arrange
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse } as any, true);
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(['player'],
                { state: { config: mockPlayerConfigData, course: mockCourse, isCourse: true } });
        });

        it('should disbale the user switcher if content is being played from course', () => {
            // arrange
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse , 
                correlationList: [{id: '123456789', type: 'API' }]} as ContentInfo, true);
            // assert
            const navigateMock = jest.spyOn(mockRouter, 'navigate');
            expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['enableUserSwitcher']).toEqual(false);
            expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['showUser']).toEqual(false);
        });

        it('should enable the user switcher if content is not being played from course', () => {
            // arrange
            // act
            contentPlayerHandler.launchContentPlayer(mockContent, true, true, { course: mockCourse } as any, false);
            // assert
            const navigateMock = jest.spyOn(mockRouter, 'navigate');
            expect(navigateMock.mock.calls[0][1]['state']['config']['config']['overlay']['enableUserSwitcher']).toEqual(true);
        });

        it('should launch the content player if is Streaming false', (done) => {
            // arrange
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
            mockCanvasPlayerService.readJSON = jest.fn(() => Promise.reject());
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
            expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
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
            expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
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
            jest.spyOn(ContentUtil, 'getTelemetryObject').mockReturnThis();
            jest.spyOn(ContentUtil, 'generateRollUp').mockReturnThis();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            contentPlayerHandler.launchContentPlayer = jest.fn();
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };

            // act
            contentPlayerHandler.playContent(content, navExtras, telemetryDetails, true);

            // assert
            expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(contentPlayerHandler.launchContentPlayer).toHaveBeenCalled();
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
