import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { of, throwError } from 'rxjs';
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
  let projectListingComponent: ProjectListingComponent;
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
    })) as any
  };
  const mockRouterParams: Partial<ActivatedRoute> = { queryParams: of({}) };
  const mockLocation: Partial<Location> = {};
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockUnnatiService: Partial<UnnatiDataService> = {};
  const mockKendra: Partial<KendraApiService> = {
    post: jest.fn(() =>
      of({
        result: {
          data: [
            {
              _id: '60110e692d0bbd2f0c3229c3',
              name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
              description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
              programId: '600ab53cc7de076e6f993724',
              solutionId: '600ac0d1c7de076e6f9943b9',
              programName: 'AP-TEST-PROGRAM-3.6.5',
            },
          ],
        },
      })
    ),
  };
  const mockLoader: Partial<LoaderService> = { startLoader: jest.fn(() => Promise.resolve()) };
  const mockTranslate: Partial<TranslateService> = { get: jest.fn(() => of('')) };
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
  const mockPopOverCtrl: Partial<PopoverController> = {};
  const mockToastController: Partial<ToastController> = {};
  const mockPopUpService: Partial<GenericPopUpService> = {};
  const mockToastService: Partial<ToastService> = { showMessage: jest.fn() };

  beforeAll(() => {
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
  it('getCreatedProjects', () => {
    //arrange
    //act
    projectListingComponent.getCreatedProjects();
    //assert
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
  describe('downloaded', () => {
    it('should execute try block downloaded', (done) => {
      //arrange
      const project = {
        _id: '600ab53cc7de076e6f993724',
        downLoaded: false
      }
      mockDB.getById = jest.fn(() => Promise.resolve(project));
      mockDB.update = jest.fn(() => Promise.resolve());
      mockLoader.startLoader = jest.fn(() => Promise.resolve());
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      //act
      projectListingComponent.getProjectList().then(() => {
        expect(mockKendra.post).toHaveBeenCalled();
        done();
      });
      projectListingComponent.downloaded(project);
      //assert
      setTimeout(() => {
        expect(mockDB.getById).toHaveBeenCalled();
        done();
      }, 0);
    });
    it('should execute catch block downloaded', (done) => {
      //arrange
      const project = {
        _id: '600ab53cc7de076e6f993724'
      }
      mockDB.getById = jest.fn(() => Promise.reject({
        error: 'Error message'
      }));
      mockLoader.startLoader = jest.fn(() => Promise.resolve());
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      mockUnnatiService.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                isEdit: false
              }],
            categories: [{
              _id: '60116ad0b2126d76f60b0fb3',
              name: 'Come See Our School!- Parent Mela',
              label: 'label'
            }],
            tasks: [{
              type: 'observation',
              status: false,
              isEdit: false,
              submissionDetails: {
                status: true
              }
            }]
          },
        }));
      mockDB.create = jest.fn(() => Promise.resolve());
      mockLoader.stopLoader = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.getProjectList().then(() => {
        expect(mockKendra.post).toHaveBeenCalled();
        done();
      });
      projectListingComponent.downloaded(project);
      //assert
      setTimeout(() => {
        expect(mockDB.getById).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
  describe('onSearch', () => {
    it('should do when searchText is unavailable', () => {
      //arrange
      const e = 'event';
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available and customQuery return success', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        mockDB.customQuery = jest.fn(() => Promise.resolve({
          docs: 'docs'
        }));
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available, customQuery return success and selectedFilterIndex = 1', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        mockDB.customQuery = jest.fn(() => Promise.resolve({
          docs: 'docs'
        }));
      projectListingComponent.selectedFilterIndex = 1;
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available, customQuery return success and selectedFilterIndex = 2', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        mockDB.customQuery = jest.fn(() => Promise.resolve({
          docs: 'docs'
        }));
      projectListingComponent.selectedFilterIndex = 2;
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available, customQuery return success and selectedFilterIndex = 3', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        mockDB.customQuery = jest.fn(() => Promise.resolve({
          docs: 'docs'
        }));
      projectListingComponent.selectedFilterIndex = 3;
      mockKendra.post = jest.fn(() =>
        throwError('error')
      );
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available and customQuery return error', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        mockDB.customQuery = jest.fn(() => Promise.reject());
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available and networkFlag is false', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        projectListingComponent.networkFlag = false;
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      mockDB.customQuery = jest.fn(() => Promise.resolve({
        docs: 'docs'
      }));
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();
    });
    it('should do when searchText is available and networkFlag is false, selectedFilterIndex is 0', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        projectListingComponent.networkFlag = false;
      projectListingComponent.selectedFilterIndex = 0;
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      mockDB.customQuery = jest.fn(() => Promise.resolve({
        docs: 'docs'
      }));
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();

    });
    it('should do when searchText is available and networkFlag is false, selectedFilterIndex is 1', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        projectListingComponent.networkFlag = false;
      projectListingComponent.selectedFilterIndex = 1;
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      mockDB.customQuery = jest.fn(() => Promise.resolve({
        docs: 'docs'
      }));
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();

    });
    it('should do when searchText is available and networkFlag is false, selectedFilterIndex is 2', () => {
      //arrange
      const e = 'event';
      projectListingComponent.searchText = 'text to search',
        projectListingComponent.networkFlag = false;
      projectListingComponent.selectedFilterIndex = 2;
      mockKendra.post = jest.fn(() =>
        of({
          result: {
            data: [
              {
                _id: '60110e692d0bbd2f0c3229c3',
                name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600ac0d1c7de076e6f9943b9',
                programName: 'AP-TEST-PROGRAM-3.6.5',
              },
            ],
          },
        })
      );
      mockDB.customQuery = jest.fn(() => Promise.resolve({
        docs: 'docs'
      }));
      //act
      projectListingComponent.onSearch(e);
      //assert
      expect(projectListingComponent.onSearch).toBeTruthy();

    });
  });
  it('ngOnDestroy', () => {
    //arrange
    projectListingComponent['_networkSubscription'] = {
      unsubscribe: jest.fn()
    } as any;
    projectListingComponent['_toast'] = {
      present: jest.fn(),
      dismiss: jest.fn()
    } as any;
    //act
    projectListingComponent.ngOnDestroy();
    //assert
    expect(projectListingComponent['_networkSubscription'].unsubscribe).toHaveBeenCalled();
  });
  describe('doAction', () => {
    it('should doAction when project have value and selectedFilterIndex = 0', () => {
      //arrange
      const id = 'id';
      const project = {
        hasAcceptedTAndC: true
      };
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have no value', () => {
      //arrange
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.doAction();
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have no value and isClicked is true', () => {
      //arrange
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true
      }));
      //act
      projectListingComponent.doAction();
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have value and selectedFilter is createdByMe, isChecked and isNew is true', () => {
      //arrange
      const id = 'id';
      const project = {
        _id: '600ab53cc7de076e6f993724',
        lastDownloadedAt: '12/04/2022',
        hasAcceptedTAndC: false,
        solutionId: '600acc42c7de076e6f995147',
        isNew: true
      };
      projectListingComponent.selectedFilterIndex = 1;
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true,
        isChecked: true,
      }));
      mockDB.update = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have value and selectedFilter is createdByMe, isChecked is true and isNew is false', () => {
      //arrange
      const id = 'id';
      const project = {
        _id: '600ab53cc7de076e6f993724',
        lastDownloadedAt: '12/04/2022',
        hasAcceptedTAndC: false,
        solutionId: '600acc42c7de076e6f995147',
        isNew: false
      };
      projectListingComponent.networkFlag = true;
      projectListingComponent.selectedFilterIndex = 1;
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true,
        isChecked: true,
      }));
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have value and selectedFilter is createdByMe, isChecked and isNew is true and networkflag is undefined', () => {
      //arrange
      const id = 'id';
      const project = {
        _id: '600ab53cc7de076e6f993724',
        lastDownloadedAt: '12/04/2022',
        hasAcceptedTAndC: false,
        solutionId: '600acc42c7de076e6f995147',
        isNew: true
      };
      projectListingComponent.selectedFilterIndex = 1;
      projectListingComponent.networkFlag = undefined;
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true,
        isChecked: true,
      }));
      mockDB.update = jest.fn(() => Promise.resolve());
      mockToastService.showMessage = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have value and selectedFilter is createdByMe, isChecked is true, isNew is false and networkFlag is undefined', () => {
      //arrange
      const id = 'id';
      const project = {
        _id: '600ab53cc7de076e6f993724',
        lastDownloadedAt: '12/04/2022',
        hasAcceptedTAndC: false,
        solutionId: '600acc42c7de076e6f995147',
        isNew: false
      };
      projectListingComponent.selectedFilterIndex = 1;
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true,
        isChecked: true,
      }));
      projectListingComponent.networkFlag = undefined;
      mockToastService.showMessage = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
    it('should doAction when project have value and selectedFilter is createdByMe and isChecked is false', () => {
      //arrange
      const id = 'id';
      const project = {
        _id: '600ab53cc7de076e6f993724',
        lastDownloadedAt: '12/04/2022',
        hasAcceptedTAndC: false,
        solutionId: '600acc42c7de076e6f995147'
      };
      projectListingComponent.selectedFilterIndex = 1;
      mockPopUpService.showPPPForProjectPopUp = jest.fn(() => Promise.resolve({
        isClicked: true,
        isChecked: false,
      }));
      //act
      projectListingComponent.doAction(id, project);
      //assert
      expect(projectListingComponent.doAction).toBeTruthy();
    });
  });
  describe('fetchProjectList', () => {
    it('networkFlag should be true', () => {
      //arrange
      projectListingComponent.networkFlag = true;
      projectListingComponent.selectedFilterIndex = 2;
      //act
      projectListingComponent.fetchProjectList();
      //assert
      expect(projectListingComponent.fetchProjectList).toBeTruthy();
    })
    it('networkFlag should be false', () => {
      //arrange
      projectListingComponent.networkFlag = false;
      //act
      projectListingComponent.fetchProjectList();
      //assert
    })
  });
  describe('getDataByFilter', () => {
    it('should execute while filter is defined', () => {
      //arrange
      const filter = {
        data: {
          text: 'data text',
          index: 1
        }
      };
      //act
      projectListingComponent.getDataByFilter(filter);
      //assert
      expect(projectListingComponent.getDataByFilter).toBeTruthy();
    });
    it('should execute while filter is undefined', () => {
      //arrange
      const filter = undefined;
      //act
      projectListingComponent.getDataByFilter(filter);
      //assert
      expect(projectListingComponent.getDataByFilter).toBeTruthy();
    });
  });
  it('ionViewWillLeave', () => {
    //arrange
    const subscribeWithPriorityData = jest.fn((_, fn) => fn());
    mockPlatform.backButton = {
      subscribeWithPriority: subscribeWithPriorityData
    } as any;
    mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
      showHeader: true,
      showBurgerMenu: true,
      pageTitle: 'string',
      actionButtons: ['true'],
    }));
    //act
    projectListingComponent.ionViewWillLeave();
    //assert
    expect(mockPlatform.backButton).toBeTruthy();
  });
  it('handleBackButton', () => {
    //arrange
    const subscribeWithPriorityData = jest.fn((_, fn) => fn());
    mockPlatform.backButton = {
      subscribeWithPriority: subscribeWithPriorityData
    } as any;
    //act
    projectListingComponent.handleBackButton();
    //assert
  });
  it('loadMore', () => {
    //arrange
    projectListingComponent.networkFlag = false;
    //act
    projectListingComponent.loadMore();
    //assert
    expect(projectListingComponent.loadMore).toBeTruthy();
  });
  describe('checkProjectInLocal', () => {
    it('should check projectInLocal have data in success.docs', () => {
      //arrange
      const id = 'id';
      const status = true;
      const selectedProject = 'project';
      mockDB.query = jest.fn(() => Promise.resolve(
        {
          _id: id,
          docs: [
            { name: 'na1' },
            { name: 'na2' }
          ]
        }
      ));
      mockDB.update = jest.fn(() => Promise.resolve());
      //act
      projectListingComponent.checkProjectInLocal(id, status, selectedProject);
      //assert
      expect(projectListingComponent.checkProjectInLocal).toBeTruthy();
    });
    it('should check projectInLocal have no data in success.docs and status is true', () => {
      //arrange
      const id = 'id';
      const status = true;
      const selectedProject = { hasAcceptedTAndC: true };
      mockDB.query = jest.fn(() => Promise.resolve(
        {
          _id: id,
          docs: []
        }
      ));
      //act
      projectListingComponent.checkProjectInLocal(id, status, selectedProject);
      //assert
      expect(projectListingComponent.checkProjectInLocal).toBeTruthy();
    });
    it('should check projectInLocal have no data in success.docs and status is false', () => {
      //arrange
      const id = 'id';
      const status = false;
      const selectedProject = { hasAcceptedTAndC: true };
      mockDB.query = jest.fn(() => Promise.resolve(
        {
          _id: id,
          docs: []
        }
      ));
      //act
      projectListingComponent.checkProjectInLocal(id, status, selectedProject);
      //assert
      expect(projectListingComponent.checkProjectInLocal).toBeTruthy();
    });
    it('should catch error in check', () => {
      //arrange
      const id = 'id';
      const status = false;
      const selectedProject = { hasAcceptedTAndC: true };
      jest.spyOn(mockDB, 'query').mockReturnValue(Promise.reject());
      //act
      projectListingComponent.checkProjectInLocal(id, status, selectedProject);
      //assert
      expect(projectListingComponent.checkProjectInLocal).toBeTruthy();
    });
  });
  it('updateInserver', () => {
    //arrange
    const project = {
      _id: '600ab53cc7de076e6f993724',
      lastDownloadedAt: '12/04/2022',
      hasAcceptedTAndC: 'accept',
      solutionId: '600acc42c7de076e6f995147'
    }
    mockSyncService.syncApiRequest = jest.fn(() => Promise.resolve());
    //act
    projectListingComponent.updateInserver(project);
    //assert
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