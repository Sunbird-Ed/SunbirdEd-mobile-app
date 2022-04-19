import { CourseUtilService  } from './course-util.service';
import { Platform, PopoverController } from '@ionic/angular';

describe('courseUtilService', () => {
  let courseUtilService: CourseUtilService;
  const mockPopoverController: Partial<PopoverController> = {};
  const mockPlatform: Partial<Platform> = {};

  beforeAll(() => {
    courseUtilService = new CourseUtilService(
        mockPopoverController as PopoverController,
        mockPlatform as Platform
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of courseUtilService', () => {
    expect(courseUtilService).toBeTruthy();
  });

  describe('showCredits', () => {
      it('should show credits', () => {
          //arrange
          mockPopoverController.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(() => Promise.resolve({}))
            });
        }) as any;
        const content = 'content', 
        pageId = 'pageId',
        rollUp = 'rollUp',
        correlation = 'correlation';
          //act
          courseUtilService.showCredits(content, pageId, rollUp, correlation);
  });
});
describe('getCourseProgress', () => {
    it('should return course progress as 100', () => {
        const leafNodeCount=  2,
        progress=  50
        courseUtilService.getCourseProgress(leafNodeCount, progress);
    });
    it('should return course progress as zero', () => {
        const leafNodeCount=  0,
        progress = 50
        courseUtilService.getCourseProgress(leafNodeCount, progress);
    });
});

describe('getImportContentRequestBody', () => {
  it('should check array', (done) => {
      // arrange
      const identifiers = ['do-123', 'do-234'];
      const requestParams = [];
      const isChild = true;
      requestParams.push({isChildContent : isChild,destinationFolder: 'c://files',
      contentId: '123',
      correlationData: []});
      // }); 
      jest.spyOn(courseUtilService, 'getImportContentRequestBody').mockReturnValue([{
        isChildContent: true,
        destinationFolder: 'sample-dest-folder',
        contentId: 'do-123'
    }]);
      // act
      courseUtilService.getImportContentRequestBody(identifiers, isChild);
      // assert
      setTimeout(() => {
        expect(requestParams).toEqual(
          expect.arrayContaining([
            {isChildContent : isChild,destinationFolder: 'c://files',
              contentId: '123',
              correlationData: []}
          ]))
        });
          done();
      }, 0);
  });

  describe('getImportContentRequestBody()', () => {
    it('should get import content body by invoked getImportContentRequestBody()', () => {
        // arrange
        const identifiers = ['do_101', 'do_102', 'do_103'];
        // act
        courseUtilService.getImportContentRequestBody(identifiers, true);
        // asert
        expect(identifiers.length).toBeGreaterThan(0);
    });
});
});