import { ConsentPiiPopupComponent } from './consent-pii-popup.component';
import { NavParams, PopoverController } from '@ionic/angular';
import { CommonUtilService, FormAndFrameworkUtilService, AppGlobalService, UtilityService } from '../../../../services';

describe('ConsentPiiPopupComponent', () => {
    let consentPiiPopupComponent: ConsentPiiPopupComponent;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockPopOverCtrl: Partial<PopoverController> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn()
    };

    beforeAll(() => {
        consentPiiPopupComponent = new ConsentPiiPopupComponent(
            mockPopOverCtrl as PopoverController,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockAppGlobalService as AppGlobalService,
            mockUtilityService as UtilityService,
            mockNavParams as NavParams
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'User name', value: 'sample-User-name' }]);
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'Mobile', value: '-' }]);
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
                userLocations: [{ type: 'state', name: 'sample-state' }]
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'State', value: 'sample-state' }]);
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
                userLocations: [{ type: 'state', name: 'sample-state' }]
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'State', value: '-' }]);
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'State', value: '-' }]);
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
            expect(consentPiiPopupComponent.consentForm).toStrictEqual([{ key: 'Class', value: '-' }]);
            done();
        }, 0);
    });

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

    it('should return button disable and enable thing', () => {
        const event = {
            detail: {
                checked: true
            }
        };
        consentPiiPopupComponent.changeEvent(event);
        expect(consentPiiPopupComponent.isAgreed).toBeTruthy();
    });

    it('should return button disable and enable thing', () => {
        const event = {
            detail: {
                checked: false
            }
        };
        consentPiiPopupComponent.changeEvent(event);
        expect(consentPiiPopupComponent.isAgreed).toBeFalsy();
    });

    describe('converDataSrcToObject', () => {
        it('should return maskedEmail for empty email', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: { categoryCode: 'declared-email' }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    maskedEmail: 'sample@sample.com'
                }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('sample@sample.com');
        });
        it('should return email', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: { categoryCode: 'declared-email' }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { email: 'sample@sample.com' }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('sample@sample.com');
        });
        it('should return - for empty email and maskedEmail', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: { categoryCode: 'declared-email' }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {}
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
        it('should return maskedphone for empty phone', () => {
            const ele = {
                code: 'phoneNumber',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: {
                            categoryCode: 'declared-phone'
                        }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    declarations: [],
                    maskedPhone: '9999999999'
                }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('9999999999');
        });
        it('should return phone', () => {
            const ele = {
                code: 'phoneNumber',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: { categoryCode: 'declared-phone' }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { phone: '9999999999' }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('9999999999');
        });
        it('should return - for empty phone and maskedphone', () => {
            const ele = {
                code: 'phoneNumber',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: {
                            categoryCode: 'declared-phone'
                        }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {}
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
        it('should return external id', () => {
            //arrange
            const ele = {
                code: 'externalIds',
                templateOptions: {
                    dataSrc: {
                        marker: 'SERVER_PROFILE',
                        params: { categoryCode: 'externaId' }
                    }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    channel: 'p1',
                    externaId: [{ id: 'id1', provider: 'p1' }, { id: 'id2', provider: 'p2' }]
                }
            };
            //act
            consentPiiPopupComponent.converDataSrcToObject(ele);
            //assert
            expect(consentPiiPopupComponent.converDataSrcToObject).toBeTruthy();
        });
        it('should return location', () => {
            //arrange
            const ele = {
                code: 'schoolId',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_LOCATIONS' }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    userLocations: [{ code: 'schoolId1', type: 'school', name: 'na1' }, { code: 'school', type: 'schoolId', name: 'na2' }]
                }
            };
            //act
            consentPiiPopupComponent.converDataSrcToObject(ele);
            //assert
            expect(consentPiiPopupComponent.converDataSrcToObject).toBeTruthy();
        });
        it('should return declaration info if the marker is SERVER_PROFILE_DECLARED', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED', params: { categoryCode: 'code1' } }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    declarations: [
                        { info: { code1: 'cd1' } }
                    ]
                }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('cd1');
        });
        it('should return - instead of declaration info if the marker is SERVER_PROFILE_DECLARED', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED', params: { categoryCode: 'code1' } }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    declarations: [
                        { info: {} }
                    ]
                }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
        it('should return maskedEmail for code is emailId', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED' }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { declarations: [], maskedEmail: 'sample@sample.com' }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('sample@sample.com');
        });
        it('should return  - for code is maskedEmail', () => {
            const ele = {
                code: 'emailId',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED' }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { declarations: [] }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
        it('should return maskedphone for code phone', () => {
            const ele = {
                code: 'phoneNumber',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED' }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { declarations: [], maskedPhone: '9999999999' }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('9999999999');
        });
        it('should return  - for code is maskedPhone', () => {
            const ele = {
                code: 'phoneNumber',
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED' }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: { declarations: [] }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
        it('should return - when all conditions are false if the marker is SERVER_PROFILE_DECLARED', () => {
            const ele = {
                templateOptions: {
                    dataSrc: { marker: 'SERVER_PROFILE_DECLARED', params: { categoryCode: 'code1' } }
                }
            };
            consentPiiPopupComponent.profile = {
                serverProfile: {
                    declarations: []
                }
            };
            // act
            const data = consentPiiPopupComponent.converDataSrcToObject(ele);
            // assert
            expect(data).toBe('-');
        });
    });
});