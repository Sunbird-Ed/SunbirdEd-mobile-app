import { ActivatedRoute, Router } from '@angular/router';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { CourseService, ProfileService, SunbirdSdk, TelemetryService , ContentService, TelemetryErrorCode,
     ErrorType, InteractType, SharedPreferences, PlayerService, ProfileType, ProfileSource  } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../../services/app-global-service.service';
import { DownloadPdfService } from '../../services/download-pdf/download-pdf.service';
import { PlayerPage } from './player.page';
import { CanvasPlayerService } from '../../services/canvas-player.service';
import { CommonUtilService } from '../../services/common-util.service';
import { FormAndFrameworkUtilService, PageId } from '../../services';
import { Location } from '@angular/common';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { Observable, of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventTopics, ExploreConstants, RouterLinks, ShareItemType } from '../app.constant';
import { PrintPdfService } from '../../services/print-pdf/print-pdf.service';
import { Environment, InteractSubtype } from '../../services';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { User, HierarchyInfo } from './player-action-handler-delegate';
import { UpdateContentStateRequest, UpdateContentStateTarget } from '@project-sunbird/sunbird-sdk';
import { ElementRef } from '@angular/core';
import { ContentUtil } from '../../util/content-util';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { FileOpener } from '@capacitor-community/file-opener';


declare const cordova;

jest.mock('@capacitor/screen-orientation', () => {
    return {
      ...jest.requireActual('@capacitor/screen-orientation'),
        ScreenOrientation: {
            orientation: jest.fn(() => Promise.resolve({type: 'landscape'})),
            lock: jest.fn(() => Promise.resolve()),
            unlock: jest.fn(() => Promise.resolve())
        }
    }
})

jest.mock('@capacitor-community/file-opener', () => {
    return {
      ...jest.requireActual('@capacitor-community/file-opener'),
        FileOpener: {
            open: jest.fn(() => Promise.resolve())
        }
    }
})

jest.mock('@capacitor/status-bar', () => {
    return {
      ...jest.requireActual('@capacitor/status-bar'),
        StatusBar: {
            hide: jest.fn(() => Promise.resolve()),
            show: jest.fn(() => Promise.resolve())
        }
    }
})

