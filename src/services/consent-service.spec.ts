import { PopoverController } from '@ionic/angular';
import { Consent, ConsentStatus } from '@project-sunbird/client-services/models';
import { of, throwError } from 'rxjs';
import { CommonUtilService } from './common-util.service';
import { ConsentService } from './consent-service';
import { ProfileService } from '@project-sunbird/sunbird-sdk';

describe('ConsentService', () => {
  let consentService: ConsentService;
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockPopoverController: Partial<PopoverController> = {};
  const mockProfileService: Partial<ProfileService> = {};

  beforeAll(() => {
    consentService = new ConsentService(
      mockProfileService as ProfileService,
      mockPopoverController as PopoverController,
      mockCommonUtilService as CommonUtilService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('showConsentPopup', () => {
    it('should update user consent', (done) => {
      // arrange
      const course = {
        courseId: 'courseId',
        channel: 'sample-channelId',
        userId: 'sample-userId'
      };
      const request: Consent = {
        status: ConsentStatus.REVOKED,
        userId: course.userId,
        consumerId: course.channel,
        objectId: course.courseId,
        objectType: 'Collection'
      };
      const presentFn = jest.fn(() => Promise.resolve());
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
      }) as any);
      const dismissFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockProfileService.updateConsent = jest.fn(() => of({
        message: 'success'
      }));
      mockCommonUtilService.showToast = jest.fn();
      // act
      consentService.showConsentPopup(course);
      // assert
      setTimeout(() => {
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should not update user consent for catch part', (done) => {
      // arrange
      const course = {
        courseId: 'courseId',
        channel: 'sample-channelId',
        userId: 'sample-userId'
      };
      const request: Consent = {
        status: ConsentStatus.REVOKED,
        userId: course.userId,
        consumerId: course.channel,
        objectId: course.courseId,
        objectType: 'Collection'
      };
      const presentFn = jest.fn(() => Promise.resolve());
      mockPopoverController.create = jest.fn(() => Promise.resolve({
        present: presentFn,
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
      }) as any);
      const dismissFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
      mockProfileService.updateConsent = jest.fn(() => throwError({
        code: 'NETWORK_ERROR'
      }));
      mockCommonUtilService.showToast = jest.fn();
      // act
      consentService.showConsentPopup(course);
      // assert
      setTimeout(() => {
        expect(mockPopoverController.create).toHaveBeenCalled();
        expect(presentFn).toHaveBeenCalled();
        expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
        expect(mockProfileService.updateConsent).toHaveBeenCalledWith(request);
        expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('getConsent', () => {
    it('should return status for getConsent', (done) => {
      const request: Consent = {
        userId: 'sample-user-id',
        consumerId: 'sample-rootOrgId',
        objectId: 'sample-rootOrgId',
        objectType: 'Organisation'
      };
      const userDetails = {
        uid: 'sample-user-id',
        serverProfile: {
          rootOrg: {
            rootOrgId: 'sample-rootOrgId'
          }
        }
      };
      mockProfileService.getConsent = jest.fn(() => of({}));
      mockProfileService.updateServerProfileDeclarations = jest.fn(() => of({}));
      // act
      consentService.getConsent(userDetails, true);
      // assert
      setTimeout(() => {
        expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
        done();
      }, 0);
    });

    it('should should show consentPopup for getConsent catchPart', (done) => {
      const request: Consent = {
        userId: 'sample-user-id',
        consumerId: 'sample-rootOrgId',
        objectId: 'sample-rootOrgId',
        objectType: 'Organisation'
      };
      const userDetails = {
        uid: 'sample-user-id',
        serverProfile: {
          rootOrg: {
            rootOrgId: 'sample-rootOrgId'
          }
        }
      };
      mockProfileService.getConsent = jest.fn(() => throwError({
        response: {
          body: {
            params: {
              err: 'USER_CONSENT_NOT_FOUND'
            }
          },
          responseCode: 404
        }
      }));
      jest.spyOn(consentService, 'showConsentPopup').mockImplementation(() => {
        return Promise.resolve();
      });
      // act
      consentService.getConsent(userDetails, true);
      // assert
      setTimeout(() => {
        expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
        done();
      }, 0);
    });

    it('should return null for network error of getConsent catchPart', (done) => {
      const request: Consent = {
        userId: 'sample-user-id',
        consumerId: 'sample-rootOrgId',
        objectId: 'sample-rootOrgId',
        objectType: 'Organisation'
      };
      const userDetails = {
        uid: 'sample-user-id',
        serverProfile: {
          rootOrg: {
            rootOrgId: 'sample-rootOrgId'
          }
        }
      };
      mockProfileService.getConsent = jest.fn(() => throwError({
        response: {
          body: {
            params: {
              err: 'USER_CONSENT'
            }
          },
          responseCode: 500
        },
        code: 'NETWORK_ERRO'
      }));
      mockProfileService.updateServerProfileDeclarations = jest.fn(() => of({}));
      jest.spyOn(consentService, 'showConsentPopup').mockImplementation(() => {
        return Promise.resolve();
      });
      // act
      consentService.getConsent(userDetails, true);
      // assert
      setTimeout(() => {
        expect(mockProfileService.getConsent).toHaveBeenCalledWith(request);
        done();
      }, 0);
    });
  });
});
