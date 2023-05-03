import {LicenseCardComponentComponent} from './license-card-component.component';
import {CommonUtilService, ID, InteractType, PageId, TelemetryGeneratorService} from '../../../services';
import {ContentUtil} from '../../../util/content-util';

describe('LicenseCardComponentComponent', () => {
    let licenseCardComponent: LicenseCardComponentComponent;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
            licenseCardComponent = new LicenseCardComponentComponent(
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockCommonUtilService as CommonUtilService
            );
        }
    );
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create instance of licenseCardComponent', () => {
        // assert
        expect(licenseCardComponent).toBeTruthy();
    });

    it('should set objId, objType, objVer', () => {
        // arrange
        licenseCardComponent.content = {
            identifier: 'do_123',
            contentType: 'course',
            pkgVersion: 1
        };

        // act
        licenseCardComponent.ngOnInit();
    });

    describe('showLicense', () => {
        it('should expand license card and generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            licenseCardComponent.showLicensce();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.LICENSE_CARD_EXPANDED,
                '',
                undefined,
                licenseCardComponent.pageId,
                {id: 'do_123', type: 'course', version: 1},
                undefined,
                licenseCardComponent.objRollup,
                licenseCardComponent.corRelationList,
                ID.LICENSE_CARD_CLICKED
            );
        });

        it('should collapse license card and generate telemetry', () => {
            // arrange
            licenseCardComponent.showCredits = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

            // act
            licenseCardComponent.showLicensce();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.LICENSE_CARD_COLLAPSED,
                '',
                undefined,
                licenseCardComponent.pageId,
                {id: 'do_123', type: 'course', version: 1},
                undefined,
                licenseCardComponent.objRollup,
                licenseCardComponent.corRelationList,
                ID.LICENSE_CARD_CLICKED
            );
        });
    });

    it('should merge properties of content', () => {
        jest.spyOn(ContentUtil, 'mergeProperties').mockImplementation();
        // act
        licenseCardComponent.mergeProperties('');
        expect(ContentUtil.mergeProperties).toHaveBeenCalled();
    });

    it('should open Url in browser when function clicked', () => {
        // arrange
        mockCommonUtilService.openUrlInBrowser = jest.fn();
        // act
        licenseCardComponent.openBrowser('https://');
        // assert
        expect(mockCommonUtilService.openUrlInBrowser).toHaveBeenCalledWith('https://');
    });
});
