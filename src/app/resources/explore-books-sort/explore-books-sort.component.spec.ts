import { ExploreBooksSortComponent } from './explore-books-sort.component';
import { NavParams, ModalController } from '@ionic/angular';
import { CommonUtilService } from '../../../services';
import { FormBuilder } from '@angular/forms';

describe('ExploreBooksSortComponent', () => {
    let exploreBooksSortComponent: ExploreBooksSortComponent;

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'searchForm':
                    value = {
                        value: {
                            board: 'cbse',
                            medium: 'english'
                        }
                    };
                    break;
                case 'boardList':
                    value = 'boardList';
                    break;
                case 'mediumList':
                    value = 'mediumList';
                    break;
            }
            return value;
        })
    };
        const mockCommonUtilService: Partial<CommonUtilService> = {
            translateMessage: jest.fn(() => 'select-box')
        };  
    const searchForm = {
        board : [],
        medium : []
    } as any;
    const mockFormBuilder: Partial<FormBuilder> = {
        group: jest.fn(() => searchForm)
    };
    const mockModalController: Partial<ModalController> = {
    };

    beforeAll(() => {
        exploreBooksSortComponent = new ExploreBooksSortComponent(
            mockNavParams as NavParams,
            mockCommonUtilService as CommonUtilService,
            mockFormBuilder as FormBuilder,
            mockModalController as ModalController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of exploreBooksSortComponent', () => {
        expect(exploreBooksSortComponent).toBeTruthy();
    });

    describe('dismiss', () => {
        it('should sort and dismiss', () => {
            // arrange
            mockModalController.dismiss = jest.fn();
            exploreBooksSortComponent['sortForm'] = {value:{ board: "cbse", medium: "english" }} as any;
            // act
            exploreBooksSortComponent.dismiss()
            // assert
            expect(mockModalController.dismiss).toHaveBeenCalled()
        })
        it('should sort and dismiss if any one is same', () => {
            // arrange
            mockModalController.dismiss = jest.fn();
            exploreBooksSortComponent['sortForm'] = {value:{ board: "cbse", medium: "medium" }} as any;
            // act
            exploreBooksSortComponent.dismiss()
            // assert
            expect(mockModalController.dismiss).toHaveBeenCalledWith({values:{ board: "cbse", medium: "medium" }})
        })
    })
});