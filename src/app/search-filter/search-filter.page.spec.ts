import {SearchFilterPage} from './search-filter.page';
import {Router} from '@angular/router';

describe('SearchFilterPage', () => {
    let searchFilterPage: SearchFilterPage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
    };

    beforeAll(() => {
        searchFilterPage = new SearchFilterPage(
            mockRouter as Router,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of filterFormPage', () => {
        expect(SearchFilterPage).toBeTruthy();
    });
});
