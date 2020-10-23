import { Injectable } from '@angular/core';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { AndroidPermission } from '@app/services/android-permissions/android-permission';
import { Content } from '@project-sunbird/sunbird-sdk';


@Injectable({
  providedIn: 'root'
})
export class DownloadPdfService {

  constructor(
    private permissionService: AndroidPermissionsService,
  ) { }


  async downloadPdf(content: Content) {
    return new Promise(async (resolve, reject) => {
      const checkedStatus = await this.permissionService.checkPermissions([AndroidPermission.WRITE_EXTERNAL_STORAGE]).toPromise();
      if (checkedStatus.isPermissionAlwaysDenied) {
        reject({ reason: 'device-permission-denied' });

        return;
      }
      if (!checkedStatus.hasPermission) {
        const requestedStatus = await this.permissionService.requestPermissions([AndroidPermission.WRITE_EXTERNAL_STORAGE]).toPromise();
        if (requestedStatus.hasPermission) {
          console.log('cam einside if');
          // download
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
              subPath: `/${fileName}.pdf`
            },
            headers: []
          };
          downloadManager.enqueue(downloadRequest, (err, id: string) => {
            if (err) {
              reject({ reason: 'download-failed' });
            }
            resolve(id);
          });
        } else {
            reject({ reason: 'user-permission-denied' });
        }
      }
    });
  }
}
