import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { urlConstants } from '../constants/urlConstants';
import { UnnatiDataService } from './unnati-data.service';
import { CertificateVerificationPopoverComponent } from '@app/app/components/popups/certificate-verification/certificate-verification-popup.component';
import { CommonUtilService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class ManageLearnCertificateService {

  constructor(
    private unanti : UnnatiDataService,
    private popoverCtrl: PopoverController,
    private commonUtilService : CommonUtilService

  ) { }
  getProjectCertificate(data){
    const config ={
      url : urlConstants.API_URLS.PROJECT_CERTIFICATE_DOWNLOAD + data.split('certs/')[1].split('?')[0]
    }
    this.unanti.get(config).subscribe(resp =>{
       this.verifyCertificate(resp);
    })
  }
  async verifyCertificate(data){
    const config ={
      url : urlConstants.API_URLS.CERTIFICATE_VERIFY +data.issuer.kid
    }
    this.unanti.get(config).subscribe(async resp =>{
    if(resp.value) {
        let payload ={
          issuanceDate : data.completedDate,
          trainingName :data.projectName,
          issuedTo:data.recipient.name 
        }
      const qrAlert = await this.popoverCtrl.create({
        component: CertificateVerificationPopoverComponent,
        componentProps: {
          certificateData: payload,
          isProject : true,
          actionsButtons: [
              {
                  btntext: 'OKAY',
                  btnClass: 'sb-btn sb-btn-sm  sb-btn-tertiary'
              }
          ],
      },
      cssClass: 'sb-popover',
    });
    await qrAlert.present();
  } else {
    this.commonUtilService.afterOnBoardQRErrorAlert('INVALID_QR', 'CERTIFICATE_VERIFICATION_FAIL', data);
  }
    })
  }
}
