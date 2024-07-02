import { CategoryKeyTranslator } from './category-key-translator-pipe';
import {
    CommonUtilService,
} from '../../services';

describe('CategoryKeyTranslator', () => {
    let categoryKeyTranslator: CategoryKeyTranslator;

    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'sample_translation')
    };


    beforeAll(() => {
        categoryKeyTranslator = new CategoryKeyTranslator(
            mockCommonUtilService as CommonUtilService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of CategoryKeyTranslator', () => {
        // arrange
        // assert
        expect(categoryKeyTranslator).toBeTruthy();
    });

    describe('transform', () => {

        it('should return empty string if content is undefined', () => {
            // arrange
            // act
            const translatedKey = categoryKeyTranslator.transform('SAMPLE_KEY', undefined);
            // assert
            expect(translatedKey).toEqual('');
        });

        it('should return course trackable key if content is trackable', () => {
            // arrange
            const content = {
                trackable: {
                    enabled: 'Yes'
                },
                primaryCategory: 'Course'
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('CRS_TRK_SAMPLE_KEY', undefined);
        });

        it('should return course trackable key if content is trackable and trackable object is available in contentData', () => {
            // arrange
            const content = {
                contentData: {
                    trackable: {
                        enabled: 'Yes'
                    },
                    primaryCategory: 'Course'
                }
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('CRS_TRK_SAMPLE_KEY', undefined);
        });

        it('should return course non trackable key if content is non trackable', () => {
            // arrange
            const content = {
                trackable: {
                    enabled: 'No'
                },
                contentType: 'Course'
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('CRS_NONTRK_SAMPLE_KEY', undefined);
        });

        it('should return  non trackable key if trackable object is not there and primaryCategory is Textbook', () => {
            // arrange
            const content = {
                contentType: 'Digital Textbook'
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('TBK_NONTRK_SAMPLE_KEY', undefined);
        });

        it('should return  trackable key if trackable object is not there and primaryCategory is Course', () => {
            // arrange
            const content = {
                contentType: 'Course'
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('CRS_TRK_SAMPLE_KEY', undefined);
        });

        it('should return  trackable key if trackable object is not there and primaryCategory is other than Course and Textbook', () => {
            // arrange
            const content = {
                contentType: 'TV Class'
            };
            // act
            categoryKeyTranslator.transform('SAMPLE_KEY', content);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('DFLT__SAMPLE_KEY', undefined);
        });
    });

});
