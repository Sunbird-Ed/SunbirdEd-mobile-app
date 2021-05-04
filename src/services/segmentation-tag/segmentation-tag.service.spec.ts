import { AuthService, Profile, ProfileService, SegmentationService } from '@project-sunbird/sunbird-sdk';
import { of } from 'rxjs';
import { AppGlobalService } from '../app-global-service.service';
import { FormAndFrameworkUtilService } from '../formandframeworkutil.service';
import { SegmentationTagService } from './segmentation-tag.service';
import { NotificationService } from '@app/services/notification.service';
import { cmdList, validCmdList } from './segmentation-tag.service.spec.data';

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
            mockNotificationSrc as NotificationService,
            mockAppGlobalService as AppGlobalService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService
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
});
