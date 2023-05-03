import {AuthService, Profile, ProfileService, SegmentationService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of} from 'rxjs';
import {AppGlobalService} from '../../services';
import {FormAndFrameworkUtilService} from '../../services';
import {SegmentationTagService} from './segmentation-tag.service';
import {NotificationService} from '../../services/notification.service';
import {cmdList, validCmdList} from './segmentation-tag.service.spec.data';
import {SplaschreenDeeplinkActionHandlerDelegate} from '../sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {DebuggingService} from '@project-sunbird/sunbird-sdk';
import {Events} from '../../util/events';


describe('SegmentationTagService ', () => {
    let segmentationTagService: SegmentationTagService;

    const mockSegmentationService: Partial<SegmentationService> = {
        getTags: jest.fn(),
        saveTags: jest.fn(() => of(true)),
        getCommand: jest.fn(),
        saveCommandList: jest.fn(() => of(true))
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({uid: 'user_id'} as Profile))
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockNotificationSrc: Partial<NotificationService> = {
        setupLocalNotification: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getSegmentationCommands: jest.fn(() => Promise.resolve(cmdList)),
        getFormFields: jest.fn(() => Promise.resolve())
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('key_value'))
    };
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {
        onAction: jest.fn(() => of(undefined))
    };

    const mockEvent: Partial<Events> = {};
    const mockDebuggingService: Partial<DebuggingService> = {};

    global.window.segmentation = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            restoreTags: jest.fn()
        },
        SBActionCriteriaService: {
            evaluateCriteria: jest.fn(() => validCmdList)
        }
    };

    beforeAll(() => {
        segmentationTagService = new SegmentationTagService(
            mockSegmentationService as SegmentationService,
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockSharedPreferences as SharedPreferences,
            mockDebuggingService as DebuggingService,
            mockNotificationSrc as NotificationService,
            mockAppGlobalService as AppGlobalService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockEvent as Events
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize LogoutHandlerService', () => {
        expect(segmentationTagService).toBeDefined();
    });

    describe('presistTags', () => {
        it('tags and commandlist should be saved in db', (done) => {
            // arrnage
            jest.spyOn(mockSegmentationService, 'saveTags');
            jest.spyOn(mockSegmentationService, 'saveCommandList');
            // act
            segmentationTagService.persistSegmentation();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.saveTags).toBeCalled();
                expect(mockSegmentationService.saveCommandList).toBeCalled();
                done();
            }, 100);
        });
        it('null tags and commandlist should be saved in db', (done) => {
            // arrnage
            jest.spyOn(mockSegmentationService, 'saveTags').mockImplementation(() => of(false));
            jest.spyOn(mockSegmentationService, 'saveCommandList').mockImplementation(() => of(false));
            // act
            segmentationTagService.persistSegmentation();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.saveTags).toBeCalled();
                expect(mockSegmentationService.saveCommandList).toBeCalled();
                done();
            }, 100);
        });
        it('should checkfor profile with no uid', (done) => {
            // arrnage
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            // act
            segmentationTagService.persistSegmentation();
            // assert
            setTimeout(() => {
                done();
            }, 100);
        });
    });

    describe('getPersistedSegmentaion', () => {
        it('get all tags and commands stored in db and and trigger the Local notification command', (done) => {
            // arrnage
            const tagsStored = {
                __tagList: ['UA_English'],
                __tagObj: [{name: 'Tags'}],
                __tagSnapShot: {
                    prifix_: {name: 'Tags'}
                }
            };
            const cmdStored = [
                {
                    cmommandId: 12387182678,
                    controlFunction: "DEBUGGING_MODE",
                    controlFunctionPayload: {traceId: '6745'}
                }
            ];
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({uid: "id"} as Profile))
            jest.spyOn(mockSegmentationService, 'getTags').mockReturnValue(of(JSON.stringify(tagsStored)));
            jest.spyOn(mockSegmentationService, 'getCommand').mockReturnValue(of(JSON.stringify(cmdStored)));
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{code: 'sample-code'}]));
            // act
            segmentationTagService.getPersistedSegmentaion();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.getTags).toBeCalled();
                expect(mockSegmentationService.getCommand).toBeCalled();
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
                expect(mockNotificationSrc.setupLocalNotification).toBeCalled();
                done();
            }, 100);
        });

        it('get all tags and BANNER_CONFIG commands stored in db and and trigger the Local notification command', (done) => {
            // arrnage
            const tagsStored = {
                __tagList: ['UA_English'],
                __tagObj: [{name: 'Tags'}],
                __tagSnapShot: {
                    prifix_: {name: 'Tags'}
                }
            };
            const cmdStored = [
                {
                    cmommandId: 12387152678,
                    controlFunction: "BANNER_CONFIG",
                    controlFunctionPayload: {showBanner: true}
                }
            ];
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({uid: "id"} as Profile))
            jest.spyOn(mockSegmentationService, 'getTags').mockReturnValue(of(JSON.stringify(tagsStored)));
            jest.spyOn(mockSegmentationService, 'getCommand').mockReturnValue(of(JSON.stringify(cmdStored)));
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{code: 'sample-code'}]));
            // act
            segmentationTagService.getPersistedSegmentaion();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.getTags).toBeCalled();
                expect(mockSegmentationService.getCommand).toBeCalled();
                expect(mockFormAndFrameworkUtilService.getFormFields).toHaveBeenCalled();
                expect(mockNotificationSrc.setupLocalNotification).toBeCalled();
                done();
            }, 100);
        });

        it('get all tags and commands stored in db and and trigger the Local notification command for empty response', (done) => {
            // arrnage
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({uid: "id"} as Profile))
            jest.spyOn(mockSegmentationService, 'getTags').mockReturnValue(of(false));
            jest.spyOn(mockSegmentationService, 'getCommand').mockReturnValue(of(false));
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            // act
            segmentationTagService.getPersistedSegmentaion();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.getTags).toBeCalled();
                expect(mockSegmentationService.getCommand).toBeCalled();
                done();
            }, 100);
        });

        it('should set else case for profile without uid', (done) => {
            // arrnage
            mockProfileService.getActiveSessionProfile = jest.fn(() => of())
            // act
            segmentationTagService.getPersistedSegmentaion();
            // assert
            setTimeout(() => {
                done();
            }, 100);
        });
    });

    describe('executeCommand', () => {
        it('should execute Command for DEBUGGING_MODE', () => {
            // arrange
            const validCmdList = [{
                cmommandId: 123871827778,
                controlFunction: "DEBUGGING_MODE",
                controlFunctionPayload: {traceId: '6745'}
            }]
            mockSharedPreferences.putString = jest.fn(() => of())
            mockDebuggingService.enableDebugging = jest.fn(() => of(true));
            mockEvent.publish = jest.fn();
            // act
            segmentationTagService.executeCommand(validCmdList)
            // assert
        })

        it('should execute Command for Banner config', () => {
            // arrange
            const validCmdList = [{
                cmommandId: 123871827978,
                controlFunction: "BANNER_CONFIG",
                controlFunctionPayload: {showBanner: true}
            }]
            mockSharedPreferences.putString = jest.fn(() => of())
            mockDebuggingService.enableDebugging = jest.fn(() => of(true));
            mockEvent.publish = jest.fn();
            // act
            segmentationTagService.executeCommand(validCmdList, false)
            // assert
        })
    })

    describe('handleLocalNotificationTap', () => {
        it('handle actionable local notification', (done) => {
            // arrange
            segmentationTagService.localNotificationId = 14;
            segmentationTagService.exeCommands = [{
                controlFunctionPayload: [{
                    config: [{
                        id: 14
                    }]
                }]
            }];
            // act
            segmentationTagService.handleLocalNotificationTap();
            // assert
            setTimeout(() => {
                expect(mockSplaschreenDeeplinkActionHandlerDelegate.onAction).toHaveBeenCalled();
                expect(segmentationTagService.localNotificationId).toBe(null);
                done();
            }, 0);
        });
    });

    describe('createSegmentTags', () => {
        it('should create SegmentTags', () => {
            // arrange
            const profile = {board:['cbse'], medium:["english"], grade:["class4"]};
            // act
            segmentationTagService.createSegmentTags(profile)
            // assert
        })
    })

    describe('refreshSegmentTags', () => {
        it('should refresh SegmentTags', () => {
            // arrange
            const res = {board:[], medium:[], grade:[], syllabus: ""}
            // act
            segmentationTagService.refreshSegmentTags(res)
            // assert
        })
    })
});