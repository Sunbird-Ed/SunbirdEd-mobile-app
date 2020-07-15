import { of } from 'rxjs';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ContentService, StorageService, Content, ContentData, DeviceInfo, ContentExportResponse, ContentExportRequest } from 'sunbird-sdk';
import { ContentShareHandlerService, CommonUtilService, TelemetryGeneratorService } from '../../services';
import { AppVersion } from '@ionic-native/app-version/ngx';
describe('ContentShareHandlerService', () => {
    let contentShareHandlerService: ContentShareHandlerService;
    const mockContentService: Partial<ContentService> = {
        exportContent: jest.fn(() => of({ exportedFilePath: 'sample_path'} as any))
    };
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
    const mockAppVersion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app'))
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
        mockAppVersion as AppVersion
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(contentShareHandlerService).toBeTruthy();
    });

    describe('exportContent()', () => {
        it('should export the content', (done) => {
            // arrange
            const shareParams = {
                byFile: true
            };
            const content = {
                identifier: 'id',
                contentData: {
                    contentType: 'contentType',
                    pkgVersion: '1',
                    name : 'Sample_name'
                } as ContentData,
                contentType: 'contentType',
            } as Content;
            // act
            contentShareHandlerService.exportContent({
                destinationFolder: 'destination_folder'
            } as any, shareParams, content);
            // assert
            setTimeout(() => {
                expect(mockSocialSharing.share).toHaveBeenCalled();
                done();
            }, 0);

        });

        it('should show FILE_SAVED TOAST while saving the content', (done) => {
            // arrange
            const shareParams = {
                saveFile: true
            };
            const content = {
                identifier: 'id',
                contentData: {
                    contentType: 'contentType',
                    pkgVersion: '1',
                    name : 'Sample_name'
                } as ContentData,
                contentType: 'contentType',
            } as Content;
            // act
            contentShareHandlerService.exportContent({
                destinationFolder: 'destination_folder'
            } as any, shareParams, content);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FILE_SAVED', '', 'green-toast');
                done();
            }, 0);

        });
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

    it('should fetch roo content if heirararchyinfo is there', (done) => {
        // arrange
        contentShareHandlerService.exportContent = jest.fn();
        const shareParams = {
            byFile: true
        };
        const content = {
            identifier: 'id',
            contentData: {
                contentType: 'contentType',
                pkgVersion: '1',
                name : 'Sample_name'
            } as ContentData,
            contentType: 'contentType',
            hierarchyInfo: [{identifier: 'id1'}, {identifier: 'id2'}] as any
        } as Content;
        const contentResp = {
            identifier: 'id',
            contentData: {
                contentType: 'contentType',
                pkgVersion: '1',
                name : 'Sample_name'
            } as ContentData,
            contentType: 'contentType',
        } as Content;
        mockContentService.getContentDetails = jest.fn(() => of(contentResp as any));
        // act
        contentShareHandlerService.shareContent(shareParams, content as Content);
        // assert
        // expect(mockContentService.getContentDetails).toBeCalled();
        setTimeout(() => {
            expect(contentShareHandlerService.exportContent).toBeCalled();
            done();
        }, 0);
    });

    it('should share file', () => {
        // arrange
        contentShareHandlerService.exportContent = jest.fn();
        const shareParams = {
            byFile: true
        };
        const content = {
            identifier: 'id',
            contentData: {
                contentType: 'contentType',
                pkgVersion: '1'
            } as ContentData,
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
        const content = {
            identifier: 'id',
            contentData: {
                contentType: 'contentType',
                pkgVersion: '1'
            } as ContentData,
            contentType: 'contentType',
        };
        // act
        contentShareHandlerService.shareContent(shareParams, content as Content);
        // assert
        expect(contentShareHandlerService.exportContent).toBeCalled();
    });

    it('should return expected playstire URL without UTM', () => {
        // arrange
        // act
        // assert
        expect( contentShareHandlerService.getPackageNameWithUTM(false)).resolves.toEqual(
            'https://play.google.com/store/apps/details?id=org.sunbird.app&hl=en_IN'
        );
    });

    it('should return expected pageID', () => {
        // arrange
        // act
        // assert
        expect( contentShareHandlerService['getPageId']('Course')).toEqual('course-detail');
        expect( contentShareHandlerService['getPageId']('TextBook')).toEqual('collection-detail');
        expect( contentShareHandlerService['getPageId']('Collection')).toEqual('collection-detail');
    });

});
