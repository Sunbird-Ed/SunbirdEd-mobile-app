import {
    ContentShareHandlerService,
    UtilityService,
    TelemetryGeneratorService,
    CommonUtilService,
    AndroidPermissionsService
} from '../../../../services';
import { SbSharePopupComponent } from './sb-share-popup.component';
import {PopoverController, Platform, NavParams, ToastController} from '@ionic/angular';
import {
    Environment,
    ImpressionType,
    ID,
    PageId,
} from '@app/services/telemetry-constants';
import { ContentType, MimeType, ShareUrl } from '../../../../app/app.constant';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Router} from '@angular/router';
import {of} from 'rxjs';
import {AndroidPermission} from '@app/services/android-permissions/android-permission';

describe('SbSharePopupComponent', () => {
    let sbSharePopupComponent: SbSharePopupComponent;
    const mockPopoverCtrl: Partial<PopoverController> = {
        dismiss: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn()),
    } as any;
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {
        shareContent: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('baseurl'))
    };
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        identifier: 'do_123',
                        contentData: {
                            contentType: 'Resource',
                            pkgVersion: '1'
                        }
                    } as any;
                    break;
                case 'pageId':
                    value = 'content-detail';
                    break;
                case 'objRollup':
                    value = { l1: 'do_1', l2: 'do_12' };
                    break;
                case 'shareItemType':
                    value = 'root-content';
                    break;
            }
            return value;
        })
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(),
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockPermissionService: Partial<AndroidPermissionsService> = {
        checkPermissions: jest.fn()
    };
    const mockToastController: Partial<ToastController> = {};
    const mockRouter: Partial<Router> = {};
    beforeAll(() => {
        sbSharePopupComponent = new SbSharePopupComponent(
            mockPopoverCtrl as PopoverController,
            mockPlatform as Platform,
            mockContentShareHandler as ContentShareHandlerService,
            mockUtilityService as UtilityService,
            mockNavParams as NavParams,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockCommonUtilService as CommonUtilService,
            mockPermissionService as AndroidPermissionsService,
            mockToastController as ToastController,
            mockRouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(sbSharePopupComponent).toBeTruthy();
    });

    it('should generate telemetry on ngOninit', () => {
        // arrange
        const unsubscribeFn = jest.fn();
        sbSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        sbSharePopupComponent.ngOnInit();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith('root-content',
            '',
            Environment.HOME,
            'content-detail',
            { id: 'do_123', type: 'Resource', version: '1' },
            undefined,
            { l1: 'do_1', l2: 'do_12' },
            undefined,
            ID.SHARE);
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW, '',
            PageId.SHARE_CONTENT_POPUP,
            Environment.HOME,
            'do_123',
            'Resource',
            '1',
            { l1: 'do_1', l2: 'do_12' },
            undefined);
    });


    it('should unsubscribe back button on ngondistroy', () => {
        // arrange
        // jest.spyOn(sbSharePopupComponent, 'closePopover').mockImplementation();
        const unsubscribeFn = jest.fn();
        sbSharePopupComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        } as any;
        // act
        sbSharePopupComponent.ngOnDestroy();
        // assert
        expect(unsubscribeFn).toHaveBeenCalled();
    });

    it('should call sharecontent on saveFile', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbSharePopupComponent.closePopover();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should call sharecontent on shareLink', () => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        // act
        sbSharePopupComponent.shareLink();
        // assert
        expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
        expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
    });

    it('should call sharecontent on shareFile', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        mockPermissionService.checkPermissions = jest.fn(() => of({ [AndroidPermission.WRITE_EXTERNAL_STORAGE]: {hasPermission: true}}));
        // act
        sbSharePopupComponent.shareFile();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call sharecontent on saveFile', (done) => {
        // arrange
        mockPopoverCtrl.dismiss = jest.fn();
        mockPermissionService.checkPermissions = jest.fn(() => of({ [AndroidPermission.WRITE_EXTERNAL_STORAGE]: {hasPermission: true}}));
        // act
        sbSharePopupComponent.saveFile();
        // assert
        setTimeout(() => {
            expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
            expect(mockContentShareHandler.shareContent).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('getContentEndPoint()', () => {

        it('should return course endpoint', () => {
            // arrange
            // act
            // assert
            expect(sbSharePopupComponent.getContentEndPoint({ contentType: ContentType.COURSE } as any)).toEqual(ShareUrl.COURSE);
        });

        it('should return collection endpoint', () => {
            // arrange
            // act
            // assert
            expect(sbSharePopupComponent.getContentEndPoint({ mimeType: MimeType.COLLECTION,
                contentType: ContentType.TEXTBOOK } as any)).toEqual(ShareUrl.COLLECTION);
        });

        it('should return content endpoint', () => {
            // arrange
            // act
            // assert
            expect(sbSharePopupComponent.getContentEndPoint(
                { contentType: ContentType.RESOURCE } as any)).toEqual(ShareUrl.CONTENT);
        });
    });
});
