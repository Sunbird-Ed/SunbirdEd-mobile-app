import { Router } from '@angular/router';
import { AppHeaderService, CommonUtilService } from '../../../../services';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { ObservationHomeComponent } from './observation-home.component';
import { of, throwError } from 'rxjs';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { ObservationService } from '../observation.service';
describe('ObservationHomeComponent', () => {
  let observationHomeComponent: ObservationHomeComponent;
  let mockHeaderService: Partial<AppHeaderService> = {};
  let mockUtils: Partial<UtilsService> = {
    setProfileData: jest.fn(() => Promise.resolve({ generatedKey: 'sa', userData: 'data' })),
    closeProfileAlert: jest.fn(),
  };
  let mockKendraService: Partial<KendraApiService> = {
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
  let mockloader: Partial<LoaderService> = {
    startLoader: jest.fn(),
    stopLoader: jest.fn(),
  };
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
    })) as any,

    navigate: jest.fn(() => Promise.resolve(true)),
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    networkAvailability$: of(true),
    networkInfo: { isNetworkAvailable: true },
  };
  let mockToastService: Partial<ToastService> = {
    showMessage: jest.fn(),
  };

  let mockObsService: Partial<ObservationService> = {};
  let mockStorage: Partial<LocalStorageService> = {
    setLocalStorage: jest.fn(),
  };

  beforeAll(() => {
    observationHomeComponent = new ObservationHomeComponent(
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockUtils as UtilsService,
      mockKendraService as KendraApiService,
      mockloader as LoaderService,
      mockStorage as LocalStorageService,
      mockCommonUtilService as CommonUtilService,
      mockToastService as ToastService,
      mockObsService as ObservationService
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should instanciate ObservationHomeComponent', () => {
    expect(observationHomeComponent).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set solution list to empty array', () => {
      observationHomeComponent.ngOnInit();
      expect(observationHomeComponent.solutionList.length).toBe(0);
    });
  });

  describe('ionViewWillEnter', () => {
    it('shoould call get profile', () => {
      mockHeaderService.getDefaultPageConfig = jest.fn(() => {
        return {
          showHeader: true,
          showBurgerMenu: false,
          showKebabMenu: false,
          kebabMenuOptions: [],
          pageTitle: '',
          actionButtons: [],
        };
      });
      mockHeaderService.updatePageConfig = jest.fn(() => {});
      spyOn(observationHomeComponent, 'getProfileInfo');
      observationHomeComponent.ionViewWillEnter();
      expect(observationHomeComponent.getProfileInfo).toHaveBeenCalled();
    });
  });

  describe('getProileInfo', () => {
    it('should call getPrograms if network is available', (done) => {
      spyOn(observationHomeComponent, 'getPrograms');
      spyOn(observationHomeComponent, 'getLocalData');
      observationHomeComponent.getProfileInfo();
      setTimeout(() => {
        expect(observationHomeComponent.getPrograms).toHaveBeenCalled();
        expect(observationHomeComponent.getLocalData).not.toHaveBeenCalled();
        done();
      });
    });
    it('should call getLocalData if network is not available', (done) => {
      observationHomeComponent.networkFlag = false;
      spyOn(observationHomeComponent, 'getPrograms');
      spyOn(observationHomeComponent, 'getLocalData');
      observationHomeComponent.getProfileInfo().then(() => {
        expect(observationHomeComponent.getPrograms).not.toHaveBeenCalled();
        expect(observationHomeComponent.getLocalData).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getProgram', () => {
    it('shoudl call api to get obs solutions', (done) => {
      observationHomeComponent.getPrograms().then(() => {
        expect(mockKendraService.post).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('observationDetails', () => {
    it('shoudl observation-details(entity page)', () => {
      const solution = {
        _id: '60110e692d0bbd2f0c3229c3',
        name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
        description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
        programId: '600ab53cc7de076e6f993724',
        solutionId: '600ac0d1c7de076e6f9943b9',
        programName: 'AP-TEST-PROGRAM-3.6.5',
      };
      observationHomeComponent.observationDetails(solution);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });

  describe('load more', () => {
    it('should load more if network available', () => {
      spyOn(observationHomeComponent, 'getPrograms');
      observationHomeComponent.networkFlag = true;
      observationHomeComponent.loadMore();
      expect(observationHomeComponent.getPrograms).toHaveBeenCalled();
    });

    it('should not load more if network not available, toast msg should come', () => {
      spyOn(observationHomeComponent, 'getPrograms');
      observationHomeComponent.networkFlag = false;
      observationHomeComponent.loadMore();
      expect(observationHomeComponent.getPrograms).not.toHaveBeenCalled();
      expect(mockToastService.showMessage).toHaveBeenCalled();
    });
  });

  describe('on search', () => {
    it('should call getProgram if network available', () => {
      spyOn(observationHomeComponent, 'getPrograms');
      observationHomeComponent.networkFlag = true;
      observationHomeComponent.onSearch('seacrh');
      expect(observationHomeComponent.getPrograms).toHaveBeenCalled();
    });

    it('should open toast msg if network not available', () => {
      spyOn(observationHomeComponent, 'getPrograms');
      observationHomeComponent.networkFlag = false;
      observationHomeComponent.onSearch('text');
      expect(observationHomeComponent.getPrograms).not.toHaveBeenCalled();
      expect(mockToastService.showMessage).toHaveBeenCalled();
    });
  });

  describe('ionViewWillLeave', () => {
    it('should call close profile alert and unsubscribe network subscription', () => {
      spyOn(observationHomeComponent['_networkSubscription'], 'unsubscribe');
      observationHomeComponent.ionViewWillLeave();
      expect(mockUtils.closeProfileAlert).toHaveBeenCalled();
      expect(observationHomeComponent['_networkSubscription'].unsubscribe).toHaveBeenCalled();
    });
  });
  describe('checkLocalDownloadedSolutions', () => {
    it('if solution list exists and dont have downloaded solution it should push downloaded solution', () => {
      observationHomeComponent.downloadedSolutions = [{ programId: 1, solutionId: 'a' }];
      observationHomeComponent.solutionList = [{ programId: 2, solutionId: 'b' }];
      observationHomeComponent.checkLocalDownloadedSolutions();
      expect(observationHomeComponent.solutionList.length).toBe(2);
    });
    it('if solution list doesnt exists and downloaded solution is present it should push downloaded solution', () => {
      observationHomeComponent.downloadedSolutions = [{ programId: 1, solutionId: 'a' }];
      observationHomeComponent.solutionList = undefined;
      observationHomeComponent.checkLocalDownloadedSolutions();
      expect(observationHomeComponent.solutionList.length).toBe(1);
    });
  });
});
