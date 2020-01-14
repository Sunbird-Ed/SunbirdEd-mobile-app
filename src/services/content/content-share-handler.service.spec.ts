import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ContentService, StorageService } from 'sunbird-sdk';
import { ContentShareHandlerService, CommonUtilService, UtilityService, TelemetryGeneratorService } from '../../services';
import { SbSharePopupComponent } from '../../app/components/popups/sb-share-popup/sb-share-popup.component';
describe('ContentShareHandlerService', () => {
    let contentShareHandlerService: ContentShareHandlerService;
    const mockContentService: Partial<ContentService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSocialSharing: Partial<SocialSharing> = {};
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

});
