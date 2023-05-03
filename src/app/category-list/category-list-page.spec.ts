import { CategoryListPage } from './category-list-page';
import { CommonUtilService } from '../../services/common-util.service';
import { Router } from '@angular/router';
import { AppHeaderService } from '../../services/app-header.service';
import { of, Subscription } from 'rxjs';
import { NavigationService } from '../../services/navigation-handler.service';
import { ContentService, CourseService, FormService, ProfileService } from '@project-sunbird/sunbird-sdk';
import { ScrollToService } from '../../services/scroll-to.service';
import {
    Environment, InteractSubtype, InteractType, PageId, SearchFilterService,
    TelemetryGeneratorService
} from '../../services';
import { ContentUtil } from '../../util/content-util';
import { RouterLinks } from '../../app/app.constant';
import { ModalController } from '@ionic/angular';

describe('CategoryListPage', () => {
    let categoryListPage: CategoryListPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(),
        convertFileToBase64: jest.fn(() => of(fn => fn())) as any
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({
            profileType: 'Student', subject: ['subject 1', 'subject 2']
        } as any))
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockSearchFilterService: Partial<SearchFilterService> = {
        reformFilterValues: jest.fn(() => Promise.resolve([
            {
                name: 'name1', code: 'code1',
                values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
            }, {
                name: 'name2', code: 'code2',
                values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
            }
        ]))
    };
    const mockRouterExtras = {
        extras: {
            state: {
                formField: {
                    searchCriteria: {
                        subjects: ['maths']
                    },
                    facet: 'course',
                    primaryFacetFilters: [
                        { code: "subject", name: "Subject", index: 2 },
                        { code: "audience", name: "Role", index: 4 }
                    ]
                },
                fromLibrary: true,
                description: '{"en":"Explore a wide variety of %category on %appName across different boards and subject"}',
                title: 'A title',
                code: 'popular_categories'
            }
        }
    };
    const data = jest.fn(() => of({
        result: [
            {
                index: 1,
                title: 'TextBook',
                data: {
                    type: 'CONTENTS',
                    request: {}
                },
                theme: 'sample_theme',
                meta: {
                    filterCriteria: {
                        facetFilters: [{
                            name: 'sample_string', values: [{ name: 'sample_string', count: 2, apply: true }]
                        }]
                    },
                    searchRequest: {},
                    searchCriteria: {}
                }
            }
        ]
    }));

    const temp = jest.fn(() => of({
        result: [{
            theme: { orientation: 'horizontal' },
            title: JSON.stringify({ en: 'sample-enrolled-course' }),
            data: {
                sections: [{
                    contents: [{ appIcon: 'sample-icon', name: 'sample-name' }]
                }]
            },
            meta: {
                filterCriteria: {
                    query: 'a query',
                    facetFilters: [
                        {
                            name: 'name1', code: 'code1',
                            values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                        },
                        {
                            name: 'name2', code: 'code2',
                            values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                        }]
                },
            }
        }, {
            theme: { orientation: 'vertical' },
            title: JSON.stringify({ en: 'sample-course' }),
            data: {
                sections: [{ contents: { appIcon: 'sample-icon', name: 'sample-name' } }]
            },
            meta: {
                filterCriteria: {
                    query: 'a query',
                    facetFilters: [{
                        name: 'name1', code: 'code1',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    }, {
                        name: 'name2', code: 'code2',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    }]
                },
            }
        }]
    }));
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const response = jest.fn(() => of({
        result: [{
            theme: { orientation: 'horizontal' },
            title: JSON.stringify({ en: 'sample-enrolled-course' }),
            data: {
                sections: [{
                    contents: [{ appIcon: 'sample-icon', name: 'sample-name' }]
                }]
            },
            meta: {
                filterCriteria: {
                    query: 'a query',
                    facetFilters: [{
                        name: 'name1', code: 'code1',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    }, {
                        name: 'name2', code: 'code2',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    }]
                },
            }
        }, {
            theme: { orientation: 'vertical' },
            title: JSON.stringify({ en: 'sample-course' }),
            data: {
                sections: [{
                    contents: { appIcon: 'sample-icon', name: 'sample-name' }
                }]
            },
            meta: {
                filterCriteria: {
                    query: 'a query',
                    facetFilters: [{
                        name: 'name1', code: 'code1',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    },
                    {
                        name: 'name2', code: 'code2',
                        values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                    }]
                },
            }
        }]
    }));
    const mockContentService: Partial<ContentService> = {
        buildContentAggregator: jest.fn(() => ({
            aggregate: response
        })) as any
    };
    const mockFormService: Partial<FormService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockScrollService: Partial<ScrollToService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockModalController: Partial<ModalController> = {};

    beforeAll(() => {
        categoryListPage = new CategoryListPage(
            mockContentService as ContentService,
            mockFormService as FormService,
            mockCourseService as CourseService,
            mockProfileService as ProfileService,
            mockCommonUtilService as CommonUtilService,
            mockRouter as Router,
            mockHeaderService as AppHeaderService,
            mockNavService as NavigationService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockScrollService as ScrollToService,
            mockSearchFilterService as SearchFilterService,
            mockModalController as ModalController
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should be create an instance of CategoryListPage', () => {
        expect(categoryListPage).toBeTruthy();
    });

    describe('ionViewWillEnter', () => {
        it('should get appName from commonUtilService and also check if supportedFacets is available', (done) => {
            // arrange
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockContentService.buildContentAggregator = jest.fn(() => ({
                aggregate: data
            })) as any;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
            // act
            categoryListPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should generate impression telemetry', (done) => {
            //arrange
            const corRelationList = [{
                "id": "Course",
                "type": "form-page"
            }]
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            //act
            categoryListPage.ionViewWillEnter();
            //assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('ngOnInit', () => {
        it('should get Appname and supportedFacets should not be defined', (done) => {
            //arrange
            const facet = [{ code: 'code1' }, { code: 'code2' }]
            mockSearchFilterService.fetchFacetFilterFormConfig = jest.fn(() => {
                return Promise.resolve(facet);
            });
            mockCommonUtilService.getAppName = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            categoryListPage.primaryFacetFilters = [
                { "code": "name1", "translations": "{\"en\":\"Subject\"}", "values": [], "name": "Subject", "index": 2, "sort": true },
                { "code": "name2", "translations": "{\"en\":\"Role\"}", "values": [], "name": "Role", "index": 4 }
            ]
            categoryListPage.displayFacetFilters = [
                {
                    name: 'name1', code: 'code1',
                    values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                },
                {
                    name: 'name2', code: 'code2',
                    values: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
                }
            ];
            const onSelectedFilter = [{ name: "accountancy", count: 124, apply: false }];
            const isInitialCall = false;
            jest.fn(categoryListPage, 'fetchAndSortData').mockImplementation({}, true)
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockSearchFilterService.fetchFacetFilterFormConfig).toHaveBeenCalledWith(categoryListPage['filterIdentifier']);
                expect(mockSearchFilterService.reformFilterValues).toHaveBeenCalledWith([
                    {
                      "name": "sample_string",
                      "values": [
                        {
                          "apply": true,
                          "count": 2,
                          "name": "sample_string",
                        }
                      ]
                    }
                  ], categoryListPage['formAPIFacets'])
                expect(categoryListPage['formAPIFacets']).toBeTruthy();
                expect(categoryListPage['supportedFacets']).toBeTruthy();
                done();
                //expect(acc).toEqual('se_mediums');
            }, 0);
        });
        it('should get Appname and supportedFacets should not be defined and extras.state.code should be other_boards', (done) => {
            //arrange
            mockCommonUtilService.getAppName = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            categoryListPage['shouldGenerateImpressionTelemetry'] = true;
            categoryListPage['sectionCode'] = 'other_boards';
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should get Appname and supportedFacets should not be defined and extras.state.code should be browse_by_subject', (done) => {
            //arrange
            mockCommonUtilService.getAppName = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            categoryListPage['shouldGenerateImpressionTelemetry'] = true;
            categoryListPage['sectionCode'] =  'browse_by_subject';
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should get Appname and supportedFacets should not be defined and extras.state.code should be browse_by_category', (done) => {
            //arrange
            mockCommonUtilService.getAppName = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            categoryListPage['shouldGenerateImpressionTelemetry'] = true;
            categoryListPage['sectionCode'] =  'browse_by_category';
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should get Appname and supportedFacets should not be defined and extras.state.code should be browse_by_audience', (done) => {
            //arrange
            mockCommonUtilService.getAppName = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            categoryListPage['shouldGenerateImpressionTelemetry'] = true;
            categoryListPage['sectionCode'] =  'browse_by_audience';
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should get Appname and supportedFacets should be defined', (done) => {
            //arrange
            mockCommonUtilService.getAppName = jest.fn();
            categoryListPage['supportedFacets'] = ["se_mediums", "subject", "primaryCategory", "audience"];
            const onSelectedFilter = { name: "accountancy", count: 124, apply: false };
            //act
            categoryListPage.ngOnInit();
            //assert
            setTimeout(() => {
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('deduceFilterCriteria', () => {
        it('should return filtercriteriadata if isDataEmpty && this.resentFilterCriteria are return true', () => {
            //arrange
            const isDataEmpty = true;
            categoryListPage['resentFilterCriteria'] = {
                facetFilters: [
                    { name: "se_mediums", values: Array(5) },
                    { name: "audience", values: Array(5) }
                ],
                facets: ["se_mediums", "audience"],
                primaryCategories: ["Digital Textbook"]
            }
            //act
            categoryListPage.deduceFilterCriteria(isDataEmpty);
            //assert
        })
        it('should return filterCriteriaData when filterPillList, filterPillBy and preFetchedFilterCriteria return true', () => {
            //arrange
            categoryListPage['filterPillList'] = [{ name: "course", count: 3016, apply: true }];
            categoryListPage['formField'] = {
                searchCriteria: { subjects: ['maths'] },
                facet: 'Course',
                aggregate: { groupBy: "subject", groupSortBy: [{ name: { order: "asc" } }] },
                filterPillBy: "primaryCategory"
            }
            categoryListPage['preFetchedFilterCriteria'] = {
                facets: ["se_mediums", "subject", "primaryCategory", "audience"],
                primaryCategories: ["Course"],
                limit: 100,
                mode: "soft",
                offset: 0
            }
            //act
            categoryListPage.deduceFilterCriteria();
            //assert
        })
        it('should return filterCriteriaData when all criteria become false', () => {
            //arrange
            categoryListPage['filterPillList'] = [{ name: "course", count: 3016, apply: true }];
            categoryListPage['formField'] = {
                searchCriteria: { subjects: ['maths'] },
                facet: 'Course',
                aggregate: { groupBy: "subject", groupSortBy: [{ name: { order: "asc" } }] },
                filterPillBy: null
            };
            categoryListPage['filterCriteria'] =  {
                facets: ["se_mediums", "subject", "primaryCategory", "audience"],
                primaryCategories: ["Course"],
                limit: 100,
                mode: "soft",
                offset: 0
            }
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                profileType: 'Student', subject: ['subject 1']
            } as any))
            categoryListPage['preFetchedFilterCriteria'] = null;
            //act
            categoryListPage.deduceFilterCriteria();
            //assert
        })
    });
    describe('onPrimaryFacetFilterSelect', () => {
        it('should check name values for facetFilterValue and toApply are equal on else case ', (done) => {
            //arrange
            const primaryFacetFilter = { code: "subject", values: [], name: "Subject", index: 2 };
            const toApply = [{ name: "audience", count: 124, apply: false }];
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        { name: 'subject1', code: 'code1', values: [{ name: 'audience' }] },
                        { name: 'course', code: 'code2', values: [{ name: 'maths' }] }
                    ]
                }
            });
            const refreshPillFilter = true;
            const onSelectedFilter = [];
            //act
            categoryListPage.onPrimaryFacetFilterSelect(primaryFacetFilter, toApply);
            //assert
            setTimeout(() => {
                done();
            }, 0)
        });
        it('should check name values for facetFilterValue and toApply are equal', (done) => {
            //arrange
            const primaryFacetFilter = { code: "subject", values: [], name: "Subject", index: 2 };
            const toApply = [{ name: "audience", count: 124, apply: false }];
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        { name: 'subject', code: 'code1', values: [{ name: 'audience' }] },
                        { name: 'course', code: 'code2', values: [{ name: 'maths' }] }
                    ]
                }
            });
            const refreshPillFilter = true;
            const onSelectedFilter = [];
            //act
            categoryListPage.onPrimaryFacetFilterSelect(primaryFacetFilter, toApply);
            //assert
            setTimeout(() => {
                done();
            }, 0)
        });
        it('should check name values for facetFilterValue and toApply are not equal', (done) => {
            //arrange
            const primaryFacetFilter = { code: "subject", values: [], name: "Subject", index: 2 };
            const toApply = [{ name: "accountancy", count: 124, apply: false }];
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        { name: 'subject', code: 'code1', values: [{ name: 'english' }] },
                        { name: 'course', code: 'code2', values: [{ name: 'maths' }] }
                    ]
                }
            });
            const onSelectedFilter = [];
            //act
            categoryListPage.onPrimaryFacetFilterSelect(primaryFacetFilter, toApply);
            //assert
            setTimeout(() => {
                done();
            }, 0)
        });
    });
    describe('navigate to ViewMore page', () => {
        it('should generate interact telemetry and if network available and navigate to textbook viewmore', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id', isAvailableLocally: true, contentData: { pkgVersion: 1 }
            });
            mockRouter.navigate = jest.fn();
            // act
            categoryListPage.navigateToViewMorePage({
                identifier: 'sample_id', isAvailableLocally: true, contentData: { pkgVersion: 1 }
            }, 'Mathematics',1);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.VIEW_MORE_CLICKED,
                Environment.HOME,
                PageId.LIBRARY,
                telemetryObject
            );
            // expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.TEXTBOOK_VIEW_MORE], {
            //     state: {
            //         contentList: {
            //             identifier: 'sample_id', isAvailableLocally: true, contentData: { pkgVersion: 1 }
            //         },
            //         subjectName: 'Mathematics',
            //         corRelation: [
            //             { id: 'Mathematics', type: 'Section' },
            //             { id: 'browse_by_audience', type: 'RootSection' },
            //             { id: {
            //                 searchCriteria: {
            //                  "subjects": ["maths"],
            //                 },
            //                 facet: 'Course',
            //                 aggregate: {
            //                     "groupBy": "subject",
            //                     "groupSortBy": [{
            //                         "name": {
            //                           "order": "asc",
            //                           "preference": [
            //                             "audience",
            //                             ["subject 1", "subject 2"],
            //                             ['accountancy'],
            //                             ["subject 1", "subject 2"],
            //                           ],
            //                         },
            //                       }]},
            //                 filterPillBy: null
            //               }, type: 'Content'}],
            //         supportedFacets: ["se_mediums", "subject", "primaryCategory", "audience"],
            //         totalCount: 1
            //     }
            // });
        });
        it('should generate interact telemetry and if network is not available and showToast', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id', isAvailableLocally: false, contentData: { pkgVersion: 1 }
            });
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            // act
            categoryListPage.navigateToViewMorePage({
                identifier: 'sample_id', isAvailableLocally: false, contentData: { pkgVersion: 1 }
            }, 'Mathematics',1);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.VIEW_MORE_CLICKED,
                Environment.HOME,
                PageId.LIBRARY,
                telemetryObject
            );
        });
    });
    describe('navigateToDetailsPage', () => {
        it('should navigate to details page and generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockNavService.navigateToDetailPage = jest.fn();
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id', isAvailableLocally: true, contentData: { pkgVersion: 1 }
            });
            const rollUp = ContentUtil.generateRollUp(undefined, 'sample_id');
            // act
            categoryListPage.navigateToDetailPage({
                data: {
                    content: { identifier: 'sample_id', pkgVersion: 1 }
                }, index: 1,
            }, 'Mathematics');
            // assert
            expect(mockNavService.navigateToDetailPage).toHaveBeenCalled();
        });
        it('should go else to else part toast if network is not available', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id',
                isAvailableLocally: true,
                contentData: { pkgVersion: 1 }
            });
            const rollUp = ContentUtil.generateRollUp(undefined, 'sample_id');
            // act
            categoryListPage.navigateToDetailPage({
                data: {
                    content: { identifier: 'sample_id', pkgVersion: 1 },
                    isAvailableLocally: false
                },
                index: 1,
            }, 'Mathematics');
            // assert
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalled();
        });
    });
    describe('navigateToFilterFormPage', () => {
        it('should navigate to filter form page', (done) => {
            //arrange
            const isDataEmpty = true;
            const openFiltersPage = (mockModalController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({
                        data: {
                            appliedFilterCriteria: {
                                facetFilters: [
                                    {
                                        name: 'sample_string', code: 'sample_code', values: [{ name: 'audience', apply: true }]
                                    }
                                ]
                            }
                        },
                    })),
                }) as any;
            }));
            categoryListPage.displayFacetFilters = {
                name1: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }],
                name2: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
            };
            jest.spyOn(categoryListPage, 'deduceFilterCriteria').mockImplementation();
            //act
            categoryListPage.navigateToFilterFormPage();
            //assert
            setTimeout(() => {
                expect(mockModalController.create).toHaveBeenCalled();
                done();
            });
        })
        it('should navigate to filter form page else on dismiss', (done) => {
            //arrange
            const isDataEmpty = true;
            const openFiltersPage = (mockModalController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({
                        data: ""
                    })),
                }) as any;
            }));
            categoryListPage.displayFacetFilters = {
                name1: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }],
                name2: [{ name: 'na 1', apply: false }, { name: 'na 2', apply: false }]
            };
            jest.spyOn(categoryListPage, 'deduceFilterCriteria').mockImplementation();
            //act
            categoryListPage.navigateToFilterFormPage();
            //assert
            setTimeout(() => {
                expect(mockModalController.create).toHaveBeenCalled();
                done();
            });
        })
    });
    it('should call scrollService() to id', () => {
        // arrange
        mockScrollService.scrollTo = jest.fn();
        // act
        categoryListPage.scrollToSection('Mathematics');
        // assert
        expect(mockScrollService.scrollTo).toHaveBeenCalledWith('Mathematics', {
            block: 'center',
            behavior: 'smooth'
        });
    });
    it('Should reload the drop down', () => {
        //arrange
        const item = {
            content: {},
            isAvailableLocally: true
        };
        const index = 0;
        //act
        categoryListPage.reloadDropdown(index, item);
        //assert
        expect(item);
    });
    it('should call clearAllSubscription on ngOnDestroy', () => {
        // arrange
        const formControlSubscriptions: Partial<Subscription[]> = [];
        // act
        categoryListPage.ngOnDestroy();
        // assert
        expect(formControlSubscriptions.forEach(s => s.unsubscribe()));
    });
    describe('pillFilterHandler', () => {
        it('should return nothing if pill is not defined', (done) => {
            //arrange
            const pill = null;
            //act
            categoryListPage.pillFilterHandler(pill);
            //assert
            setTimeout(() => {
                expect(pill).toBeFalsy();
                done();
            })
        });
        it('should check facetFilter if it return true', (done) => {
            //arrange
            const pill = { name: "course", count: 3034, apply: true };
            categoryListPage['filterPillList'] = [{ name: "course", count: 3016, apply: true }];
            categoryListPage['formField'] = {
                searchCriteria: { subjects: ['maths'] },
                facet: 'Course',
                aggregate: { groupBy: "subject", groupSortBy: [{ name: { order: "asc" } }] },
                filterPillBy: "subject"
            };
            categoryListPage['preFetchedFilterCriteria'] = null;
            categoryListPage['supportedUserTypesConfig'] = [{code: 'audience'}];
            categoryListPage['primaryFacetFiltersFormGroup'] = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: 'sample-subpersona'
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                },
                patchValue: jest.fn()
            } as any;
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        { name: 'subject', code: 'code1', values: [] },
                        { name: 'course', code: 'code2', values: [] }
                    ]
                }
            });
            const refreshPillFilter = true;
            //act
            categoryListPage.pillFilterHandler(pill);
            //assert
            setTimeout(() => {
                done();
            })
        })
        it('should check facetFilter if it return true, if no filter values', (done) => {
            //arrange
            const pill = { name: "course", count: 3034, apply: true };
            categoryListPage['filterPillList'] = [{ name: "course", count: 3016, apply: true }];
            categoryListPage['formField'] = {
                searchCriteria: { subjects: ['maths'] },
                facet: 'Course',
                aggregate: { groupBy: "subject", groupSortBy: [{ name: { order: "asc" } }] },
                filterPillBy: "subject"
            };
            categoryListPage['preFetchedFilterCriteria'] = null;
            categoryListPage['supportedUserTypesConfig'] = [{code: 'audience'}];
            categoryListPage['primaryFacetFiltersFormGroup'] = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: 'sample-subpersona'
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                },
                patchValue: jest.fn()
            } as any;
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        // { name: 'subject', code: 'code1', values: [{ name: 'audience', apply: true }] },
                        // { name: 'course', code: 'code2', values: [{ name: 'maths', apply: false }] }
                    ]
                }
            });
            const refreshPillFilter = true;
            //act
            categoryListPage.pillFilterHandler(pill);
            //assert
            setTimeout(() => {
                done();
            })
        })
        it('should check facetFilter if it return true on else case', (done) => {
            //arrange
            const pill = { name: "course", count: 3034, apply: true };
            categoryListPage['filterPillList'] = [{ name: "course", count: 3016, apply: true }];
            categoryListPage['formField'] = {
                searchCriteria: { subjects: ['maths'] },
                facet: 'Course',
                aggregate: { groupBy: "subject", groupSortBy: [{ name: { order: "asc" } }] },
                filterPillBy: "subject1"
            };
            categoryListPage['preFetchedFilterCriteria'] = null;
            categoryListPage['supportedUserTypesConfig'] = [{code: 'audience'}];
            categoryListPage['primaryFacetFiltersFormGroup'] = {
                value: {
                    children: {
                        persona: {
                            type: { type: 'sample-type' },
                            code: 'sample-code',
                            subPersona: 'sample-subpersona'
                        }
                    },
                    name: 'sample name',
                    persona: {
                        type: { type: 'sample-type' },
                        code: 'sample-code',
                        subPersona: [{}]
                    }
                },
                patchValue: jest.fn()
            } as any;
            categoryListPage.deduceFilterCriteria = jest.fn(() => {
                return {
                    query: 'a query',
                    facetFilters: [
                        { name: 'subject', code: 'code1', values: [{ name: 'audience', apply: true }] },
                        { name: 'audience', code: 'code2', values: [{ name: 'maths', apply: false }] }
                    ]
                }
            });
            const refreshPillFilter = true;
            //act
            categoryListPage.pillFilterHandler(pill);
            //assert
            setTimeout(() => {
                done();
            })
        })
    });
    describe('getExistingFilters', () => {
        it('should check whether formFields.filterPillBy is true or not', () => {
            //arrange
            const existingSearchFilters = {};
            const formFields = {
                facet: "Digital Textbook",
                index: 0,
                filterPillBy: "primaryCategory",
                primaryFacetFilters: [
                    { code: "subject", name: "Subject", index: 2,  patchValue: jest.fn() },
                    { code: "audience", name: "Role", index: 4 },
                ]
            }
            //act
            categoryListPage.getExistingFilters(formFields);
            //assert
            expect(formFields.filterPillBy).toBeTruthy();
        })

        it('should check whether formFields.filterPillBy is true or not and else on primaryFacetFilters', () => {
            //arrange
            const existingSearchFilters = {};
            const formFields = {
                facet: "Digital Textbook",
                index: 0,
                filterPillBy: "primaryCategory",
                primaryFacetFilters: ''
            }
            //act
            categoryListPage.getExistingFilters(formFields);
            //assert
            expect(formFields.filterPillBy).toBeTruthy();
        })

        it('should check else case if no formfields', () => {
            //arrange
            const formFields = ''
            //act
            categoryListPage.getExistingFilters(formFields);
            //assert
        })
    });
});