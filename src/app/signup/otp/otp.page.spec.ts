import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { OtpPage } from './otp.page';
import { OTPTemplates, ProfileConstants, RouterLinks } from '../../app.constant';
import { of, throwError } from 'rxjs';
import { HttpClientError, SharedPreferences } from '@project-sunbird/sunbird-sdk';

describe('OtpPage', () => {
    let otpPage: OtpPage;
    const mockProfileService: Partial<ProfileService> = {
        generateOTP: jest.fn(() => of()),
        updateServerProfile: jest.fn(() => of()),
        verifyOTP: jest.fn(() => of())
    }
    const mockSharedPreference: Partial<SharedPreferences> = {}
    const mockFormBuilder: Partial<FormBuilder> = {}
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName: jest.fn(),
        getLoader: jest.fn(),
        translateMessage: jest.fn(),
        showToast: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        }
    }
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    userData: {
                        contactInfo: {
                            email: "wd@fwwefw.cew"
                        },
                        userId:'some_id'
                    }
                }
            }
        })) as any
    }
    const mockSharedPreferences: Partial<SharedPreferences> = {}
    window.console.error = jest.fn();
    beforeAll(() => {
        otpPage = new OtpPage(
            mockProfileService as ProfileService,
            mockSharedPreferences as SharedPreferences,
            mockFormBuilder as FormBuilder,
            mockCommonUtilService as CommonUtilService,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockLocation as Location,
            mockRouter as Router,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of otp page', () => {
        expect(otpPage).toBeTruthy();
    });

    describe('goBack', () => {
        it('should goBack', () => {
            // arrange
            mockLocation.back = jest.fn(() => Promise.resolve());
            // act
            otpPage.goBack();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        })
    })

    describe('ngOnInit', () => {
        it('ngOnInit', () => {
            // arrange
            mockFormBuilder.group = jest.fn()
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            // act
            otpPage.ngOnInit()
            // assert
        })
    })

    describe('continue', () => {
        it('should verify otp through phone number and continue', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            otpPage.userData = {
                contactInfo: {
                    type: 'phone',
                    phone: '9876586432'
                },
                userId:'some_id',
                location: [{
                    type: '324',
                    code: '234'
                }],
                profileUserTypes: [{
                    type: 'admin'
                }]
            }
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup
            const req = {
                key: otpPage.userData.contactInfo.phone,
                type: ProfileConstants.CONTACT_TYPE_PHONE,
                otp: '23423',
                ...(otpPage.userData.contactInfo.phone &&
                  otpPage.userData.contactInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: otpPage.userData.userId })
              };
              const profileReq = {
                userId: otpPage.userData.userId,
                profileLocation: {
                    type: '234',
                    code: '213'
                  },
                firstName: otpPage.userData.name,
                lastName: '',
                dob: otpPage.userData.dob,
                profileUserTypes: otpPage.userData.profileUserTypes
              };
            mockProfileService.verifyOTP = jest.fn(() => of())
            mockProfileService.updateServerProfile = jest.fn(() => of({})) as any
            const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
              };
            mockRouter.navigate = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith(req);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalledWith(profileReq);
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`],{
                    state: categoriesProfileData
                })
            }, 0);
        })

        it('should verify otp through phone number and continue', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            otpPage.userData = {
                contactInfo: {
                    type: 'phone',
                    phone: '9876586432'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                },
                profileUserTypes: [{
                    type: ''
                }]
            }
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup
            const req = {
                key: otpPage.userData.contactInfo.phone,
                type: ProfileConstants.CONTACT_TYPE_PHONE,
                otp: '23423',
                ...(otpPage.userData.contactInfo.phone &&
                  otpPage.userData.contactInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: otpPage.userData.userId })
              };
              const profileReq = {
                userId: otpPage.userData.userId,
                profileLocation: {
                    type: '234',
                    code: '213'
                  },
                firstName: otpPage.userData.name,
                lastName: '',
                dob: otpPage.userData.dob,
                profileUserTypes: otpPage.userData.profileUserTypes
              };
            mockProfileService.verifyOTP = jest.fn(() => of())
            mockProfileService.updateServerProfile = jest.fn(() => of({})) as any
            const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
              };
            mockRouter.navigate = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith(req);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalledWith(profileReq);
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`],{
                    state: categoriesProfileData
                })
            }, 0);
        })

        it('should verify otp through email and continue', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup

            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const req = {
                key: otpPage.userData.contactInfo.email,
                type: ProfileConstants.CONTACT_TYPE_EMAIL,
                otp: '23423',
                ...(otpPage.userData.contactInfo &&
                  otpPage.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: otpPage.userData.userId })
              };
              const profileReq = {
                userId: otpPage.userData.userId,
                profileLocation: {
                    type: '234',
                    code: '213'
                  },
                firstName: otpPage.userData.name,
                lastName: '',
                dob: otpPage.userData.dob,
                profileUserTypes: otpPage.userData.profileUserTypes
              };
              mockProfileService.verifyOTP = jest.fn(() => of())
              mockProfileService.updateServerProfile = jest.fn(() => of({})) as any
              const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
              };
            mockRouter.navigate = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith(req);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalledWith(profileReq);
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`],{
                    state: categoriesProfileData
                  })
            }, 0);
        })

        it('should catch error on update server profile', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup

            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const req = {
                key: otpPage.userData.contactInfo.email,
                type: ProfileConstants.CONTACT_TYPE_EMAIL,
                otp: '324',
                ...(otpPage.userData.contactInfo &&
                  otpPage.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: otpPage.userData.userId })
              };
            mockProfileService.verifyOTP = jest.fn(() => of());
            mockProfileService.updateServerProfile = jest.fn(() => throwError({response: {body: { params: {err:'UOS_USRUPD0003'}}}})) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith(req);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled()
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should catch error on update server profile, error else case', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup

            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const req = {
                key: otpPage.userData.contactInfo.email,
                type: ProfileConstants.CONTACT_TYPE_EMAIL,
                otp: '324',
                ...(otpPage.userData.contactInfo &&
                  otpPage.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: otpPage.userData.userId })
              };
            mockProfileService.verifyOTP = jest.fn(() => of());
            mockProfileService.updateServerProfile = jest.fn(() => throwError({response: {body: { params: {err:'UOS_USRUPD0063'}}}})) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith(req);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled()
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should catch error on verify otp profile', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup
            const locationCodes = [];
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: [{
                    type: '324',
                    code: '234'
                }]
            }
            let response = new Response();
                response = {responseCode: 400, body: { params: {err:'UOS_OTPVERFY0063'}, result: {remainingAttempt: 1}}};
            const error: HttpClientError = new HttpClientError('Error', response);
            mockProfileService.verifyOTP = jest.fn(() => throwError(error)) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should catch error on verify otp profile, else if response code is not 400', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup
            const locationCodes = [];
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: [{
                    type: '324',
                    code: '234'
                }]
            }
            let response = new Response();
                response = {responseCode: 402, body: { params: {err:'UOS_OTPVERFY0063'}, result: {remainingAttempt: 1}}};
            const error: HttpClientError = new HttpClientError('Error', response);
            mockProfileService.verifyOTP = jest.fn(() => throwError(error)) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should catch error on verify otp profile, else if response body is not object', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup
            const locationCodes = [];
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: [{
                    type: '324',
                    code: '234'
                }]
            }
            let response = new Response();
                response = {responseCode: 400, body: "", result: {remainingAttempt: 1}};
            const error: HttpClientError = new HttpClientError('Error', response);
            mockProfileService.verifyOTP = jest.fn(() => throwError(error)) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should catch error on verify otp profile and no remainingAttempt', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            otpPage.otpInfoForm = {value: {otp: '23223'}} as FormGroup

            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: [{
                    type: '324',
                    code: '234'
                }]
            }
            let response = new Response();
                response = {responseCode: 400, body: { params: {err:'UOS_OTPVERFY0063'}, result: {remainingAttempt: 0}}};
            const error: HttpClientError = new HttpClientError('Error', response);
            mockProfileService.verifyOTP = jest.fn(() => throwError(error)) as any
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage  = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockProfileService.verifyOTP).toHaveBeenCalledWith();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('SOMETHING_WENT_WRONG')
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith()
            }, 0);
        })

        it('should show toast if no network available', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            // act
            otpPage.continue()
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED')
            }, 0);
        })
    })

    describe('resendOTP', () => {
        it('should resendOTP for contact type phone', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            otpPage.userData = {
                contactInfo: {
                    type: 'phone',
                    phone: '9876586432'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const req = {
                key: otpPage.userData.contactInfo.phone,
                type: ProfileConstants.CONTACT_TYPE_PHONE,
                ...(otpPage.userData.contactInfo &&
                    otpPage.userData.contactInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                    { userId: 'some_id', templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
           
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockProfileService.generateOTP = jest.fn(() => of())
            // act
            otpPage.resendOTP()
            // assert
            setTimeout(() => {
                
                expect(mockProfileService.generateOTP).toHaveBeenCalledWith(req);
            }, 0);
        })

        it('should resendOTP for contact type email', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const req = {
                key: otpPage.userData.contactInfo.email,
                type: ProfileConstants.CONTACT_TYPE_EMAIL,
                ...(otpPage.userData.contactInfo.email &&
                  otpPage.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
                  { userId: 'some_id', templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
              };
              const presentFn = jest.fn(() => Promise.resolve());
              mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                  present: presentFn,
                  dismiss: jest.fn(() => Promise.resolve())
              }));
            mockProfileService.generateOTP = jest.fn(() => of())
            // act
            otpPage.resendOTP()
            // assert
            setTimeout(() => {
                expect(mockProfileService.generateOTP).toHaveBeenCalledWith(req);
            }, 0);
        })

        it('should catch error on generateotp for contact type email', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                templateId: '',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            mockProfileService.generateOTP = jest.fn(() => throwError({}))
            // act
            otpPage.resendOTP()
            // assert
            setTimeout(() => {
                
                expect(mockProfileService.generateOTP).toHaveBeenCalled();
            }, 0);
        })

        it('should catch error on generateotp for contact type email, loader undefined', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            otpPage.userData = {
                contactInfo: {
                    type: 'email',
                    email: 'asda@add.dew'
                },
                userId:'some_id',
                templateId: '',
                location: {
                    type: '324',
                    code: '234'
                }
            }
            // const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve(undefined));
            mockProfileService.generateOTP = jest.fn(() => throwError({}))
            // act
            otpPage.resendOTP()
            // assert
            setTimeout(() => {
                
                expect(mockProfileService.generateOTP).toHaveBeenCalled();
            }, 0);
        })

        it('should show toast if no network available', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            // act
            otpPage.resendOTP()
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED')
            }, 0);
        })
    })

    describe('redirectToLogin', () => {
        it('should naviagte to sign in page', () => {
            // arrange
            mockRouter.navigate = jest.fn()
            // act
            otpPage.redirectToLogin()
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN]);
        })
    })
    describe('changeEvent', () => {
        it('should changeEvent', () => {
            // arrange
            let event = {target:{ checked: true}}
            // act
            otpPage.changeEvent(event);
            // assert
        })
    })
})