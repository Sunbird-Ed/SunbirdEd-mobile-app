import { ChildContentHandler } from '../../services/content/child-content-handler';
import { of } from 'rxjs';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { mockChildContentData } from './child-content.handler.spec.data';
describe('ChildContentHandler', () => {
    let childContentHandler: ChildContentHandler;
    const mockContentService: Partial<ContentService> = {
        getChildContents: jest.fn(() => of(mockChildContentData))
    };

    beforeAll(() => {
        childContentHandler = new ChildContentHandler(
            mockContentService as ContentService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of ChildContentHandler', () => {
        expect(childContentHandler).toBeTruthy();
    });

    describe('setChildContents()', () => {
        it('should export the content', (done) => {
            // arrange

            // act
            childContentHandler.setChildContents('do_2127630844502753281124', 1, 'do_212763017508380672130');
            // assert
            setTimeout(() => {
                expect(childContentHandler.contentHierarchyInfo).toEqual(
                    [{
                        contentType: 'course',
                        identifier: 'do_2127630844502753281124'
                    },
                    {
                        contentType: 'courseunit',
                        identifier: 'do_2127630862588313601130'
                    }]);
                done();
            });
        });
    });
});
