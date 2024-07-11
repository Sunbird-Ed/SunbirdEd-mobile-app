import { DownloadPdfService } from './download-pdf.service';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { of } from 'rxjs';
import { content } from './download-pdf.data';
import { Content } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../common-util.service';

describe('DownloadPdfService', () => {
  let downloadPdfService: DownloadPdfService;
  const mockPermissionService: Partial<AndroidPermissionsService> = {
    checkPermissions: jest.fn(() => of({})),
    requestPermissions: jest.fn(() => of({}))
  };

  const mockCommonUtilService: Partial<CommonUtilService> = {
    isAndroidVer13: jest.fn(() => (true))
  }

  beforeAll(() => {
    downloadPdfService = new DownloadPdfService(
      mockPermissionService as AndroidPermissionsService,
      mockCommonUtilService as CommonUtilService
    );
    jest.spyOn(mockPermissionService, 'checkPermissions')
    jest.spyOn(mockPermissionService, 'requestPermissions')
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(downloadPdfService).toBeTruthy();
  });

  describe('if permission is always denied', () => {
    it('it should reject', (done) => {
        // arrange
        mockCommonUtilService.isAndroidVer13 = jest.fn(() => (true));
        window['downloadManager'].enqueue = jest.fn((request, callback) => {callback("", "id")})
        // act
        downloadPdfService.downloadPdf(content as any as Content);
        // asserts
        setTimeout(() => {
          expect(downloadPdfService.downloadPdf).rejects
        done();
      }, 0);
    });
    it('it should resolves if false, and has permission true', (done) => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => (false)) as any;
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: true, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => (Promise.reject({ reason: 'device-permission-denied'}))) as any;
      // act
      downloadPdfService.downloadPdf(content as any as Content)
      // .catch(() => ({reason: "device-permission-denied" }));;
      // assert
      setTimeout(() => {
        done();
      }, 0);
    });
    it('it should resolves checkstatus false, and has permission true else case', (done) => {
      // arrange
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        done();
      }, 0);
    });
    it('it should resolves if false', () => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => true);
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of(
        {hasPermission: false })) as any;
      // act
      downloadPdfService.downloadPdf(content as any as Content)
      // assert
      setTimeout(() => {
        expect(downloadPdfService.downloadPdf).rejects.toMatchObject({"reason": "user-permission-denied"})
      }, 0);
    });
    it('it should reject if false, catch error', () => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => true);
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of(
        {hasPermission: false })) as any;
      // act
      downloadPdfService.downloadPdf(content as any as Content)
      // assert
      setTimeout(() => {
        expect(downloadPdfService.downloadPdf).rejects.toMatchObject({"reason": "user-permission-denied"})
      }, 0);
    });
    it('it should resolves if false, resolve on download enqueue', () => {
      // arrange
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      window['downloadManager'] = {
        enqueue: jest.fn((request, callback) => {callback("", "id")})
      } as any
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(window['downloadManager'].enqueue).toHaveBeenCalled();
        expect(downloadPdfService.downloadPdf).resolves
      }, 0);
    });
    it('it should resolves if false, error on download enqueue', () => {
      // arrange
      mockCommonUtilService.isAndroidVer13 = jest.fn(() => true);
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false })) as any;
      mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
      window['downloadManager'] = {
        enqueue: jest.fn((request, callback) => {
          callback(('Download failed'))
        })
      } as any
      // act
      downloadPdfService.downloadPdf(content as any as Content);
      // assert
      setTimeout(() => {
        expect(window['downloadManager'].enqueue).toHaveBeenCalled();
        expect(downloadPdfService.downloadPdf).rejects.toThrowError("{ reason: 'download-failed' }")
      }, 0);
    });
  });
});
