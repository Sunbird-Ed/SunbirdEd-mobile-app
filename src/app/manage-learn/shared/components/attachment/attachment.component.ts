import { Component, Input, OnInit } from '@angular/core';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { FileExtension } from '../../fileExtension';

@Component({
  selector: 'attachments',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {
  @Input() url: string;
  @Input() extension: string;
  imageFormats: string[] = FileExtension.imageFormats;
  videoFormats: string[] = FileExtension.videoFormats;
  audioFormats: string[] = FileExtension.audioFormats;
  pdfFormats: string[] = FileExtension.pdfFormats;
  wordFormats: string[] = FileExtension.wordFormats;
  spreadSheetFormats: string[] = FileExtension.spreadSheetFormats;

  constructor(private photoViewer: PhotoViewer, private streamingMedia: StreamingMedia) {
    console.log('Hello AttachmentsComponent Component');
  }
  ngOnInit(): void {

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
    this.photoViewer.show(link);
  }

  openDocument(link) {

    const url = encodeURIComponent(link);
    // const browser = this.iab.create(
    //   'https://docs.google.com/viewer?url=' + url,
    //   '_blank',
    //   'location=no,toolbar=no,clearcache=yes'
    // );
    // browser.show();
    // TODO:check working
    (window as any).cordova.InAppBrowser.open(
      'https://docs.google.com/viewer?url=' + encodeURIComponent(link),
      '',
      'location=no,toolbar=no,clearcache=yes'
    );
  }
}
