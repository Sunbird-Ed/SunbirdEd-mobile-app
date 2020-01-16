import { of } from 'rxjs';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ContentService, StorageService, Content, ContentData, DeviceInfo } from 'sunbird-sdk';
import { ContentShareHandlerService, CommonUtilService, UtilityService, TelemetryGeneratorService } from '../../services';
import { SbSharePopupComponent } from '../../app/components/popups/sb-share-popup/sb-share-popup.component';
import { AppVersion } from '@ionic-native/app-version/ngx';
describe('ContentShareHandlerService', () => {
    let contentShareHandlerService: ContentShareHandlerService;
    const mockContentService: Partial<ContentService> = {};
    const mockStorageService: Partial<StorageService> = {
        getStorageDestinationDirectoryPath: jest.fn(() => 'dirpath')
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {
        getDeviceID: jest.fn(() => 'device_id')
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        getAppName: jest.fn(() => Promise.resolve('resolved')),
        translateMessage: jest.fn(() => 'Try this: ')
    };
    const mockSocialSharing: Partial<SocialSharing> = {
        share: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('baseurl'))
    };
    const mockAppVersion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('packageName'))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn()
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    beforeAll(() => {
        contentShareHandlerService = new ContentShareHandlerService(
        mockContentService as ContentService,
        mockStorageService as StorageService,
        mockDeviceInfo as DeviceInfo,
        mockCommonUtilService as CommonUtilService,
        mockSocialSharing as SocialSharing,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockUtilityService as UtilityService,
        mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(contentShareHandlerService).toBeTruthy();
    });

    it('should call export content', (done) => {
        // arrange
        const exportContentRequest = {
            destinationFolder: 'destinationFolder',
            contentIds: ['id1']
        };
        const contentExportResponse = {
            exportedFilePath: 'samplepath'
        };
        const shareParams = {
            byFile: true
        };
        const content: Partial<Content> = {
            identifier: 'id',
            contentType: 'contentType',
        };
        contentShareHandlerService.generateShareInteractEvents = jest.fn();
        mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
        // act
        contentShareHandlerService.exportContent(exportContentRequest, shareParams, content as Content);
        // assert
        setTimeout(() => {
            // expect(mockSocialSharing.share).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('should share link', (done) => {
        // arrange
        contentShareHandlerService.exportContent = jest.fn();
        contentShareHandlerService.generateShareInteractEvents = jest.fn();
        const shareParams = {
            byLink: true,
            link: 'link'
        };
        const contentData: Partial<ContentData> = {
            contentType: 'dummyType'
        };
        const content: Partial<Content> = {
            identifier: 'id',
            contentType: 'contentType',
            contentData: contentData as ContentData
        };
        // act
        contentShareHandlerService.shareContent(shareParams, content as Content);
        // assert
        setTimeout(() => {
            expect(mockSocialSharing.share).toHaveBeenCalled();
            done();
        }, 0);
    });


    it('should share file', () => {
        // arrange
        contentShareHandlerService.exportContent = jest.fn();
        const shareParams = {
            byFile: true
        };
        const content: Partial<Content> = {
            identifier: 'id',
            contentType: 'contentType',
        };
        // act
        contentShareHandlerService.shareContent(shareParams, content as Content);
        // assert
        expect(contentShareHandlerService.exportContent).toBeCalled();
    });

    it('should save file on device', () => {
        // arrange
        contentShareHandlerService.exportContent = jest.fn();
        const shareParams = {
            saveFile: true
        };
        const content: Partial<Content> = {
            identifier: 'id',
            contentType: 'contentType',
        };
        // act
        contentShareHandlerService.shareContent(shareParams, content as Content);
        // assert
        expect(contentShareHandlerService.exportContent).toBeCalled();
    });

});
