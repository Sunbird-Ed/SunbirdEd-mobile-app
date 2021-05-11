import {SbSubjectListPopupComponent} from "./sb-subject-list-popup.component";
import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {PillShape, PillsViewType, PillBorder, ShowMoreViewType, PillsMultiRow, PillSize} from '@project-sunbird/common-consumption';
import {CorReleationDataType, Environment, ImpressionType, InteractType, PageId, TelemetryGeneratorService} from '@app/services';
import {CorrelationData} from 'sunbird-sdk';

describe("SbSubjectListPopupComponent", () => {
    let sbSubjectListPopupComponent: SbSubjectListPopupComponent;
    // const corRelationList: Array<CorrelationData> = [];
    // corRelationList.push({id: sbSubjectListPopupComponent.subjectList.toString(), type: CorReleationDataType.SUBJECT_LIST});
    const mockPopoverController: Partial<PopoverController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        sbSubjectListPopupComponent = new SbSubjectListPopupComponent(
            mockPopoverController as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService
        );
      });
    
      beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });
    
      it("should create an instance of OverflowMenuComponent", () => {
        expect(SbSubjectListPopupComponent).toBeTruthy();
      });

      describe("closePopover", () => {
        it("should call dismiss", () => {
            mockPopoverController.dismiss = jest.fn();
          // act
          sbSubjectListPopupComponent.closePopover();
          // assert
          expect(mockPopoverController.dismiss).toHaveBeenCalled();
        });
      });

      it('should generate impression telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        // act
        sbSubjectListPopupComponent.ngOnInit();
        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.POP_UP_CATEGORY,
            '',
            Environment.HOME,
            PageId.HOME,
            undefined, undefined, undefined, undefined,
            [{id: "", type: 'subject-list'}]
        );
      });
      
    });
