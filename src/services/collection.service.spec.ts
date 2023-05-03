import { of, throwError } from 'rxjs';
import {
  ContentService,
} from '@project-sunbird/sunbird-sdk';
import { CollectionService,  } from './collection.service';
import { CommonUtilService } from './common-util.service';


describe('LocalCourseService', () => {
  let collectionService: CollectionService;

  const mockContentService: Partial<ContentService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  window.console.error = jest.fn()

  beforeAll(() => {
    collectionService = new CollectionService(
      mockContentService as ContentService,
      mockCommonUtilService as CommonUtilService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of collectionService', () => {
    expect(collectionService).toBeTruthy();
  });

  describe('fetchCollectionData', () => {
    it('should fetch content heirarchy if data not available locally', (done) => {
        // arrange
        mockCommonUtilService.networkInfo = {
          isNetworkAvailable: false
        };
        const contentDetails = {
            isAvailableLocally : false
        };
        const courseHeirarchy = {
            name: 'name',
            identifier: 'id'
        };
        mockContentService.getContentDetails = jest.fn(() => of(contentDetails));
        mockContentService.getContentHeirarchy = jest.fn(() => of(courseHeirarchy));
        // act
        collectionService.fetchCollectionData('id').then((res) => {
            expect(res).toEqual(courseHeirarchy);
            done();
        });
        // assert
    });
    it('should fetch content locally if data available locally', (done) => {
        // arrange
        const contentDetails = {
            isAvailableLocally : true
        };
        const collection = {
            name: 'name',
            identifier: 'id'
        };
        mockContentService.getContentDetails = jest.fn(() => of(contentDetails));
        mockContentService.getChildContents = jest.fn(() => of(collection));
        // act
        collectionService.fetchCollectionData('id').then((res) => {
            expect(res).toEqual(collection);
            done();
        });
        // assert
    });
    it('should handle error scenario', (done) => {
        // arrange
        mockContentService.getContentDetails = jest.fn(() => throwError(''));
        // act
        collectionService.fetchCollectionData('id').catch((err) => {
            done();
        });
    });
  });

});
