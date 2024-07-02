import {ContentActionsComponent} from '../../../app/components';
import {AuthService, ContentDeleteStatus, ContentService} from '@project-sunbird/sunbird-sdk';
import {NavParams, Platform, PopoverController, ToastController} from '@ionic/angular';
import {Events} from '../../../util/events';
import {TranslateService} from '@ngx-translate/core';
import {CommonUtilService, Environment, InteractSubtype, InteractType, TelemetryGeneratorService} from '../../../services';
import {FileSizePipe} from '../../../pipes/file-size/file-size';
import {of, throwError} from 'rxjs';
import { PageId } from '../../../services';

describe('ContentActionsComponent', () => {
    let contentActionsComponent: ContentActionsComponent;
    const mockContentService: Partial<ContentService> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'pageName':
                    value = 'course';
                    break;
                case 'isChild':
                    value = true;
                    break;
                case 'content':
                    value = {
                        identifier: 'doId_1234',
                        type: 'resource',
                        pkgVersion: '2'
                    };
                    break;
                case 'objRollup':
                    value = [
                        {
                            l1: 'samplel1',
                            l2: 'samplel2'
                        }
                    ];
                    break;
                case 'corRelationList':
                    value = [{id: 'sampleId', type: 'textbook'}, {id: 'sampleDoid', type: 'unit'}];
            }
            return value;
        })
    };
    const mockToastCtrl: Partial<ToastController> = {};
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({
            access_token: 'sample_access_token',
            refresh_token: 'sample_refresh_token',
        }))
    };
    const mockEvents: Partial<Events> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockPlatform: Partial<Platform> = {};
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    beforeAll(() => {
        contentActionsComponent = new ContentActionsComponent(
            mockContentService as ContentService,
            mockAuthService as AuthService,
            mockNavParams as NavParams,
            mockToastCtrl as ToastController,
            mockEvents as Events,
            mockTranslateService as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFileSizePipe as FileSizePipe,
            mockPopoverCtrl as PopoverController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of contentActionsComponent page', () => {
        // arrange
        expect(contentActionsComponent).toBeTruthy();
    });

    describe('getUserId ', () => {
        it('should cover else part if pageId or userId is undefined', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined));
            contentActionsComponent.pageName = undefined;
            // act
            contentActionsComponent.getUserId();
            // assert
            setTimeout(() => {
                expect(contentActionsComponent.showFlagMenu).toBe(true);
                done();
            }, 0);
        });

        it('should fetchUserId when called up if session is not available sets user id to empty', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({
                userToken: 'sample_userToken'
            }));
            contentActionsComponent.pageName = 'course';
            // act
            contentActionsComponent.getUserId();
            // assert
            setTimeout(() => {
                expect(contentActionsComponent.userId).toBe('sample_userToken');
                done();
            }, 0);
        });
    });

    it('should generate content_delete request body', () => {
        // arrange
        // act
        contentActionsComponent.getDeleteRequestBody();
        // assert
    });

    it('should handle telemetry Object and generate Interact telemetry', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve({unenroll: true}));
        // act
        contentActionsComponent.unenroll();
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.UNENROL_CLICKED,
                Environment.HOME,
                'course',
                {
                    id: 'doId_1234',
                    type: undefined,
                    version: '2'
                },
                undefined,
                contentActionsComponent.objRollup,
                contentActionsComponent.corRelationList);
            done();
        }, 0);
    });

    it('should close popup when switch case value is 1', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        contentActionsComponent.close(1);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            done();
        }, 0);
    });
    it('should show toastCtrl when showToaster() called upon', () => {
        // arrange
        const presentFn = jest.fn(() => Promise.resolve());
        mockToastCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn
        })) as any;
        mockCommonUtilService.addPopupAccessibility = jest.fn(() => ({
            present: presentFn
        }));
        // act
        contentActionsComponent.showToaster('CONTENT_DELETE_FAILED');
        // assert
        expect(mockToastCtrl.create).toHaveBeenCalled();
    });

    it('should call translateService to fetch the message', () => {
        // arrange
        mockTranslateService.get = jest.fn(() => of({CONTENT_DELETE_FAILED: 'content-deleted'}));
        // act
        contentActionsComponent.getMessageByConstant('CONTENT_DELETE_FAILED');
        // assert
        expect(mockTranslateService.get).toHaveBeenCalledWith('CONTENT_DELETE_FAILED');
    });

    describe('deleteContent', () => {
        it('should generate telemetry call loader, contentService', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockContentService.deleteContent = jest.fn(() => of([{
                identifier: 'doId_1234',
                status: ContentDeleteStatus.NOT_FOUND
            }]));
            jest.spyOn(contentActionsComponent, 'showToaster').mockImplementation();
            jest.spyOn(contentActionsComponent, 'getMessageByConstant').mockImplementation();
            // act
            contentActionsComponent.deleteContent();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.DELETE_CLICKED,
                Environment.HOME,
                contentActionsComponent.pageName,
                {
                    id: 'doId_1234',
                    type: undefined,
                    version: '2'
                },
                undefined,
                contentActionsComponent.objRollup,
                contentActionsComponent.corRelationList);
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockContentService.deleteContent).toHaveBeenCalledWith(contentActionsComponent.getDeleteRequestBody());
                done();
            }, 0);


        });

        it('should generate telemetry, call loader and contentService where content deleted successfully', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPopoverCtrl.dismiss = jest.fn();
            mockEvents.publish = jest.fn();
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockContentService.deleteContent = jest.fn(() => of([{
                identifier: 'doId_1234',
                status: ContentDeleteStatus.DELETED_SUCCESSFULLY
            }]));
            jest.spyOn(contentActionsComponent, 'showToaster').mockImplementation();
            jest.spyOn(contentActionsComponent, 'getMessageByConstant').mockImplementation();
            // act
            contentActionsComponent.deleteContent();
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {update: true});
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({isDeleted: true});
                done();
            }, 0);

        });

        it('should generate error message if delete is failed', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockPopoverCtrl.dismiss = jest.fn();
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockContentService.deleteContent = jest.fn(() => throwError({ error: 'not found' }));
            jest.spyOn(contentActionsComponent, 'showToaster').mockImplementation();
            jest.spyOn(contentActionsComponent, 'getMessageByConstant').mockImplementation();
            // act
            contentActionsComponent.deleteContent();
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should display popup when switch case value is 0', (done) => {
        // arrange
        mockCommonUtilService.translateMessage = jest.fn();
        mockFileSizePipe.transform = jest.fn();
        const presentFn = jest.fn(() => Promise.resolve());
        jest.spyOn(contentActionsComponent, 'deleteContent').mockImplementation();
        mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: true, btn:''}}))

        }) as any);
        mockCommonUtilService.showToast = jest.fn();
        // act
        contentActionsComponent.close(0);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(presentFn).toHaveBeenCalled();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('REMOVE_FROM_DEVICE');
            done();
        }, 0);

    });
    it('should display popup when switch case value is 0', (done) => {
        // arrange
        mockCommonUtilService.translateMessage = jest.fn();
        mockFileSizePipe.transform = jest.fn();
        const presentFn = jest.fn(() => Promise.resolve());
        jest.spyOn(contentActionsComponent, 'deleteContent').mockImplementation();
        mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: true, btn: {isInternetNeededMessage: 'network'}}}))

        }) as any);
        // act
        contentActionsComponent.close(0);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            // expect(presentFn).toHaveBeenCalled();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('REMOVE_FROM_DEVICE');
            done();
        }, 0);

    });

    it('should display popup when switch case value is 0, if network available on dismiss', (done) => {
        // arrange
        mockCommonUtilService.translateMessage = jest.fn();
        mockFileSizePipe.transform = jest.fn();
        const presentFn = jest.fn(() => Promise.resolve());
        jest.spyOn(contentActionsComponent, 'deleteContent').mockImplementation();
        mockCommonUtilService.networkInfo = {isNetworkAvailable: true}
        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: true, btn: {isInternetNeededMessage: 'network'}}}))

        }) as any);
        // act
        contentActionsComponent.close(0);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('REMOVE_FROM_DEVICE');
            done();
        }, 0);

    });

    it('should display popup when switch case value is 0 and canDelete from data is false', (done) => {
        // arrange
        mockCommonUtilService.translateMessage = jest.fn();
        mockFileSizePipe.transform = jest.fn();
        const presentFn = jest.fn(() => Promise.resolve());
        jest.spyOn(contentActionsComponent, 'deleteContent').mockImplementation();

        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: false}}))

        }) as any);
        // act
        contentActionsComponent.close(0);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(presentFn).toHaveBeenCalled();
            expect(contentActionsComponent.deleteContent).not.toHaveBeenCalled();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('REMOVE_FROM_DEVICE');
            done();
        }, 0);

    });

    describe('download', () => {
        it('should dismiss the popup', () => {
            // arrange
            // act
            contentActionsComponent.download();
            // assert
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ download: true });
        });
    });

    describe('share', () => {
        it('should dismiss the popup', () => {
            // arrange
            // act
            contentActionsComponent.share();
            // assert
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalledWith({ share: true });
        });
    });

    describe('syncCourseProgress', () => {
        it('should generate telemetry on sync progress and dismiss popover', () => {
            // arramge
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            contentActionsComponent.syncCourseProgress()
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled()
        })
    })
});

