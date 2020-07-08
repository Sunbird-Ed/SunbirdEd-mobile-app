import { CreateEditGroupPage } from './create-edit-group.page';
import { GroupService } from '@project-sunbird/sunbird-sdk';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Platform, AlertController } from '@ionic/angular';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../services';

describe('CreateEditGroupPage', () => {
    let createEditGroupPage: CreateEditGroupPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockGroupService: Partial<GroupService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getAppName : jest.fn(() => Promise.resolve('Sunbird')),
        getBuildConfigValue: jest.fn(() => Promise.resolve('sampleConfig'))
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('sampleConfig'))
    };
    const mockFormBuilder: Partial<FormBuilder> = {
        group: jest.fn(() => { }) as any
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {
    };
    const mockTranslate: Partial<TranslateService> = {};

    beforeAll(() => {
        createEditGroupPage = new CreateEditGroupPage(
            mockGroupService as GroupService,
            mockCommonUtilService as CommonUtilService,
            mockFormBuilder as FormBuilder,
            mockTranslate as TranslateService,
            mockHeaderService as AppHeaderService,
            mockLocation as Location,
            mockPlatform as Platform,
            mockAlertCtrl as AlertController,
            mockUtilityService as UtilityService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of createEditGroupPage', () => {
        expect(createEditGroupPage).toBeTruthy();
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
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('Sunbird'));
        createEditGroupPage.ionViewWillEnter();
        expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe backButton', () => {
            createEditGroupPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            createEditGroupPage.ionViewWillLeave();
            expect(createEditGroupPage.backButtonFunc).toBeTruthy();
        });

        it('should unsubscribe backButton for else part', () => {
            createEditGroupPage.backButtonFunc = undefined;
            createEditGroupPage.ionViewWillLeave();
            expect(createEditGroupPage.backButtonFunc).toBeFalsy();
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

    describe('onSubmit', () => {
        it('should return and new group invoked createGroup if createGroupForm is valid', (done) => {
            createEditGroupPage.createGroupForm = {
                value: {groupName: 'new-sample-group', groupDesc: 'group-desc'},
                valid: true
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.create = jest.fn(() => of({})) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            createEditGroupPage.onSubmit();
            expect(createEditGroupPage.createGroupFormSubmitted).toBeTruthy();
            expect(createEditGroupPage.createGroupForm.valid).toBeTruthy();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockGroupService.create).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('GROUP_CREATED');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not return and new group invoked createGroup if createGroupForm is valid for catch part', (done) => {
            createEditGroupPage.createGroupForm = {
                value: {groupName: 'new-sample-group', groupDesc: 'group-desc'},
                valid: true
            } as any;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockGroupService.create = jest.fn(() => throwError({error: 'error'})) as any;
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            createEditGroupPage.onSubmit();
            expect(createEditGroupPage.createGroupFormSubmitted).toBeTruthy();
            expect(createEditGroupPage.createGroupForm.valid).toBeTruthy();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockGroupService.create).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
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

    it( 'should open terms of use page', () => {
        // arrange
        // action
        createEditGroupPage.openTermsOfUse();
        // assert
        expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
    });
});
