import { ModalController, NavParams } from '@ionic/angular';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { EntityfilterComponent } from './entityfilter.component';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KendraApiService } from '../../../core/services/kendra-api.service';

describe('EntityFilterComponent', () => {
    let entityfilterComponent: EntityfilterComponent;
    const mockLocalStorageService: Partial<LocalStorageService> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'solutionId':
                    value = {
                        identifier: 'doId_1234',
                        type: 'resource',
                        pkgVersion: '2'
                    };
                    break;
                case 'data':
                    value = [{id: 'sampleId', type: 'textbook'}, {id: 'sampleDoid', type: 'unit'}];
            }
            return value;
        })
    };

    const mockLoaderService: Partial<LoaderService> = {};
    const mockHttpClient: Partial<HttpClient> = {};
    const mockModalController: Partial<ModalController> = {};
    const mockAssessmentApiService: Partial<AssessmentApiService> = {};
    const mockUtilsService: Partial<UtilsService> = {};
    const mockChangeDetectorRef: Partial<ChangeDetectorRef> = {};
    const mockKendraApiService: Partial<KendraApiService> = {};


beforeAll(() => {
    entityfilterComponent = new EntityfilterComponent(
      mockLocalStorageService as LocalStorageService,
      mockNavParams as NavParams,
      mockLoaderService as LoaderService,
      mockHttpClient as HttpClient,
      mockModalController as ModalController,
      mockAssessmentApiService as AssessmentApiService,
      mockUtilsService as UtilsService,
      mockChangeDetectorRef as ChangeDetectorRef,
      mockKendraApiService as KendraApiService
    );
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

    it('Should instanciate ObservationHomeComponent', () => {
        expect(entityfilterComponent).toBeTruthy();
    });

    it('should return button disable and enable thing', () => {
        const event = {
            detail: {
                checked: false
            }
        };
        entityfilterComponent.onStateChange(event);
        expect(entityfilterComponent.profileData).toBeFalsy();
        });

    it('should dismiss', () =>{
    //arrange
    mockModalController.dismiss = jest.fn();
    //act
    entityfilterComponent.cancel();
    //assert
    expect(mockModalController.dismiss).toHaveBeenCalled();
    
    })

        describe('ngOnInit', () => {
        it('getTargettedEntityType', () =>{
        entityfilterComponent.getTargettedEntityType();
        expect(entityfilterComponent.getTargettedEntityType).toBeTruthy();       
        })
        })

        describe('addSchools' , () => {
            it('should push element into array' , () => {
                //arrange
                const selectedSchools = ['sample_1'];
                selectedSchools.push('sample_2');
                mockModalController.dismiss = jest.fn();
                //act
                entityfilterComponent.addSchools();
                //assert
                expect(selectedSchools).toContainEqual('sample_2');
                expect(mockModalController.dismiss).toHaveBeenCalled();
            });
        });
        
            describe('searchEntity', () => {
                it('should trigger search() ', () => {
                    // arrange
                    const selectableList = [];
                    jest.spyOn(entityfilterComponent, 'search').mockImplementation();
                    // act
                    entityfilterComponent.searchEntity();
                    // assert
                    setTimeout(() => {              
                    }, 0);
                });
            });
            
            describe('ngOnInit', () => {
                it('should trigger getTargettedEntityType ', () => {
                    // arrange
                    const selectableList = [];
                    jest.spyOn(entityfilterComponent, 'getTargettedEntityType').mockImplementation();
                    // act
                    entityfilterComponent.ngOnInit();
                    // assert
                    setTimeout(() => {
                    }, 0);
                });
            });
    });

    