describe('PlayerPage', () => {
    let playerPage: PlayerPage;
    window.cordova.plugins = {
        InAppUpdateManager: {
            checkForImmediateUpdate: jest.fn((fn, fn1) => {fn({}), fn1()})
        }
    } as any;
    const mockAlertCtrl: Partial<AlertController> = {
        create: jest.fn((fn) => (fn(),Promise.resolve({
            present: jest.fn(() => Promise.resolve()),
          })) as any,)
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
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;
    const mockAppGlobalService: Partial<AppGlobalService> = {
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn(),
        subscribe: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(),
        handleAssessmentStatus: jest.fn(),
        showToast: jest.fn()
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
        getFormFields: jest.fn(() => Promise.resolve([{}]))
    };
    const mockDownloadPdfService: Partial<DownloadPdfService> = {
        downloadPdf: jest.fn(() => Promise.resolve({}))
    };
    const mockTransfer: Partial<FileTransfer> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateBackClickedNewTelemetry: jest.fn()
    };
    const mockprintPdfService: Partial<PrintPdfService> = {};
    const mockContentService: Partial<ContentService> = {
        getContentDetails: jest.fn(() => of()),
        nextContent: jest.fn()
    };

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
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockAlertCtrl as AlertController,
            mockCommonUtilService as CommonUtilService,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockPopoverCtrl as PopoverController,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockDownloadPdfService as DownloadPdfService,
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

    describe('ngOninit', () => {
        it('should call getPdfPlayerConfiguration', (done) => {
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: jest.fn(fn => fn())
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
            StatusBar.hide= jest.fn()
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'epubPlayer', code: 'epub', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            playerPage.config = {
                context: {
                    objectRollup: {
                        l1: 'li'
                    },
                    dispatcher: {
                        dispatch: jest.fn(() => Promise.resolve())
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
            let plyr = playerPage.pdf as ElementRef;
            window.setTimeout = jest.fn(fn => fn(
                plyr.nativeElement.append = jest.fn()
            ), 500) as any;
            window.setTimeout = jest.fn((f1) => f1(() => {
                document.createElement = jest.fn(fn => {
                    Promise.resolve({
                        setAttribute: jest.fn(), 
                        addEventListener: jest.fn()})
                }) as any
            }), 100) as any
            playerPage.playerConfig = {};
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch();
            });
            setTimeout(() => {
                expect(playerPage['loadPdfPlayer']).toBeFalsy();
                done();
            }, 0);
        });
        it('should check mimetype and load pdf player', () => {
            StatusBar.hide= jest.fn();
            playerPage.config = {
                context: {
                    objectRollup: {
                        l1: 'li'
                    },
                    dispatcher: {
                        dispatch: jest.fn(() => Promise.resolve())
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
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'epubPlayer', code: 'epub', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            let plyr = playerPage.pdf as ElementRef
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            ScreenOrientation.lock = jest.fn(() => Promise.resolve())
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            window.setTimeout = jest.fn(fn => fn(
                plyr.nativeElement.append = jest.fn()
            ), 500) as any;
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ detail: {edata: {type: ''}}}))
            }
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {return ele}) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'id'})) as any
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry(request: string): Observable<boolean> {
                            // for success
                            return of(true);
                        }
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load epub player', () => {
            StatusBar.hide= jest.fn();
            playerPage.config = {
                context: {
                    objectRollup: {
                        l1: 'li'
                    },
                    dispatcher: {
                        dispatch: jest.fn(() => Promise.resolve())
                    },
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                },
                metadata: {
                    identifier: 'identifier',
                    mimeType: 'application/epub',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'epubPlayer', code: 'epub', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            let plyr = playerPage.epub as ElementRef;
            window.setTimeout = jest.fn(fn => fn(
                plyr.nativeElement.append = jest.fn()
            ), 500) as any;
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            ScreenOrientation.lock = jest.fn(() => Promise.resolve())
            playerPage.isExitPopupShown = true;
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ detail: {edata: {type: 'EXIT'}}}))
            }
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {return ele}) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry(request: string): Observable<boolean> {
                            // for success
                            return of(true);
                        }
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load epub player', () => {
            StatusBar.hide= jest.fn();
            playerPage.config = {
                context: {
                    objectRollup: {
                        l1: 'li'
                    },
                    dispatcher: {
                        dispatch: jest.fn(() => Promise.resolve())
                    },
                    pdata: {
                        pid: 'sunbird.app.contentplayer'
                    }
                },
                metadata: {
                    identifier: 'identifier',
                    mimeType: 'application/epub',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'epubPlayer', code: 'epub', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/pdf',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            playerPage.epub = {
                nativeElement: {
                    append: jest.fn()
                }
            }
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            ScreenOrientation.lock = jest.fn(() => Promise.resolve())
            playerPage.isExitPopupShown = true;
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ detail: {edata: {type: 'EXIT'}}}))
            }
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {return ele}) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry(request: string): Observable<boolean> {
                            // for success
                            return of(true);
                        }
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load quml player', () => {
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'qumlPlayer', code: 'quml', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            const subscribeFn = jest.fn(fn => fn()) as any;
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
            let plyr = playerPage.qumlPlayer as ElementRef
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            mockContentService.getQuestionSetChildren = jest.fn();
            window.setTimeout = jest.fn(fn => fn(
                plyr.nativeElement.append = jest.fn()
            ), 500) as any;
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({ edata: {type: 'EXIT'}}))
            }
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {return ele}) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                telemetryService: {
                    saveTelemetry(request: string): Observable<boolean> {
                        return of(true);
                    }
                } as Partial<TelemetryService> as TelemetryService
            } as Partial<SunbirdSdk> as SunbirdSdk);
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load quml player, if not locally available', () => {
            const subscribeFn = jest.fn(fn => fn()) as any;
            mockPlatform.pause = {
                subscribe: subscribeFn
            } as any;
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'qumlPlayer', code: 'quml', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            playerPage.qumlPlayer = {
                nativeElement: {
                    append: jest.fn()
                }
            }
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
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
                    isAvailableLocally: false,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockContentService.getQuestionSetChildren = jest.fn(() => Promise.resolve([{identifier: '1234', children:[{identifier:'1234'}]}]));
            mockContentService.getQuestionList = jest.fn(() => of({questions: []}))
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            window.setTimeout = jest.fn(fn => fn(
                playerPage.previewElement.nativeElement = {
                    append: jest.fn(),
                    contentWindow: {
                        Renderer: true
                    }
                }
            ), 500) as any;
            playerPage.isExitPopupShown = false
            const ele = {
                setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({detail: {edata: {type: 'EXIT'}}}))
            }
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {return ele}) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
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
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load quml player, if not locally available, no id for child', () => {
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'qumlPlayer', code: 'quml', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
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
                    isAvailableLocally: false,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockContentService.getQuestionSetChildren = jest.fn(() => Promise.resolve([{identifier: '1234', children:[{identifier:''}]}]));
            mockContentService.getQuestionList = jest.fn(() => of({questions: []}))
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load quml player, if not locally available, and else if no childern', () => {
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'qumlPlayer', code: 'quml', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
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
                        showShare: true,
                        showDeviceOrientation: true
                     }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'application/vnd.sunbird.questionset',
                    isAvailableLocally: false,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            document.getElementsByTagName = jest.fn(() => [{contentWindow: {postMessage: jest.fn()}}]) as any;
            mockContentService.getQuestionSetChildren = jest.fn(() => Promise.resolve([{identifier: '1234'}]));
            mockContentService.getQuestionList = jest.fn(() => of({questions: []}))
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load video player', () => {
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
                    isAvailableLocally: false,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            let playerConfig = {
                fields: [
                    { name: 'videoPlayer', code: 'video', values: [{isEnabled: true}] },
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] }
                ],
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
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            mockPlatform.is = jest.fn(fn => fn == 'android');
            mockprofileService.getActiveSessionProfile = jest.fn(() => of({uid: 'id', profileType: ProfileType.PARENT, source: '', serverProfile: {firstName: 'name'}, handle: 'handle'})) as any
            let ele = {setAttribute: jest.fn(), 
                addEventListener: jest.fn((_, f1) => f1({detail: { edata: {type: 'EXIT'}}
            }))}
            window.setTimeout = jest.fn(fn => fn(
            playerPage.video = {
                nativeElement: {
                    append: jest.fn()
                }
            } as ElementRef
            ))
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => (ele)) as any,
            ), 500) as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            playerPage.ngOnInit().then(() => {
                jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                    telemetryService: {
                        saveTelemetry(request: string): Observable<boolean> {
                            // for success
                            return of(true);
                        }
                    } as Partial<TelemetryService> as TelemetryService
                } as Partial<SunbirdSdk> as SunbirdSdk);
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load video player for platfrom ios', () => {
            let playerConfig = {
                fields: [
                    { name: 'pdfPlayer', code: 'pdf', values: [{isEnabled: true}] },
                    { name: 'videoPlayer', code: 'video', values: [{isEnabled: true}] }
                ],
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
                    mimeType: 'video/webm',
                    isAvailableLocally: true,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
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
                        showShare: true,
                        showDeviceOrientation: true
                     }
                },
                metadata: {
                    identifier: 'li',
                    mimeType: 'video/mp4',
                    isAvailableLocally: false,
                    contentData: {
                        isAvailableLocally: true,
                        basePath: 'basePath',
                        streamingUrl: 'streamingurl'
                    }
                }
            };
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve(playerConfig));
            mockPlatform.is = jest.fn(platform => platform === "ios");
            playerPage.ngOnInit().then(() => {
                playerPage.config['context'].dispatcher.dispatch({});
            });
        });

        it('should check mimetype and load pdf player', (done) => {
            mockFormAndFrameworkUtilService.getPdfPlayerConfiguration = jest.fn(() => Promise.resolve({}));
            playerPage.playerConfig = true;
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
                    },
                    actor: { id: '123' }
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
            window.setTimeout = jest.fn(fn => fn(
                document.createElement = jest.fn(() => {
                    Promise.resolve({
                        setAttribute: jest.fn(), 
                        addEventListener: jest.fn((_, f1) => f1({ detail: {edata: {type: 'EXIT'}}
                    }))})
                }) as any), 500) as any;
            playerPage.playerConfig = {};
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
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
    
    describe('ionViewWillEnter', () => {
        it('should hide statusbar', () => {
            // arrange
            window.setInterval = jest.fn((fn) => fn(() => {
                playerPage.playerType ='sunbird-old-player';
                ScreenOrientation.lock = jest.fn();
                StatusBar.hide = jest.fn();
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
                playerPage.previewElement = {
                    nativeElement: {
                        src: '12346',
                        onload: jest.fn((_, fn) => fn()),
                            // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                        // ),
                        contentWindow: {
                            cordova: '',
                            Media: '',
                            initializePreview: playerPage.config,
                            addEventListener: jest.fn(fn => fn()),
                            EkstepRendererAPI: {
                                getCurrentStageId: jest.fn()
                            },
                            TelemetryService: {
                                exit: jest.fn(),
                                interact: jest.fn()
                            }
                        }
                    }
                } as ElementRef;
                window.setTimeout = jest.fn((fn) => fn({}), 1000) as any;
                mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
                mockCourseService.syncAssessmentEvents = of({
                    subscribe: jest.fn()
                }) as any;
            })) as any
            // act
            playerPage.ionViewWillEnter();
            // assert 
            setTimeout(() => {
            expect( StatusBar.hide).toHaveBeenCalled();
            expect( ScreenOrientation.lock).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.DOWNLOAD_PDF_CLICKED,
                Environment.PLAYER,
                PageId.PLAYER,
                ContentUtil.getTelemetryObject(playerPage.config['metadata']['contentData']),
                undefined,
                ContentUtil.generateRollUp(playerPage.config['metadata']['hierarchyInfo'], playerPage.config['metadata']['identifier']))
        }, 100);
        });

        it('should initialize the backbutton handle else case', () => {
            window.setInterval = jest.fn((fn) => fn(() => {
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
                playerPage.previewElement = {
                    nativeElement: {
                        src: '12346',
                        onload: jest.fn((_, fn) => fn(),
                            // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                        ),
                        contentWindow: {
                            cordova: '',
                            Media: '',
                            initializePreview: playerPage.config,
                            addEventListener: jest.fn(fn => fn()),
                            EkstepRendererAPI: {
                                getCurrentStageId: jest.fn()
                            },
                            TelemetryService: {
                                exit: jest.fn(),
                                interact: jest.fn()
                            }
                        }
                    }
                } as ElementRef;
                window.setTimeout = jest.fn((fn) => fn({}), 1000) as any;
                window.clearInterval = jest.fn()
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
            }), 500) as any;
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        EkstepRendererAPI: {getCurrentStageId: jest.fn()}, 
                        TelemetryService: {interact: jest.fn()},
                        Renderer: true}
                }   
            } as ElementRef
            mockAppGlobalService.getSelectedUser = jest.fn()
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
            })) as any;
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{code: 'config', config: {v1: {whitelistUrl: ['https://obj.stage.sunbirded.org/**']}}}]))
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
            mockEvents.publish = jest.fn() as any
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                // expect(playerPage.loadPdfPlayer).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(mockAlertCtrl.getTop).toHaveBeenCalled();
                // expect(mockLocation.back).toHaveBeenCalledWith();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                // expect(playerPage.previewElement.nativeElement.onload).toBe(null);
            }, 0);
        });
        it('should initialize the backbutton', () => {
            window.setInterval = jest.fn((fn) => fn(() => {
                playerPage.playerType ='sunbird-old-player';
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
                const config = playerPage.config;
                window.setTimeout = jest.fn((fn) => fn({}), 1000) as any;
                playerPage.previewElement = {
                    nativeElement: {
                        src: '12346',
                        onload: jest.fn((fn) => fn(() => {})
                            // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                        ),
                        contentWindow: {
                            cordova: '',
                            Media: '',
                            initializePreview: config,
                            addEventListener: jest.fn(fn => fn()),
                            EkstepRendererAPI: {
                                getCurrentStageId: jest.fn()
                            },
                            TelemetryService: {
                                exit: jest.fn(),
                                interact: jest.fn()
                            }
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
                mockEvents.publish = jest.fn(() => Promise.resolve()) as any
                StatusBar.hide = jest.fn()
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
            }), 500) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
              })) as any;
            playerPage.previewElement = {
                nativeElement: {
                    onload: jest.fn((fn) => fn(() => {})
                        // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                    ),
                    contentWindow: {
                        EkstepRendererAPI: {getCurrentStageId: jest.fn()}, 
                        TelemetryService: {interact: jest.fn()},
                        Renderer: false}
                }
            }
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: true }));
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                // expect(playerPage.loadPdfPlayer).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(mockAlertCtrl.getTop).toHaveBeenCalled();
                // expect(mockLocation.back).toHaveBeenCalledWith();
                // expect(mockEvents.subscribe).toHaveBeenCalled();
                // done();
            }, 0);
        });

        it('should initialize back button when mimetype is questionset', () => {
            window.setInterval = jest.fn((fn) => fn(() => {
                playerPage.previewElement = {
                    nativeElement: {
                        src: '12346',
                        contentWindow: {
                            EkstepRendererAPI: {
                                getCurrentStageId: jest.fn()
                            },
                            TelemetryService: {
                                exit: jest.fn(),
                                interact: jest.fn()
                            }
                        },
                        onload: jest.fn((fn) => fn(() => {})
                            // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                        ),
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
                StatusBar.hide = jest.fn();
            }), 500) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve(undefined));
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
              })) as any;
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            // mockLocation.back = jest.fn();
            playerPage.previewElement.nativeElement = {
                contentWindow: {
                    EkstepRendererAPI: {
                        getCurrentStageId: jest.fn()
                    }, 
                    TelemetryService: {
                        exit: jest.fn(),
                        interact: jest.fn()
                    },
                    Renderer: false}
            }
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: false }));
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                // expect(playerPage.loadPdfPlayer).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(mockAlertCtrl.getTop).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                // expect(playerPage.showConfirm).toHaveBeenCalled();
            }, 0);
        });

        it('should initialize back button when mimetype is not questionset', () => {
            window.setInterval = jest.fn((fn) => fn(() =>{
                let c: ElementRef = {
                    nativeElement: {
                        src: '12346',
                        contentWindow: {
                            EkstepRendererAPI: {
                                getCurrentStageId: jest.fn()
                            },
                            TelemetryService: {
                                exit: jest.fn(),
                                interact: jest.fn()
                            }
                        },
                        onload: jest.fn((fn) => fn(() => {})
                            // window.setTimeout = jest.fn((fn) => fn(), 1000) as any}
                        ),
                    }
                };
                playerPage.previewElement = c
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
                StatusBar.hide = jest.fn();
            }), 500) as any;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve({})) as any;
            playerPage.previewElement.nativeElement = {
                contentWindow: {
                    EkstepRendererAPI: {
                        getCurrentStageId: jest.fn()
                    }, 
                    TelemetryService: {
                        exit: jest.fn(),
                        interact: jest.fn()
                    },
                    Renderer: false}
            }
            mockEvents.subscribe = jest.fn((_, fn) => fn({ showConfirmBox: false }));
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            mockAppGlobalService.getSelectedUser = jest.fn();
            playerPage.ionViewWillEnter();
            setTimeout(() => {
                expect(mockPlatform.backButton).toBeTruthy();
            }, 0);
        });
    });

    describe('toggleDeviceOrientation' , () => {
        it('should lock and unlock' , () => {
            //arrange
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape'})) as any;
            ScreenOrientation.unlock = jest.fn();
            ScreenOrientation.lock = jest.fn();
            //act
            playerPage.toggleDeviceOrientation();
            //assert
            // expect(ScreenOrientation.unlock).toHaveBeenCalled();
            // expect(ScreenOrientation.lock).toHaveBeenCalledWith('PORTRAIT');
        });

        it('should lock and unlock' , () =>{
            //arrange
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'landscape'})) as any;
            ScreenOrientation.unlock = jest.fn();
            ScreenOrientation.lock = jest.fn();
            //act
            playerPage.toggleDeviceOrientation();
            //assert
            // expect(ScreenOrientation.unlock).toHaveBeenCalled();
            // expect(ScreenOrientation.lock).toHaveBeenCalledWith('LANDSCAPE');
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe backButtonSubscription', () => {
            // arrange
            StatusBar.show = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of("Orientation"));
            ScreenOrientation.unlock = jest.fn();
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
            expect(StatusBar.show).toHaveBeenCalled();
            expect( ScreenOrientation.unlock).toHaveBeenCalled();
        }, 100);;
        });

        it('should unsubscribe backButtonSubscription', () => {
            // arrange
            StatusBar.show = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of("Landscape"));
            ScreenOrientation.unlock = jest.fn();
            playerPage['events'] = undefined as any;
            playerPage['backButtonSubscription'] = undefined as any;
            window.removeEventListener = jest.fn((_, fn) => fn(() => {})) as any
            // act
            playerPage.ionViewWillLeave();
            // assert
            setTimeout(() => {
            // expect(playerPage['events'].unsubscribe).toHaveBeenCalled();
            // expect(playerPage['backButtonSubscription'].unsubscribe).toHaveBeenCalled();
            expect(StatusBar.show).toHaveBeenCalled();
            expect( ScreenOrientation.unlock).toHaveBeenCalled();
        }, 100);;
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

    describe('PlayerEvents', () => {
        it('should sync assessment events with end edata', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid' })) as any;
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
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
            })) as any;
            playerPage.playerEvents(event);

            expect(mockCourseService.syncAssessmentEvents).toHaveBeenCalled();
        });
        it('should exit the player', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
            })) as any;
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        Renderer: true,
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            interact: jest.fn()
                        }
                    }
                }
            }
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            mockPlayerService.deletePlayerSaveState = jest.fn();
            const event = {
                edata: {
                    type: 'EXIT'
                }
            };
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
            })) as any;
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            } as any;
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            } as any;
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
        it('should call the print service NEXT_CONTENT_PLAY', () => {
            // mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            } as any;
            const event = {
                edata: {
                    type: 'NEXT_CONTENT_PLAY'
                }
            };
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uiid: 'id'})) as any
            jest.spyOn(playerPage, 'playNextContent').mockImplementation()
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            mockLocation.back = jest.fn();
            jest.spyOn(SunbirdSdk, 'instance', 'get').mockReturnValue({
                telemetryService: {
                    saveTelemetry(request: string): Observable<boolean> {
                        // for success
                        return of(true);
                    }
                } as Partial<TelemetryService> as TelemetryService
            } as Partial<SunbirdSdk> as SunbirdSdk);
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT, {
                    content: { id: 1, title: 'Next Content' },
                    course: { id: 1, name: 'Test Course' }
                  });
                // done();
            }, 0);
        });
        it('should call the download service to download the pdf for catch part(user-permission-denied)', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            } as any;
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage['content'] = {
                contentData: {
                    downloadUrl: 'https://'
                }
            }as any;
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            const event = {
                edata: {
                    type: 'compatibility-error'
                }
            };
            global['window'].cordova.plugins.InAppUpdateManager.checkForImmediateUpdate = jest.fn((fn, fn1) => {fn({ }), fn1({})});
            playerPage.playerEvents(event);
            setTimeout(() => {
                expect(global['window'].cordova.plugins.InAppUpdateManager.checkForImmediateUpdate).toHaveBeenCalled();
            }, 50);
        });
        it('should handle the exdata event', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
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
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            const event = {
                edata: {
                    type: 'DEVICE_ROTATION_CLICKED'
                }
            };
            ScreenOrientation.orientation = jest.fn(() => Promise.resolve({type: 'portrait'})) as any
            playerPage.playerEvents(event);

        });

        it('should handle if no event edata type', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            const event = {
                edata: {
                    type: ''
                }
            };
            // act
            playerPage.playerEvents(event);

        });
        it('should handle if no event edata, with details type exit', () => {
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ uid: 'sample-uid', handle: '', profileType: ProfileType.ADMIN, source: ProfileSource.LOCAL }));
            playerPage.config = {
                metadata: {
                    mimeType: 'application/vnd.sunbird.questionset'
                }
            }
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
            })) as any;
            playerPage.previewElement = {
                nativeElement: {
                    contentWindow: {
                        Renderer: true,
                        EkstepRendererAPI: {
                            getCurrentStageId: jest.fn()
                        },
                        TelemetryService: {
                            interact: jest.fn()
                        }
                    }
                }
            }
            playerPage.isExitPopupShown = false
            const event = {
                detail: {edata: { type: "EXIT"}}
            };
            mockPlayerService.deletePlayerSaveState = jest.fn()
            // act
            playerPage.playerEvents(event);

        });
    });

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
            }as any
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

    describe('getNewPlayerConfiguration', () => {
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
            mockContentService.getContentDetails = jest.fn(() => throwError({})) as any
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
            mockContentService.getContentDetails = jest.fn(() => of({contentData: {instructions: 'instruct', outcomeDeclaration: 'declare'}})) as any
            playerPage.getNewPlayerConfiguration();
            setTimeout(() =>{
            expect(mockContentService.getQuestionSetRead).toHaveBeenCalled();
            } , 0)
        });
    })

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

    describe('getNextContent', () => {
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
    })

    describe('playNextContent', () => {
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
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            mockLocation.back = jest.fn();
            playerPage.playNextContent();
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT , {
                    content: playerPage.nextContentToBePlayed,
                    course : {}
                });
                expect(mockLocation.back).toHaveBeenCalled();
            }, 0);
        });
    })

    xdescribe('onContentNotFound', () => {
        it('should check Content on NotFound', (done) => {
            // arrange
            const info: Array<HierarchyInfo> = [{identifier: 'abc',
                contentType: '',
                primaryCategory: ''}];
            const content = {identifier:'', info};
            window.setTimeout = jest.fn((fn) => 
                fn(), 1000) as any;
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            // act
            playerPage.onContentNotFound('', info);
            // asert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT, {
                    content,
                    course: playerPage.course
                });
                done()       
            }, 0);
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
                            exit: jest.fn(),
                            interact: jest.fn()
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = true;
            mockAlertCtrl.create = jest.fn(() => ({
                present: jest.fn(() => Promise.resolve())
            })) as any
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn()
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
                            exit: jest.fn(() => Promise.reject({})),
                            interact: jest.fn()
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = false;
            playerPage['navigateBackToTrackableCollection'] = true;
            mockAlertCtrl.create = jest.fn(() => ({
                present: jest.fn(() => Promise.resolve())
            })) as any
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
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
                            exit: jest.fn(() => Promise.reject({})),
                            interact: jest.fn()
                        }
                    }
                }
            }
            playerPage['navigateBackToContentDetails'] = false;
            playerPage['navigateBackToTrackableCollection'] = false;
            mockAlertCtrl.create = jest.fn(() => ({
                present: jest.fn(() => Promise.resolve())
            })) as any
            mockAppGlobalService.getSelectedUser = jest.fn(() => Promise.resolve())
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
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

    describe('showConfirm' , () => {
        it('should be called when player type is not sunbird old player', () =>{
            playerPage.playerType = 'sunbird-pdf-player';
            playerPage.previewElement.nativeElement = {
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
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
            })) as any;
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            playerPage.handleNavBackButton();
            playerPage.showConfirm();
            setTimeout(() =>{
                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'CONFIRM');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTENT_PLAYER_EXIT_PERMISSION');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'CANCEL');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'OKAY');
            }, 0)
        })

        it('should be called when player type is  sunbird old player', () =>{
            playerPage.playerType = 'sunbird-old-player';
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
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
            mockEvents.publish = jest.fn(() => Promise.resolve()) as any
            playerPage.showConfirm();
            setTimeout(() =>{
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'CONFIRM');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTENT_PLAYER_EXIT_PERMISSION');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'CANCEL');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'OKAY');
            }, 0)
        })

        it('should be called when player type is  sunbird old player and exit app, if renderer is false', () =>{
            playerPage.playerType = 'sunbird-old-player';
            const presentFn = jest.fn(() => Promise.resolve())
            mockAlertCtrl.create = jest.fn(() => Promise.resolve({
                present: presentFn,
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
            }, 0)
        })
    })

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
                identifier: undefined,
                batchId: undefined,
                courseId: undefined
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
            mockCourseService.updateContentState = jest.fn(() => of(true))
            window.setTimeout = jest.fn((fn) => {
                fn()
            }, 1000) as any;
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
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
            FileOpener.open = jest.fn(() => Promise.resolve())
            mockLocation.back = jest.fn();
            //act
            playerPage.openPDF("https://sample/openPdfUrl");
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                // expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalledWith(
                //     Environment.PLAYER,
                //     TelemetryErrorCode.ERR_DOWNLOAD_FAILED,
                //     ErrorType.SYSTEM,
                //     PageId.PLAYER,
                //     JSON.stringify('e')
                // );
                expect(mockCourseService.updateContentState).toHaveBeenCalledWith(updateContentStateRequest);
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
                present: jest.fn(() => Promise.resolve()),
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
            FileOpener.open = jest.fn(() => Promise.resolve())
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
                present: jest.fn(() => Promise.resolve()),
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
            FileOpener.open = jest.fn(() => Promise.resolve())
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
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())   
            }));
            mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            const mockDownload = jest.fn(() => Promise.reject({
            }));
            FileOpener.open = jest.fn(() => Promise.reject())
            mockTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            }) as any;
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
            mockTelemetryService.saveTelemetry = jest.fn(() => of());
            // act
            playerPage.playerTelemetryEvents(event);
            // assert
        })
    })
});
