import { ContentPlayerHandler } from '../../../services/content/player/content-player-handler';
import { TelemetryGeneratorService, CommonUtilService } from '../../../services';
import { PlayerService, CourseService } from 'sunbird-sdk';
import { File } from '@ionic-native/file/ngx';
import { CanvasPlayerService } from '../../canvas-player.service';
import { Router } from '@angular/router';
import { of, identity } from 'rxjs';
import { mockPlayerConfigData, mockContent } from './content.player-handler.spec.data';
import { ContentInfo } from '../content-info';

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


    beforeAll(() => {
        contentPlayerHandler = new ContentPlayerHandler(
            mockPlayerService as PlayerService,
            mockCourseService as CourseService,
            mockCanvasPlayerService as CanvasPlayerService,
            mockFile as File,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockRouter as Router,
            mockCommonUtilService as CommonUtilService
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
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
                { state: { config: mockPlayerConfigData, course: mockCourse } });
                done();
            }, 0);
        });
    });

});
