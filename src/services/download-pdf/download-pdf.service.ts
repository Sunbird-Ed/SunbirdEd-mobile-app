import { Injectable } from '@angular/core';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { AndroidPermission } from '@app/services/android-permissions/android-permission';
import { Content } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../common-util.service';


@Injectable({
  providedIn: 'root'
})
export class DownloadPdfService {
  
  constructor(
    private permissionService: AndroidPermissionsService,
    private commonUtilService: CommonUtilService
  ) { }


  downloadPdf(content: Content) {
    if(this.commonUtilService.isAndroidVer13()) {
      this.handlePDFDownlaod(content);
    } else {
      return new Promise(async (resolve, reject) => {
        const checkedStatus = await this.permissionService.checkPermissions([AndroidPermission.WRITE_EXTERNAL_STORAGE]).toPromise();
        if (checkedStatus.isPermissionAlwaysDenied) {
          reject({ reason: 'device-permission-denied' });

          return;
        }
        if (!checkedStatus.hasPermission) {
          const requestedStatus = await this.permissionService.requestPermissions([AndroidPermission.WRITE_EXTERNAL_STORAGE]).toPromise();
          if (requestedStatus.hasPermission) {
            this.handlePDFDownlaod(content);
          } else {
              reject({ reason: 'user-permission-denied' });
          }
        }
      });
    }
  }

  handlePDFDownlaod(content) {
    return new Promise((resolve, reject) => {
      const fileUri = content.contentData.downloadUrl;
      const fileName = content.name;
      const displayDescription = content.contentData.description;
      const downloadRequest: EnqueueRequest = {
        uri: fileUri,
        title: '',
        description: displayDescription,
        mimeType: 'application/pdf',
        visibleInDownloadsUi: true,
        notificationVisibility: 1,
        destinationInExternalPublicDir: {
          dirType: 'Download',
          subPath: `/${fileName}`
        },
        headers: []
      };
      downloadManager.enqueue(downloadRequest, (err, id: string) => {
        if (err) {
          reject({ reason: 'download-failed' });
        }
        resolve(id);
      });
    });
  }
}
