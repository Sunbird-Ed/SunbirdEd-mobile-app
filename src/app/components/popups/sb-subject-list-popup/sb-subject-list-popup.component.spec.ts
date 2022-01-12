import { SbSubjectListPopupComponent } from './sb-subject-list-popup.component'
import {
    TelemetryGeneratorService
} from '@app/services';
import {ModalController, Platform} from '@ionic/angular';
import { of } from 'rxjs';

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
                expect( data ).toBeUndefined();
            })    
    });
    });