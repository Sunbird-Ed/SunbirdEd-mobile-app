import {ActivityDetailsPage} from './activity-details.page';
import {Router} from '@angular/router';
import {FilterPipe} from '@app/pipes/filter/filter.pipe';
import {CommonUtilService, Environment, ImpressionType, PageId, TelemetryGeneratorService} from '@app/services';

describe('ActivityDetailsPage', () => {
    let activityDetailsPage: ActivityDetailsPage;
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFilterPipe: Partial<FilterPipe> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    memberList: ['member-1']
                }
            }
        })) as any
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        activityDetailsPage = new ActivityDetailsPage(
            mockRouter as Router,
            mockFilterPipe as FilterPipe,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of activityDetailsPage', () => {
        expect(activityDetailsPage).toBeTruthy();
    });

    it('should return searchin memberList', () => {
        const request = ['member-1'];
        mockFilterPipe.transform = jest.fn(() => request);
        activityDetailsPage.onSearch('member-1');
        expect(mockFilterPipe.transform).toHaveBeenCalledWith(request, 'title', request[0]);
    });

    it('ngOnInit', () => {
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        activityDetailsPage.ngOnInit();
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            PageId.ACTIVITY_DETAIL,
            Environment.GROUP
        );
    });
});
