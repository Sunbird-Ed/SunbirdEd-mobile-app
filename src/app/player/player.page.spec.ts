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
import { RouterLinks, ShareItemType } from '../app.constant';



declare const cordova;

describe('PlayerPage', () => {
    let playerPage: PlayerPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockCanvasPlayerService: Partial<CanvasPlayerService> = {
        handleAction: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockScreenOrientation: Partial<ScreenOrientation> = {
        unlock: jest.fn()

    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockStatusBar: Partial<StatusBar> = {};
    const mockEvents: Partial<Events> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
    };
    const mockRoute: Partial<ActivatedRoute> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    contentToPlay: {
                        identifier: '123456',
                        contentData: {
                            downloadUrl: 'https://'
                        }
                    },
                    config: {
                        metadata: {
                            mimeType: 'application/pdf',
                            contentData: {
                                downloadUrl: '12345'
                            }
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
    const mockPopoverCtrl: Partial<PopoverController> = {

    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        // getPdfPlayerConfiguration: jest.fn(() => Promise.resolve({}))
    };
    const mockDownloadPdfService: Partial<DownloadPdfService> = {
        // downloadPdf: jest.fn(() => Promise.resolve({}))
    };
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

    describe('ionviewWillEnter', () => {
        it('should initialize the backbutton', (done) => {
            playerPage.loadPdfPlayer = true;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
                return Promise.resolve();
            });
            mockLocation.back = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                expect(playerPage.loadPdfPlayer).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(mockAlertCtrl.getTop).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalledWith();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });

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
                    objectRollup: {
                        l1: 'li'
                    },
                    dispatcher: {
                        dispatch: jest.fn()
                    },
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                },
                metadata: {
                    identifier: 'identifier',
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }

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
                    },
                    objectRollup: {
                        l1: 'li'
                    }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry: jest.fn((request: string) => {
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
    describe('pdfPlayerEvents', () => {
        it('should exit the player', (done) => {
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(playerPage.loadPdfPlayer).toBe(false);
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 50);
        });
        it('should call the download service to download the pdf', (done) => {
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: {
                        type: 'DOWNLOAD'
                    }
                }
            };

            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.resolve());
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
                // expect(CommonUtilService.showToast).toHaveBeenCalledWith('PDF_DOWNLOADED');
                done();
            }, 100);

        });
        it('should call the download service to download the pdf for catch part', (done) => {
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: {
                        type: 'DOWNLOAD'
                    }
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                    reason: 'device-permission-denied'
            }));
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
                // expect(CommonUtilService.showToast).toHaveBeenCalledWith('DEVICE_NEEDS_PERMISSION');
                done();
            }, 0);

        });
        it('should call the download service to download the pdf for catch part(user-permission-denied)', (done) => {
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: {
                        type: 'DOWNLOAD'
                    }
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                    reason: 'user-permission-denied'
            }));
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
                // expect(CommonUtilService.showToast).toHaveBeenCalledWith('DEVICE_NEEDS_PERMISSION');
                done();
            }, 0);

        });
        it('should call the download service to download the pdf for catch part(download-failed)', (done) => {
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: {
                        type: 'DOWNLOAD'
                    }
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                    reason: 'download-failed'
            }));
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
                // expect(CommonUtilService.showToast).toHaveBeenCalledWith('DEVICE_NEEDS_PERMISSION');
                done();
            }, 0);

        });
        it('should handle the share event', (done) => {
            const event = {
                edata: {
                        type: 'SHARE'
                }
            };
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({}))
            } as any)));
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            },50);

        });
        it('should handle the content compatibility error', (done) => {
            const event = {
                edata: {
                    type: 'compatibility-error'
                }
            };
            global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate = jest.fn(() => {});
            playerPage.pdfPlayerEvents(event);
            setTimeout(() => {
                expect(global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate).toHaveBeenCalled();
                done();
            }, 50);
        });
    });
});
