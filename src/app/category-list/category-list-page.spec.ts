import {CategoryListPage} from './category-list-page';
import {CommonUtilService} from '../../services/common-util.service';
import {Router} from '@angular/router';
import {AppHeaderService} from '../../services/app-header.service';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation-handler.service';
import {ContentService, CourseService, FormService, ProfileService} from '@project-sunbird/sunbird-sdk';
import {ScrollToService} from '../../services/scroll-to.service';
import {Environment, FormAndFrameworkUtilService, InteractSubtype, InteractType, PageId, TelemetryGeneratorService} from '../../services';
import {ContentUtil} from '@app/util/content-util';
import {RouterLinks} from '@app/app/app.constant';
import {ModalController} from '@ionic/angular';

describe('CategoryListPage', () => {
    let categoryListPage: CategoryListPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn()
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({profileType: 'Student'} as any))
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockRouterExtras = {
        extras: {
            state: {
                formField: {
                    searchCriteria: {
                        subjects: ['maths']
                    },
                    facet: 'sample',
                    primaryFacetFilters: [
                        {
                            code: '1',
                            translations: 'en'
                        }
                    ]
                },
                fromLibrary: true
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
                        facetFilters: [
                            {
                                name: 'sample_string',
                                values: [{
                                    name: 'sample_string',
                                    count: 2,
                                    apply: true,

                                }]

                            }
                        ]
                    },
                    searchRequest: {},
                    searchCriteria: {}
                }
            }
        ]
    }));
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockNavService: Partial<NavigationService> = {
        navigateToTrackableCollection: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToContent: jest.fn()
    };
    const mockContentService: Partial<ContentService> = {};
    const mockFormService: Partial<FormService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockScrollService: Partial<ScrollToService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
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
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
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
        // it('should get appName from commonUtilService and also check if supportedFacets is available', (done) => {
        //     // arrange
        //     mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        //     mockHeaderService.showHeaderWithBackButton = jest.fn();
        //     mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([]));
        //     mockContentService.buildContentAggregator = jest.fn(() => ({
        //         aggregate: data
        //     })) as any;
        //     // act
        //     categoryListPage.ionViewWillEnter();
        //     // assert
        //     setTimeout(() => {
        //         expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        //         expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        //         expect(data).toHaveBeenCalled();
        //         done();
        //     }, 0);
        // });
    });

    describe('navigate to Textbook page', () => {
        it('should generate interact telemetry and if network available and navigate to textbook viewmore', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id',
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                }
            });
            mockRouter.navigate = jest.fn();
            // act
            categoryListPage.navigateToTextbookPage({
                identifier: 'sample_id',
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                }
            }, 'Mathematics');
            // assert

            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.VIEW_MORE_CLICKED,
                Environment.HOME,
                PageId.LIBRARY,
                telemetryObject
            );
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.TEXTBOOK_VIEW_MORE], {
                state: {
                    contentList: {
                        identifier: 'sample_id',
                        isAvailableLocally: true,
                        contentData: {
                            pkgVersion: 1
                        }
                    },
                    subjectName: 'Mathematics'
                }
            });
        });

        it('should generate interact telemetry and if network is not available and showToast', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            const telemetryObject = ContentUtil.getTelemetryObject({
                identifier: 'sample_id',
                isAvailableLocally: false,
                contentData: {
                    pkgVersion: 1
                }
            });
            mockCommonUtilService.presentToastForOffline = jest.fn(() => Promise.resolve());
            // act
            categoryListPage.navigateToTextbookPage({
                identifier: 'sample_id',
                isAvailableLocally: false,
                contentData: {
                    pkgVersion: 1
                }
            }, 'Mathematics');
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
                identifier: 'sample_id',
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                }
            });
            const rollUp = ContentUtil.generateRollUp(undefined, 'sample_id');

            // act
            categoryListPage.navigateToDetailPage({
                data: {
                    content: {
                        identifier: 'sample_id',
                        pkgVersion: 1
                    }
                },
                index: 1,
            }, 'Mathematics');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractSubtype.SELECT_CONTENT,
                '',
                Environment.HOME,
                PageId.CATEGORY_RESULTS,
                telemetryObject,
                {
                    positionClicked: 1,
                    sectionName: 'Mathematics'
                },
                rollUp,
                [{
                    id: 'Mathematics',
                    type: 'Section'
                }]
            );
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
                contentData: {
                    pkgVersion: 1
                }
            });
            const rollUp = ContentUtil.generateRollUp(undefined, 'sample_id');

            // act
            categoryListPage.navigateToDetailPage({
                data: {
                    content: {
                        identifier: 'sample_id',
                        pkgVersion: 1
                    },
                    isAvailableLocally: false
                },
                index: 1,
            }, 'Mathematics');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractSubtype.SELECT_CONTENT,
                '',
                Environment.HOME,
                PageId.CATEGORY_RESULTS,
                telemetryObject,
                {
                    positionClicked: 1,
                    sectionName: 'Mathematics'
                },
                rollUp,
                [{
                    id: 'Mathematics',
                    type: 'Section'
                }]
            );
            expect(mockCommonUtilService.presentToastForOffline).toHaveBeenCalled();
        });
    });

    // it('should navigate to formFilter page', (done) => {
    //     // arrange
    //     mockModalController.create = jest.fn(() => (Promise.resolve(
    //         {
    //             present: jest.fn(() => Promise.resolve({})),
    //             onDidDismiss: jest.fn(() => Promise.resolve({
    //                 data: {
    //                     appliedFilterCriteria: {
    //                         facetFilters: [
    //                             {
    //                                 name: 'sample_string',
    //                                 code: 'sample_code',
    //                                 values: [{
    //                                     name: 'audience',
    //                                     apply: true
    //                                 }]
    //                             }
    //                         ]
    //                     }

    //                 },
    //             })),
    //         } as any
    //     )));
    //     mockContentService.buildContentAggregator = jest.fn(() => ({
    //         aggregate: data
    //     })) as any;
    //     // act
    //     categoryListPage.navigateToFilterFormPage();
    //     // assert
    //     setTimeout(() => {
    //         expect(mockModalController.create).toHaveBeenCalled();
    //         done();
    //     });
    // });

    it('should get facetValues and set audience filter', () => {
        // arrange
        categoryListPage['supportedUserTypesConfig'] = [{
            code: 'sample'
        }];
        mockModalController.create = jest.fn(() => (Promise.resolve(
            {
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({
                    data: {
                        appliedFilterCriteria: {
                            facetFilters: [
                                {
                                    name: 'audience',
                                    values: [{
                                        name: 'audience',
                                        apply: true
                                    }]
                                }
                            ]
                        }

                    },
                })),
            } as any
        )));
        mockContentService.buildContentAggregator = jest.fn(() => ({
            aggregate: data
        })) as any;
        // act
        categoryListPage.navigateToFilterFormPage();
        // assert
        setTimeout(() => {
            expect(mockModalController.create).toHaveBeenCalled();
            done();
        });
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
});
