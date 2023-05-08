import { Router } from '@angular/router';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService, CommonUtilService, ContainerService, FormAndFrameworkUtilService } from '../../../services';
import { SegmentationTagService } from '../../../services/segmentation-tag/segmentation-tag.service';
import { CategoriesEditService } from './categories-edit.service';
import { Events } from '../../../util/events';
import { TncUpdateHandlerService } from '../../../services/handlers/tnc-update-handler.service';
import { Location } from '@angular/common';
import { ExternalIdVerificationService } from '../../../services/externalid-verification.service';

describe('CategoriesEditService', () => {
    let categoriesEditService: CategoriesEditService;

    const mockProfileService: Partial<ProfileService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSegmentationTagService: Partial<SegmentationTagService> = {};
    const mockEvents: Partial<Events> = {};
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        checkForTncUpdate: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockLocation: Partial<Location> = {};
    const mockContainer: Partial<ContainerService> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
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
                lastCreatedProfile: { id: 'sample-id' },
                showOnlyMandatoryFields: true,
                hasFilledLocation: true,
                isRootPage: true,
                profile: {
                    serverProfile: {
                        userType: 'teacher',
                        firstName: 'sample-user',
                    }
                }
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {};

    beforeAll(() => {
        categoriesEditService = new CategoriesEditService(
            mockProfileService as ProfileService,
            mockCommonUtilService as CommonUtilService,
            mockSegmentationTagService as SegmentationTagService,
            mockEvents as Events,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockLocation as Location,
            mockContainer as ContainerService,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockExternalIdVerificationService as ExternalIdVerificationService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of CategoriesEditService', () => {
        expect(CategoriesEditService).toBeTruthy();
    });

});
