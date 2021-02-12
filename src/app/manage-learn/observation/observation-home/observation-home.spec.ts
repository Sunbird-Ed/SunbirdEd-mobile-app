import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AppHeaderService } from '../../../../services';
import { LoaderService, UtilsService } from '../../core';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { ObservationService } from '../observation.service';
import { Location } from '@angular/common';

import { ObservationHomeComponent } from './observation-home.component';
describe('ObservationHomeComponent', () => {
  let observationHomeComponent: ObservationHomeComponent;
  const mockHttp: Partial<HttpClient> = {};
  const mockLocation: Partial<Location> = {};
  const mockHeaderService: Partial<AppHeaderService> = {};
  const mockPlatform: Partial<Platform> = {};
  const mockObservationService: Partial<ObservationService> = {};
  const mockUtils: Partial<UtilsService> = {};
  const mockAssessmentApiService: Partial<AssessmentApiService> = {};
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
      mockHttp as HttpClient,
      mockLocation as Location,
      mockHeaderService as AppHeaderService,
      mockPlatform as Platform,
      mockRouter as Router,
      mockObservationService as ObservationService,
      mockUtils as UtilsService,
      mockAssessmentApiService as AssessmentApiService,
      mockloader as LoaderService
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should instanciate CourseBatchesPage', () => {
    expect(observationHomeComponent).toBeTruthy();
  });
});
