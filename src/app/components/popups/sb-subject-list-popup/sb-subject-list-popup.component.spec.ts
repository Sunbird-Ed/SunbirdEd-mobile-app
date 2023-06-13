import { SbSubjectListPopupComponent } from './sb-subject-list-popup.component'
import {CorReleationDataType, Environment, ImpressionType, PageId, TelemetryGeneratorService} from '../../../../services';
import {ModalController, Platform} from '@ionic/angular';
import { of } from 'rxjs';
import {CorrelationData} from '@project-sunbird/sunbird-sdk';

describe('SbSubjectListPopupComponent', () => {
    let sbSubjectListPopupComponent: SbSubjectListPopupComponent;

    const mockModalController: Partial<ModalController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        sbSubjectListPopupComponent = new SbSubjectListPopupComponent(
            mockModalController as ModalController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPlatform as Platform
        );
    });

    it('should be able to create an instance', () => {
        expect(sbSubjectListPopupComponent).toBeTruthy();
    });

        describe('closePopover', () =>{
            it('should dismiss', () => {
                // arrange
                mockModalController.dismiss = jest.fn(),
                // act
                sbSubjectListPopupComponent.closePopover();
                // assert
                expect(mockModalController.dismiss).toHaveBeenCalled();
            });
        });


    describe('handlePillSelect', () => {
        it('if event has value', () =>{
            //arrange
            mockModalController.dismiss = jest.fn(() => of(undefined)) as any;
            const event = {
                data : {
                    length : 'length'
                }
            }
            // act
            sbSubjectListPopupComponent.handlePillSelect(event);
            // assert 
            expect( mockModalController.dismiss).toHaveBeenCalled();
        })


        it('if no value  ', () =>{
            //arrange
            const event = {
                data : {
                    length : ''
                }
            }
            // act
            const data = sbSubjectListPopupComponent.handlePillSelect(event);
            // assert 
            setTimeout(() => {
                expect( data ).toBeUndefined();
            }, 0);
        })    
    });

    describe('ngOnInit', () => {
        it('should generate telemtry on ngOnInit', () => {
            // arrange
            const corRelationList: Array<CorrelationData> = [];
            corRelationList.push({id: sbSubjectListPopupComponent.subjectList.toString(), type: CorReleationDataType.SUBJECT_LIST});
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
            // act
            sbSubjectListPopupComponent.ngOnInit()
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.POP_UP_CATEGORY,
                '',
                Environment.HOME,
                PageId.HOME,
                undefined, undefined, undefined, undefined,
                corRelationList)
        })

    })
});