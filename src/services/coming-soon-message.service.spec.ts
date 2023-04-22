import { ComingSoonMessageService } from './coming-soon-message.service';
import {
    Content,
    ContentService,
    SharedPreferences,
    SystemSettingsService
} from '@project-sunbird/sunbird-sdk';
import { ContentConstants } from '../app/app.constant';
import { of } from 'rxjs';

describe('ComingSoonMessageService', () => {
    let comingSoonMessageService: ComingSoonMessageService;
    const mockSharedPreferences: SharedPreferences = {};
    const mockSystemSettingsService: SystemSettingsService = {};
    const mockContentService: ContentService = {};

    beforeAll(() => {
        comingSoonMessageService = new ComingSoonMessageService(
            mockSharedPreferences as SharedPreferences,
            mockSystemSettingsService as SystemSettingsService,
            mockContentService as ContentService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(comingSoonMessageService).toBeTruthy();
    });

    describe('getComingSoonMessage', () => {
        it('should return translated coming soon message from  root content if available', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    altMsg: [{
                        key: ContentConstants.COMING_SOON_MSG,
                        value: 'some_message',
                        translations: JSON.stringify({ en: 'some_translated_message' })
                    }]
                }
            };
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe('some_translated_message');
                    done();
                });
        });

        it('should return default coming soon message from root content if selected language translation is not available', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    altMsg: [{
                        key: ContentConstants.COMING_SOON_MSG,
                        value: 'some_message',
                        translations: JSON.stringify({ mr: 'some_translated_message' })
                    }]
                }
            };
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe('some_message');
                    done();
                });
        });

        it('should return undefined if channel and altMsg are not available in child content', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    identifier: 'some_do_id'
                },
                hierarchyInfo: [
                    {
                        identifier: 'some_do_id'
                    }
                ]
            };
            const childContent = {
                contentData: {
                    identifier: 'some_do_id'
                }
            };
            mockContentService.getChildContents = jest.fn(() => of(childContent));
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe(undefined);
                    done();
                });
        });

        it('should return coming soon msg if available in child content', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    identifier: 'some_do_id'
                },
                hierarchyInfo: [
                    {
                        identifier: 'some_do_id'
                    }
                ]
            };
            const childContent = {
                contentData: {
                    identifier: 'some_do_id',
                    altMsg: [{
                        key: ContentConstants.COMING_SOON_MSG,
                        value: 'some_message',
                        translations: JSON.stringify({ en: 'some_translated_message' })
                    }]
                }
            };
            mockContentService.getChildContents = jest.fn(() => of(childContent));
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe('some_translated_message');
                    done();
                });
        });

        it('should return undefined if tenant specific message is not available in system setting config', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    identifier: 'some_do_id'
                },
                hierarchyInfo: [
                    {
                        identifier: 'some_do_id'
                    }
                ]
            };
            const childContent = {
                contentData: {
                    identifier: 'some_do_id',
                    channel: 'some_channel'
                }
            };
            mockContentService.getChildContents = jest.fn(() => of(childContent));
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({
                value: JSON.stringify([{ rootOrgId: 'some_another_channel' }])
            }));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe(undefined);
                    done();
                });
        });

        it('should return translated coming soon message if tenant specific message is available in system setting config', (done) => {
            // arrange
            const content: Content = {
                contentData: {
                    identifier: 'some_do_id'
                },
                hierarchyInfo: [
                    {
                        identifier: 'some_do_id'
                    }
                ]
            };
            const childContent = {
                contentData: {
                    identifier: 'some_do_id',
                    channel: 'some_channel'
                }
            };
            mockContentService.getChildContents = jest.fn(() => of(childContent));
            mockSharedPreferences.getString = jest.fn(() => of('en'));
            mockSystemSettingsService.getSystemSettings = jest.fn(() => of({
                value: JSON.stringify([{
                    rootOrgId: 'some_channel',
                    translations: JSON.stringify({ en: 'some_translated_message' })
                }])
            }));
            // act
            comingSoonMessageService.getComingSoonMessage(content)
                .then((comingSoonMessage) => {
                    // assert
                    expect(comingSoonMessage).toBe('some_translated_message');
                    done();
                });
        });

        it('should return default coming soon message if tenant specific message is available in system setting config '
            + 'and if selected language translation is not available', (done) => {
                // arrange
                const content: Content = {
                    contentData: {
                        identifier: 'some_do_id'
                    },
                    hierarchyInfo: [
                        {
                            identifier: 'some_do_id'
                        }
                    ]
                };
                const childContent = {
                    contentData: {
                        identifier: 'some_do_id',
                        channel: 'some_channel'
                    }
                };
                mockContentService.getChildContents = jest.fn(() => of(childContent));
                mockSharedPreferences.getString = jest.fn(() => of('en'));
                mockSystemSettingsService.getSystemSettings = jest.fn(() => of({
                    value: JSON.stringify([{
                        rootOrgId: 'some_channel',
                        value: 'some_message',
                        translations: JSON.stringify({ hi: 'some_translated_message' })
                    }])
                }));
                // act
                comingSoonMessageService.getComingSoonMessage(content)
                    .then((comingSoonMessage) => {
                        // assert
                        expect(comingSoonMessage).toBe('some_message');
                        done();
                    });
            });
    });
});
