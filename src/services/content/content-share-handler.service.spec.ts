import { of, throwError } from 'rxjs';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import {
    ContentService, StorageService, Content
} from '@project-sunbird/sunbird-sdk';
import {
    ContentShareHandlerService, CommonUtilService,
    TelemetryGeneratorService
} from '../../services';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import {
    InteractType, InteractSubtype,
    Environment, PageId
} from '../telemetry-constants';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { AppGlobalService } from '../app-global-service.service';
import { Platform } from '@ionic/angular';

describe('ContentShareHandlerService', () => {

    let contentShareHandlerService: ContentShareHandlerService;

    const mockContentService: Partial<ContentService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('app_name'))
    };
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        setNativePopupVisible: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    window.console.error = jest.fn()

    beforeAll(() => {
        contentShareHandlerService = new ContentShareHandlerService(
            mockContentService as ContentService,
            mockStorageService as StorageService,
            mockCommonUtilService as CommonUtilService,
            mockSocialSharing as SocialSharing,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of sbSharePopupComponent', () => {
        expect(contentShareHandlerService).toBeTruthy();
    });

    describe('shareContent', () => {
        it('should go to catch block if throws error', (done) => {
            // arrange
            const shareParams = {
                byFile: true,
                saveFile: false
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                primaryCategory: 'primaryCategory',
                contentData: {
                    contentType: 'contentType',
                    primaryCategory: 'primaryCategory',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() => ('dirpath'));
            mockContentService.exportContent = jest.fn(() => throwError({ error: 'error' }));
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' }, 'content-detail');

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                // expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['do_id'], destinationFolder: 'dirpath', subContentIds: [] }
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SHARE_CONTENT_FAILED');
                done();
            }, 0);
        });

        it('should share content file', (done) => {
            // arrange
            const shareParams = {
                byFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                    primaryCategory: 'primaryCategory',
                }
            };
            mockPlatform.is = jest.fn(platform => platform === "android");
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const contentExportResponse = {
                exportedFilePath: 'samplepath'
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() => ('dirpath'));
            mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_FILE':
                        return 'SHARE_CONTENT_FILE';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            // mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
                PageId.CONTENT_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['do_id'], destinationFolder: 'dirpath', subContentIds: [] }
                );
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_FILE', {
                    app_name: 'app_name',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_ENROLLED');
                expect(mockSocialSharing.share).toHaveBeenCalledWith('SHARE_CONTENT_FILE', '', '' + 'samplepath', '');
                done();
            }, 0);
        });

        it('should share textbook with selected child content', (done) => {
            // arrange
            const shareParams = {
                byFile: true,
                shareFile: false
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                    primaryCategory: 'primaryCategory',
                }
            };
            mockPlatform.is = jest.fn(platform => platform === "ios");
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const contentExportResponse = {
                exportedFilePath: 'samplepath'
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() => ('dirpath'));
            mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_FILE':
                        return 'SHARE_CONTENT_FILE';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            // mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content,
                undefined, ['child_do_id'], [], { l1: 'textbook_do_id' }, PageId.CONTENT_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'textbook_do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'textbook_do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                // expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['textbook_do_id'], destinationFolder: 'undefinedcontent/', subContentIds: ['child_do_id'] }
                );
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_FILE', {
                    app_name: 'app_name',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_ENROLLED');
                expect(mockSocialSharing.share).toHaveBeenCalledWith('SHARE_CONTENT_FILE', '', '' + 'samplepath', '');
                done();
            }, 0);
        });

        it('should share content link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                    primaryCategory: 'primaryCategory',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockPlatform.is = jest.fn(platform => platform === "android")
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
             PageId.CONTENT_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'primaryCategory', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'SHARE_CONTENT_LINK');
                done();
            }, 0);
        });

        it('should share course link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentData: {
                    contentType: CsContentType.COURSE,
                    primaryCategory: 'Course',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockPlatform.is = jest.fn(platform => platform === "ios");
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.COURSE_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: 'Course', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: CsContentType.COURSE, version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content');
                done();
            }, 0);
        });

        it('should share course module link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentData: {
                    contentType: CsContentType.COURSE,
                    primaryCategory: 'Course',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, 'module_do_id', [], [], { l1: 'do_id' },
            PageId.COURSE_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: 'Course', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: CsContentType.COURSE, version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content&moduleId=module_do_id',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'SHARE_CONTENT_LINK');
                done();
            }, 0);
        });

        it('should share textbook link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentData: {
                    contentType: CsContentType.TEXTBOOK,
                    primaryCategory: 'Digital Textbook',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.COLLECTION_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: 'Digital Textbook', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: 'Digital Textbook', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'SHARE_CONTENT_LINK');
                done();
            }, 0);
        });

        it('should share link of content of textbook', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'content_do_id',
                contentData: {
                    contentType: CsContentType.TEXTBOOK,
                    primaryCategory: 'Digital Textbook',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.COLLECTION_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'content_do_id', type: 'Digital Textbook', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'content_do_id', type: 'Digital Textbook', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content&contentId=content_do_id',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'SHARE_CONTENT_LINK');
                done();
            }, 0);
        });

        it('should share collection link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentData: {
                    contentType: CsContentType.COLLECTION,
                    primaryCategory: 'Content Playlist',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockAppVersion.getPackageName = jest.fn(() => Promise.resolve('org.sunbird.app'));
            mockCommonUtilService.translateMessage = jest.fn((key, fields) => {
                switch (key) {
                    case 'SHARE_CONTENT_LINK':
                        return 'SHARE_CONTENT_LINK';
                }
            });
            mockSocialSharing.share = jest.fn();
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.COLLECTION_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: 'Content Playlist', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: 'Content Playlist', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockAppVersion.getPackageName).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SHARE_CONTENT_LINK', {
                    app_name: 'app_name',
                    content_link: 'shareUrl?referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_content',
                    content_name: content.contentData.name,
                    play_store_url: 'https://play.google.com/store/apps/details?id=org.sunbird.app&referrer=utm_source%3Dmobile%26utm_campaign%3Dshare_app'
                });
                expect(mockSocialSharing.share).toHaveBeenCalledWith(null, null, null, 'SHARE_CONTENT_LINK');
                done();
            }, 0);
        });

        it('should save content file on device', (done) => {
            // arrange
            const shareParams = {
                byFile: false,
                saveFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const contentExportResponse = {
                exportedFilePath: 'samplepath'
            };
            mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.CONTENT_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['do_id'], destinationFolder: '/pathDownload/', saveLocally: true, subContentIds: [] }
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FILE_SAVED', '', 'green-toast');
                done();
            }, 0);
        });

        it('should save content file on device for ios platform exportContent', (done) => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            let shareParams = {
                byLink: false,
                byFile: false,
                saveFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const contentExportResponse = {
                exportedFilePath: 'samplepath'
            };
            // shareParams.byFile = true;
            mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.CONTENT_DETAIL);

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: ''
                    },
                    values, { l1: 'do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['do_id'], destinationFolder: 'undefinedDownload/', saveLocally: true, subContentIds: [] }
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('FILE_SAVED', '', 'green-toast');
                done();
            }, 0);
        });

        it('should save content file on device for ios platform exportContent', (done) => {
            // arrange
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            const shareParams = {
                byLink: false,
                byFile: false,
                saveFile: false
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType',
                }
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            const contentExportResponse = {
                exportedFilePath: 'samplepath'
            };
            mockContentService.exportContent = jest.fn(() => of(contentExportResponse));
            const values = new Map();
            values['ContentType'] = content.contentData.contentType;
            mockCommonUtilService.showToast = jest.fn();

            // act
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' },
            PageId.CONTENT_DETAIL);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

});
