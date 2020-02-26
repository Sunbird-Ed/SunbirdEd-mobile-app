import { ReportsPage } from './reports.page';
import {
    ProfileService, GroupService, Profile,
    ProfileSource, GetAllProfileRequest, ProfileType, Group, TelemetryObject, ObjectType
} from 'sunbird-sdk';
import { NgZone } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Location } from '@angular/common';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId
} from '@app/services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';

describe('ReportsPage', () => {
    let reportsPage: ReportsPage;
    const mockProfileService: Partial<ProfileService> = {};
    const mockGroupService: Partial<GroupService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockLoading: Partial<LoadingController> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockRoute: Partial<ActivatedRoute> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    profile: {
                        id: 'sample-uid-1',
                        handle: 'f-name'
                    }
                }
            }
        }))
    };
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};


    beforeAll(() => {
        reportsPage = new ReportsPage(
            mockProfileService as ProfileService,
            mockGroupService as GroupService,
            mockNgZone as NgZone,
            mockLoading as LoadingController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance for reportsPage', () => {
        expect(reportsPage).toBeTruthy();
    });

    it('should generate Impression telemetry and enableBackBtn by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn(() => { });
        const presentFn = jest.fn(() => Promise.resolve());
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        jest.spyOn(reportsPage, 'populateUsers').mockResolvedValue(['Current_user', 'group'])
        jest.spyOn(reportsPage, 'enableBackBtn').mockImplementation(() => {
            return;
        });
        jest.spyOn(reportsPage, 'populateGroups').mockResolvedValue({});
        mockNgZone.run = jest.fn((fn) => fn());
        // act
        reportsPage.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                Environment.USER,
                PageId.REPORTS_USER_GROUP
            );
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            expect(presentFn).toHaveBeenCalled();
            expect(reportsPage.populateUsers).toHaveBeenCalled();
            expect(mockNgZone.run).toHaveBeenCalled();
            expect(reportsPage.populateGroups).toHaveBeenCalled();
            expect(dismissFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should generate Impression telemetry and enableBackBtn by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn(() => { });
        const presentFn = jest.fn(() => Promise.resolve());
        const dismissFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        jest.spyOn(reportsPage, 'populateUsers').mockRejectedValue('');
        jest.spyOn(reportsPage, 'enableBackBtn').mockImplementation(() => {
            return;
        });
        // act
        reportsPage.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                Environment.USER,
                PageId.REPORTS_USER_GROUP
            );
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            expect(presentFn).toHaveBeenCalled();
            expect(reportsPage.populateUsers).toHaveBeenCalled();
            expect(dismissFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should hide header by invoked ionViewWillEnter()', () => {
        // arrange
        mockHeaderService.hideHeader = jest.fn();
        // act
        reportsPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
    });

    it('should find all userProfile and populate users', (done) => {
        // arrange
        const profile: Profile[] = [{
            uid: 'sample-uid-1',
            handle: 'f-name',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }, {
            uid: 'sample-uid-2',
            handle: '',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }];
        const getAllProfileRequest: GetAllProfileRequest = {
            local: true
        };
        mockProfileService.getAllProfiles = jest.fn(() => of(profile));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({
            uid: 'sample-uid-1',
            handle: 'f-name',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }));
        reportsPage = new ReportsPage(
            mockProfileService as ProfileService,
            mockGroupService as GroupService,
            mockNgZone as NgZone,
            mockLoading as LoadingController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
        );
        // act
        reportsPage.populateUsers();
        // assert
        setTimeout(() => {
            expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(getAllProfileRequest);
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({
                requiredFields: ['completeness',
                    'missingFields',
                    'lastLoginTime',
                    'topics',
                    'organisations',
                    'roles',
                    'locations']
            });
            done();
        }, 0);
    });

    it('should not find all userProfile and populate users for getActiveSessionProfile catch part', (done) => {
        // arrange
        const profile: Profile[] = [{
            uid: 'sample-uid-1',
            handle: 'f-name',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }, {
            uid: 'sample-uid-2',
            handle: '',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }];
        const getAllProfileRequest: GetAllProfileRequest = {
            local: true
        };
        mockProfileService.getAllProfiles = jest.fn(() => of(profile));
        mockProfileService.getActiveSessionProfile = jest.fn(() => throwError(''));
        // act
        reportsPage.populateUsers().catch(() => {
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(getAllProfileRequest);
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({
                    requiredFields: ['completeness',
                        'missingFields',
                        'lastLoginTime',
                        'topics',
                        'organisations',
                        'roles',
                        'locations']
                });
                done();
            }, 0);
        });
    });

    it('should not find all userProfile and populate users for getAllProfiles catch part', (done) => {
        // arrange
        const profile: Profile[] = [{
            uid: 'sample-uid-1',
            handle: 'f-name',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }, {
            uid: 'sample-uid-2',
            handle: '',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }];
        const getAllProfileRequest: GetAllProfileRequest = {
            local: true
        };
        mockProfileService.getAllProfiles = jest.fn(() => throwError(profile));
        // act
        reportsPage.populateUsers().catch(() => {
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(getAllProfileRequest);
                done();
            }, 0);
        });
    });

    it('should return all active groups', (done) => {
        // arrange
        const group: Partial<Group>[] = [{
            gid: 'group-1'
        }];
        mockGroupService.getAllGroups = jest.fn(() => of(group));
        // act
        reportsPage.populateGroups().then(() => {
            setTimeout(() => {
                // assert
                expect(mockGroupService.getAllGroups).toHaveBeenCalledWith();
                done();
            }, 0);
        });
    });

    it('should show user report list by invoked goToUserReportList()', () => {
        // arrange
        const uid = 'sample-uid-1';
        const handle = 'f-name';
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        const telemetryObject: Partial<TelemetryObject> = {
            id: uid,
            type: ObjectType.USER,
            version: undefined
        };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        const navigationExtras: NavigationExtras = { state: { isFromUsers: true, uids: [uid], handle } };
        // act
        reportsPage.goToUserReportList(uid, handle);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.USER_CLICKED,
            Environment.USER,
            PageId.REPORTS_USER_GROUP,
            telemetryObject
        );
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.REPORTS}/${RouterLinks.REPORTS_LIST}`], navigationExtras);
    });

    it('should show group report list by invoked goToGroupUserReportList()', () => {
        // arrange
        const group: Partial<Group> = {
            gid: 'group-1'
        };
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        const telemetryObject: Partial<TelemetryObject> = {
            id: group.gid,
            type: ObjectType.GROUP,
            version: undefined
        };
        const profile: Profile[] = [{
            uid: 'sample-uid-1',
            handle: 'f-name-1',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }, {
            uid: 'sample-uid-2',
            handle: 'f-name-2',
            source: ProfileSource.LOCAL,
            profileType: ProfileType.TEACHER
        }];
        const getAllProfileRequest: GetAllProfileRequest = { local: true, groupId: group.gid };
        mockProfileService.getAllProfiles = jest.fn(() => of(profile));
        // act
        reportsPage.goToGroupUserReportList(group);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.GROUP_CLICKED,
            Environment.USER,
            PageId.REPORTS_USER_GROUP,
            telemetryObject
        );
        expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(getAllProfileRequest);
    });

    it('should generate telemetry for user by invoked onSegmentChange()', () => {
        // arrange
        const data = 'users';
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        const subType = 'users-tab-clicked';
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn(() => { });
        // act
        reportsPage.onSegmentChange(data);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            subType,
            Environment.USER,
            PageId.REPORTS_USER_GROUP
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            Environment.USER,
            PageId.REPORTS_USER_GROUP
        );
    });

    it('should generate telemetry for user by invoked onSegmentChange()', () => {
        // arrange
        const data = 'groups';
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        const subType = 'groups-tab-clicked';
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn(() => { });
        // act
        reportsPage.onSegmentChange(data);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            subType,
            Environment.USER,
            PageId.REPORTS_USER_GROUP
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW,
            '',
            Environment.USER,
            PageId.REPORTS_USER_GROUP
        );
    });

    it('should be enable device backbutton by invoked enableBackBtn()', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        jest.spyOn(reportsPage, 'goBack').mockImplementation(() => {
            return;
        });
        // act
        reportsPage.enableBackBtn();
        // assert
        expect(subscribeWithPriorityData).toHaveBeenCalled();
        expect(reportsPage.goBack).toHaveBeenCalled();
    });

    it('should go to previous page', () => {
        // arrange
        mockLocation.back = jest.fn();
        reportsPage = new ReportsPage(
            mockProfileService as ProfileService,
            mockGroupService as GroupService,
            mockNgZone as NgZone,
            mockLoading as LoadingController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockHeaderService as AppHeaderService,
            mockCommonUtilService as CommonUtilService,
            mockRoute as ActivatedRoute,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
        );
        // act
        reportsPage.goBack();
        // assert
        setTimeout(() => {
            expect(mockLocation.back).toHaveBeenCalled();
        }, 0);
    });

    it('should unsubscribe device backbutton by invoked ionViewWillLeave()', () => {
        // arrange
        const unsubscribeData = jest.fn();
        const subscribeWithPriorityData = {
            unsubscribe: unsubscribeData
        } as any;
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        // act
        reportsPage.ionViewWillLeave();
        // assert
        setTimeout(() => {
            expect(unsubscribeData).toHaveBeenCalled();
        }, 0);
    });
});
