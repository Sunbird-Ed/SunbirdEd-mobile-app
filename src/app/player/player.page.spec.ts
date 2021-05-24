import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { Events } from '@app/util/events';
import { CourseService, ProfileService, SunbirdSdk, TelemetryService , ContentService } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { FormAndFrameworkUtilService, PageId } from '@app/services';
import { Location } from '@angular/common';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Observable, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventTopics, ExploreConstants, RouterLinks, ShareItemType } from '../app.constant';
import { PrintPdfService } from '@app/services/print-pdf/print-pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { IterableDiffers } from '@angular/core';



declare const cordova;

describe('PlayerPage', () => {
    let playerPage: PlayerPage;
    const mockAlertCtrl: Partial<AlertController> = {
        
    };
    const mockCourseService: Partial<CourseService> = {};
    const mockCanvasPlayerService: Partial<CanvasPlayerService> = {
        handleAction: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockScreenOrientation: Partial<ScreenOrientation> = {
        unlock: jest.fn(),
        ORIENTATIONS: {
            LANDSCAPE: 'LANDSCAPE' } as any,
        lock: jest.fn(() => Promise.resolve([]))

    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockStatusBar: Partial<StatusBar> = {};
    const mockEvents: Partial<Events> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn()
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
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
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
    const mockprintPdfService: Partial<PrintPdfService> = {};
    const mockContentService: Partial<ContentService> = {};

    const mockprofileService: Partial<ProfileService> = {};
    beforeAll(() => {
        playerPage = new PlayerPage(
            mockCourseService as CourseService,
            mockprofileService as ProfileService,
            mockContentService as ContentService,
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
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockprintPdfService as PrintPdfService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be data instance of player page', () => {
        expect(playerPage).toBeTruthy();
    });

    describe('showConfirm' , () => {
        
        it('should be called when player type is not sunbird old player', (done) =>{
            playerPage.playerType = 'sunbird-pdf-player';
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn()
            })) as any;
            playerPage.showConfirm();
            setTimeout(() =>{
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'CONFIRM');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTENT_PLAYER_EXIT_PERMISSION');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'CANCEL');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'OKAY');
            done()
            }, 0)
        })

        it('should be called when player type is  sunbird old player', (done) =>{
            playerPage.playerType = 'sunbird-old-player';
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn()
            })) as any;
            playerPage.previewElement= {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI : {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService:{
                           interact: jest.fn()
                        },
                        Renderer : {
                            running: true
                        }
                    }
                }
            }
            playerPage.showConfirm();
            setTimeout(() =>{
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'CONFIRM');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTENT_PLAYER_EXIT_PERMISSION');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'CANCEL');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'OKAY');
            done()
            }, 0)
        })
    })

    describe('ionviewWillEnter', () => {
        it('should initialize the backbutton', (done) => {
            playerPage.playerType = 'sunbird-old-player';
            playerPage.previewElement = {
                nativeElement: {
                    src: '12346'
                }
            }
            playerPage.config = {
                context: {
                    actor: {
                        id: '123456'
                    }
                },
                metadata: {
                  basePath: 'basePath'
                }
            }
            // playerPage.loadPdfPlayer = true;
            mockStatusBar.hide = jest.fn();
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
                return Promise.resolve();
            });
            // mockLocation.back = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                // expect(playerPage.loadPdfPlayer).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(mockAlertCtrl.getTop).toHaveBeenCalled();
                // expect(mockLocation.back).toHaveBeenCalledWith();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    it('should initialize back button when mimetype is questionset', (done) => {
        playerPage.previewElement = {
            nativeElement: {
                src: '12346'
            }
        }
        playerPage.config = {
            context: {
                actor: {
                    id: '123456'
                }
            },
            metadata: {
              basePath: 'basePath',
              mimeType: 'application/vnd.sunbird.questionset'
            }
        }
        playerPage.playerType = 'sunbird-quml-player'
        mockStatusBar.hide = jest.fn();
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn()),
        } as any;
        mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
        jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
            return Promise.resolve();
        });
        // mockLocation.back = jest.fn();
        mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
        playerPage.ionViewWillEnter();
        setTimeout(() => {
            // expect(playerPage.loadPdfPlayer).toBeTruthy();
            expect(mockPlatform.backButton).toBeTruthy();
            expect(mockAlertCtrl.getTop).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(playerPage.showConfirm).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should initialize back button when mimetype is not questionset', (done) => {
        playerPage.previewElement = {
            nativeElement: {
                src: '12346'
            }
        }
        playerPage.config = {
            context: {
                actor: {
                    id: '123456'
                }
            },
            metadata: {
              basePath: 'basePath',
              mimeType: 'application'
            }
        }
        playerPage.playerType = 'sunbird-pdf-player'
        // playerPage.loadPdfPlayer = true;
        mockStatusBar.hide = jest.fn();
        mockPlatform.backButton = {
            subscribeWithPriority: jest.fn((_, fn) => fn()),
        } as any;
        mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
        jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
            return Promise.resolve();
        });
        // mockLocation.back = jest.fn();
        mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
        playerPage.ionViewWillEnter();
        setTimeout(() => {
            // expect(playerPage.loadPdfPlayer).toBeTruthy();
            expect(mockPlatform.backButton).toBeTruthy();
            expect(mockAlertCtrl.getTop).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });


    it('should return new  player config', (done) => {
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
                },
                actor: {id: 'sample'}
            },
            metadata: {
                identifier: 'identifier',
                mimeType: 'application/pdf',
                isAvailableLocally: true,
                basePath: 'basePath',
                contentData: {
                    isAvailableLocally: true,
                    basePath: 'basePath',
                    streamingUrl: 'streamingurl'
                }
            }

        }
        mockprofileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile: {
                firstName: 'firstName',
                lastName: 'lastname'
            }
        })) as any;
        playerPage.getNewPlayerConfiguration();
        setTimeout(() => {
            expect(mockprofileService.getActiveSessionProfile).toBeCalled();
            done();
        }, 0)
        //  expect(playerPage.getNewPlayerConfiguration()).toHaveBeenCalled();
    })

    it('should call the get question read api for instructions', (done) =>{
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
                isAvailableLocally: true,
                basePath: 'basePath',
                instructions: 'int',
                contentData: {
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    basePath: 'basePath',
                    streamingUrl: 'streamingurl'
                }
            }
        }

        mockprofileService.getActiveSessionProfile = jest.fn(() => of({
            serverProfile:{
                firstName: 'firstName', 
                lastName: 'lastname'
            }
        })) as any;

        mockContentService.getQuestionSetRead = jest.fn(() => of(
            {
                questionset: {
                    instructions:{
                        default: 'sample instructions'
                    }
                }
            }
        )) as any;
        playerPage.getNewPlayerConfiguration();
        setTimeout(() =>{
        expect(mockContentService.getQuestionSetRead).toHaveBeenCalled();
         done()
        } , 0)
    });

    it('should check if new player is enabled', () => {
        const config = {
            fields: [
                {
                    "name": "pdfPlayer",
                    "code": "pdf",
                    "values": [
                        {
                            "isEnabled": true
                        }
                    ]
                },
                {
                    "name": "epubPlayer",
                    "code": "epub",
                    "values": [
                        {
                            "isEnabled": true
                        }
                    ]
                }
            ]
        }
        playerPage.checkIsPlayerEnabled(config, 'pdfPlayer');
    })
    it('should return a content', (done)=> {
       mockContentService.nextContent = jest.fn(()=> of({
        
            identifier: 'identifier',
            mimeType: 'application/pdf',
            isAvailableLocally: true,
            contentData: {
                isAvailableLocally: true,
                basePath: 'basePath',
                streamingUrl: 'streamingurl'
            }   
       })) as any;
       playerPage.getNextContent({} , '1234')
       setTimeout(() =>{
           expect(mockContentService.nextContent).toHaveBeenCalled();
           done();
       }, 0)
    })

    it('should player next content' , () => {
        playerPage.nextContentToBePlayed = {
            identifier: 'identifier',
            mimeType: 'application/pdf',
            isAvailableLocally: true,
            contentData: {
                isAvailableLocally: true,
                basePath: 'basePath',
                streamingUrl: 'streamingurl'
            } 
        }
        mockEvents.publish = jest.fn(()=> []);
        mockLocation.back = jest.fn();
        playerPage.playNextContent();
        expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT , {
            content: playerPage.nextContentToBePlayed,
            course : {}
        });
        expect(mockLocation.back).toHaveBeenCalled();
    })
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
            jest.spyOn(playerPage, 'checkIsPlayerEnabled').mockImplementation(() => {
                return {
                    name: 'pdfPlayer'
                }
            })
            jest.spyOn(playerPage, 'getNewPlayerConfiguration').mockImplementation(() => {

                return Promise.resolve(playerPage.config);

            })
            jest.spyOn(playerPage , 'getNextContent').mockImplementation(() => {
                
                return Promise.resolve({contentId: 'sample content id',
                 identifier: 'sampleid', name: 'sample name'});

            })
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
                // expect(mockFormAndFrameworkUtilService.getPdfPlayerConfiguration).toHaveBeenCalled();
                expect(playerPage.loadPdfPlayer).toBeFalsy();
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
            jest.spyOn(playerPage, 'checkIsPlayerEnabled').mockImplementation(() => {
                return {
                    name: 'pdfPlayer'
                }
            })
            jest.spyOn(playerPage, 'getNewPlayerConfiguration').mockImplementation(() => {
                return Promise.resolve(playerPage.config);
            });
            jest.spyOn(playerPage , 'getNextContent').mockImplementation(() => {
                
                return Promise.resolve({contentId: 'sample content id',
                 identifier: 'sampleid', name: 'sample name'});

            })
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry: jest.fn((request: string) => {
                            return of(true).pipe(
                                finalize(() => {
                                    done();

                                })
                            );
                        })
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });


        it('should check mimetype and load video player', (done) => {
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
                config: {
                    sideMenu: {
                        showDownload: false,
                        showPrint: false,
                        showReplay: false,
                        showExit: true,
                        showShare: true
                     }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'video/mp4',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            jest.spyOn(playerPage , 'checkIsPlayerEnabled').mockImplementation(() => {
                return {
                    name: 'videoPlayer'
                }
            })
            jest.spyOn(playerPage , 'getNewPlayerConfiguration').mockImplementation(() => {
                return Promise.resolve(playerPage.config);
            });
            jest.spyOn(playerPage , 'getNextContent').mockImplementation(() => {
                
                return Promise.resolve({contentId: 'sample content id',
                 identifier: 'sampleid', name: 'sample name'});

            })
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry: jest.fn((request: string) => {
                            return of(true).pipe(
                                finalize(() => {
                                    done();

                                })
                            );
                        })
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load quml player', (done) => {
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
                config: {
                    sideMenu: {
                        showDownload: false,
                        showPrint: false,
                        showReplay: false,
                        showExit: true,
                        showShare: true
                     }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            jest.spyOn(playerPage , 'checkIsPlayerEnabled').mockImplementation(() => {
                return {
                    name: 'qumlPlayer'
                }
            })
            jest.spyOn(playerPage , 'getNextContent').mockImplementation(() => {
                
                return Promise.resolve({contentId: 'sample content id',
                 identifier: 'sampleid', name: 'sample name'});

            })
            jest.spyOn(playerPage , 'getNewPlayerConfiguration').mockImplementation(() => {
                return Promise.resolve(playerPage.config);
            });
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry: jest.fn((request: string) => {
                            return of(true).pipe(
                                finalize(() => {
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
            playerPage.config = {
                metadata: {
                    mimeType: 'pdf-player'
                }
            }
            playerPage.playerEvents(event);

            setTimeout(() => {
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should call show confirm, when player is qunl' , () =>{
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };

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
                config: {
                    sideMenu: {
                        showDownload: false,
                        showPrint: false,
                        showReplay: false,
                        showExit: true,
                        showShare: true
                     }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            
            playerPage.playerEvents(event);
        })
        it('should call the download service to download the pdf', (done) => {
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: 'DOWNLOAD'
                }
            };

            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.resolve());
            playerPage.playerEvents(event);
            setTimeout(() => {
                // expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
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
                    type: 'DOWNLOAD'
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                reason: 'device-permission-denied'
            }));
            playerPage.playerEvents(event);
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
                    type: 'DOWNLOAD'
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                reason: 'user-permission-denied'
            }));
            playerPage.playerEvents(event);
            setTimeout(() => {
                // expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
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
                    type: 'DOWNLOAD'
                }
            };
            mockCommonUtilService.showToast = jest.fn();
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({
                reason: 'download-failed'
            }));
            playerPage.playerEvents(event);
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
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalled();
                done();
            }, 50);

        });
        it('should handle the content compatibility error', (done) => {
            const event = {
                edata: {
                    type: 'compatibility-error'
                }
            };
            global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate = jest.fn(() => { });
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate).toHaveBeenCalled();
                done();
            }, 50);
        });
    });

});
