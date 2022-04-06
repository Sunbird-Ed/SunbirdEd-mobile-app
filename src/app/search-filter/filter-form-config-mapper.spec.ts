import { FilterFormConfigMapper } from './filter-form-config-mapper';
import { SearchFilterService } from '@app/services';
import { TranslateJsonPipe } from '@app/pipes/translate-json/translate-json';

describe('FilterFormConfigMapper', () => {
    let filterFormConfigMapper: FilterFormConfigMapper;
    const mockSearchFilterService: Partial<SearchFilterService> = {
        getFacetFormAPIConfig: jest.fn(() => Promise.resolve('string' as any))
    };
    const mockTranslateJsonPipe: Partial<TranslateJsonPipe> = {};

    beforeAll(() => {
        filterFormConfigMapper = new FilterFormConfigMapper(
            mockSearchFilterService as SearchFilterService,
            mockTranslateJsonPipe as TranslateJsonPipe
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of filterFormConfigMapper', () => {
        expect(filterFormConfigMapper).toBeTruthy();
    });
});