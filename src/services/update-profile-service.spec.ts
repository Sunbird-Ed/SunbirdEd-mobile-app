import {UpdateProfileService} from '../services/update-profile-service';
import {ProfileService} from '@project-sunbird/sunbird-sdk';
import {FrameworkCategoryCodesGroup, FrameworkService, FrameworkUtilService} from '@project-sunbird/sunbird-sdk';
import {TranslateService} from '@ngx-translate/core';
import {CommonUtilService} from '../services/common-util.service';
import {TelemetryGeneratorService} from '../services/telemetry-generator.service';
import {Events} from '../util/events';
import {AppGlobalService} from '../services/app-global-service.service';
import {of, throwError} from 'rxjs';
import {SbProgressLoader} from '../services/sb-progress-loader.service';

describe('UpdateProfileService', () => {
    let updateProfileService: UpdateProfileService;

    const mockProfileService: Partial<ProfileService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockEvents: Partial<Events> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        updateProfileService = new UpdateProfileService(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockTranslateService as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockSbProgressLoader as SbProgressLoader
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('checkProfileData', () => {
        it('should set profile data accordingly and getActiveSuggestedFrameworkList', () => {
            // arrange
            const data = {
                board: ['fm']
            };
            const profile = {
                syllabus: ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{identifier: 'fm', name: 'fm'}]));
            mockTranslateService.currentLang = 'en';
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(
                {
                    language: 'en',
                    requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
                }
            );
        });

        it('should set profile data accordingly and getFrameworkDetails', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError('err' as any));
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should set profile data accordingly and check for boardList data', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            {code: 'boardcode', name: 'framework1'}
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            {code: 'medium1code', name: 'medium1'}
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            {code: 'grade1code', name: 'grade1'}
                        ]
                    }
                ]
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            mockProfileService.updateProfile = jest.fn(() => of({
                syllabus: ['ekstep_k12'],
                board: ['cbse'],
                grade: ['grade1', 'grade2'],
                medium: ['medium1', 'medium2']
            }));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockTelemetryGeneratorService.generateProfilePopulatedTelemetry = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(updateProfileService.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });

        it('should set profile data accordingly and getFrameworkDetails', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            {code: 'boardcode', name: 'framework1'}
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            {code: 'medium1code', name: 'medium1'}
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            {code: 'grade1code', name: 'grade1'}
                        ]
                    }
                ]
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            mockProfileService.updateProfile = jest.fn(() => of({
                syllabus: ['ekstep_k12'],
                board: ['cbse'],
                grade: ['grade1', 'grade2'],
                medium: ['medium1', 'medium2']
            }));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockTelemetryGeneratorService.generateProfilePopulatedTelemetry = jest.fn();
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(updateProfileService.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });

        it('should set profile data accordingly equal to categoryTerms', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                medium: ['medium1'],
                gradeLevel: ['grade1', 'grade2'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            {code: 'boardcode', name: 'framework1'}
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            {code: 'medium1code', name: 'medium1'}
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            {code: 'grade1code', name: 'grade1'}
                        ]
                    }
                ]
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            mockProfileService.updateProfile = jest.fn(() => of({
                syllabus: ['ekstep_k12'],
                board: ['cbse'],
                grade: ['grade1', 'grade2'],
                medium: ['medium1', 'medium2']
            }));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockTelemetryGeneratorService.generateProfilePopulatedTelemetry = jest.fn();
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(updateProfileService.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });

        it('should set profile data accordingly and frameworkData', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                medium: ['medium1', 'medium2'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode'],
                medium: ['medium1'],
                grade: ['grade1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            const getFrameworkDetailsResp = {
                name: '',
                identifier: '',
                categories: [
                    {
                        code: 'board',
                        terms: [
                            {code: 'boardcode', name: 'framework1'}
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            {code: 'medium1', name: 'medium1'}
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            {code: 'grade1', name: 'grade1'}
                        ]
                    }
                ]
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            mockProfileService.updateProfile = jest.fn(() => of({
                syllabus: ['ekstep_k12'],
                board: ['cbse'],
                grade: ['grade1', 'grade2'],
                medium: ['medium1', 'medium2']
            }));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockTelemetryGeneratorService.generateProfilePopulatedTelemetry = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(updateProfileService.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });

        it('should set profile data accordingly if board length is higher', (done) => {
            // arrange
            const data = {
                board: ['framework1'],
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode', 'b2']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{identifier: 'framework1', name: 'framework1'}];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            {code: 'boardcode', name: 'framework1'}
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            {code: 'medium1code', name: 'medium1'}
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            {code: 'grade1code', name: 'grade1'}
                        ]
                    }
                ]
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            mockProfileService.updateProfile = jest.fn(() => of({
                syllabus: ['ekstep_k12'],
                board: ['cbse'],
                grade: ['grade1', 'grade2'],
                medium: ['medium1', 'medium2']
            }));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn();
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            mockTelemetryGeneratorService.generateProfilePopulatedTelemetry = jest.fn();
            mockSbProgressLoader.hide = jest.fn();
            // act
            updateProfileService.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(updateProfileService.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(updateProfileService.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });
    });
});
