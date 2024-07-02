import { ShowCertificateComponent } from './show-certificate-component.component';
import { CommonUtilService, ID, InteractType, PageId, TelemetryGeneratorService } from '../../../services';

describe('ShowCertificateComponent', () => {
    let showCertificateComponent: ShowCertificateComponent;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
        showCertificateComponent = new ShowCertificateComponent(
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService
        );
    }
    );
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create instance of showCertificateComponent', () => {
        // assert
        expect(showCertificateComponent).toBeTruthy();
    });
    it('ngOnInit', () => {
        showCertificateComponent.content = {
            identifier: 'do_123',
            contentType: 'course',
            pkgVersion: 1
        };
        let scoreKey = '>=';
        showCertificateComponent.certificateDetails = { key1: { criteria: { enrollment: { status: 1 }} }, 
        key2: { criteria: { enrollment: { status: 2 }, assessment: {score: {[scoreKey]: 20}} } } }
        showCertificateComponent.ngOnInit();
    });

    it('ngOnInit if no criteria', () => {
        showCertificateComponent.content = {
            identifier: 'do_123',
            contentType: 'course',
            pkgVersion: 1
        };
        let scoreKey = '>=';
        showCertificateComponent.certificateDetails = { key1: {  } }
        showCertificateComponent.ngOnInit();
    });

    describe('showCertificate', () => {
        it('should expand certificate and generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            showCertificateComponent.showCertificate();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.CERTIFICATE_CARD_EXPANDED,
                '',
                undefined,
                showCertificateComponent.pageId,
                { id: 'do_123', type: 'course', version: 1 },
                undefined,
                showCertificateComponent.objRollup,
                showCertificateComponent.corRelationList,
                ID.CERTIFICATE_SECTION
            );
        });
        it('should collapse certificate and generate telemetry', () => {
            // arrange
            showCertificateComponent.showCredits = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            showCertificateComponent.showCertificate();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.CERTIFICATE_CARD_COLLAPSED,
                '',
                undefined,
                showCertificateComponent.pageId,
                { id: 'do_123', type: 'course', version: 1 },
                undefined,
                showCertificateComponent.objRollup,
                showCertificateComponent.corRelationList,
                ID.CERTIFICATE_SECTION
            );
        });
    });

});