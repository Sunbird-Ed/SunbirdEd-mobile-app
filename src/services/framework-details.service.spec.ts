import { TranslateService } from '@ngx-translate/core';
import { FrameworkUtilService } from 'sunbird-sdk';
import { of } from 'rxjs';
import { CommonUtilService } from '.';
import { FrameworkDetailsService } from './framework-details.service';
import { LocationHandler } from './location-handler';
import { FrameworkUtilServiceImpl } from '@project-sunbird/sunbird-sdk';
import { mockBoardCategory, mockGradeLevelCategory, mockMediumCategory, mockSubjectCategory } from './framework-details.service.spec.data';
describe('FrameworkDetailsService', () => {
    let frameworkDetailsService: FrameworkDetailsService;
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFrameworkCategoryTerms: jest.fn((arg) => {
            let value;
            switch (arg.currentCategoryCode) {
                case 'board':
                    value = mockBoardCategory;
                    break;
                case 'medium':
                    value = mockMediumCategory;
                    break;
                case 'gradeLevel':
                    value = mockGradeLevelCategory;
                    break;
                case 'subject':
                    value = mockSubjectCategory;
                    break;
            }
            return of(value);
        })
    };
    const mockLocationHandler: Partial<LocationHandler> = {};
    const mockTranslate: Partial<TranslateService> = {};

    frameworkDetailsService = new FrameworkDetailsService(
        mockFrameworkUtilService as FrameworkUtilService,
        mockCommonUtilService as CommonUtilService,
        mockTranslate as TranslateService,
        mockLocationHandler as LocationHandler
    );

    it('should be create a instance of FrameworkDetailsService', () => {
        expect(frameworkDetailsService).toBeTruthy();
    });

    describe('getFrameworkDetails', () => {
        it('should return framework code', (done) => {
            // arrange
            const profile = {
                syllabus: ['sample-syllabus'],
                board: ['board'],
                medium: ['assamese', 'bengali'],
                grade: ['class1', 'class2'],
                subject: ['accountancy', 'assamese']
            };
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve(profile));
            mockLocationHandler.getAvailableLocation = jest.fn(() => Promise.resolve([
                {code: 'state-code', name: 'state-name', id: 'state-id', type: 'state'},
                {code: 'dist-code', name: 'dist-name', id: 'dist-id', type: 'district'}
            ])) as any;
            mockLocationHandler.getLocationList = jest.fn(() => Promise.resolve(
                [
                    {
                        id: 'state-id'
                    },
                    {
                        id: 'dist-id'
                    }
                ]
            )) as any;
            // act
            frameworkDetailsService.getFrameworkDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getGuestUserConfig).toHaveBeenCalled();
                expect(mockLocationHandler.getAvailableLocation).toHaveBeenCalled();
                expect(mockLocationHandler.getLocationList).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return error', (done) => {
            // arrange
            const profile = {
                syllabus: ['sample-syllabus'],
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve(profile));
            mockLocationHandler.getAvailableLocation = jest.fn(() => Promise.resolve([
                {code: 'state-code', name: 'state-name', id: 'state-id', type: 'state'},
                {code: 'dist-code', name: 'dist-name', id: 'dist-id', type: 'district'}
            ])) as any;
            mockLocationHandler.getLocationList = jest.fn(() => Promise.resolve(
                [
                    {
                        id: 'state-id'
                    },
                    {
                        id: 'dist-id'
                    }
                ]
            )) as any;
            // act
            frameworkDetailsService.getFrameworkDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getGuestUserConfig).toHaveBeenCalled();
                expect(mockLocationHandler.getAvailableLocation).toHaveBeenCalled();
                expect(mockLocationHandler.getLocationList).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
