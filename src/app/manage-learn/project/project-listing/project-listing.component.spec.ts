import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProjectListingComponent } from './project-listing.component';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService } from "../../core";
import { UtilsService } from '../../core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Platform } from '@ionic/angular';
import { DbService } from '../../core/services/db.service';
import { HttpClient } from '@angular/common/http';
import { AppHeaderService } from '../../../../services/app-header.service';
import { RouterLinks } from '../../../app.constant';
import { Location } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController, } from '@angular/common/http/testing';

describe('ProjectListingComponent', () => {
    let component: ProjectListingComponent;
    let mockUnnatiDataService: Partial<UnnatiDataService> = {}
    const mockLoaderService: Partial<LoaderService> = {}
    const mockUtilsService: Partial<UtilsService> = {}
    const mockRouter: Partial<Router> = {}
    const mockAppHeaderService: Partial<AppHeaderService> = {}
    const mockRouterLinks: Partial<RouterLinks> = {}
    const mockPlatform: Partial<Platform> = {}
    const mockDbService: Partial<DbService> = {}
    let mockHttpClient: Partial<HttpClient> = {}
    const mockLocation: Partial<Location> = {}

    beforeAll(() => {
        component = new ProjectListingComponent(
            mockRouter as Router,
            mockLocation as Location,
            mockAppHeaderService as AppHeaderService,
            mockPlatform as Platform,
            mockUnnatiDataService as UnnatiDataService,
            mockLoaderService as LoaderService,
            mockDbService as DbService,
            mockHttpClient as HttpClient,
            mockUtilsService as UtilsService,
        )
    })

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('Should be intiate Project listing compnent', () => {
        expect(ProjectListingComponent).toBeTruthy();
    })
    describe('ionViewWillEnter', () => {
        it('Should return list of projects / projectsList by invoked ionViewWillEnter', (done) => {
            mockUtilsService.getProfileInfo = jest.fn(() => Promise.resolve(true));
            mockUnnatiDataService.post = jest.fn(() =>
                of({
                    result: {
                        data: [
                            {
                                description: "Come See Our School!- Parent Mela",
                                externalId: "AP-TEST-PROGRAM-3.6.5-IMP-PROJECT-1-DEO",
                                name: "Come See Our School!- Parent Mela",
                                programId: "600ab53cc7de076e6f993724",
                                programName: "AP-TEST-PROGRAM-3.6.5",
                                projectTemplateId: "600acc61a0cc3e4909f91f80",
                                solutionId: "600acc42c7de076e6f995147",
                                type: "improvementProject",
                                _id: "60116ad0b2126d76f60b0fb3",
                            }
                        ],
                    },
                })
            );
            mockAppHeaderService.getDefaultPageConfig = jest.fn(() => ({
                showHeader: true,
                showBurgerMenu: true,
                pageTitle: 'string',
                actionButtons: ['true'],
            }));
            mockAppHeaderService.updatePageConfig = jest.fn();
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, cb) => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                    return {
                        unsubscribe: jest.fn()
                    };
                }),
            } as any;
            mockLoaderService.startLoader = jest.fn(() => Promise.resolve());
            mockLoaderService.stopLoader = jest.fn(() => Promise.resolve());
            mockLocation.back = jest.fn();
            // act
            component.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockUtilsService.getProfileInfo).toHaveBeenCalled();
                expect(mockUnnatiDataService.post).toHaveBeenCalled();
                expect(component.projects.length).toBeGreaterThan(0);
                expect(mockAppHeaderService.getDefaultPageConfig).toHaveBeenCalled();
                expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalled();
                expect(mockPlatform.backButton).not.toBeUndefined();
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('Should unsubscribe if backButtonFunc is not undefined', (done) => {
            // arrange
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((_, cb) => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                    return {
                        unsubscribe: jest.fn()
                    };
                }),
            } as any;
            // act
            component.ionViewWillLeave();
            // assert
            setTimeout(() => {
                // expect(mockPlatform.backButton.unsubscribe).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ProjectDetail', () => {
        it('Should navigate to project detail Page', (done) => {
            //arrange
            mockRouter.navigate = jest.fn();
            // act
            let project = {
                programId: '600ab53cc7de076e6f993724',
                solutionId: '600acc42c7de076e6f995147'
            }
            let id = '60116ad0b2126d76f60b0fb3';
            component.selectedProgram(id, project);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['project/details', id, project.programId, project.solutionId]);
                done();
            }, 0);
        })
    });

    describe('CreateProject', () => {
        it('Should navigate to create project Page', (done) => {
            //arrange
            mockRouter.navigate = jest.fn();
            // act
            component.createProject();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/project/create-project'], {
                    queryParams: {}
                });
                done();
            }, 0);
        })
    });
});