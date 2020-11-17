import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform, Events, AlertController, PopoverController } from '@ionic/angular';
import { CourseService, SunbirdSdk, TelemetryService } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { CommonUtilService } from '@app/services/common-util.service';
import { FormAndFrameworkUtilService, PageId } from '@app/services';
import { Location } from '@angular/common';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Observable, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';





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
        // getPdfPlayerConfiguration: jest.fn(() => Promise.resolve({}))
    };
    const mockDownloadPdfService: Partial<DownloadPdfService> = {};
    const mockFileOpener: Partial<FileOpener> = {};
    const mockTransfer: Partial<FileTransfer> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
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
            mockDownloadPdfService as DownloadPdfService,
            mockFileOpener as FileOpener,
            mockTransfer as FileTransfer,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be data instance of player page', () => {
        expect(playerPage).toBeTruthy();
    });

    describe('ngOninit', () => {
        it('should call getPdfPlayerConfiguration', (done) => {
            const subscribeFn = jest.fn(() => { }) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.config = {
                context: {
                    dispatcher: {
                        // dispatch: jest.fn()
                    },
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                },
                metadata: {
                    mimeType: 'application/pdf'
                }
            };
            jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                telemetryService: {
                    saveTelemetry(request: string): Observable<boolean> {
                        // for success
                        return of(true);
                        // for error
                        return throwError(new Error('sample_error'));
                    }
                } as Partial<TelemetryService> as TelemetryService
            } as Partial<SunbirdSdk> as SunbirdSdk);
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry(request: string): Observable<boolean> {
                            done();
                            return of(true);
                        }
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch();
            });
            setTimeout(() => {
                expect(mockFormAndFrameworkUtilService.getPdfPlayerConfiguration).toHaveBeenCalled();
                expect(playerPage.loadPdfPlayer).toBe(true);
                done();
            }, 0);
        });
        it('should check mimetype and load pdf player', (done) => {
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.playerConfig = true;
            const subscribeFn = jest.fn(() => { }) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            playerPage.config = {
                context: {
                    dispatcher: {
                        // dispatch: jest.fn()
                    },
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                },
                metadata: {
                    mimeType: 'application/pdf'
                }
            };
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry : jest.fn((request: string) => {
                            return of(true).pipe(
                                finalize(() => {
                                    expect(SunbirdSdk.instance.telemetryService.saveTelemetry).toHaveBeenCalledWith('{}');
                                    done();

                                })
                            );
                        })
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });
    });


});
