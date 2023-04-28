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
  } as any;

  beforeAll(() => {
    downloadPdfService = new DownloadPdfService(
      mockPermissionService as AndroidPermissionsService
    );
    spyOn(mockPermissionService, 'checkPermissions')
    spyOn(mockPermissionService, 'requestPermissions')
    spyOn(window['downloadManager'], 'enqueue')
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
      mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: true})) as any;
    })
    it('it should reject', (done) => {
      try {
        downloadPdfService.downloadPdf(content as any as Content);
        fail();
      } catch (e) {
        expect(e).toEqual({ reason: 'device-permission-denied' });
        done();
      }
    });
  });

  describe('if permission is not always denied', () => {
    beforeAll(() => {
      mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: false})) as any;
    });

    describe('if permission is not allowed', () => {

      describe('if permission granted', () => {
        beforeAll(() => {
          mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: false, hasPermission: false})) as any;
          mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: false, hasPermission: true})) as any;
          window['downloadManager']['enqueue'].and.callFake((downloadRequest, callback) => {
            callback(null, 'sampleid');
          });

        })
        it('should download pdf', (done) => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
            expect(window['downloadManager'].enqueue).toHaveBeenCalled();
            done();
          } catch (e) {
            fail(e);
          }
        });
      });

      describe('if permission not granted', () => {
        beforeAll(() => {
          mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: false, hasPermission: false})) as any;
          mockPermissionService.checkPermissions = jest.fn(() => of({isPermissionAlwaysDenied: false, hasPermission: false})) as any;
        })
        it('should reject ', (done) => {
          try {
            downloadPdfService.downloadPdf(content as any as Content);
            fail();
          } catch (e) {
            expect(e).toEqual({ reason: 'user-permission-denied' });
            done();
          }
        });
      });
    });
  });
});
