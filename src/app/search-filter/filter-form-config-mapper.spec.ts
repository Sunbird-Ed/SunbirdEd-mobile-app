import { FilterFormConfigMapper } from './filter-form-config-mapper';
import { SearchFilterService } from '../../services';
import { TranslateJsonPipe } from '../../pipes/translate-json/translate-json';

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
        mockSearchFilterService.getFacetFormAPIConfig = jest.fn(() => Promise.resolve())
        expect(filterFormConfigMapper).toBeTruthy();
    });

    describe('map', () => {
        it('should execute map when searchFilterFormConfig have no values', (done) => {
            //arrange
            const facetFilters = {
                se_mediums: [{ name: 'tamil', count: 47, apply: true }, { name: 'english', count: 122, apply: false }],
                se_gradeLevels: [{ name: 'class 9', count: 33, apply: false }, { name: 'class 8', count: 34, apply: false }]
            };
            filterFormConfigMapper['searchFilterFormConfig'] = undefined;
            mockSearchFilterService.getFacetFormAPIConfig = jest.fn(() => Promise.resolve([
                { code: 'se_mediums', index: 1, type: 'dropdown', name: 'en', multiple: true },
                { code: 'se_gradeLevels', index: 2, type: 'dropdown', name: 'es', multiple: true }
            ]))
            mockTranslateJsonPipe.transform = jest.fn(() => Promise.resolve('en'))
            //act
            filterFormConfigMapper.map(facetFilters);
            //assert
            setTimeout(() => {
                expect(filterFormConfigMapper).toBeTruthy();
                done();
            }, 0);
        });
        it('should execute map when searchFilterFormConfig have values and index is specified', (done) => {
            //arrange
            const facetFilters = {
                se_mediums: [{ name: 'tamil', count: 47, apply: false }, { name: 'english', count: 122, apply: false }],
                se_gradeLevels: [{ name: 'class 9', count: 33, apply: false }, { name: 'class 8', count: 34, apply: false }]
            };
            const existingFilters = { primaryCategory: true, subject: true, audience: true }
            filterFormConfigMapper['searchFilterFormConfig'] = [
                { code: 'se_mediums', index: 1, type: 'dropdown', name: 'en' },
                { code: 'se_gradeLevels', index: 2, type: 'dropdown', name: 'es' }
            ];
            mockTranslateJsonPipe.transform = jest.fn(() => Promise.resolve('en'))
            //act
            filterFormConfigMapper.map(facetFilters, existingFilters);
            //assert
            setTimeout(() => {
                expect(filterFormConfigMapper).toBeTruthy();
                done();
            }, 0);
        });
        it('should execute map when searchFilterFormConfig have values and index is not specified', (done) => {
            //arrange
            const facetFilters = {
                se_mediums: [{ name: 'tamil', count: 47, apply: true }, { name: 'english', count: 122, apply: true }],
                se_gradeLevels: [{ name: 'class 9', count: 33, apply: false }, { name: 'class 8', count: 34, apply: false }]
            };
            const existingFilters = { primaryCategory: true, subject: true, audience: true }
            filterFormConfigMapper['searchFilterFormConfig'] = [
                { code: 'se_mediums', type: 'dropdown', name: 'en' },
                { code: 'se_gradeLevels', type: 'dropdown', name: 'es' }
            ];
            mockTranslateJsonPipe.transform = jest.fn(() => Promise.resolve('en'))
            //act
            filterFormConfigMapper.map(facetFilters, existingFilters);
            //assert
            setTimeout(() => {
                expect(filterFormConfigMapper).toBeTruthy();
                done();
            }, 0);
        });
    });
});