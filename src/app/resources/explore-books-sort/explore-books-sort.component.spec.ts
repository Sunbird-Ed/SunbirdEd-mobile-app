import { ExploreBooksSortComponent } from './explore-books-sort.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavParams, Platform, ModalController } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';

describe('ExploreBooksSortComponent', () => {
    let exploreBooksSortComponent : ExploreBooksSortComponent;
    const mockNavParams : Partial<NavParams> = {
        get : jest.fn(() => ({
            value : {
                board : ['cbse'],
                medium : ['english']
            }
        }))
    };
    const mockPlatform : Partial<Platform> = {};
    const mockCommonUtilService : Partial<CommonUtilService> = {
        translateMessage : jest.fn(() => ('sample-string'))
    };
    const mockTelemetryGeneratorService : Partial<TelemetryGeneratorService> = {};
    const mockFormBuilder : Partial<FormBuilder> = {
        group : jest.fn(() => ({
            value : {
                board : ['sample-board'],
                medium : ['hindi']
            }
        })) as any
    };
    const mockModalController : Partial<ModalController> = {};


    beforeAll(() => {
        exploreBooksSortComponent = new ExploreBooksSortComponent(
            mockNavParams as NavParams,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormBuilder as FormBuilder,
            mockModalController as ModalController,
            
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

    });

    it('should create instance of ExploreBooksSortComponent',() => {
        expect(exploreBooksSortComponent).toBeTruthy();
    });

    


    describe('dismiss', () => {
        it('if part', () => {
            //arrange
            mockModalController.dismiss = jest.fn();

            //act
            exploreBooksSortComponent.dismiss();

            //assert
            expect(mockModalController.dismiss).toHaveBeenCalledWith(
                { values: exploreBooksSortComponent.sortForm.value }
                );
            
            });

            it('else part', () => {
                //arrange
                mockModalController.dismiss = jest.fn();
                mockFormBuilder.group = jest.fn(() => ({
                    value : {
                        board : ['sample'],
                        medium : ['hindi']
                    }
                })) as any
    
                //act
                console.log(exploreBooksSortComponent.searchForm.value);
                console.log(exploreBooksSortComponent.sortForm.value);
                exploreBooksSortComponent.dismiss();
    
                //assert
                expect(mockModalController.dismiss).toHaveBeenCalledWith({values: {board: ['sample-board'], medium: ['hindi']}});
                // expect(mockModalController.dismiss).toHaveBeenCalledWith(null);
                
                });
    })


})