import { ActivatedRoute, Router } from '@angular/router';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { CourseService, ProfileService, SunbirdSdk, TelemetryService , ContentService, TelemetryErrorCode,
     ErrorType, InteractType, SharedPreferences, PlayerService  } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { CommonUtilService } from '../../services/common-util.service';
import { FormAndFrameworkUtilService, PageId } from '../../services';
import { Location } from '@angular/common';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Observable, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventTopics, ExploreConstants, RouterLinks, ShareItemType } from '../app.constant';
import { PrintPdfService } from '../../services/print-pdf/print-pdf.service';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Environment, InteractSubtype } from '../../services';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { User, HierarchyInfo } from './player-action-handler-delegate';
import { UpdateContentStateRequest, UpdateContentStateTarget } from '@project-sunbird/sunbird-sdk';
import { ElementRef } from '@angular/core';


declare const cordova;

describe('PlayerPage', () => {
    let playerPage: PlayerPage;
    window.cordova.plugins = {
        InAppUpdateManager: {
            checkForImmediateUpdate: jest.fn((fn, fn1) => {fn({}), fn1()})
        }
    };
    const mockAlertCtrl: Partial<AlertController> = {
        
    };
    const mockCourseService: Partial<CourseService> = {
        syncAssessmentEvents: jest.fn(() => of(undefined)),
    };
    const mockCanvasPlayerService: Partial<CanvasPlayerService> = {
        handleAction: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios'),
        pause: {
            subscribe: jest.fn((fn) => fn({}))
        } as any,
    };
    const mockScreenOrientation: Partial<ScreenOrientation> = {
        unlock: jest.fn(),
        ORIENTATIONS: {
            LANDSCAPE: 'LANDSCAPE',
            PORTRAIT: 'PORTRAIT' } as any,
        lock: jest.fn(() => Promise.resolve([]))

    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockStatusBar: Partial<StatusBar> = {
        hide: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(),
        handleAssessmentStatus: jest.fn(),
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
        })) as any,
        navigate: jest.fn()
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
        downloadPdf: jest.fn(() => Promise.resolve({}))
    };
    const mockFileOpener: Partial<FileOpener> = {};
    const mockTransfer: Partial<FileTransfer> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockprintPdfService: Partial<PrintPdfService> = {};
    const mockContentService: Partial<ContentService> = {};

    const mockprofileService: Partial<ProfileService> = {};
    const mockPlayerService: Partial<PlayerService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFile: Partial<File> = {
        checkDir: jest.fn(),
        checkFile: jest.fn(),
        createDir: jest.fn()
    };
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockSunbirdSdk: Partial<SunbirdSdk> = {};
    SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;
    
    beforeAll(() => {
        playerPage = new PlayerPage(
            mockCourseService as CourseService,
            mockprofileService as ProfileService,
            mockContentService as ContentService,
            mockPlayerService as PlayerService,
            mockSharedPreferences as SharedPreferences,
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
            mockprintPdfService as PrintPdfService,
            mockFile as File
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
            mockAlertCtrl.create = jest.fn((fn) => Promise.resolve({
                present: jest.fn()
            })) as any;
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            playerPage.handleNavBackButton();
            playerPage.showConfirm();
            setTimeout(() =>{
            expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalled();
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
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
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

        it('should be called when player type is  sunbird old player and exit app, if renderer is false', (done) =>{
            playerPage.playerType = 'sunbird-old-player';
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn()
            })) as any;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
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
                            running: false
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
        it('should initialize the backbutton handle else case', (done) => {
            window.setInterval = jest.fn((fn) => fn({}), 500) as any;
            playerPage.playerType ='sunbird-old-player';
            playerPage.previewElement = {
                nativeElement: ''
            }
            playerPage.config = {
                    context: {
                        actor: {
                            id: '123456'
                        }
                    },
                    metadata: {
                    basePath: 'basePath',
                    isAvailableLocally: false,
                    contentData:{
                        streamingUrl: ''
                    }
                    },
                    config: {}
            };
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([
                {
                    name: 'Player',
                    code: 'config',
                    config: {
                        v1: {
                            whitelistUrl: [
                                'https://obj.stage.sunbirded.org/**'
                            ]
                        }
                    }
                }
            ]));
            mockStatusBar.hide = jest.fn()
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
                return Promise.resolve();
            });
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
        it('should initialize the backbutton', (done) => {
            window.setInterval = jest.fn((fn) => fn({}), 500) as any;
            playerPage.playerType ='sunbird-old-player';
            playerPage.config = {
                context: {
                    actor: {
                        id: '123456'
                    }
                },
                metadata: {
                basePath: 'basePath',
                isAvailableLocally: true,
                contentData:{
                    streamingUrl: ''
                }
                },
                config: {}
            };
            const config = playerPage.config;
            playerPage.previewElement = {
                nativeElement: {
                    src: '12346',
                    onload: () => {},
                    contentWindow: {
                        cordova: '',
                        Media: '',
                        initializePreview: config,
                        addEventListener: jest.fn(fn => fn())
                    }
                }
            } as ElementRef;
            window.setTimeout = jest.fn((fn) => fn({}), 1000) as any;
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([
                {
                    name: 'Player',
                    code: 'config',
                    config: {
                        v1: {
                            whitelistUrl: [
                                'https://obj.stage.sunbirded.org/**'
                            ]
                        }
                    }
                }
            ]));
            mockStatusBar.hide = jest.fn()
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([
                {
                    name: 'Player',
                    code: 'config',
                    config: {
                        v1: {
                            whitelistUrl: [
                                'https://obj.stage.sunbirded.org/**'
                            ]
                        }
                    }
                }
            ]));
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            jest.spyOn(playerPage, 'showConfirm').mockImplementation(() => {
                return Promise.resolve();
            });
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

        it('should initialize back button when mimetype is questionset', () => {
            window.setInterval = jest.fn((fn) => fn({}), 500) as any;
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
                    isAvailableLocally: true,
                    basePath: 'basePath',
                    mimeType: 'application/vnd.sunbird.questionset'
                },
                config: {}
            }
            playerPage.playerType = 'sunbird-quml-player';
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([
                {
                    name: 'Player',
                    code: 'config',
                    config: {
                        v1: {
                            whitelistUrl: []
                        }
                    }
                }
            ]));
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
            }, 0);
        });

        it('should initialize back button when mimetype is not questionset', () => {
            window.setInterval = jest.fn((fn) => fn({}), 500) as any;
            playerPage.previewElement = {
                nativeElement: {
                    src: '12346',
                    contentWindow: {
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            exit: jest.fn()
                        }
                    }
                }
            };
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
            };
            playerPage.playerType = 'sunbird-pdf-player';
            // playerPage.loadPdfPlayer = true;
            mockStatusBar.hide = jest.fn();
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve({}));
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: false }));
            mockEvents.publish = jest.fn()
            mockAppGlobalService.getSelectedUser = jest.fn();
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                expect(mockPlatform.backButton).toBeTruthy();
            }, 0);
        });
    });

    it('should return new  player config', () => {
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
        }, 0)
        //  expect(playerPage.getNewPlayerConfiguration()).toHaveBeenCalled();
    })

    it('should call the get question read api for instructions', () =>{
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
                isAvailableLocally: false,
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
        } , 0)
    });

    it('should handle error the get question read api for instructions', () =>{
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
                isAvailableLocally: false,
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

        mockContentService.getQuestionSetRead = jest.fn(() => throwError({})) as any;
        playerPage.getNewPlayerConfiguration();
        setTimeout(() =>{
        expect(mockContentService.getQuestionSetRead).toHaveBeenCalled();
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

    it('should return a content', ()=> {
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
        mockEvents.publish = jest.fn();
        mockLocation.back = jest.fn();
        playerPage.playNextContent();
        expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT , {
            content: playerPage.nextContentToBePlayed,
            course : {}
        });
        expect(mockLocation.back).toHaveBeenCalled();
    });

    describe('ionViewWillEnter', () => {
        beforeEach(() => {
            jest.useFakeTimers();
         });
   
        it('should hide statusbar', () => {
            // arrange
            jest.runAllTimers();
            playerPage.playerType ='sunbird-old-player';
            mockScreenOrientation.lock = jest.fn();
            mockStatusBar.hide = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCourseService.syncAssessmentEvents = of({
                subscribe: jest.fn()
            }) as any;
            // act
            playerPage.ionViewWillEnter();
            // assert 
            setTimeout(() => {
            expect( mockStatusBar.hide).toHaveBeenCalled();
            expect( mockScreenOrientation.lock).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.DOWNLOAD_PDF_CLICKED,
                Environment.PLAYER,
                PageId.PLAYER,
                ContentUtil.getTelemetryObject(playerPage.config['metadata']['contentData']),
                undefined,
                ContentUtil.generateRollUp(playerPage.config['metadata']['hierarchyInfo'], playerPage.config['metadata']['identifier']))
        }, 100);
        });
    });

    describe('ngOninit', () => {
        it('should call getPdfPlayerConfiguration', (done) => {
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: jest.fn(fn => fn())
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
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
                    },
                    hierarchyInfo: {
                        contentType: '',
                        identifier: 'string',
                        primaryCategory: ''
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
                expect(mockPlatform.pause?.subscribe).toHaveBeenCalled();
                // expect(mockFormAndFrameworkUtilService.getPdfPlayerConfiguration).toHaveBeenCalled();
                expect(playerPage.loadPdfPlayer).toBeFalsy();
                done();
            }, 0);
        });
        it('should check mimetype and load pdf player', (done) => {
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.playerConfig = true;
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
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
                config: {sideMenu: {sideMenu: true}},
                metadata: {
                    identifier: 'li',
                    mimeType: 'application/epub',
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
                    name: 'epubPlayer'
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
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
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
                        showShare: true,
                        showDeviceOrientation: true
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

        it('should check mimetype and load video player for platfrom ios', (done) => {
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.playerConfig = true;
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
            mockPlatform.is = jest.fn(platform => platform === "ios");
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
                        showShare: true,
                        showDeviceOrientation: true
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
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
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
                        showShare: true,
                        showDeviceOrientation: true
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
            mockContentService.getQuestionSetChildren = jest.fn();
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

        it('should check mimetype and load pdf player', (done) => {
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.playerConfig = true;
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => []) as any;
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
                config: {sideMenu: {sideMenu: true}},
                metadata: {
                    identifier: 'li',
                    mimeType: '',
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

    describe('toggleDeviceOrientation' , () => {
        it('should lock and unlock' , () => {
            //arrange
            mockScreenOrientation.type = 'landscape';
            mockScreenOrientation.unlock = jest.fn();
            mockScreenOrientation.lock = jest.fn(() => Promise.resolve('PORTRAIT'));
            //act
            playerPage.toggleDeviceOrientation();
            //assert
            expect(mockScreenOrientation.unlock).toHaveBeenCalled();
            expect(mockScreenOrientation.lock).toHaveBeenCalledWith('PORTRAIT');
        });

        it('should lock and unlock' , () =>{
            //arrange
            mockScreenOrientation.type = 'LANDSCAPE';
            mockScreenOrientation.unlock = jest.fn();
            mockScreenOrientation.lock = jest.fn(() => Promise.resolve('LANDSCAPE'));
            //act
            playerPage.toggleDeviceOrientation();
            //assert
            expect(mockScreenOrientation.unlock).toHaveBeenCalled();
            expect(mockScreenOrientation.lock).toHaveBeenCalledWith('LANDSCAPE');
        });
    });

    describe('pdfPlayerEvents', () => {
        it('should sync assessment events', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockPlayerService.savePlayerState = jest.fn();
            mockCourseService.syncAssessmentEvents = jest.fn(() => of(undefined)) as any;
            const event = {
                edata: {
                    type: 'END'
                }
            };
            playerPage.config = {
                metadata: {
                    mimeType: 'application/vnd.sunbird.questionset'
                }
            }
            playerPage.playerEvents(event);

            expect(mockCourseService.syncAssessmentEvents).toHaveBeenCalled();
        });
        it('should exit the player', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
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
            }, 50);
        });
        it('should exit the player and confirm if has metadata', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };
            playerPage.isExitPopupShown = false;
            playerPage.config = {
                metadata: {
                    mimeType: 'application/vnd.sunbird.questionset'
                }
            }
            playerPage.playerEvents(event);

            setTimeout(() => {
            }, 50);
        });

        it('should exit the player and confirm if has metadata on else case if isExit popup is shown', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };
            playerPage.isExitPopupShown = true;
            playerPage.config = {
                metadata: {
                    mimeType: 'application/vnd.sunbird.questionset'
                }
            }
            playerPage.playerEvents(event);

            setTimeout(() => {
            }, 50);
        });
        it('should call the download service to download the pdf', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
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
            }, 100);

        });
        it('should call the print service to print the pdf for catch part', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: 'PRINT'
                }
            };
            mockprintPdfService.printPdf = jest.fn()
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled();
            }, 0);
        });
        it('should call the print service to print the pdf for catch part', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            };
            const event = {
                edata: {
                    type: 'NEXT_CONTENT_PLAY'
                }
            };
            playerPage.playerEvents(event);
            setTimeout(() => {

            }, 0);
        });
        it('should call the download service to download the pdf for catch part(user-permission-denied)', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
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
            }, 0);

        });
        it('should call the download service to download the pdf for catch part(download-failed)', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
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
            }, 0);

        });
        it('should handle the share event', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
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
            }, 50);

        });
        it('should handle the content compatibility error', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: {
                    type: 'compatibility-error'
                }
            };
            global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate = jest.fn((fn, fn1) => {fn({ }), fn1({})});
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(global.window.cordova.plugins.InAppUpdateManager.checkForImmediateUpdate).toHaveBeenCalled();
            }, 50);
        });
        it('should handle the exdata event', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: {
                    type: 'exdata',
                    currentattempt: 2,
                    maxLimitExceeded: false,
                    isLastAttempt: false,
                }
            };
            playerPage.playerEvents(event);
            expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
        });

        it('should handle the exdata event if no curent attemopts', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: {
                    type: 'exdata',
                    currentattempt: 0,
                    maxLimitExceeded: false,
                    isLastAttempt: false,
                }
            };
            playerPage.playerEvents(event);
        });

        it('should handle the DEVICE_ROTATION_CLICKED event', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: {
                    type: 'DEVICE_ROTATION_CLICKED'
                }
            };
            jest.spyOn(playerPage, 'toggleDeviceOrientation').mockImplementation(() => {
                return Promise.resolve();
            });
            playerPage.playerEvents(event);

        });

        it('should handle if no event edata type', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: {
                    type: ''
                }
            };
            // act
            playerPage.playerEvents(event);

        });
        it('should handle if no event edata', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' }));
            const event = {
                edata: ''
            };
            // act
            playerPage.playerEvents(event);

        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe pauseSubscription', () => {
            // arrange
            playerPage['pauseSubscription'] = {
                unsubscribe: jest.fn(),
            } as any;
            // act
            playerPage.ngOnDestroy();
            // assert
            expect(playerPage['pauseSubscription'].unsubscribe).toHaveBeenCalled();
        });
        it('should handle else if no pauseSubscription', () => {
            // arrange
            playerPage['pauseSubscription'] = undefined as any;
            // act
            playerPage.ngOnDestroy();
            // assert
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe backButtonSubscription', () => {
            // arrange
            mockStatusBar.show = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of("Orientation"));
            mockScreenOrientation.unlock = jest.fn();
            playerPage['events'] = {
                unsubscribe: jest.fn(),
            } as any;
            playerPage['backButtonSubscription'] = {
                unsubscribe: jest.fn(),
            } as any;
            // act
            playerPage.ionViewWillLeave();
            // assert 
            setTimeout(() => {
            expect(playerPage['events'].unsubscribe).toHaveBeenCalled();
            expect(playerPage['backButtonSubscription'].unsubscribe).toHaveBeenCalled();
            expect(mockStatusBar.show).toHaveBeenCalled();
            expect( mockScreenOrientation.unlock).toHaveBeenCalled();
        }, 100);;
        });

        it('should unsubscribe backButtonSubscription', () => {
            // arrange
            mockStatusBar.show = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of("Landscape"));
            mockScreenOrientation.unlock = jest.fn();
            playerPage['events'] = undefined as any;
            playerPage['backButtonSubscription'] = undefined as any;
            window.removeEventListener = jest.fn((_,fn) => fn({}))
            // act
            playerPage.ionViewWillLeave();
            // assert
            setTimeout(() => {
            // expect(playerPage['events'].unsubscribe).toHaveBeenCalled();
            // expect(playerPage['backButtonSubscription'].unsubscribe).toHaveBeenCalled();
            expect(mockStatusBar.show).toHaveBeenCalled();
            expect( mockScreenOrientation.unlock).toHaveBeenCalled();
        }, 100);;
        });
    });

    describe('openPDF' , () =>{
        it('should create a loader and dismiss' , async () =>{
            //arrange
            playerPage.previewElement= {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI : {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService:{
                            exit: jest.fn(),
                           interact: jest.fn()
                        },
                        Renderer : {
                            running: true
                        }
                    }
                }
            }
            playerPage.config = {
                context: {
                    actor: {id: 'some_id'}
                },
                metadata: {
                    identifier: 'id'
                }
            }
            const course = {
                identifier: 'id',
                batchId: '12',
                courseId: '324'
            }
            const updateContentStateRequest: UpdateContentStateRequest = {
                userId: playerPage.config['context']['actor']['id'],
                contentId: playerPage.config['metadata']['identifier'],
                courseId: course['identifier'] || course['courseId'],
                batchId: course['batchId'],
                status: 2,
                progress: 100,
                target: [UpdateContentStateTarget.LOCAL, UpdateContentStateTarget.SERVER]
              };
            mockCourseService.updateContentState = jest.fn(() => of({}))
            window.setTimeout = jest.fn((fn) => {
                fn()
            }, 1000) as any;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())   
            }));
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any;
            mockFileOpener.open = jest.fn(() => Promise.resolve())
            mockLocation.back = jest.fn();
            //act
            playerPage.openPDF("https://sample/openPdfUrl");
            //assert
            setTimeout(() => {
                // expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                // expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                //     Environment.PLAYER,
                //     TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                //     ErrorType.SYSTEM,
                //     PageId.PLAYER,
                //     JSON.stringify('e')
                // );
                // expect(mockCourseService.updateContentState).toHaveBeenCalledWith(updateContentStateRequest);
                // expect(mockLocation.back).toHaveBeenCalled();
            }, 1000);
        })

        it('should create a loader and dismiss, handle error on file opener' , async () =>{
            //arrange
            playerPage.previewElement= {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI : {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService:{
                            exit: jest.fn(),
                           interact: jest.fn()
                        },
                        Renderer : {
                            running: true
                        }
                    }
                }
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())   
            }));
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any;
            mockFileOpener.open = jest.fn(() => Promise.reject())
            mockLocation.back = jest.fn();
            //act
            playerPage.openPDF("https://sample/openPdfUrl");
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.PLAYER,
                    TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                    ErrorType.SYSTEM,
                    PageId.PLAYER,
                    JSON.stringify('e')
                );
                expect(mockLocation.back).toHaveBeenCalled();
            }, 1000);
        })
        it('should create a loader and dismiss and handle error on download' , () =>{
            //arrange
            playerPage.previewElement= {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI : {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService:{
                            exit: jest.fn(() => Promise.reject()),
                           interact: jest.fn()
                        },
                        Renderer : {
                            running: true
                        }
                    }
                }
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())   
            }));
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            const mockDownload = jest.fn(() => Promise.reject({
            }));
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any;
            mockFileOpener.open = jest.fn(() => Promise.reject({}))
            mockCommonUtilService.showToast = jest.fn()
            mockLocation.back = jest.fn();
            //act
            playerPage.openPDF("https://sample/openPdfUrl");
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.PLAYER,
                    TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                    ErrorType.SYSTEM,
                    PageId.PLAYER,
                    JSON.stringify(e)
                );
                expect(mockLocation.back).toHaveBeenCalled();
            }, 0);
        })
        it('should create a loader and dismiss and handle error on exit telemetry service' , () =>{
            //arrange
            playerPage.course = '';
            playerPage.previewElement= {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI : {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService:{
                            exit: jest.fn(() => Promise.reject({})),
                           interact: jest.fn()
                        },
                        Renderer : {
                            running: true
                        }
                    }
                }
            }
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn(() => Promise.resolve())   
            }));
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            const mockDownload = jest.fn(() => Promise.reject({
            }));
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any;
            mockFileOpener.open = jest.fn(() => Promise.resolve())
            mockLocation.back = jest.fn();
            //act
            playerPage.openPDF("https://sample/openPdfUrl");
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                    Environment.PLAYER,
                    TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                    ErrorType.SYSTEM,
                    PageId.PLAYER,
                    JSON.stringify('e')
                );
                expect(mockLocation.back).toHaveBeenCalled();
            }, 0);
        })
    })

    xdescribe('onContentNotFound', () => {
        it('should check Content on NotFound', (done) => {
            // arrange
            const info: Array<HierarchyInfo> = [{identifier: 'abc',
                contentType: '',
                primaryCategory: ''}];
            const content = {identifier:'', info};
            window.setTimeout = jest.fn((fn) => {
                fn();
            }, 1000) as any;
            jest.spyOn(playerPage, 'closeIframe').mockImplementation();
            mockEvents.publish = jest.fn(() => Promise.resolve())
            // act
            playerPage.onContentNotFound('', info);
            // asert
            setTimeout(() => {
                playerPage.closeIframe();
                done()
            }, 0);
            expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT, {
            content,
            course: playerPage.course
            });
        })
    })

    describe('onUserSwitch', () => {
        it('should switch user', () => {
            // arrange
            const user: User = {
                uid: ''
            };
            mockAppGlobalService.setSelectedUser = jest.fn();
            // act
            playerPage.onUserSwitch(user);
            // asert
            expect(mockAppGlobalService.setSelectedUser).toHaveBeenCalledWith(user)
        })
    })

    describe('closeIframe', () => {
        it('should closeIframe', () => {
            // arrange
            const content = {ContentData: {downloadUrl:''}}
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            exit: jest.fn()
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = true;
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn();
            mockRouter.navigate = jest.fn(() => Promise.resolve()) as any;
            // act
            setTimeout(() => {
            playerPage.closeIframe(content);
                // asert
                expect(mockEvents.publish).toHaveBeenCalled();
            }, 1000);
        })

        it('should closeIframe and error on exit telemetry services', () => {
            // arrange
            const content = {ContentData: {downloadUrl:''}}
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            exit: jest.fn(() => Promise.reject({}))
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = false;
            playerPage['navigateBackToTrackableCollection'] = true;
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn();
            mockRouter.navigate = jest.fn(() => Promise.resolve()) as any;
            // act
            setTimeout(() => {
            playerPage.closeIframe(content);
                // asert
                expect(mockEvents.publish).toHaveBeenCalled();
            }, 1000);
        })

        it('should go back to last location if not trackable or content details', () => {
            // arrange
            const content = {ContentData: {downloadUrl:''}}
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            exit: jest.fn(() => Promise.reject({}))
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = false;
            playerPage['navigateBackToTrackableCollection'] = false;
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn();
            mockLocation.back = jest.fn(() => Promise.resolve());
            // act
            setTimeout(() => {
            playerPage.closeIframe(content);
                // asert
                expect(mockEvents.publish).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
            }, 1000); 
        })
    })

    describe('playerTelemetryEvents', () => {
        it('should handle playerTelemetryEvents', () => {
            // arrange
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
            // act
            playerPage.playerTelemetryEvents({});
            // assert
        })

        it('should handle playerTelemetryEvents on else case no events', () => {
            // arrange
            let event = undefined;
            mockTelemetryService.saveTelemetry = jest.fn(() => of());
            // act
            playerPage.playerTelemetryEvents(event);
            // assert
        })
    })

    describe('handleDownload', () => {
        it('should handleDownload ', () => {
            // arrange
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.resolve('res'))
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 0);
        })

        it('should handleDownload and handle error on downlaod pdf ', () => {
            // arrange
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({reason: 'device-permission-denied'}))
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 0);
        })

        it('should handleDownload and handle empty error on downlaod pdf ', () => {
            // arrange
            mockDownloadPdfService.downloadPdf = jest.fn(() => Promise.reject({reason: ''}))
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 0);
        })
        it('should handleDownload for ios platform ', () => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            mockFile.checkDir = jest.fn(() => Promise.resolve()) as any;
            mockFile.checkFile = jest.fn(() => Promise.resolve()) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 0);
        })

        it('should handleDownload for ios platform checkfile error and downlaod file for ios', () => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            mockFile.checkDir = jest.fn(() => Promise.resolve()) as any;
            mockFile.checkFile = jest.fn(() => Promise.reject()) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 500);
        })

        it('should handleDownload for ios platform checkdir error and downlaod file for ios', () => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            mockFile.checkDir = jest.fn(() => Promise.reject()) as any;
            mockFile.createDir = jest.fn(() => Promise.resolve({})) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 500);
        })

        it('should handleDownload for ios platform handle error on createdir and downlaod file for ios', () => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            mockFile.checkDir = jest.fn(() => Promise.reject()) as any;
            mockFile.createDir = jest.fn(() => Promise.reject({})) as any;
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            setTimeout(() => {
                expect(mockDownloadPdfService.downloadPdf).toHaveBeenCalled()
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CONTENT_DOWNLOADED');
            }, 500);
        })
        it('should show toast if no downlaod url', () => {
            // arrange
            playerPage['content'] = {
                contentData: {
                    downloadUrl: ''
                }
            }
            mockCommonUtilService.showToast = jest.fn();
            // act
            playerPage.handleDownload();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        })
    })

    describe('downloadFileIos', () => {
        it('should download File for Ios', () => {
            // arrange
            const content = {contentData: {downloadUrl: ""}}
            mockFile.documentsDirectory = '/'
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            window.setTimeout = jest.fn((fn) => {
                fn()
            }, 500) as any;
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any
            mockCommonUtilService.showToast = jest.fn(() => Promise.resolve())
            // act
            playerPage.downloadFileIos(content);
            // assert
            setTimeout(() => {
                expect(mockTransfer.create).toHaveBeenCalled();
            }, 500);
        })

        it('should download File for Ios handle error', () => {
            // arrange
            const content = {contentData: {downloadUrl: ""}}
            mockFile.documentsDirectory = '/'
            const mockDownload = jest.fn(() => Promise.reject({}));
            window.setTimeout = jest.fn((fn) => {
                fn()
            }, 500) as any;
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any
            mockCommonUtilService.showToast = jest.fn(() => Promise.resolve())
            // act
            playerPage.downloadFileIos(content);
            // assert
            setTimeout(() => {
                expect(mockTransfer.create).toHaveBeenCalled();
            }, 500);
        })
    })
});
