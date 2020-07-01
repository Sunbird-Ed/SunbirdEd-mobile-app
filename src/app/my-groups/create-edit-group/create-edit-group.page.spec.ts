import { CreateEditGroupPage } from './create-edit-group.page';
import { ClassRoomService } from '@project-sunbird/sunbird-sdk';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('CreateEditGroupPage', () => {
    let createEditGroupPage: CreateEditGroupPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockClassRoomService: Partial<ClassRoomService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFormBuilder: Partial<FormBuilder> = {
        group: jest.fn(() => { }) as any
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {
    };
    const mockRouter: Partial<Router> = {};
    const mockTranslate: Partial<TranslateService> = {};

    beforeAll(() => {
        createEditGroupPage = new CreateEditGroupPage(
            mockClassRoomService as ClassRoomService,
            mockCommonUtilService as CommonUtilService,
            mockFormBuilder as FormBuilder,
            mockTranslate as TranslateService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockLocation as Location,
            mockPlatform as Platform,
            mockAlertCtrl as AlertController
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of createEditGroupPage', () => {
        expect(createEditGroupPage).toBeTruthy();
    });

    it('should return current user', () => {
        mockAppGlobalService.getCurrentUser = jest.fn(() => {});
        createEditGroupPage.ngOnInit();
        expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
    });

    describe('handleBackButtonEvents', () => {
        it('should return active portal', (done) => {
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn({ data: 's-id', unsubscribe: jest.fn() })) as any,
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve(true));
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve({
                dismiss: dismissFn
            })) as any;
            createEditGroupPage.handleBackButtonEvents();
            setTimeout(() => {
                expect(mockPlatform.backButton).not.toBeUndefined();
                done();
            }, 0);
        });

        it('should navigate to previous page', (done) => {
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, fn) => fn({ data: 's-id', unsubscribe: jest.fn() })) as any,
            } as any;
            mockAlertCtrl.getTop = jest.fn(() => undefined);
            mockLocation.back = jest.fn();
            createEditGroupPage.handleBackButtonEvents();
            setTimeout(() => {
                expect(mockPlatform.backButton).not.toBeUndefined();
                done();
            }, 0);
        });
    });

    it('should return headers with backButton', () => {
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(createEditGroupPage, 'handleBackButtonEvents').mockImplementation(() => {
            return;
        });
        createEditGroupPage.ionViewWillEnter();
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe backButton', () => {
            createEditGroupPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            createEditGroupPage.ionViewWillLeave();
            expect(createEditGroupPage.backButtonFunc).toBeTruthy();
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        });

        it('should unsubscribe backButton for else part', () => {
            createEditGroupPage.backButtonFunc = undefined;
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
            createEditGroupPage.ionViewWillLeave();
            expect(createEditGroupPage.backButtonFunc).toBeFalsy();
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        });
    });

    it('should return createGroupForm', () => {
        createEditGroupPage.createGroupForm = {
            controls: {
                id : {}
            }
        } as any;
        expect(createEditGroupPage.createGroupFormControls).toEqual({id: {}});
    });

    describe('createGroup', () => {
        it('should return new created group', (done) => {
            const request = {
                groupName: 'new-sample-group'
            };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockClassRoomService.create = jest.fn(() => of({})) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            createEditGroupPage.profile = {
                uid: 'sample-uid'
            };
            // act
            createEditGroupPage.createGroup(request);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockClassRoomService.create).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('GROUP_CREATED');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return new created group', (done) => {
            const request = {
                groupName: 'new-sample-group'
            };
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockClassRoomService.create = jest.fn(() => throwError({error: 'error'})) as any;
            mockCommonUtilService.showToast = jest.fn();
            createEditGroupPage.profile = {
                uid: 'sample-uid'
            };
            // act
            createEditGroupPage.createGroup(request);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockClassRoomService.create).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
        });
    });

    describe('onSubmit', () => {
        it('should invoked createGroup if createGroupForm is valid', () => {
            createEditGroupPage.createGroupForm = {
                value: {groupName: 'new-sample-group'},
                valid: true
            } as any;
            createEditGroupPage.onSubmit();
            expect(createEditGroupPage.createGroupFormSubmitted).toBeTruthy();
            expect(createEditGroupPage.createGroupForm.valid).toBeTruthy();
        });

        it('should not invoked createGroup if createGroupForm is not valid', () => {
            createEditGroupPage.createGroupForm = {
                value: {groupName: 'new-sample-group'},
                valid: false
            } as any;
            createEditGroupPage.onSubmit();
            expect(createEditGroupPage.createGroupFormSubmitted).toBeTruthy();
            expect(createEditGroupPage.createGroupForm.valid).toBeFalsy();
        });
    });
});
