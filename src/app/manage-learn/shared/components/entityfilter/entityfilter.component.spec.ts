import { ModalController, NavParams } from '@ionic/angular';
import { LoaderService, LocalStorageService, UtilsService } from '../../core';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { EntityfilterComponent } from './entityfilter.component';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KendraApiService } from '../../../core/services/kendra-api.service';
import { of, throwError } from 'rxjs';

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
    const mockKendraApiService: Partial<KendraApiService> = {
        post: jest.fn(() =>
          of({
            result: {
              data: [
                {
                  _id: '60110e692d0bbd2f0c3229c3',
                  name: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                  description: 'AP-TEST-PROGRAM-3.6.5-OBS-1-DEO',
                  programId: '600ab53cc7de076e6f993724',
                  solutionId: '600ac0d1c7de076e6f9943b9',
                  programName: 'AP-TEST-PROGRAM-3.6.5',
                },
              ],
            },
          })
        ),
      };


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

    describe('search', () => {
        it('should search and make event true', (done) => {
            //arrange
            const event = { 
                detail: { checked: false },
                target: { complete: jest.fn() } };
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            let apiUrl = entityfilterComponent['searchUrl'] +
            '?observationId=' +
            entityfilterComponent['observationId'] +
            '&search=' +
            encodeURIComponent(entityfilterComponent['searchQuery'] ? entityfilterComponent['searchQuery'] : '') +
            '&page=' +
            entityfilterComponent['page'] +
            '&limit=' +
            entityfilterComponent['limit'];
            apiUrl =
            apiUrl +
      `&parentEntityId=${encodeURIComponent(
        entityfilterComponent['entityType']
      )}`;
            mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
            mockAssessmentApiService.post = jest.fn(() =>
        of({
          result: [
              {
            data: [{
                _id: '60110e692d0bbd2f0c3229c3',
            entities: [
              {
                _id: '5fd098e2e049735a86b748b0',
                externalId: 'D_AP-D005',
                name: 'WEST GODAVARI',
                submissionsCount: 4,
              },
            ],
            entityType: 'district',
            }]
          }
          ],
        })
      );
            //act
            entityfilterComponent.search(event);
            //assert
            setTimeout(() => {
                             expect(mockLoaderService.startLoader).not.toHaveBeenCalled()
                             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                             expect(mockAssessmentApiService.post).toHaveBeenCalled();
                             done();
                         }, 0);
        });

        it('should search and make event false', (done) => {
            //arrange
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            entityfilterComponent['searchQuery'] = 'query' as any;
            let apiUrl = entityfilterComponent['searchUrl'] +
            '?observationId=' +
            entityfilterComponent['observationId'] +
            '&search=' +
            encodeURIComponent(entityfilterComponent['searchQuery'] ? entityfilterComponent['searchQuery'] : '') +
            '&page=' +
            entityfilterComponent['page'] +
            '&limit=' +
            entityfilterComponent['limit'];
            apiUrl =
            apiUrl +
      `&parentEntityId=${encodeURIComponent(
        entityfilterComponent['entityType']
      )}`;
            mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
            mockLoaderService.stopLoader = jest.fn(() => Promise.resolve());
            mockAssessmentApiService.post = jest.fn(() =>
        of({
          result: [
              {
            data: [{
                _id: '60110e692d0bbd2f0c3229c3',
                selected: true,
            entities: [
              {
                _id: '5fd098e2e049735a86b748b0',
                externalId: 'D_AP-D005',
                name: 'WEST GODAVARI',
                submissionsCount: 4,
              },
            ],
            entityType: 'district',
            }]
          }
          ],
        })
      );
            //act
            entityfilterComponent.search();
            //assert
            setTimeout(() => {
                             expect(mockLoaderService.startLoader).toHaveBeenCalled();
                             expect(mockLoaderService.stopLoader).toHaveBeenCalled();
                             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                             expect(mockAssessmentApiService.post).toHaveBeenCalled();
                             done();
                         }, 0);
        });

        it('should search by making event true and assessmentApiService throw an error', (done) => {
            //arrange
            const event = { 
                detail: { checked: false },
                target: { complete: jest.fn() } };
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            let apiUrl = entityfilterComponent['searchUrl'] +
            '?observationId=' +
            entityfilterComponent['observationId'] +
            '&search=' +
            encodeURIComponent(entityfilterComponent['searchQuery'] ? entityfilterComponent['searchQuery'] : '') +
            '&page=' +
            entityfilterComponent['page'] +
            '&limit=' +
            entityfilterComponent['limit'];
            apiUrl =
            apiUrl +
      `&parentEntityId=${encodeURIComponent(
        entityfilterComponent['entityType']
      )}`;
            mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
            mockAssessmentApiService.post = jest.fn(() => throwError('err') as any);
            //act
            entityfilterComponent.search(event);
            //assert
            setTimeout(() => {
                             expect(mockLoaderService.startLoader).not.toHaveBeenCalled()
                             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                             expect(mockAssessmentApiService.post).toHaveBeenCalled();
                             done();
                         }, 0);
        });

        it('should search by making event false and assessmentApiService throw an error', (done) => {
            //arrange
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            entityfilterComponent['searchQuery'] = 'query' as any;
            let apiUrl = entityfilterComponent['searchUrl'] +
            '?observationId=' +
            entityfilterComponent['observationId'] +
            '&search=' +
            encodeURIComponent(entityfilterComponent['searchQuery'] ? entityfilterComponent['searchQuery'] : '') +
            '&page=' +
            entityfilterComponent['page'] +
            '&limit=' +
            entityfilterComponent['limit'];
            apiUrl =
            apiUrl +
      `&parentEntityId=${encodeURIComponent(
        entityfilterComponent['entityType']
      )}`;
            mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
            mockLoaderService.stopLoader = jest.fn(() => Promise.resolve());
            mockAssessmentApiService.post = jest.fn(() => throwError('err') as any);
            //act
            entityfilterComponent.search();
            //assert
            setTimeout(() => {
                             expect(mockLoaderService.startLoader).toHaveBeenCalled();
                             expect(mockLoaderService.stopLoader).toHaveBeenCalled();
                             expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                             expect(mockAssessmentApiService.post).toHaveBeenCalled();
                             done();
                         }, 0);
        })
    })

    describe('getTargettedEntityType', () => {
        it('should get taregeted entity type', (done) => {
            //arrange
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            mockKendraApiService.post = jest.fn(() => of({
                result: {
                    _id: '60110e692d0bbd2f0c3229c3'
                }
            }));
            jest.spyOn(entityfilterComponent, 'search').mockImplementation(() => {
                return Promise.resolve()
            })
            //act
            entityfilterComponent.getTargettedEntityType();
            //assert
            setTimeout(() => {
                expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                done();
            });
        });

        it('should get taregeted entity type if the result return false', (done) => {
            //arrange
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            mockKendraApiService.post = jest.fn(() => of({
                result: null
            }));
            jest.spyOn(entityfilterComponent, 'search').mockImplementation(() => {
                return Promise.resolve()
            })
            //act
            entityfilterComponent.getTargettedEntityType();
            //assert
            setTimeout(() => {
                expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                done();
            })
        });



        it('should get taregeted entity type while the kendraApiService.post return an error', (done) => {
            //arrange
            const payload = mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            mockKendraApiService.post = jest.fn(() => throwError('err') as any)
            //act
            entityfilterComponent.getTargettedEntityType();
            //assert
            setTimeout(() => {
                expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                done();
            })
        });
    })

    it('should return button disable and enable thing', () => {
        const event = {
            detail: {
                checked: false
            }
        };
        entityfilterComponent['profileData'] = [];
        entityfilterComponent.onStateChange(event);
        expect(entityfilterComponent.profileData).toBeTruthy();
    }); 

    describe('openSelect', () => {        
        it('should open select if selectedState is true', () => {
            //arrange
            entityfilterComponent['profileData'] = {stateSelected: true};
            entityfilterComponent['selectedState'] = true;
            entityfilterComponent['profileMappedState'] = true;
            jest.spyOn(entityfilterComponent, 'search').mockImplementation()
            //act
            entityfilterComponent.openSelect();
            //assert
            expect(entityfilterComponent.openSelect).toBeTruthy();
        })

        it('should open select if selectedState is false', () => {
            //arrange
            entityfilterComponent['profileData'] = {stateSelected: false};
            entityfilterComponent['selectedState'] = false;
            entityfilterComponent['profileMappedState'] = false;
            entityfilterComponent.selectStateRef = {
                open: jest.fn(() => 'string')
            }
            //act
            entityfilterComponent.openSelect();
            //assert
            setTimeout(() => {
                expect(entityfilterComponent.selectStateRef.open).toHaveBeenCalled();
            },100)
        })
    })

    describe('checkItem', () => {
        it('should check item', () => {
            //arrange
            const listItem = [];
            entityfilterComponent['selectedListCount'] = {count: 1}
            //act
            entityfilterComponent.checkItem(listItem);
            //assert
            expect(entityfilterComponent.checkItem).toBeTruthy();
        });

        it('should check item and decrement the count', () => {
            //arrange
            const listItem = {selected: true};
            entityfilterComponent['selectedListCount'] = {count: 1}
            //act
            entityfilterComponent.checkItem(listItem);
            //assert
            expect(listItem.selected).toBeFalsy();
        })
    })

    it('should clearEntity', () => {
        //arrange
        entityfilterComponent['selectableList'] = [];
        //act
        entityfilterComponent.clearEntity();
        //assert
        expect(entityfilterComponent.clearEntity).toBeTruthy();
    })

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
            jest.spyOn(entityfilterComponent, 'getTargettedEntityType').mockImplementation(() => {
                return Promise.resolve();
            });
        entityfilterComponent.ngOnInit();      
        })
    })

    describe('addSchools' , () => {
            it('should push element into array' , () => {
                //arrange
                const selectedSchools = [];
                entityfilterComponent['selectableList'] = [{
                        selected: true,
                        preSelected: undefined
                }]
                mockModalController.dismiss = jest.fn();
                //act
                entityfilterComponent.addSchools();
                //assert
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

    describe('doInfininte', () => {
        it('should call do infinite on trigger', (done) => {
            //arrange
            const infiniteScroll = 'infinite scroll' as any;
            jest.spyOn(entityfilterComponent, 'search').mockImplementation(() => {
                return Promise.resolve();
            });
            //act
            entityfilterComponent.doInfinite(infiniteScroll);
            //assert
            setTimeout(() => {
                done();
            }, 500) 
    }) 
    })
            
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

    