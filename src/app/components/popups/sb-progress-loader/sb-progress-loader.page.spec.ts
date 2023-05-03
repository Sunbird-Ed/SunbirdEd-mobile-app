import { SbProgressLoaderPage } from '../../../../app/components/popups/sb-progress-loader/sb-progress-loader.page';
import { Platform } from '@ionic/angular';

describe('SbProgressLoaderPage', () => {
    let sbProgressLoaderPage: SbProgressLoaderPage;
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        sbProgressLoaderPage = new SbProgressLoaderPage(
            mockPlatform as Platform
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of SbProgressLoaderPage', () => {
        // assert
        expect(sbProgressLoaderPage).toBeTruthy();
    });


    it('should subscribeBackButton when landed ', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        // act
        sbProgressLoaderPage.ngOnInit();
        // assert
    });

    it('should unsubscibe the backButton once subscribed', () => {
        sbProgressLoaderPage['backButtonSubscription'] = {
            unsubscribe: jest.fn(),
        } as any;

        sbProgressLoaderPage.ngOnDestroy();
    });
});
