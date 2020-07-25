import { PageFilterOptionsPage } from '../page-filter-options/page-filter-options.page';
import {
    AppGlobalService,
} from '../../../services';
import { PopoverController, NavParams, Platform } from '@ionic/angular';
import {
    mockFacets,
    mockFacetsContetType,
    mockFacetsBoard,
    mockFacetsContentTypeWith,
    mockFacetsBoardNew
} from './page-filter-options.spec.data';

describe('PageFilterOptionsPage', () => {
    let pageFilterOptionsPage: PageFilterOptionsPage;

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn(),
        create: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'facets':
                    value = mockFacetsBoard;
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => {
            return { unsubscribe: jest.fn() };
        }),
    } as any;


    const mockAppGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => false)
    };

    beforeAll(() => {
        pageFilterOptionsPage = new PageFilterOptionsPage(
            mockNavParams as NavParams,
            mockPopOverController as PopoverController,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of PageFilterOptionsPage', () => {
        expect(pageFilterOptionsPage).toBeTruthy();
    });

    describe('changeValue()', () => {
        it('should populate selectedValuesIndices', () => {
            // arrange
            pageFilterOptionsPage.facets = mockFacetsBoardNew;
            // act
            pageFilterOptionsPage.changeValue('AP', 1);
            // assert
            expect(pageFilterOptionsPage.facets.selectedValuesIndices).toEqual([0]);
        });

    });

});

