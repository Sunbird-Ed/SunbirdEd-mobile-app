import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AppHeaderService } from '../../../../services';
import { LoaderService, UtilsService } from '../../core';
import { Location } from '@angular/common';
import { ObservationHomeComponent } from './observation-home.component';
import { of, throwError } from 'rxjs';
import { KendraApiService } from '../../core/services/kendra-api.service';
describe('ObservationHomeComponent', () => {
  let observationHomeComponent: ObservationHomeComponent;
  const mockLocation: Partial<Location> = {};
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockUtils: Partial<UtilsService> = {};
  const mockKendraService: Partial<KendraApiService> = {};
  const mockloader: Partial<LoaderService> = {};
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
  };
  beforeAll(() => {
    observationHomeComponent = new ObservationHomeComponent(
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockUtils as UtilsService,
      mockKendraService as KendraApiService,
      mockloader as LoaderService
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should instanciate ObservationHomeComponent', () => {
    expect(observationHomeComponent).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should return observationList/programsList by invoked ngOnIt', (done) => {
      // arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockKendraService.post = jest.fn(() =>
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
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());

      // act
      observationHomeComponent.ngOnInit();
      // assert
      setTimeout(() => {
        expect(mockUtils.getProfileInfo).toHaveBeenCalled();
        expect(mockKendraService.post).toHaveBeenCalled();
        expect(observationHomeComponent.solutionList.length).toBe(1);
        done();
      }, 0);
    });
    it('should show no data if data is not present', (done) => {
      // arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockKendraService.post = jest.fn(() =>
        of({
          result: {},
        })
      );
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());

      // act
      observationHomeComponent.ngOnInit();
      // assert
      setTimeout(() => {
        expect(mockUtils.getProfileInfo).toHaveBeenCalled();
        expect(mockKendraService.post).toHaveBeenCalled();
        expect(observationHomeComponent.solutionList.length).toBe(0);
        done();
      }, 0);
    });

    it('show no data message if no api response', (done) => {
      // arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockKendraService.post = jest.fn(() => throwError({}));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());

      // act
      observationHomeComponent.ngOnInit();
      // assert
      setTimeout(() => {
        expect(mockUtils.getProfileInfo).toHaveBeenCalled();
        expect(mockKendraService.post).toHaveBeenCalled();
        expect(observationHomeComponent.solutionList.length).toBe(0);
        done();
      }, 0);
    });
  });

  // describe('observationDetails ', () => {
  //   it('navigate to observation entity page', () => {
  //     //arrange
  //     mockRouter.navigate = jest.fn();

  //     // act
  //     observationHomeComponent.observationDetails({
  //       _id: '60110e692d0bbd2f0c3229c3',
  //       name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
  //       description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
  //       programId: '600ab53cc7de076e6f993724',
  //       solutionId: '600ac0d1c7de076e6f9943b9',
  //       programName: 'AP-TEST-PROGRAM-3.6.5',
  //     });

  //     //assert
  //     expect(mockRouter.navigate).toHaveBeenCalledWith(['/observation/observation-details'], {
  //       queryParams: {
  //         programId: '600ab53cc7de076e6f993724',
  //         solutionId: '600ac0d1c7de076e6f9943b9',
  //         observationId: '60110e692d0bbd2f0c3229c3',
  //         solutionName: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
  //       },
  //     });
  //   });
  // });

  // describe('ionViewWillEnter', () => {
  //   it('Should update page config', (done) => {
  //     // arrange
  //     mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
  //       showHeader: true,
  //       showBurgerMenu: true,
  //       showKebabMenu: false,
  //       kebabMenuOptions: [],
  //       pageTitle: '',
  //       actionButtons: ['search'],
  //     }));
  //     mockHeaderService.updatePageConfig = jest.fn();
  //     mockPlatform.backButton = {
  //       subscribeWithPriority: jest.fn((_, cb) => {
  //         setTimeout(() => {
  //           cb();
  //         }, 0);
  //         return {
  //           unsubscribe: jest.fn(),
  //         };
  //       }),
  //     } as any;
  //     mockLocation.back = jest.fn();

  //     // act
  //     observationHomeComponent.ionViewWillEnter();
  //     // assert
  //     setTimeout(() => {
  //       expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
  //       expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
  //       // expect(mockPlatform.backButton).not.toBeUndefined();
  //       // expect(mockLocation.back).toHaveBeenCalled();
  //       done();
  //     }, 0);
  //   });
  // });
  // describe('load more', () => {
  //   it('it should load more data ', (done) => {
  //     // arrange
  //     observationHomeComponent.page = 1;

  //     // act
  //     observationHomeComponent.loadMore();

  //     //assert
  //     setTimeout(() => {
  //       // expect(mockAssessmentApiService.post).toHaveBeenCalled();
  //       expect(observationHomeComponent.page).toBe(2);
  //       done();
  //     }, 0);
  //   });
  // });
});
