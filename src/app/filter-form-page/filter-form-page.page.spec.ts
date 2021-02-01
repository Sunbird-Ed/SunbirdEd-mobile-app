import {FilterFormPagePage} from './filter-form-page.page';
import {Router} from '@angular/router';

describe('FilterFormPagePage', () => {
    let filterFormPagePage: FilterFormPagePage;
    const mockRouterExtras = {
        extras: {
            state: undefined
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
    };

    beforeAll(() => {
        filterFormPagePage = new FilterFormPagePage(
            mockRouter as Router,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of filterFormPage', () => {
        expect(filterFormPagePage).toBeTruthy();
    });
});
