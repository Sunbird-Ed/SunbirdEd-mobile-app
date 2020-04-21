import {ContentActionsComponent} from '@app/app/components';
import {AuthService, ContentService} from 'sunbird-sdk';
import {Events, NavParams, Platform, PopoverController, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {CommonUtilService, Environment, InteractSubtype, InteractType, TelemetryGeneratorService} from '@app/services';
import {FileSizePipe} from '@app/pipes/file-size/file-size';
import {of} from 'rxjs';

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
            mockNavParams as NavParams,
            mockToastCtrl as ToastController,
            mockAuthService as AuthService,
            mockEvents as Events,
            mockTranslateService as TranslateService,
            mockPlatform as Platform,
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

    describe('constructor ', () => {
        it('', () => {
            // act
            subscribeWithPriorityCallback();
            // assert
            expect(mockBackBtnFunc.unsubscribe).toBeCalled();
            expect(mockPopoverCtrl.dismiss).toBeCalled();
        });
    });

    describe('getUserId ', () => {
        it('should cover else part if pageId or userId is undefined', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined));
            contentActionsComponent.pageName = undefined;
            // act
            contentActionsComponent.getUserId();
            // assert
            expect(contentActionsComponent.showFlagMenu).toBe(true);
        });

        it('should fetchUserId when called up if session is not available sets user id to empty', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({
                userToken: 'sample_userToken'
            }));
            contentActionsComponent.pageName = 'course';
            // act
            contentActionsComponent.getUserId();
            // assert
            expect(contentActionsComponent.userId).toBe('sample_userToken');
        });
    });

    it('should generate content_delete request body', () => {
        // arrange
        // act
        contentActionsComponent.getDeleteRequestBody();
        // assert
    });

    it('should handle telemetry Object and generate Interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockPopoverCtrl.dismiss = jest.fn(() => Promise.resolve({unenroll: true}));
        // act
        contentActionsComponent.unenroll();
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
    });

    it('should close popup when switch case value is 1', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        contentActionsComponent.close(1);
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should display popup when switch case value is 0', (done) => {
        // arrange
        mockCommonUtilService.translateMessage = jest.fn();
        mockFileSizePipe.transform = jest.fn();
        const presentFn = jest.fn(() => Promise.resolve());
        jest.spyOn(contentActionsComponent, 'deleteContent').mockImplementation();

        mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))

        }) as any);
        // act
        contentActionsComponent.close(0);
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.create).toHaveBeenCalled();
            expect(presentFn).toHaveBeenCalled();
            expect(contentActionsComponent.deleteContent).toHaveBeenCalled();
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
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false } }))

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

});
