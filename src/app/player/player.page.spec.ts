import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform, Events, AlertController, PopoverController } from '@ionic/angular';
import { CourseService } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { CommonUtilService } from '@app/services/common-util.service';
import { FormAndFrameworkUtilService, PageId } from '@app/services';
import { Location } from '@angular/common';





describe('PlayerPage', () => {
    let playerPage: PlayerPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockCanvasPlayerService: Partial<CanvasPlayerService> = {
        handleAction: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockScreenOrientation: Partial<ScreenOrientation> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockStatusBar: Partial<StatusBar> = {};
    const mockEvents: Partial<Events> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRoute: Partial<ActivatedRoute> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    contentToPlay: { identifier: '123456' },
                    config: {
                        metadata: {
                            mimeType: 'application/pdf'
                        }
                    },
                    course: {},
                    navigateBackToContentDetails: {},
                    corRelation: {},
                    isCourse: true,
                    childContent: true
                }
            }
        })) as any
    };
    const mockLocation: Partial<Location> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        // invokePdfPlayerConfiguration: jest.fn(() => Promise.resolve({}))
    };
    const mockDownloadPdfService: Partial<DownloadPdfService> = {};
    beforeAll(() => {
        playerPage = new PlayerPage(
            mockCourseService as CourseService,
            mockCanvasPlayerService as CanvasPlayerService,
            mockPlatform as Platform,
            mockScreenOrientation as ScreenOrientation,
            mockAppGlobalService as AppGlobalService,
            mockStatusBar as StatusBar,
            mockEvents as Events,
            mockAlertCtrl as AlertController,
            mockCommonUtilService as CommonUtilService,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockPopoverCtrl as PopoverController,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockDownloadPdfService as DownloadPdfService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be data instance of player page', () => {
        expect(playerPage).toBeTruthy();
    });

    describe('initializePdfPlayerConfiguration', () => {
        it('should call form api for configuration', (done) => {
            mockAppGlobalService.getPdfPlayerConfiguration = jest.fn(() => undefined) as any;
            playerPage.playerConfig = undefined;
            mockFormAndFrameworkUtilService.invokePdfPlayerConfiguration = jest.fn(() =>
                Promise.resolve([])
            );
            playerPage.initializePdfPlayerConfiguration();
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.invokePdfPlayerConfiguration).toHaveBeenCalled();
                expect(playerPage.playerConfig).toStrictEqual([]);
                done();
            }, 0);
        });

        it('should get pdf player config from app global service', (done) => {
            mockAppGlobalService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({})) as any;
            playerPage.initializePdfPlayerConfiguration();
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    describe('ngOninit', () => {
        it('should check mimetype and load pdf player', (done) => {
            playerPage.playerConfig = true;
            const subscribeFn = jest.fn(() => { }) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            jest.spyOn(playerPage, 'initializePdfPlayerConfiguration').mockImplementation(() => {
                return Promise.resolve();
            });
            playerPage.ngOnInit();
            setTimeout(() => {
                expect(playerPage.playerConfig).toBeTruthy();
                expect(mockPlatform.pause).toBeTruthy();
                expect(subscribeFn).toHaveBeenCalled();
                done();
            }, 0);
        });
    });


});
