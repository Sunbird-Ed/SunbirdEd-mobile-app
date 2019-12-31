import {Content} from 'sunbird-sdk';
import {ContentUtil} from '@app/util/content-util';

describe('ContentUtil', () => {
    describe('resolvePDFUrl()', () => {
        it('should return undefined if no itemSetPreviewUrl is set for Content', () => {
            // arrange
            const content: Partial<Content> = {
                contentData: {
                    itemSetPreviewUrl: undefined
                }
            };

            // act / assert
            expect(ContentUtil.resolvePDFUrl(content as Content)).toEqual(undefined);
        });

        it('should return network url if itemSetPreviewUrl is set for Content as network url', () => {
            // arrange
            const content: Partial<Content> = {
                contentData: {
                    itemSetPreviewUrl: 'http://some_domain.com/som_path.some_extension'
                }
            };

            // act / assert
            expect(ContentUtil.resolvePDFUrl(content as Content)).toEqual('http://some_domain.com/som_path.some_extension');
        });

        it('should return local url if itemSetPreviewUrl is set for Content as bundled relative path', () => {
            // arrange
            let content: Partial<Content> = {
                basePath: 'file://some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: 'http://some_domain.com/some_path.some_extension'
                }
            };

            // act / assert
            expect(ContentUtil.resolvePDFUrl(content as Content)).toEqual('http://some_domain.com/some_path.some_extension');

            content = {
                basePath: 'file://some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };

            // act / assert
            expect(ContentUtil.resolvePDFUrl(content as Content)).toEqual('file://some_local_path/some_local_path/some_path.some_extension');
        });
    });
});
