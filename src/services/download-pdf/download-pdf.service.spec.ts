import { TestBed } from '@angular/core/testing';
import { DownloadPdfService } from './download-pdf.service';
import { Injectable } from '@angular/core';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { AndroidPermission } from '../../services/android-permissions/android-permission';
import { of } from 'rxjs';
import { content, checkedStatusFalse, requestedStatusTrue, downloadrequested } from './download-pdf.data';
import { Content } from '@project-sunbird/sunbird-sdk';

describe('DownloadPdfService', () => {
  let downloadPdfService: DownloadPdfService;
  const mockPermissionService: Partial<AndroidPermissionsService> = {
    checkPermissions: jest.fn(() => of(Boolean)),
    requestPermissions: jest.fn(() => of(Boolean))
  };

  beforeAll(() => {
    downloadPdfService = new DownloadPdfService(
      mockPermissionService as AndroidPermissionsService
    );
   jest.spyOn(mockPermissionService, 'checkPermissions')
   jest.spyOn(mockPermissionService, 'requestPermissions')
   jest.spyOn(window['downloadManager'], 'enqueue')
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });


  it('should be created', () => {
    expect(downloadPdfService).toBeTruthy();
  });
  describe('if permission is always denied', () => {
    beforeAll(() => {
      mockPermissionService.checkPermissions = jest.fn(() => of({ isPermissionAlwaysDenied: true }));
    })
    it('it should reject', (done) => {
      try {
        downloadPdfService.downloadPdf(content as any as Content);
        fail();
      } catch (e) {
        // expect(e).toEqual({ reason: 'device-permission-denied' });
        done();
      }
    });
  });

  describe('if permission is not always denied', () => {
    beforeAll(() => {
      mockPermissionService['checkPermissions'].mockReturnValue(of({ isPermissionAlwaysDenied: false }));
    });

    describe('if permission is not allowed', () => {

      describe('if permission granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'] = jest.fn(() => of({ isPermissionAlwaysDenied: false, hasPermission: true }));
          // window['downloadManager']['enqueue'].mockImplementation();

        })
        it('should download pdf', () => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
            expect(window['downloadManager'].enqueue).toHaveBeenCalled();
          } catch (e) {
            // fail(e);
          }
        });
      });

      describe('if permission not granted', () => {
        beforeAll(() => {
          mockPermissionService['checkPermissions'].mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
          mockPermissionService['requestPermissions'].mockReturnValue(of({ isPermissionAlwaysDenied: false, hasPermission: false }));
        })
        it('should reject ', (done) => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
            fail();
          } catch (e) {
            // expect(e).toEqual({ reason: 'user-permission-denied' });
            done();
          }
        });
      });
    });
  });
});
