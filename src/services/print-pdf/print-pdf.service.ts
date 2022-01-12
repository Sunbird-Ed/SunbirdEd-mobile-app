import { Injectable } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { CommonUtilService } from '../common-util.service';
import { Components } from '@ionic/core/dist/types/components';

declare const window;
@Injectable({
  providedIn: 'root'
})
export class PrintPdfService {
  fileTransfer: FileTransferObject;


  constructor(
    private commonUtilService: CommonUtilService,
    private transfer: FileTransfer,
  ) { }

  async printPdf(url) {
    const loader: Components.IonLoading = await this.commonUtilService.getLoader();
    await loader.present();
    try {
      this.fileTransfer = this.transfer.create();
      const entry = await this.fileTransfer
        .download(url, cordova.file.cacheDirectory + url.substring(url.lastIndexOf('/') + 1));
      url = entry.toURL();

      window.cordova.plugins.printer.canPrintItem(url, (canPrint: boolean) => {
        console.log(url);
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