describe('PageFilterOptionsPage', () => {
    let pageFilterOptionsPage: PageFilterOptionsPage;

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn(),
        create: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'facets':
                    value = mockFacets;
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => {
            return { unsubscribe: jest.fn() };
        }),
    } as any;


    const mockAppGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(() => false)
    };

    beforeAll(() => {
        pageFilterOptionsPage = new PageFilterOptionsPage(
            mockNavParams as NavParams,
            mockPopOverController as PopoverController,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of PageFilterOptionsPage', () => {
        expect(pageFilterOptionsPage).toBeTruthy();
    });

    describe('isSelected()', () => {
        it('should return false', () => {
            // arrange
            pageFilterOptionsPage.facets = {};
            // act n assert
            expect(pageFilterOptionsPage.isSelected('topic1')).toBeFalsy();
        });

        it('should return proper result', () => {
            // arrange
            pageFilterOptionsPage.facets = { selected: ['topic1'] };
            // act n assert
            expect(pageFilterOptionsPage.isSelected('topic1')).toBeTruthy();
            pageFilterOptionsPage.facets =  { selected: undefined };
        });
    });

    describe('isSelected()', () => {
        it('should return false', () => {
            // arrange
            pageFilterOptionsPage.facets = {};
            // act n assert
            expect(pageFilterOptionsPage.isSelected('topic1')).toBeFalsy();
        });

        it('should return proper result', () => {
            // arrange
            pageFilterOptionsPage.facets = { selected: ['topic1'] };
            // act n assert
            expect(pageFilterOptionsPage.isSelected('topic1')).toBeTruthy();
            pageFilterOptionsPage.facets =  { selected: undefined };
        });
    });

    describe('getSelectedOptionCount()', () => {
        it('should return proper message with filter added count', () => {
            // arrange
            // act
            const output = pageFilterOptionsPage.getSelectedOptionCount({
                code: 'contentType',
                selected: ['WorkSheet']
            });
            // assert
            expect(output).toEqual('1');
        });

        it('should return empty message if facets is empty', () => {
            // arrange
            // act
            const output = pageFilterOptionsPage.getSelectedOptionCount({
            });
            // assert
            expect(output).toEqual('');
        });
    });

    describe('cancel()', () => {
        it('should populate selected facets', () => {
            // arrange
            pageFilterOptionsPage.facets = { selected: ['topic1'] };
            pageFilterOptionsPage.prevSelectedTopic = ['topic1'];
            // act
            pageFilterOptionsPage.cancel();
            // assert
            expect(pageFilterOptionsPage.facets.selected).toEqual(['topic1']);
            expect(mockPopOverController.dismiss).toHaveBeenCalled();
            pageFilterOptionsPage.facets =  { selected: undefined };
        });

    });

    describe('apply()', () => {
        it('should populate selected facets', () => {
            // arrange
            pageFilterOptionsPage.facets = { selected: ['topic1'] };
            pageFilterOptionsPage.prevSelectedTopic = ['topic1'];
            pageFilterOptionsPage.backButtonFunc = { unsubscribe: jest.fn() };
            // act
            pageFilterOptionsPage.apply();
            // assert
            expect(pageFilterOptionsPage.prevSelectedTopic).toEqual(['topic1']);
            expect(mockPopOverController.dismiss).toHaveBeenCalled();
            pageFilterOptionsPage.facets =  { selected: undefined };
        });

        it('should populate selected facets and should not unsubscribe', () => {
            // arrange
            pageFilterOptionsPage.facets = { selected: ['topic1'] };
            pageFilterOptionsPage.prevSelectedTopic = ['topic1'];
            pageFilterOptionsPage.backButtonFunc = { unsubscribe: jest.fn() };
            pageFilterOptionsPage.backButtonFunc = undefined;
            // act
            pageFilterOptionsPage.apply();
            // assert
            expect(pageFilterOptionsPage.prevSelectedTopic).toEqual(['topic1']);
            pageFilterOptionsPage.facets = { selected: undefined };
        });

    });

    describe('toggleGroup()', () => {
        it('should mark shownGroup as null', () => {
            // arrange
            pageFilterOptionsPage.shownGroup = true;
            // act
            pageFilterOptionsPage.toggleGroup(true);
            // assert
            expect(pageFilterOptionsPage.shownGroup).toEqual(null);
        });

        it('should mark shownGroup as true', () => {
            // arrange
            pageFilterOptionsPage.shownGroup = true;
            // act
            pageFilterOptionsPage.toggleGroup(false);
            // assert
            expect(pageFilterOptionsPage.shownGroup).toEqual(false);
        });

    });

    describe('getItems()', () => {
        it('should mark showTopicFilterList as true', () => {
            // arrange
            pageFilterOptionsPage.topicsVal = [[{ name: 'topic1' }]];
            pageFilterOptionsPage.backButtonFunc = { unsubscribe: jest.fn() };
            // act
            pageFilterOptionsPage.getItems({ srcElement: { value: 'topic1' } });
            // assert
            expect(pageFilterOptionsPage.showTopicFilterList).toBeTruthy();
        });

        it('should mark showTopicFilterList as true', () => {
            // arrange
            pageFilterOptionsPage.topicsVal = [[{ name: 'topic2' }]];
            pageFilterOptionsPage.backButtonFunc = { unsubscribe: jest.fn() };
            // act
            pageFilterOptionsPage.getItems({ srcElement: { value: 'topic1' } });
            // assert
            expect(pageFilterOptionsPage.showTopicFilterList).toBeTruthy();
        });

        it('should mark showTopicFilterList as false', () => {
            // arrange
            pageFilterOptionsPage.topicsVal = [[{ name: 'topic2' }]];
            pageFilterOptionsPage.backButtonFunc = { unsubscribe: jest.fn() };
            // act
            pageFilterOptionsPage.getItems({ srcElement: { value: undefined } });
            // assert
            expect(pageFilterOptionsPage.showTopicFilterList).toBeFalsy();
        });

    });

    describe('changeValue()', () => {
        it('should populate selectedValuesIndices', () => {
            // arrange
            pageFilterOptionsPage.facets = mockFacetsContetType;
            // act
            pageFilterOptionsPage.changeValue('WorkSheet', 1);
            // assert
            expect(pageFilterOptionsPage.facets.selectedValuesIndices).toEqual([]);
        });

        it('should populate selectedValuesIndices with code other than contentType', () => {
            // arrange
            pageFilterOptionsPage.facets = mockFacetsBoard;
            // act
            pageFilterOptionsPage.changeValue('WorkSheet', 1);
            // assert
            expect(pageFilterOptionsPage.facets.selectedValuesIndices.length).toEqual(1);
        });

        it('should populate facets.selcted', () => {
            // arrange
            pageFilterOptionsPage.facets = mockFacetsBoard;
            // act
            pageFilterOptionsPage.changeValue('AP', 1);
            // assert
            expect(pageFilterOptionsPage.facets.selected).toEqual(['AP']);
        });

        it('should populate facets.selcted for contentType term', () => {
            // arrange
            pageFilterOptionsPage.facets = mockFacetsContentTypeWith;
            // act
            pageFilterOptionsPage.changeValue('AP', 1);
            // assert
            expect(pageFilterOptionsPage.facets.selectedValuesIndices).toEqual([1]);
        });
    });

    describe('handleDeviceBackButton()', () => {
        it('should dismiss the popup', () => {
            // arrange
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn()),
            } as any;
            // act
            pageFilterOptionsPage.handleDeviceBackButton();
            // assert
            expect(mockPopOverController.dismiss).toHaveBeenCalled();
        });

    });
});


