import { ConsentPiiPopupComponent } from './consent-pii-popup.component';
import { PopoverController } from '@ionic/angular';
import { CommonUtilService, FormAndFrameworkUtilService, AppGlobalService, UtilityService } from '../../../../services';

describe('ConsentPiiPopupComponent', () => {
    let consentPiiPopupComponent: ConsentPiiPopupComponent;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockUtilityService: Partial<UtilityService> = {};

    beforeAll(() => {
        consentPiiPopupComponent = new ConsentPiiPopupComponent(
            mockPopOverCtrl as PopoverController,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockAppGlobalService as AppGlobalService,
            mockUtilityService as UtilityService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of consentPiiPopupComponent', () => {
        expect(consentPiiPopupComponent).toBeTruthy();
    });

    it('should return consentForm for user name', (done) => {
        // arrange
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id'
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'User name' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE',
                    params: {
                        categoryCode: 'firstName'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'User name');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'User name', value: 'sample-User-name'}]);
            done();
        }, 0);
    });

    it('should return consentForm if requird properties is empty', (done) => {
        // arrange
        consentPiiPopupComponent.consentForm = [];
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id'
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'Mobile' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE',
                    params: {
                        categoryCode: 'mobile'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'Mobile');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'Mobile', value: '-'}]);
            done();
        }, 0);
    });

    it('should return consentForm for location', (done) => {
        // arrange
        consentPiiPopupComponent.consentForm = [];
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id',
                userLocations: [{type: 'state', name: 'sample-state'}]
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            code: 'state',
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'State' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE_LOCATIONS',
                    params: {
                        categoryCode: 'name'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'State');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'State', value: 'sample-state'}]);
            done();
        }, 0);
    });

    it('should return consentForm of location if location type is not matched', (done) => {
        // arrange
        consentPiiPopupComponent.consentForm = [];
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id',
                userLocations: [{type: 'state', name: 'sample-state'}]
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            code: 'dist',
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'State' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE_LOCATIONS',
                    params: {
                        categoryCode: 'name'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'State');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'State', value: '-'}]);
            done();
        }, 0);
    });

    it('should return empty consentForm for location if userlocation is empty', (done) => {
        // arrange
        consentPiiPopupComponent.consentForm = [];
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id',
                userLocations: []
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            code: 'state',
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'State' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE_LOCATIONS',
                    params: {
                        categoryCode: 'state'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'State');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'State', value: '-'}]);
            done();
        }, 0);
    });

    it('should return empty consentForm for default value', (done) => {
        // arrange
        consentPiiPopupComponent.consentForm = [];
        const profile = {
            serverProfile: {
                firstName: 'sample-User-name',
                id: 'sample-user-id',
                userLocations: []
            }
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        mockFormAndFrameworkUtilService.getConsentFormConfig = jest.fn(() => Promise.resolve([{
            code: 'class',
            templateOptions: {
                placeHolder: JSON.stringify({ en: 'Class' }),
                dataSrc: {
                    marker: 'SERVER_PROFILE_Data',
                    params: {
                        categoryCode: 'class'
                    }
                }
            }
        }]));
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'Class');
        // act
        consentPiiPopupComponent.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
            expect(mockFormAndFrameworkUtilService.getConsentFormConfig).toHaveBeenCalled();
            expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalled();
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{key: 'Class', value: '-'}]);
            done();
        }, 0);
    });

    // it('should close the popUp for clicked on close icon', () => {
    //     mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
    //     consentPiiPopupComponent.closePopover();
    //     expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    // });

    // it('should close the popUp for clicked on close icon', () => {
    //     mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
    //     consentPiiPopupComponent.closePopover();
    //     expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    // });

    it('should close the popUp for clicked on dont share button', () => {
        mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
        consentPiiPopupComponent.dontShare();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should submit profile details and close the popUp for clicked on share button', () => {
        mockPopOverCtrl.dismiss = jest.fn(() => Promise.resolve(true));
        mockCommonUtilService.showToast = jest.fn();
        consentPiiPopupComponent.share();
        expect(mockPopOverCtrl.dismiss).toHaveBeenCalled();
    });

    it('should return to terms of use page', (done) => {
        // arrange
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample-url'));
        // act
        consentPiiPopupComponent.openTermsOfUse();
        // assert
        setTimeout(() => {
            expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('TOU_BASE_URL');
            done();
        }, 0);
    });
});
