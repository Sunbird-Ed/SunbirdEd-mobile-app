import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ContentService, StorageService, Content } from 'sunbird-sdk';
import { ContentShareHandlerService, CommonUtilService, UtilityService, TelemetryGeneratorService } from '../../services';
import { SbSharePopupComponent } from '../../app/components/popups/sb-share-popup/sb-share-popup.component';
describe('ContentShareHandlerService', () => {
    let contentShareHandlerService: ContentShareHandlerService;
    const mockContentService: Partial<ContentService> = {};
    const mockStorageService: Partial<StorageService> = {
        getStorageDestinationDirectoryPath: jest.fn(() => 'dirpath')
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSocialSharing: Partial<SocialSharing> = {
        share: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('baseurl'))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn()
    };

    beforeAll(() => {
        contentShareHandlerService = new ContentShareHandlerService(
        mockContentService as ContentService,
        mockStorageService as StorageService,
        mockCommonUtilService as CommonUtilService,
        mockSocialSharing as SocialSharing,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockUtilityService as UtilityService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(contentShareHandlerService).toBeTruthy();
    });

    // it('should share link', () => {
    //     // arrange
    //     contentShareHandlerService.exportContent = jest.fn();
    //     contentShareHandlerService.generateShareInteractEvents = jest.fn();
    //     const shareParams = {
    //         byLink: true,
    //         link: 'link'
    //     };
    //     const content: Partial<Content> = {
    //         identifier: 'id',
    //         contentType: 'contentType',
    //     };
    //     // act
    //     contentShareHandlerService.shareContent(shareParams, content as Content);
    //     // assert
    //     expect(contentShareHandlerService.exportContent).toBeCalled();

    // });


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
