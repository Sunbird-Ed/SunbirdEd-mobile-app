import { PageFilterPage } from '../page-filter/page-filter.page';
import { FrameworkUtilService } from '@project-sunbird/sunbird-sdk';
import { PopoverController, NavParams, MenuController, Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { TranslateService } from '@ngx-translate/core';
import {
    AppGlobalService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    PageId,
    ImpressionType,
    Environment,
    InteractType,
    InteractSubtype
} from '../../services';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import {
    mockFilter,
    mockTopicCategoryTerms,
    mockMediumCategoryTerms,
    mockSubjectCategoryTerms,
    mockGradeLevelCategoryTerms,
    mockRootOrgData
} from './page-filter.page.spec.data';
import { of } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';

jest.mock('lodash/cloneDeep', () => jest.fn());
jest.mock('lodash/map', () => jest.fn());
describe('PageFilterPage', () => {
    let pageFilterPage: PageFilterPage;

    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFrameworkCategoryTerms: jest.fn((arg) => {
            let value;
            switch (arg.currentCategoryCode) {
                case 'topic':
                    value = mockTopicCategoryTerms;
                    break;
                case 'purpose':
                    value = mockTopicCategoryTerms;
                    break;
                case 'medium':
                    value = mockMediumCategoryTerms;
                    break;
                case 'gradeLevel':
                    value = mockGradeLevelCategoryTerms;
                    break;
                case 'subject':
                    value = mockSubjectCategoryTerms;
                    break;
            }
            return of(value);
        })
    };

    const mockPopOverController: Partial<PopoverController> = {
        dismiss: jest.fn(),
        create: jest.fn()
    };

    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'callback':
                    value = { applyFilter: jest.fn() };
                    break;
                case 'filter':
                    value = mockFilter;
                    break;
                case 'pageId':
                    value = PageId.COURSES;
                    break;
            }
            return value;
        })
    };

    const mockPlatform: Partial<Platform> = {
    };

    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn({
            unsubscribe: jest.fn()
        })),
    } as any;

    const mockTranslateService: Partial<TranslateService> = {
        currentLang: 'en'
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => ({
            syllabus: ''
        }))
    };

    const mockEvents: Partial<Events> = {
        subscribe: jest.fn((_, fn) => fn({
        }))
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(() => {
            return {
                present: jest.fn(),
                dismiss: jest.fn()
            };
        }),
        getTranslatedValue: jest.fn(),
        translateMessage: jest.fn(() => ('FILTER_ADDED'))
    };

    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getCourseFrameworkId: jest.fn(() => Promise.resolve('11111111')),
        getRootOrganizations: jest.fn(() => Promise.resolve(mockRootOrgData))
    };

    const mockMenuController: Partial<MenuController> = {
        enable: jest.fn()
    };

    beforeAll(() => {
        pageFilterPage = new PageFilterPage(
            mockFrameworkUtilService as FrameworkUtilService,
            mockPopOverController as PopoverController,
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockTranslateService as TranslateService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockMenuController as MenuController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of PageFilterPage', () => {
        expect(pageFilterPage).toBeTruthy();
    });

    describe('ionViewWillEnter()', () => {
        it('should dismiss the menu drawer', () => {
            // arrange
            // act
            pageFilterPage.ionViewWillEnter();
            // assert
            expect(mockMenuController.enable).toBeCalledWith(false);
        });
    });

    describe('initFilterValues()', () => {
        it('should initialize the filter and generate impression telemetry', (done) => {
            // arrange
            // act
            pageFilterPage.initFilterValues();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toBeCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.COURSE_PAGE_FILTER,
                    Environment.HOME);
                expect(pageFilterPage.filters).toBeDefined();
                done();
            }, 0);
        });

        it('should initialize the filter and generate impression telemetry for library filter', (done) => {
            // arrange
            mockNavParams.get =  jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'callback':
                        value = { applyFilter: jest.fn() };
                        break;
                    case 'filter':
                        value = mockFilter;
                        break;
                    case 'pageId':
                        value = PageId.LIBRARY;
                        break;
                }
                return value;
            });
            // act
            pageFilterPage.initFilterValues();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toBeCalledWith(
                    ImpressionType.VIEW, '',
                    PageId.LIBRARY_PAGE_FILTER,
                    Environment.HOME);
                expect(pageFilterPage.filters).toBeDefined();
                done();
            }, 0);
        });
    });

    describe('cancel()', () => {
        it('should generate interact telemetry and dismiss the popup', (done) => {
            // arrange
            (cloneDeep as any).mockImplementationOnce((data) => {
                return jest.requireActual('lodash/cloneDeep')(pageFilterPage.filters);
            });
            const applyFilterMock = jest.spyOn(pageFilterPage.callback, 'applyFilter');
            // act
            pageFilterPage.initFilterValues();
            pageFilterPage.apply();
            pageFilterPage.cancel();
            // assert
            setTimeout(() => {
                expect(pageFilterPage.callback.applyFilter).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.CANCEL,
                    Environment.HOME,
                    PageId.LIBRARY);
                expect(applyFilterMock.mock.calls[0][0]).toEqual({ contentType: ['Story', 'Worksheet'] });
                expect(mockPopOverController.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('apply()', () => {
        it('should not invoke applyFilter() of callback', (done) => {
            // arrange
            (cloneDeep as any).mockImplementationOnce((data) => {
                return jest.requireActual('lodash/cloneDeep')(pageFilterPage.filters);
            });
            const applyFilterMock = jest.spyOn(pageFilterPage.callback, 'applyFilter');
            // act
            pageFilterPage.initFilterValues();
            pageFilterPage.apply();
            // assert
            setTimeout(() => {
                expect(pageFilterPage.callback.applyFilter).toHaveBeenCalled();
                expect(applyFilterMock.mock.calls[0][0]).toEqual({ contentType: ['Story', 'Worksheet'] });
                expect(mockPopOverController.dismiss).toHaveBeenCalledWith({ apply: true });
                done();
            }, 0);
        });

        it('should invoke applyFilter() of callback', (done) => {
            // arrange
            pageFilterPage.callback = undefined;
            // act
            pageFilterPage.initFilterValues();
            pageFilterPage.apply();
            // assert
            setTimeout(() => {
                expect(pageFilterPage.pagetAssemblefilter).not.toBe({ contentType: ['Story', 'Worksheet'] });
                done();
            }, 0);
        });
    });

    describe('onLanguageChange()', () => {
        it('should not update the selected values', () => {
            // arrange
            pageFilterPage.backButtonFunc = { unsubscribe: jest.fn()};
            // act
            pageFilterPage.onLanguageChange();
            // assert
            expect(pageFilterPage.filters).not.toEqual([
                undefined,
                undefined
              ]);
        });
        it('should update the selected values', () => {
            // arrange
            pageFilterPage.backButtonFunc = { unsubscribe: jest.fn()};
            pageFilterPage.filters[7] = pageFilterPage.filters[6];
            delete  pageFilterPage.filters[7].resourceTypeValues;
            // act
            pageFilterPage.initFilterValues();
            pageFilterPage.onLanguageChange();
            // assert
            expect(pageFilterPage.filters[6].selected).toEqual([
                undefined,
                undefined
              ]);
        });
    });

    describe('getSelectedOptionCount()', () => {
        it('should return proper message with filter added count', () => {
            // arrange
            // act
            const output = pageFilterPage.getSelectedOptionCount({
                code: 'contentType',
                selected: ['WorkSheet']
            });
            // assert
            expect(output).toEqual('1 FILTER_ADDED');
        });

        it('should return empty message if facets is empty', () => {
            // arrange
            // act
            const output = pageFilterPage.getSelectedOptionCount({
            });
            // assert
            expect(output).toEqual('');
        });
    });

    describe('openFilterOptions()', () => {
        it('should open the popup window', () => {
            // arrange
            // act
            pageFilterPage.openFilterOptions({
            });
            // assert
            expect(mockPopOverController.create).toHaveBeenCalled();
        });
    });

    describe('ionViewWillLeave()', () => {
        it('should open the popup window', () => {
            // arrange
            pageFilterPage.backButtonFunc = { unsubscribe: jest.fn()};
            // act
            pageFilterPage.ionViewWillLeave();
            // assert
            expect( pageFilterPage.backButtonFunc.unsubscribe).toHaveBeenCalled();
            expect(mockMenuController.enable).toHaveBeenCalledWith(true);
        });
    });
});
