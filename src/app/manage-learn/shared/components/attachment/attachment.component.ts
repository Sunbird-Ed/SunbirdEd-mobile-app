import { Component, Input } from '@angular/core';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Platform } from '@ionic/angular';
import { FileExtension } from '../../fileExtension';

@Component({
  selector: 'attachments',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent {
  @Input() url: string;
  @Input() extension: string;
  imageFormats: string[] = FileExtension.imageFormats;
  videoFormats: string[] = FileExtension.videoFormats;
  audioFormats: string[] = FileExtension.audioFormats;
  pdfFormats: string[] = FileExtension.pdfFormats;
  wordFormats: string[] = FileExtension.wordFormats;
  spreadSheetFormats: string[] = FileExtension.spreadSheetFormats;

  constructor(private photoViewer: PhotoViewer, private streamingMedia: StreamingMedia, private platform: Platform) {
    console.log('Hello AttachmentsComponent Component');
  }

  playVideo(link) {
    let options: StreamingVideoOptions = {
      successCallback: () => {
        console.log('Video played');
      },
      errorCallback: (e) => {
        console.log('Error streaming');
      },
      orientation: 'landscape',
      shouldAutoClose: true,
      controls: false,
    };

    this.streamingMedia.playVideo(link, options);
  }

  playAudio(link) {
    let options: StreamingVideoOptions = {
      successCallback: () => {
        console.log('Video played');
      },
      errorCallback: (e) => {
        console.log('Error streaming');
      },
      shouldAutoClose: true,
      controls: true,
    };

    this.streamingMedia.playAudio(link, options);
  }

  openImage(link) {
    if (this.platform.is('ios')) {
      const options = {
        share: true,
        closeButton: true,
        copyToReference: true,
        headers: "",
        piccasoOptions: {}
      };
      const newLink = link ? link.split('?') : "";
      link = (newLink && newLink.length) ? newLink[0] : ""
    }
    this.photoViewer.show(link);
  }

  openDocument(link) {
    // const url = encodeURIComponent(link);
    // const browser = this.iab.create(
    //   'https://docs.google.com/viewer?url=' + url,
    //   '_blank',
    //   'location=no,toolbar=no,clearcache=yes'
    // );
    // browser.show();
    // (window as any).cordova.InAppBrowser.open(
    //   'https://docs.google.com/viewer?url=' + encodeURIComponent(link),
    //   '',
    //   'location=no,toolbar=no,clearcache=yes'
    // );
    window.open(link, '_system', 'location=yes,enableViewportScale=yes,hidden=no');
  }
}
