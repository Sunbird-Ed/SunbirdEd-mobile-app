import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { CommonUtilService } from '../common-util.service';
import { Components } from '@ionic/core/dist/types/components';
import { FilePathService } from '../../services/file-path/file.service';
import { FilePaths } from '../../services/file-path/file';
import { Platform } from '@ionic/angular';
declare const window;
@Injectable({
  providedIn: 'root'
})
export class PrintPdfService {
  fileTransfer: FileTransferObject;


  constructor(
    private commonUtilService: CommonUtilService,
    private transfer: FileTransfer,
    public platform: Platform,
    private filePathService: FilePathService,
  ) { }

  async printPdf(url) {
    const loader: Components.IonLoading = await this.commonUtilService.getLoader();
    await loader.present();
    try {
      this.fileTransfer = this.transfer.create();
      const filePath = FilePaths.CACHE;
      const folderPath = await this.filePathService.getFilePath(filePath);
      console.log('folderPath in print-pdf.service', folderPath);
      const entry = await this.fileTransfer
        .download(url, folderPath + url.substring(url.lastIndexOf('/') + 1));
      url = entry.toURL();
      console.log('url in print-pdf.service', url);
    

      window.cordova.plugins.printer.canPrintItem(url, (canPrint: boolean) => {
        if (canPrint) {
          window.cordova.plugins.printer.print(url);
        } else {
          this.commonUtilService.showToast('ERROR_COULD_NOT_OPEN_FILE');
        }
      });
    } catch (e) {
      this.commonUtilService.showToast('ERROR_COULD_NOT_OPEN_FILE');
    } finally {
      await loader.dismiss();
    }
  }
}