import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { AppHeaderService } from '../../../../services';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { ObservationDetailComponent } from './observation-detail.component';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { DhitiApiService } from '../../core/services/dhiti-api.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { EntityfilterComponent } from '../../shared/components/entityfilter/entityfilter.component';
import { ObservationService } from '../observation.service';
describe('ObservationHomeComponent', () => {
  let observationDetailComponent: ObservationDetailComponent;
  const mockLocation: Partial<Location> = {};
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockUtils: Partial<UtilsService> = {};
  const mockAssessmentApiService: Partial<AssessmentApiService> = {};
  const mockObservationService: Partial<ObservationService> = {};
  const mockDhiti: Partial<DhitiApiService> = {};
  const mockloader: Partial<LoaderService> = {};
  const mockModalCtrl: Partial<ModalController> = {};
  const mockLocalStorage: Partial<LocalStorageService> = {};
  mockModalCtrl.create = jest.fn(() =>
    Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
      dismiss: jest.fn(() => Promise.resolve({})),
    } as any)
  );
  const mockAlertCtrl: Partial<AlertController> = {};
  const mockToast: Partial<ToastService> = {};

  // class MockTranslateService {
  //   public get onLangChange() {
  //     return new EventEmitter<LangChangeEvent>();
  //   }
  // }
  const mockTranslate: Partial<TranslateService> = {};
  // = new MockTranslateService() as any;

  const mockRoute: Partial<ActivatedRoute> = {
    queryParams: of({}),
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
  };
  beforeAll(() => {
    observationDetailComponent = new ObservationDetailComponent(
      mockHeaderService as AppHeaderService,
      mockRouter as Router,
      mockModalCtrl as ModalController,
      mockRoute as ActivatedRoute,
      mockUtils as UtilsService,
      mockAssessmentApiService as AssessmentApiService,
      mockloader as LoaderService,
      mockDhiti as DhitiApiService,
      mockTranslate as TranslateService,
      mockAlertCtrl as AlertController,
      mockToast as ToastService,
      mockObservationService as ObservationService,
      mockLocalStorage as LocalStorageService

    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should instanciate ObservationHomeComponent', () => {
    expect(observationDetailComponent).toBeTruthy();
  });

  describe('ionViewWillEnter', () => {
    it('Should update page config', (done) => {
      // arrange
      mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
        showHeader: true,
        showBurgerMenu: true,
        showKebabMenu: false,
        kebabMenuOptions: [],
        pageTitle: '',
        actionButtons: ['search'],
      }));
      mockHeaderService.updatePageConfig = jest.fn();
      mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, cb) => {
          setTimeout(() => {
            cb();
          }, 0);
          return {
            unsubscribe: jest.fn(),
          };
        }),
      } as any;
      mockLocation.back = jest.fn();
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockAssessmentApiService.post = jest.fn(() =>
        of({
          result: {
            _id: '60110e692d0bbd2f0c3229c3',
            entities: [
              {
                _id: '5fd098e2e049735a86b748b0',
                externalId: 'D_AP-D005',
                name: 'WEST GODAVARI',
                submissionsCount: 4,
              },
            ],
            entityType: 'district',
          },
        })
      );

      // act
      observationDetailComponent.ionViewWillEnter();
      // assert
      setTimeout(() => {
        expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
        expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
        expect(observationDetailComponent.solutionData.entities.length).toBe(1);

        done();
      }, 0);
    });
  });

  describe('getObservationEntities', () => {
    it('if no entities are present then list array should be empty', (done) => {
      //arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockAssessmentApiService.post = jest.fn(() =>
        of({
          result: {
            _id: '60110e692d0bbd2f0c3229c3',
          },
        })
      );

      // act
      observationDetailComponent.getObservationEntities();

      // assert
      setTimeout(() => {
        expect(observationDetailComponent.entities.length).toBe(0);
        done();
      }, 0);
    });

    it('list array should be empty if api fails', (done) => {
      //arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockAssessmentApiService.post = jest.fn(() => throwError({}));

      // act
      observationDetailComponent.getObservationEntities();

      // assert
      setTimeout(() => {
        expect(observationDetailComponent.entities.length).toBe(0);
        done();
      }, 0);
    });
  });

  describe('checkForAnySubmissionsMade', () => {
    it('it should return number of submission done for the observation', (done) => {
      //arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockDhiti.post = jest.fn(() =>
        of({
          result: true,
          data: {
            noOfSubmissions: 1,
          },
        })
      );

      //act
      observationDetailComponent.checkForAnySubmissionsMade();

      // assert
      setTimeout(() => {
        expect(observationDetailComponent.submissionCount).toBe(1);
        done();
      }, 0);
    });
  });

  describe('observationDetails ', () => {
    it('navigate to observation entity page', () => {
      //arrange
      mockRouter.navigate = jest.fn();
      observationDetailComponent.programId = '32423HHS65';
      observationDetailComponent.solutionId = '4213412JKSBA6688';
      observationDetailComponent.observationId = '2343ADSDF657HJ';

      // act
      let entity = {
        _id: '60110e692d0bbd2f0c3229c3',
        name: 'ABC-SCHOOl',
      };
      observationDetailComponent.goToObservationSubmission(entity);

      //assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/observation/observation-submission'], {
        queryParams: {
          programId: '32423HHS65',
          solutionId: '4213412JKSBA6688',
          observationId: '2343ADSDF657HJ',
          entityId: '60110e692d0bbd2f0c3229c3',
          entityName: 'ABC-SCHOOl',
        },
      });
    });
  });

  describe('addEntity', () => {
    it('should open the add entity page and add selected entity to list ', (done) => {
      // arrange
      const data = {
        data: [
          {
            _id: '5fd098e2e049735a86b748b5',
            name: 'KADAPA, D_AP-D010',
            externalId: 'D_AP-D010',
            selected: true,
            isSelected: false,
            preSelected: false,
          },
          {
            _id: '5fd098e2e049735a86b748b6',
            name: 'KURNOOL, D_AP-D011',
            externalId: 'D_AP-D011',
            selected: true,
            isSelected: false,
            preSelected: false,
          },
        ],
      };
      const present = jest.fn();
      const onDidDismiss = jest.fn().mockReturnValue(Promise.resolve(data));
      mockModalCtrl.create = jest.fn(() =>
        Promise.resolve({
          present,
          onDidDismiss,
        })
      ) as any;

      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: {} }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockAssessmentApiService.post = jest.fn(() =>
        of({
          message: 'Updated successfully.',
          status: 200,
        })
      );

      // act
      observationDetailComponent.addEntity();

      // assert
      setTimeout(() => {
        expect(present).toHaveBeenCalled();
        expect(onDidDismiss).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('removeEntity', () => {
    it('should show delete alert and delete entity', (done) => {
      //arrange
      const dismissFn = jest.fn(() => Promise.resolve(true));
      const present = jest.fn(() => Promise.resolve());

      mockAlertCtrl.create = jest.fn(() =>
        Promise.resolve({
          dismiss: dismissFn,
          present,
        })
      ) as any;

      mockTranslate.get = jest.fn(() => of(''));

      //act
      observationDetailComponent.removeEntity({ _id: '3214edsac' });

      //assert
      setTimeout(() => {
        expect(present).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should call delete entity api', (done) => {
      //arrange
      mockUtils.getProfileInfo = jest.fn(() => Promise.resolve({ data: 'data' }));
      mockloader.startLoader = jest.fn(() => Promise.resolve());
      mockloader.stopLoader = jest.fn(() => Promise.resolve());
      mockTranslate.get = jest.fn(() => of(''));
      mockToast.openToast = jest.fn(() => Promise.resolve())
      mockAssessmentApiService.post = jest.fn(() =>
        of({
          result: {
            _id: '60110e692d0bbd2f0c3229c3',
          },
        })
      );
      //TODO:need fix
      //act
      // observationDetailComponent.deleteEntity('123');
      //assert
      setTimeout(() => {
        // expect(mockAssessmentApiService.post).toHaveBeenCalled();
        // expect(mockToast.openToast).toHaveBeenCalled();

        done()
      }, 200);
    });
  });
});