describe('ContentActionsComponent', () => {
    let contentActionsComponent: ContentActionsComponent;
    const mockContentService: Partial<ContentService> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'pageName':
                    value = PageId.CHAPTER_DETAILS;
                    break;
                case 'isChild':
                    value = false;
                    break;
                case 'content':
                    value = undefined;
                    break;
                case 'objRollup':
                    value = [
                        {
                            l1: 'samplel1',
                            l2: 'samplel2'
                        }
                    ];
                    break;
                case 'corRelationList':
                    value = [{id: 'sampleId', type: 'textbook'}, {id: 'sampleDoid', type: 'unit'}];
            }
            return value;
        })
    };
    const mockToastCtrl: Partial<ToastController> = {};
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of({
            access_token: 'sample_access_token',
            refresh_token: 'sample_refresh_token',
        }))
    };
    const mockEvents: Partial<Events> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockPlatform: Partial<Platform> = {};
    let subscribeWithPriorityCallback;
    const mockBackBtnFunc = {unsubscribe: jest.fn()};
    const subscribeWithPriorityData = jest.fn((val, callback) => {
        subscribeWithPriorityCallback = callback;
        return mockBackBtnFunc;
    });
    mockPlatform.backButton = {
        subscribeWithPriority: subscribeWithPriorityData,
    } as any;
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    beforeAll(() => {
        contentActionsComponent = new ContentActionsComponent(
            mockContentService as ContentService,
            mockAuthService as AuthService,
            mockNavParams as NavParams,
            mockToastCtrl as ToastController,
            mockEvents as Events,
            mockTranslateService as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFileSizePipe as FileSizePipe,
            mockPopoverCtrl as PopoverController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of contentActionsComponent page', () => {
        // arrange
        expect(contentActionsComponent).toBeTruthy();
    });

});