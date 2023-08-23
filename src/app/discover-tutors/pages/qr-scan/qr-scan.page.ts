import { Component } from '@angular/core';
import { DsepService } from '../../services/dsep.service';
// import { SearchResponse } from './path-to-dsep-service.models'; // Adjust the path

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.page.html',
  styleUrls: ['./qr-scan.page.scss']
})
export class QRScanPage {
  tutors: any[] = [];

  constructor(private dsepService: DsepService) {}

  onQRCodeScanned(data: any) {
    // const context = this.extractDataFromQRCode(data);
    // this.dsepService.searchTutors(context).subscribe((response: SearchResponse) => {
    //   this.tutors = response.tutors;
    // });
  }

  extractDataFromQRCode(data: any): any {
    // Extract Grade, Medium, and Subject from the QR code data
    // Return the extracted context
  }
}
