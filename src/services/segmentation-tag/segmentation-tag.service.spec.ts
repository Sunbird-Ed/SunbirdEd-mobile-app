import {AuthService, Profile, ProfileService, SegmentationService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of} from 'rxjs';
import {AppGlobalService} from '@app/services';
import {FormAndFrameworkUtilService} from '@app/services';
import {SegmentationTagService} from './segmentation-tag.service';
import {NotificationService} from '@app/services/notification.service';
import {cmdList, validCmdList} from './segmentation-tag.service.spec.data';
import {SplaschreenDeeplinkActionHandlerDelegate} from '../sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {DebuggingService} from 'sunbird-sdk';
import {Events} from '@app/util/events';


describe('SegmentationTagService ', () => {
    let segmentationTagService: SegmentationTagService;

    const mockSegmentationService: Partial<SegmentationService> = {
        getTags: jest.fn(),
        saveTags: jest.fn(() => of(true)),
        getCommand: jest.fn(),
        saveCommandList: jest.fn(() => of())
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
        it('tags should be saved in db', (done) => {
            // arrnage
            jest.spyOn(mockSegmentationService, 'saveTags');
            // act
            segmentationTagService.persistSegmentation();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.saveTags).toBeCalled();
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
                    cmommandId: 12387182678
                }
            ];
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
    });

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
});
