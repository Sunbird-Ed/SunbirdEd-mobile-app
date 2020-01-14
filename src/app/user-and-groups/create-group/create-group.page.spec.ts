import { CreateGroupPage } from './create-group.page';
import { FormBuilder } from '@angular/forms';
import { CommonUtilService, TelemetryGeneratorService, AppHeaderService } from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { GroupService, FrameworkService, FrameworkUtilService, Framework, CategoryTerm } from 'sunbird-sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { of, identity } from 'rxjs';

describe('createGroupPage', () => {
    let createGroupPage: CreateGroupPage;
    const mockFormBuilder: Partial<FormBuilder> = {
        group: jest.fn()
    };
    const mockTranslateService: Partial<TranslateService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'string'),
        getLoader: jest.fn(() => {
            return { 
                present: jest.fn(),
                dismiss: jest.fn()
            }
        })
    };
    const mockGroupService: Partial<GroupService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {
        getFrameworkDetails: jest.fn(() => {
            return new Promise((resolve, reject) => {
                resolve([1]);
            });
        })
    };
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFrameworkCategoryTerms: jest.fn(),
        getActiveChannelSuggestedFrameworkList: jest.fn()
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => {
            return { extras: { state: ''}};
        })
    };
    const mockPlatform: Partial<Platform> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockLocation: Partial<Location> = {};
    const mockChangeDetectorRef: Partial<ChangeDetectorRef> = {
        detectChanges: jest.fn()
    };

    beforeAll(() => {
        createGroupPage = new CreateGroupPage(
            mockFormBuilder as FormBuilder,
            mockTranslateService as TranslateService,
            mockCommonUtilService as CommonUtilService,
            mockGroupService as GroupService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockAppHeaderService as AppHeaderService,
            mockActivatedRoute as ActivatedRoute,
            mockRouter as Router,
            mockPlatform as Platform,
            mockNgZone as NgZone,
            mockLocation as Location,
            mockChangeDetectorRef as ChangeDetectorRef
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialise classlist by calling getter of classlist', () => {
        // act
        createGroupPage.classList.push(1);
        // // assert
        expect(createGroupPage.classList).toEqual([1]);
    });

    it('should initialise syllabuslist', () => {
        // act
        createGroupPage.syllabusList.push(1);
        // assert
        expect(createGroupPage.syllabusList).toEqual([1]);
    });

    it('should check for classlist to be initialised', (done) => {
        // arrange
        createGroupPage.groupEditForm = {
            patchValue: jest.fn()
        } as any;
        spyOn(createGroupPage.groupEditForm, 'patchValue').and.stub();
        jest.spyOn(mockFrameworkService, 'getFrameworkDetails').mockReturnValue(of({} as Framework));
        jest.spyOn(mockFrameworkUtilService, 'getFrameworkCategoryTerms').mockReturnValue(of([{identifier: 'q23123'}] as CategoryTerm[]));
        // act
        createGroupPage.getClassList('0114', false);
        // assert
        setTimeout(() => {
            expect(createGroupPage.classList).toEqual([{identifier: 'q23123'}]);
            done();
        }, 0);
    });
});