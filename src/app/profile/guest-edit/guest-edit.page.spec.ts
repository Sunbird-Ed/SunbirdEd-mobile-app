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
import { Events, Platform, AlertController, PopoverController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    ContainerService,
    AppHeaderService
} from '../../../services';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

describe('ProfileSettingsPage', () => {
    let guestEditPage: GuestEditPage;
    const mockAlertCtrl: Partial<AlertController> = {};
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
    const mockPlatform: Partial<Platform> = {};
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
                lastCreatedProfile: {id: 'sample-id'}
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

    const mockPopoverCtrl: Partial<PopoverController> = {};

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
            mockPlatform as Platform,
            mockAlertCtrl as AlertController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainer as ContainerService,
            mockPopoverCtrl as PopoverController,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
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
            get: jest.fn(() => ({Validators: ''})) as any
        } as any;
        expect(guestEditPage.syllabusControl).toBeTruthy();
    });

    it('should return boardControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({Validators: ''})) as any
        } as any;
        expect(guestEditPage.boardControl).toBeTruthy();
    });

    it('should return mediumControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({Validators: ''})) as any
        } as any;
        expect(guestEditPage.mediumControl).toBeTruthy();
    });

    it('should return gradeControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({Validators: ''})) as any
        } as any;
        expect(guestEditPage.gradeControl).toBeTruthy();
    });

    it('should return subjectControl', () => {
        guestEditPage.guestEditForm = {
            get: jest.fn(() => ({Validators: ''})) as any
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
                get: jest.fn(() => ({name: 'sample-name', board: 'board', patchValue: jest.fn()}))
            } as any;
            guestEditPage.profile = {
                syllabus: [{name: 'sample-name'}]
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

    describe('onSubjectChanged', () => {
        it('should change subject in telemetry', () => {
            // arrange
            guestEditPage.profileForTelemetry = { subject: 'subject' };
            mockAppGlobalService.generateAttributeChangeTelemetry = jest.fn();
            // act
            guestEditPage.onSubjectChanged('subject1');
            // assert
            expect(guestEditPage.profileForTelemetry.subject).toEqual('subject1');
            expect(mockAppGlobalService.generateAttributeChangeTelemetry).toHaveBeenCalled();
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
                    userType: 'userType'
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
                    userType: 'userType',
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
        it('should show toast if medium is not there', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.guestEditForm = {
                value: {
                    syllabus: [],
                    userType: 'userType',
                    boards: ['board'],
                    medium: []
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'MEDIUM':
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
        it('should show toast if grades are not there', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.guestEditForm = {
                value: {
                    syllabus: [],
                    userType: 'userType',
                    boards: ['board'],
                    medium: ['medium'],
                    grades: []
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'CLASS':
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
        it('should call submitNewUserForm if new user', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.isNewUser = true;
            jest.spyOn(guestEditPage, 'submitNewUserForm').mockImplementation();
            guestEditPage.guestEditForm = {
                value: {
                    syllabus: [],
                    userType: 'userType',
                    boards: ['board'],
                    medium: ['medium'],
                    grades: ['grade']
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'CLASS':
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
                expect(guestEditPage.submitNewUserForm).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call submitEditForm if not new user', (done) => {
            // arrange
            guestEditPage.isFormValid = true;
            guestEditPage.isNewUser = false;
            jest.spyOn(guestEditPage, 'submitEditForm').mockImplementation();
            guestEditPage.guestEditForm = {
                value: {
                    syllabus: [],
                    userType: 'userType',
                    boards: ['board'],
                    medium: ['medium'],
                    grades: ['grade']
                },
                getRawValue: jest.fn(() => { })
            } as any;
            mockCommonUtilService.translateMessage = jest.fn((arg) => {
                let value;
                switch (arg) {
                    case 'PLEASE_SELECT':
                        value = 'translated1';
                        break;
                    case 'CLASS':
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
                expect(guestEditPage.submitEditForm).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
