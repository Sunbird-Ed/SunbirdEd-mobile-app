import { Router, ActivatedRoute} from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { of} from 'rxjs';
import { Location } from '@angular/common';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService, UtilsService, ToastService } from "../../core";
import { DbService } from '../../core/services/db.service';
import { Platform, PopoverController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SyncService } from '../../core/services/sync.service';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { GenericPopUpService } from '../../shared';
import { ProjectListingComponent } from './project-listing.component'

describe('ProjectListingComponent', () => {
    let projectListingComponent : ProjectListingComponent;
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
        extras: {
          state: {
            ongoingBatches: [],
            upcommingBatches: [],
            course: {},
            objRollup: {},
            corRelationList: [],
            telemetryObject: {
              id: '',
              type: '',
              version: '',
            },
          },
        },
      })) as any};
    const mockRouterParams: Partial<ActivatedRoute> = {queryParams: of({})};
    const mockLocation: Partial<Location> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockUnnatiService: Partial<UnnatiDataService> = {};
    const mockKendra: Partial<KendraApiService> = {};
    const mockLoader: Partial<LoaderService> = {};
    const mockTranslate: Partial<TranslateService> = {get: jest.fn(() => of(''))};
    const mockUtils: Partial<UtilsService> = {
        setProfileData: jest.fn(() => Promise.resolve({ generatedKey: 'sa', userData: 'data' })),
        closeProfileAlert: jest.fn(),
        getProfileData: jest.fn(),
        getProfileInfo: jest.fn(),
        getUniqueKey: jest.fn(),
      };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        networkAvailability$: of(true),
        networkInfo: { isNetworkAvailable: true }
    };
    const mockSyncService: Partial<SyncService> = {};
    const mockDB: Partial<DbService> = {};
    const mockPopOverCtrl:Partial<PopoverController> = {};
    const mockToastController: Partial<ToastController> = {};
    const mockPopUpService: Partial<GenericPopUpService> = {};
    const mockToastService: Partial<ToastService> = {};
    
    beforeAll(() =>{
        projectListingComponent = new ProjectListingComponent(
            mockRouter as Router,
            mockRouterParams as ActivatedRoute,
            mockLocation as Location,
            mockHeaderService as AppHeaderService,
            mockPlatform as Platform,
            mockUnnatiService as UnnatiDataService,
            mockKendra as KendraApiService,
            mockLoader as LoaderService,
            mockTranslate as TranslateService,
            mockUtils as UtilsService,
            mockCommonUtilService as CommonUtilService,
            mockSyncService as SyncService,
            mockDB as DbService,
            mockPopOverCtrl as PopoverController,
            mockToastController as ToastController,
            mockPopUpService as GenericPopUpService,
            mockToastService as ToastService
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should create instatance', () => {
        expect(projectListingComponent).toBeTruthy();
    });

    it('ionViewWillEnter', () => {
      //arrange
      projectListingComponent['projects'] = [];
      projectListingComponent['page'] = 1;
      projectListingComponent['currentOnlineProjectLength'] = 0;
      mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                     showHeader: true,
                     showBurgerMenu: true,
                     pageTitle: 'string',
                     actionButtons: ['true'],
                 }));
      mockHeaderService.updatePageConfig = jest.fn();
      mockPlatform.backButton = {
                     subscribeWithPriority: jest.fn((_, cb) => {
                         setTimeout(() => {
                             cb();
                         }, 0);
                         return {
                             unsubscribe: jest.fn()
                         };
                     }),
                 } as any;
      mockLocation.back = jest.fn();
      //act
      projectListingComponent.ionViewWillEnter();
      //assert
      expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
      expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
      expect(mockPlatform.backButton).not.toBeUndefined();
    });
    // describe('ionViewWillEnter', () => {
    //     it('Should return list of projects / projectsList by invoked ionViewWillEnter', (done) => {
    //         // arrange 
    //         mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
    //         mockUnnatiDataService.post = jest.fn(() =>
    //             of({
    //                 result: {
    //                     data: [
    //                         {
    //                             description: "Come See Our School!- Parent Mela",
    //                             externalId: "AP-TEST-PROGRAM-3.6.5-IMP-PROJECT-1-DEO",
    //                             name: "Come See Our School!- Parent Mela",
    //                             programId: "600ab53cc7de076e6f993724",
    //                             programName: "AP-TEST-PROGRAM-3.6.5",
    //                             projectTemplateId: "600acc61a0cc3e4909f91f80",
    //                             solutionId: "600acc42c7de076e6f995147",
    //                             type: "improvementProject",
    //                             _id: "60116ad0b2126d76f60b0fb3",
    //                         }
    //                     ],
    //                 },
    //             })
    //         );
            
    //         mockAppHeaderService.getDefaultPageConfig = jest.fn(() => ({
    //             showHeader: true,
    //             showBurgerMenu: true,
    //             pageTitle: 'string',
    //             actionButtons: ['true'],
    //         }));
    //         mockAppHeaderService.updatePageConfig = jest.fn();
    //         mockPlatform.backButton = {
    //             subscribeWithPriority: jest.fn((_, cb) => {
    //                 setTimeout(() => {
    //                     cb();
    //                 }, 0);
    //                 return {
    //                     unsubscribe: jest.fn()
    //                 };
    //             }),
    //         } as any;
    //         mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
    //         mockLoaderService.stopLoader = jest.fn(() => Promise.resolve());
    //         mockLocation.back = jest.fn();
    //         // act
    //         component.ionViewWillEnter();
    //         // assert
    //         setTimeout(() => {
    //             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
    //             expect(mockUnnatiDataService.post).toHaveBeenCalled();
    //             expect(component.projects.length).toBeGreaterThan(0);
    //             expect(mockAppHeaderService.getDefaultPageConfig).toHaveBeenCalled();
    //             expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalled();
    //             expect(mockPlatform.backButton).not.toBeUndefined();
    //             expect(mockLocation.back).toHaveBeenCalled();
    //             done();
    //         }, 0);
    //     });

    //     it('Re assign project array if no projects is present', (done) => {
    //         // arrange
    //         mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
    //         mockUnnatiDataService.post = jest.fn(() => throwError({}));
    //         mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
    //         mockLoaderService.stopLoader = jest.fn(() => Promise.resolve());
    //         // act
    //         component.getProjectList();
    //         // assert
    //         setTimeout(() => {
    //             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
    //             expect(mockUnnatiDataService.post).toHaveBeenCalled();
    //             expect(component.projects.length).toBe(0);
    //             done();
    //         }, 0);
    //     });

    //     it('Should unsubscribe if backButtonFunc is not undefined', (done) => {
    //         // arrange
    //         mockPlatform.backButton = {
    //             subscribeWithPriority: jest.fn((_, cb) => {
    //                 setTimeout(() => {
    //                     cb();
    //                 }, 0);
    //                 return {
    //                     unsubscribe: jest.fn()
    //                 };
    //             }),
    //         } as any;
    //         // act
    //         component.ionViewWillLeave();
    //         // assert
    //         setTimeout(() => {
    //             // expect(mockPlatform.backButton.unsubscribe).toHaveBeenCalled();
    //             done();
    //         }, 0);
    //     });
    // });

    // describe('ProjectDetail', () => {
    //     it('Should navigate to project detail Page', (done) => {
    //         //arrange
    //         mockRouter.navigate = jest.fn();
    //         // act
    //         let project = {
    //             programId: '600ab53cc7de076e6f993724',
    //             solutionId: '600acc42c7de076e6f995147'
    //         }
    //         let id = '60116ad0b2126d76f60b0fb3';
    //         component.selectedProgram(id, project);
    //         // assert
    //         setTimeout(() => {
    //             expect(mockRouter.navigate).toHaveBeenCalledWith(['project/details', id, project.programId, project.solutionId]);
    //             done();
    //         }, 0);
    //     })
    // });

    // describe('CreateProject', () => {
    //     it('Should navigate to create project Page', (done) => {
    //         //arrange
    //         mockRouter.navigate = jest.fn();
    //         // act
    //         component.createProject();
    //         // assert
    //         setTimeout(() => {
    //             expect(mockRouter.navigate).toHaveBeenCalledWith(['/project/create-project'], {
    //                 queryParams: {}
    //             });
    //             done();
    //         }, 0);
    //     })
    // });

    // describe('Loadmore', () => {
    //     it('Should load more projects based on limit and page.', (done) => {
    //         //arrange
    //         component.page = 0;
    //         // act
    //         component.loadMore();
    //         // assert 
    //         setTimeout(() => {
    //             expect(component.page).toBe(1);
    //             done();
    //         }, 0);
    //     })
    // })
});