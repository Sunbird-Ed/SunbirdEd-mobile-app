import { SearchPage } from './search.page';
import { MimeType, ContentType, RouterLinks, EventTopics } from '@app/app/app.constant';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    SharedPreferences,
    ContentService,
    EventsBusService,
    DownloadEventType,
    ContentEventType,
    CourseService,
    SearchHistoryService,
    PageAssembleService,
    FrameworkCategoryCodesGroup
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform,  NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService
} from 'services';
import { Scanner } from 'typescript';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '@app/services/telemetry-constants';
import { of, Subscription, throwError } from 'rxjs';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { FormAndFrameworkUtilService } from '../../services';

describe('SearchPage', () => {
    let searchPage: SearchPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => {})
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        convertFileSrc: jest.fn(() => 'img'),
        showContentComingSoonAlert: jest.fn(),
        showToast: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        unsubscribe: jest.fn()
    };
    const mockEvent: Partial<Events> = {
        unsubscribe: jest.fn(),
        subscribe: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
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
                shouldGenerateEndTelemetry: false
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {
        currentLang: 'en'
    };
    const mockContentService: Partial<ContentService> = {};
    const mockpageService: Partial<ContentService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockNavCtrl: Partial<NavController> = {
        navigateForward: jest.fn(() => Promise.resolve(true))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(),
        getString: jest.fn(() => of('ka' as any))
    };
    const mockCourseService: Partial<CourseService> = {};
    const mocksearchHistoryService: Partial<SearchHistoryService> = {};
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app')),
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({}))
    };
    const mockPopoverController: Partial<PopoverController> = {};
    beforeAll(() => {
        searchPage = new SearchPage(
            mockContentService as ContentService,
            mockpageService as PageAssembleService,
            mockEventsBusService as EventsBusService,
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockCourseService as CourseService,
            mocksearchHistoryService as SearchHistoryService,
            mockAppversion as AppVersion,
            mockchangeDetectionRef as ChangeDetectorRef,
            mockZone as NgZone,
            mockEvent as Events,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockTranslate as TranslateService,
            mockHeaderService as AppHeaderService,
            mockPopoverController as PopoverController,
            mockLocation as Location,
            mockRouter as Router,
            mockNavCtrl as NavController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a instance of searchPage', () => {
        expect(searchPage).toBeTruthy();
        expect(searchPage.contentType).toEqual('contentType');
    });

    // arrange
    // act
    // assert
    // describe('ngOnInit', () => {
    it('should fetch app name on ngOnInit', (done) => {
        // arrange
        // act
        searchPage.ngOnInit();
        // assert
        expect(mockAppversion.getAppName).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.appName).toEqual('Sunbird');
            done();
        }, 0);
    });
    // });

    it('should hide header on ionview will enter', () => {
        // arrange
        spyOn(searchPage, 'handleDeviceBackButton').and.stub();
        // act
        searchPage.ionViewWillEnter();
        // assert
        expect(mockHeaderService.hideHeader).toHaveBeenCalled();
        expect(searchPage.handleDeviceBackButton).toHaveBeenCalled();
    });

    it('should set current FrameworkId', (done) => {
        // arrange
        // act
        searchPage.getFrameworkId();
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.currentFrameworkId).toEqual('ka');
            done();
        }, 0);
    });

    it('should focus the search bar', (done) => {
        // arrange
        searchPage.isFirstLaunch = true;
        searchPage.searchBar = {
            setFocus: jest.fn()
        };
        jest.spyOn(searchPage, 'checkUserSession').mockImplementation();
        // act
        searchPage.ionViewDidEnter();
        // assert
        expect(searchPage.checkUserSession).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.isFirstLaunch).toBe(false);
            done();
        }, 200);
    });

    describe('set grade and medium', () => {
        it('should reset grade', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setGrade(true, ['grade1']);
            // assert
            expect(searchPage.profile.grade.length).toEqual(1);
        });
        it('should set grade', () => {
            // arrange
            searchPage.profile = {
                grade: ['grade']
            } as any;
            // act
            searchPage.setGrade(false, ['grade1']);
            // assert
            expect(searchPage.profile.grade.length).toEqual(2);
        });
        it('should reset medium', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setMedium(true, ['medium1']);
            // assert
            expect(searchPage.profile.medium.length).toEqual(1);
        });
        it('should set medium', () => {
            // arrange
            searchPage.profile = {
                medium: ['medium']
            } as any;
            // act
            searchPage.setMedium(false, ['medium1']);
            // assert
            expect(searchPage.profile.medium.length).toEqual(2);
        });
        it('should find code of a category', () => {
            // arrange
            const categoryType = 'grade';
            const categoryList = [{name: 'sampleName', code: 'sampleCode'}];
            const data = {grade: 'sampleName'};
            // assert
            expect(searchPage.findCode(categoryList, data, categoryType)).toEqual('sampleCode');
        });
        it('should find code of a category', () => {
            // arrange
            const categoryType = 'grade';
            const categoryList = [{name: 'sampleName', code: 'sampleCode'}];
            const data = {grade: 'Name'};
            // assert
            expect(searchPage.findCode(categoryList, data, categoryType)).toBeUndefined();
        });
    });
    describe('setCurrentProfile', () => {
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                framework: 'framework',
                board: 'board',
                medium: []
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(0, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                true,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
            expect(searchPage.profile.board).toEqual(['board']);
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                framework: 'framework',
                board: 'board',
                medium: ['medium1']
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(1, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                true,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
            expect(searchPage.profile.board).toEqual(['board']);
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                medium: ['medium1']
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(2, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                false,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                gradeLevel: ['grade1']
            };
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(3, data);
            // assert
            expect(searchPage.setGrade).toHaveBeenCalledWith(
                false,
                data.gradeLevel
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
        });
    });
    describe('editProfile', () => {
        it('should edit Profile', (done) => {
            // arrange
            searchPage.gradeList = [{code: 'grade1', name: 'grade1'}];
            searchPage.profile = {
                grade: ['grade1'],
                gradeValue: {
                    grade1: 'grade1'
                }
            };
            mockProfileService.updateProfile = jest.fn(() => of({syllabus: 'sylabus'}));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            // act
            searchPage.editProfile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('checkProfileData', () => {
        it('should set profile data accordingly', () => {
            // arrange
            const data = {
                framework: 'framework1'
            };
            const profile = {
                syllabus : ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of({identifier: 'fm', name: 'fm'}));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(
                {
                    language: 'en',
                    requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
                }
            );
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1'
            };
            const profile = {
                syllabus : ['framework1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError('err' as any));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

});
