import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services/common-util.service';
import { PopoverController } from '@ionic/angular';
import { ContentService } from 'sunbird-sdk';

@Component({
  selector: 'app-download-transcript-popup',
  templateUrl: './download-transcript-popup.component.html',
  styleUrls: ['./download-transcript-popup.component.scss'],
})
export class DownloadTranscriptPopupComponent implements OnInit {

  transcriptLanguage: string;
  @Input() contentData;
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private popOverCtrl: PopoverController,
    private commonUtilService: CommonUtilService,
  ) { }
  ngOnInit(): void {
  }
  async download() {
    const loader = await this.commonUtilService.getLoader();
    this.popOverCtrl.dismiss();
    await loader.present();
    const transcriptsObj = this.contentData.transcripts;
    if (transcriptsObj) {
      let transcripts = [];
      if (typeof transcriptsObj === 'string') {
        console.log('....................')
        transcripts = JSON.parse(transcriptsObj);
      } else {
        transcripts = transcriptsObj;
      }
      if (transcripts && transcripts.length > 0) {
        transcripts.forEach(item => {
            if (item.language === this.transcriptLanguage) {
              const url = item.artifactUrl;
              const request = {
                identifier: item.identifier,
                downloadUrl: url,
                mimeType: '',
                fileName: this.contentData.name
              };
              this.contentService.downloadTranscriptFile(request).then((data) => {
                loader.dismiss();
              }).catch((err) => {
                console.log('err........', err);
                loader.dismiss();
              });
            }
        });
      } else {
        loader.dismiss();
      }
    }
  }

  closePopover() {
    this.popOverCtrl.dismiss();
  }

}
