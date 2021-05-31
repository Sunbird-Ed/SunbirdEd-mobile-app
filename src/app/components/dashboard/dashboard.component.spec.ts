import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services';
import { AppHeaderService, AppGlobalService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';

describe('DashboardComponent', () => {
    let dashboardComponent: DashboardComponent;

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };

    beforeAll(() => {
        dashboardComponent = new DashboardComponent(
            
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of dashboardComponent', () => {
        expect(dashboardComponent).toBeTruthy();
    });

});
