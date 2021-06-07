import { GuestEditPage } from './guest-edit.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    Framework,
    FrameworkCategoryCodesGroup,
    GetSuggestedFrameworksRequest,
    SharedPreferences
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '@app/util/events';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    InteractType,
    InteractSubtype,
    Environment,
    PageId,
    ImpressionType,
    ObjectType,
    LoginHandlerService
} from '../../../services';
import { Location } from '@angular/common';
import { of, Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { ProfileHandler } from '@app/services/profile-handler';

describe('GuestEditPage', () => {
    let guestEditPage: GuestEditPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRoterExtras = {
        extras: {
            state: {
                contentType: 'contentType',
                corRelationList: 'corRelationList',
                source: 'source',
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false,
                isNewUser: true,
                lastCreatedProfile: { id: 'sample-id' }
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(),
        getString: jest.fn(() => of('ka' as any))
    };
    const mockFb: Partial<FormBuilder> = {
        group: jest.fn(() => ({})) as any,
        control: jest.fn()
    };

    const mockProfileHandler: Partial<ProfileHandler> = {
        getSupportedProfileAttributes: jest.fn(() => Promise.resolve({ borad: 'board', medium: 'medium', gradeLevel: 'gradeLevel' }))
    };
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};

    beforeAll(() => {
        guestEditPage = new GuestEditPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockSharedPreferences as SharedPreferences,
            mockAppGlobalService as AppGlobalService,
            mockCommonUtilService as CommonUtilService,
            mockFb as FormBuilder,
            mockTranslate as TranslateService,
            mockEvents as Events,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockProfileHandler as ProfileHandler,
            mockLoginHandlerService as LoginHandlerService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of guestEditPage', () => {
        expect(guestEditPage).toBeTruthy();
    });

    it('should return syllabusControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({ Validators: '' })) as any
        } as any;
        expect(guestEditPage.syllabusControl).toBeTruthy();
    });

    it('should return boardControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({ Validators: '' })) as any
        } as any;
        expect(guestEditPage.boardControl).toBeTruthy();
    });

    it('should return mediumControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({ Validators: '' })) as any
        } as any;
        expect(guestEditPage.mediumControl).toBeTruthy();
    });

    it('should return gradeControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({ Validators: '' })) as any
        } as any;
        expect(guestEditPage.gradeControl).toBeTruthy();
    });

    it('should return subjectControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({ Validators: '' })) as any
        } as any;
        expect(guestEditPage.subjectControl).toBeTruthy();
    });

    describe('getSyllabusDetails', () => {
        it('should fetch all the syllabus list details', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            guestEditPage.guestEditForm = {
                syllabus: ['sampl'],
                get: jest.fn(() => ({ name: 'sample-name', board: 'board', patchValue: jest.fn() }))
            } as any;
            guestEditPage.profile = {
                syllabus: [{ name: 'sample-name' }]
            };
            guestEditPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING'
            }];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                from: 'server',
                language: undefined,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            guestEditPage.getSyllabusDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                done();
            }, 0);
        });

        it('should show data not found toast message if syllabus list is empty.', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            guestEditPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                from: 'server',
                language: undefined,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            guestEditPage.getSyllabusDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_DATA_FOUND');
                expect(guestEditPage.loader.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    describe('ngOnDestroy', () => {
        it('should stop detecting the guest edit page changes on leaving the page', () => {
            // arrange
            guestEditPage['formControlSubscriptions'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            guestEditPage.ngOnDestroy();
            // commonUtilService.getLoader
            expect(guestEditPage['formControlSubscriptions'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('ionViewWillLeave', () => {
    it('should unsubscribe to the header events', () => {
        // arrange
        const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
        guestEditPage['unregisterBackButton'] = mockHeaderEventsSubscription as any;
        guestEditPage['backButtonFunc'] = null;
        // act
        guestEditPage.ionViewWillLeave();
        // assert
        expect(guestEditPage['unregisterBackButton'].unsubscribe).toHaveBeenCalled();
      });
    });
  

    describe('onSubjectChanged', () => {
        it('should return newValue and oldValue for category changed', () => {
            const event = {
                detail: {
                    value: ['math']
                }
            };
            guestEditPage.profileForTelemetry = {
                subject: ['english']
            };
            mockAppGlobalService.generateAttributeChangeTelemetry = jest.fn();
            // act
            guestEditPage.onCategoryChanged('subject', event);
            expect(mockAppGlobalService.generateAttributeChangeTelemetry).toHaveBeenCalled();
        });

        it('should return newValue and oldValue if category is not changed', () => {
            const event = {
                detail: {
                    value: ['math']
                }
            };
            guestEditPage.profileForTelemetry = {
                subject: ['math']
            };
            mockAppGlobalService.generateAttributeChangeTelemetry = jest.fn();
            // act
            guestEditPage.onCategoryChanged('subject', event);
        });
    });

    describe('onSubmit', () => {
        beforeEach(() => {
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
        });
        it('should show toast if form is invalid', () => {
            // arrange
            guestEditPage.isFormValid = false;
            mockCommonUtilService.translateMessage = jest.fn(() => 'translated');
            // act
            guestEditPage.onSubmit();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated');
        });
        it('should show toast if userType is not there', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.guestEditForm = {
                value: {
                    userType: ''
                },
            } as any;
            // act
            guestEditPage.onSubmit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('USER_TYPE_SELECT_WARNING');
                done();
            }, 0);
        });
        it('should show toast if name is not there', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.guestEditForm = {
                value: {
                    profileType: 'userType'
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'FULL_NAME':
                        value = 'translated2';
                        break;
                }
                return value;
            }
            );
            jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: '' });
            // act
            guestEditPage.onSubmit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated1', false, 'red-toast');
                done();
            }, 0);
        });
        it('should show toast if boards are not there', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.guestEditForm = {
                value: {
                    syllabus: [],
                    profileType: 'userType',
                    boards: []
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'BOARD':
                        value = 'translated2';
                        break;
                }
                return value;
            }
            );
            jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: 'name' });
            mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
            // act
            guestEditPage.onSubmit();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated1', false, 'red-toast');
                done();
            }, 0);
        });
        // it('should show toast if medium is not there', (done) => {
        //     // arrange
        //     guestEditPage.isFormValid = true;
        //     guestEditPage.guestEditForm = {
        //         value: {
        //             syllabus: [],
        //             userType: 'userType',
        //             boards: ['board'],
        //             medium: []
        //         },
        //         getRawValue: jest.fn(() => { })
        //     } as any;
        //     mockCommonUtilService.translateMessage = jest.fn((arg) => {
        //         let value;
        //         switch (arg) {
        //             case 'PLEASE_SELECT':
        //                 value = 'translated1';
        //                 break;
        //             case 'MEDIUM':
        //                 value = 'translated2';
        //                 break;
        //         }
        //         return value;
        //     }
        //     );
        //     jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: 'name' });
        //     mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        //     // act
        //     guestEditPage.onSubmit();
        //     // assert
        //     setTimeout(() => {
        //         expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated1', false, 'red-toast');
        //         done();
        //     }, 0);
        // });
        // it('should show toast if grades are not there', (done) => {
        //     // arrange
        //     guestEditPage.isFormValid = true;
        //     guestEditPage.guestEditForm = {
        //         value: {
        //             syllabus: [],
        //             userType: 'userType',
        //             boards: ['board'],
        //             medium: ['medium'],
        //             grades: []
        //         },
        //         getRawValue: jest.fn(() => { })
        //     } as any;
        //     mockCommonUtilService.translateMessage = jest.fn((arg) => {
        //         let value;
        //         switch (arg) {
        //             case 'PLEASE_SELECT':
        //                 value = 'translated1';
        //                 break;
        //             case 'CLASS':
        //                 value = 'translated2';
        //                 break;
        //         }
        //         return value;
        //     }
        //     );
        //     jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: 'name' });
        //     mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        //     // act
        //     guestEditPage.onSubmit();
        //     // assert
        //     setTimeout(() => {
        //         expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated1', false, 'red-toast');
        //         done();
        //     }, 0);
        // });
        // it('should call submitNewUserForm if new user', (done) => {
        //     // arrange
        //     guestEditPage.isFormValid = true;
        //     guestEditPage.isNewUser = true;
        //     jest.spyOn(guestEditPage, 'submitNewUserForm').mockImplementation();
        //     guestEditPage.guestEditForm = {
        //         value: {
        //             syllabus: [],
        //             userType: 'userType',
        //             boards: ['board'],
        //             medium: ['medium'],
        //             grades: ['grade']
        //         },
        //         getRawValue: jest.fn(() => { })
        //     } as any;
        //     mockCommonUtilService.translateMessage = jest.fn((arg) => {
        //         let value;
        //         switch (arg) {
        //             case 'PLEASE_SELECT':
        //                 value = 'translated1';
        //                 break;
        //             case 'CLASS':
        //                 value = 'translated2';
        //                 break;
        //         }
        //         return value;
        //     }
        //     );
        //     jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: 'name' });
        //     mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        //     // act
        //     guestEditPage.onSubmit();
        //     // assert
        //     setTimeout(() => {
        //         expect(guestEditPage.submitNewUserForm).toHaveBeenCalled();
        //         done();
        //     }, 0);
        // });
        // it('should call submitEditForm if not new user', (done) => {
        //         // arrange
        //         guestEditPage.isFormValid = true;
        //         guestEditPage.isNewUser = false;
        //         jest.spyOn(guestEditPage, 'submitEditForm').mockImplementation();
        //         guestEditPage.guestEditForm = {
        //             value: {
        //                 syllabus: [],
        //                 userType: 'userType',
        //                 boards: ['board'],
        //                 medium: ['medium'],
        //                 grades: ['grade']
        //             },
        //             getRawValue: jest.fn(() => { })
        //         } as any;
        //         mockCommonUtilService.translateMessage = jest.fn((arg) => {
        //             let value;
        //             switch (arg) {
        //                 case 'PLEASE_SELECT':
        //                     value = 'translated1';
        //                     break;
        //                 case 'CLASS':
        //                     value = 'translated2';
        //                     break;
        //             }
        //             return value;
        //         }
        //         );
        //         jest.spyOn(guestEditPage.guestEditForm, 'getRawValue').mockReturnValue({ name: 'name' });
        //         mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        //         // act
        //         guestEditPage.onSubmit();
        //         // assert
        //         setTimeout(() => {
        //             expect(guestEditPage.submitEditForm).toHaveBeenCalled();
        //             done();
        //         }, 0);
        //     });
    });

    describe('ngOnInit', () => {
        it('should generate INTERACT and IMPRESSION telemetry for new User', (done) => {
            // arrange
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve(
                [{ code: 'teacher' }]));
            // act
            guestEditPage.ngOnInit().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CREATE_USER_INITIATED,
                    Environment.USER,
                    PageId.CREATE_USER
                );
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.CREATE_USER,
                    Environment.USER, '',
                    ''
                );
                done();
            });
        });

        it('should generate INTERACT and IMPRESSION telemetry for existing User', (done) => {
            // arrange
            guestEditPage['isNewUser'] = false;
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve(
                [{ code: 'teacher' }]));
            // act
            guestEditPage.ngOnInit().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.EDIT_USER_INITIATED,
                    Environment.USER,
                    PageId.CREATE_USER
                );
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '',
                    PageId.CREATE_USER,
                    Environment.USER, undefined,
                    ObjectType.USER
                );
                done();
            });
        });

        it('should populate the supported attributes', (done) => {
            // arrange
            mockProfileHandler.getSupportedProfileAttributes = jest.fn(() => Promise.resolve(
                {
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                }));
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve(
                [{ code: 'teacher' }]));

            guestEditPage['onSyllabusChange'] = jest.fn(() => of({} as any));
            guestEditPage['onMediumChange'] = jest.fn(() => of({} as any));
            guestEditPage['onGradeChange'] = jest.fn(() => of({} as any));
            // act
            guestEditPage.ngOnInit().then(() => {
                // assert
                expect(guestEditPage.supportedProfileAttributes).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                });
                done();
            });
        });

    });

    describe('onProfileTypeChange', () => {
        it('should unsubscribe the previous subscription and create a new one', (done) => {
            // arrange
            guestEditPage['onSyllabusChange'] = jest.fn(() => of({} as any));
            guestEditPage['onMediumChange'] = jest.fn(() => of({} as any));
            guestEditPage['onGradeChange'] = jest.fn(() => of({} as any));
            mockProfileHandler.getSupportedProfileAttributes = jest.fn(() => Promise.resolve(
                {
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                }));
            guestEditPage.guestEditForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: ['AP'] };
                            break;
                        case 'board':
                            value = { value: ['AP'] };
                            break;
                        case 'medium':
                            value = { value: ['English'] };
                            break;
                        case 'grade':
                            value = { value: ['Class 1'] };
                            break;
                        case 'profileType':
                            value = { value: '' };
                            break;
                    }
                    return value;
                }),
                value: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'profileType':
                            value = { value: '' };
                            break;
                    }
                    return value;
                }),
                patchValue: jest.fn(),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    },
                    profileType: {
                        validator: jest.fn()
                    }
                },
            } as any;
            guestEditPage['formControlSubscriptions'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            guestEditPage.onProfileTypeChange();

            // assert
            expect(guestEditPage['formControlSubscriptions'].unsubscribe).toHaveBeenCalled();
            done();
        });

    });

});
