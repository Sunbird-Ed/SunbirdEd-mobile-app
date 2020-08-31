import { of, throwError } from 'rxjs';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
    ContentService, StorageService, Content
} from 'sunbird-sdk';
import {
    ContentShareHandlerService, CommonUtilService,
    TelemetryGeneratorService
} from '../../services';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    InteractType, InteractSubtype,
    Environment, PageId
} from '../telemetry-constants';
import { ContentType } from '../../app/app.constant';

describe('ContentShareHandlerService', () => {

    let contentShareHandlerService: ContentShareHandlerService;

    const mockContentService: Partial<ContentService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('app_name'))
    };
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        contentShareHandlerService = new ContentShareHandlerService(
            mockContentService as ContentService,
            mockStorageService as StorageService,
            mockCommonUtilService as CommonUtilService,
            mockSocialSharing as SocialSharing,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion
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
                byFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType'
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
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
                    contentType: 'contentType'
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
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
                byFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType'
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
                undefined, ['child_do_id'], [], { l1: 'textbook_do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'textbook_do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'textbook_do_id' }, []);
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
                expect(mockContentService.exportContent).toHaveBeenCalledWith(
                    { contentIds: ['do_id'], destinationFolder: 'dirpath', subContentIds: ['child_do_id'] }
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
                    contentType: 'contentType'
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
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
                    contentType: ContentType.COURSE
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COURSE, version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COURSE, version: undefined
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

        it('should share course module link', (done) => {
            // arrange
            const shareParams = {
                byLink: true,
                link: 'shareUrl'
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentData: {
                    contentType: ContentType.COURSE
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
            contentShareHandlerService.shareContent(shareParams, content as Content, 'module_do_id', [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COURSE, version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COURSE_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COURSE, version: undefined
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
                    contentType: ContentType.TEXTBOOK
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: ContentType.TEXTBOOK, version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: ContentType.TEXTBOOK, version: undefined
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
                    contentType: ContentType.TEXTBOOK
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'content_do_id', type: ContentType.TEXTBOOK, version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'content_do_id', type: ContentType.TEXTBOOK, version: undefined
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
                    contentType: ContentType.COLLECTION
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COLLECTION, version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.COLLECTION_DETAIL,
                    {
                        id: 'do_id', type: ContentType.COLLECTION, version: undefined
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
                saveFile: true
            };
            const content: Partial<Content> = {
                identifier: 'do_id',
                contentType: 'contentType',
                contentData: {
                    contentType: 'contentType'
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
            contentShareHandlerService.shareContent(shareParams, content as Content, undefined, [], [], { l1: 'do_id' });

            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH, InteractSubtype.SHARE_CONTENT_INITIATED,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
                    },
                    values, { l1: 'do_id' }, []);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.SHARE_CONTENT_SUCCESS,
                    Environment.HOME, PageId.CONTENT_DETAIL,
                    {
                        id: 'do_id', type: 'contentType', version: undefined
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
    });

});
