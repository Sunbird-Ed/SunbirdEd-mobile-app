import { AuthService, Profile, ProfileService, SegmentationService, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { AppGlobalService } from '../app-global-service.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { SegmentationTagService } from './segmentation-tag.service';
import { NotificationService } from '@app/services/notification.service';
import { cmdList, validCmdList } from './segmentation-tag.service.spec.data';
import { SplaschreenDeeplinkActionHandlerDelegate } from '../sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';

describe('SegmentationTagService ', () => {
    let segmentationTagService: SegmentationTagService;

    const mockSegmentationService: Partial<SegmentationService> = {
        getTags: jest.fn(),
        saveTags:jest.fn(() => of(true)),
        getCommand: jest.fn(),
        saveCommandList: jest.fn(() => of())
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({ uid: 'user_id' } as Profile))
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockNotificationSrc: Partial<NotificationService> = {
        setupLocalNotification: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getSegmentationCommands: jest.fn(() => Promise.resolve(cmdList))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('key_value'))
    };
    const mockSplaschreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {
        onAction: jest.fn()
    };

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
            mockNotificationSrc as NotificationService,
            mockAppGlobalService as AppGlobalService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockSplaschreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate
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
        })
    });

    describe('getPersistedSegmentaion', () => {
        it('get all tags and commands stored in db and and trigger the Local notification command', (done) => {
            // arrnage
            const tagsStored = {
                __tagList: ['UA_English'],
                __tagObj: [{ name: 'Tags' }],
                __tagSnapShot: {
                    prifix_: { name: 'Tags' }
                }
            };
            const cmdStored = [
                {
                    cmommandId: 12387182678
                }
            ];
            jest.spyOn(mockSegmentationService, 'getTags').mockReturnValue(of(JSON.stringify(tagsStored)));
            jest.spyOn(mockSegmentationService, 'getCommand').mockReturnValue(of(JSON.stringify(cmdStored)));
            jest.spyOn(segmentationTagService, 'getSegmentCommand');
            // act
            segmentationTagService.getPersistedSegmentaion();
            // assert
            setTimeout(() => {
                expect(mockSegmentationService.getTags).toBeCalled();
                expect(mockSegmentationService.getCommand).toBeCalled();
                expect(mockNotificationSrc.setupLocalNotification).toBeCalled();
                done();
            }, 100);
        });
    });

    describe('handleLocalNotificationTap', () => {
        it('handle actionable local notification', () => {
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
            expect(mockSplaschreenDeeplinkActionHandlerDelegate.onAction).toBeCalled();
            expect(segmentationTagService.localNotificationId).toBe(null);
        });
    });
});
