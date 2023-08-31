import { ActivePageService } from '../active-page/active-page-service';
import { RouterLinks } from '../../app/app.constant';
import { PageId } from '../telemetry-constants';

describe('ContentPlayerHandler', () => {
    let activePageService: ActivePageService;
    beforeAll(() => {
        activePageService = new ActivePageService(
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ActivePageService', () => {
        expect(activePageService).toBeTruthy();
    });

    describe('computePageId()', () => {
        it('should return expected pageId', () => {
            // arrange
            // act
            // assert
            expect(activePageService.computePageId(RouterLinks.LIBRARY_TAB)).toEqual(PageId.LIBRARY);
            expect(activePageService.computePageId(RouterLinks.COURSE_TAB)).toEqual(PageId.COURSES);
            expect(activePageService.computePageId(RouterLinks.HOME_TAB)).toEqual(PageId.HOME);
            expect(activePageService.computePageId(RouterLinks.SEARCH_TAB)).toEqual(PageId.SEARCH);
            expect(activePageService.computePageId(RouterLinks.PROFILE_TAB)).toEqual(PageId.PROFILE);
            expect(activePageService.computePageId(RouterLinks.GUEST_PROFILE_TAB)).toEqual(PageId.GUEST_PROFILE);
            expect(activePageService.computePageId(RouterLinks.DOWNLOAD_TAB)).toEqual(PageId.DOWNLOADS);
            expect(activePageService.computePageId(RouterLinks.COLLECTION_DETAIL_ETB)).toEqual(PageId.COLLECTION_DETAIL);
            expect(activePageService.computePageId(RouterLinks.CONTENT_DETAILS)).toEqual(PageId.CONTENT_DETAIL);
            expect(activePageService.computePageId(RouterLinks.QRCODERESULT)).toEqual(PageId.DIAL_CODE_SCAN_RESULT);
            expect(activePageService.computePageId(RouterLinks.COLLECTION_DETAILS)).toEqual(PageId.COLLECTION_DETAIL);
            expect(activePageService.computePageId(RouterLinks.ENROLLED_COURSE_DETAILS)).toEqual(PageId.COURSE_DETAIL);
            expect(activePageService.computePageId(RouterLinks.ACTIVE_DOWNLOADS)).toEqual(PageId.ACTIVE_DOWNLOADS);
            expect(activePageService.computePageId(RouterLinks.COURSE_BATCHES)).toEqual(PageId.COURSE_BATCHES);
            expect(activePageService.computePageId(RouterLinks.DISTRICT_MAPPING)).toEqual(PageId.DISTRICT_MAPPING);
            expect(activePageService.computePageId(RouterLinks.PLAYER)).toEqual(PageId.HOME);
        });
    });
});
