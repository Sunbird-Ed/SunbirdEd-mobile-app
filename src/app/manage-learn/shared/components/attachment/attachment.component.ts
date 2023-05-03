import { Component, Input } from '@angular/core';
import { FileTransfer,FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Platform } from '@ionic/angular';
import { FileExtension } from '../../fileExtension';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { LoaderService, ToastService } from '@app/app/manage-learn/core';

@Component({
  selector: 'attachments',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent {
  @Input() url: string;
  @Input() extension: string;
  path;
  imageFormats: string[] = FileExtension.imageFormats;
  videoFormats: string[] = FileExtension.videoFormats;
  audioFormats: string[] = FileExtension.audioFormats;
  pdfFormats: string[] = FileExtension.pdfFormats;
  wordFormats: string[] = FileExtension.wordFormats;
  spreadSheetFormats: string[] = FileExtension.spreadSheetFormats;

  constructor(private photoViewer: PhotoViewer, private streamingMedia: StreamingMedia, private platform: Platform,
    private fileTransfer: FileTransfer,
    private file: File,
    public toast: ToastService,
    public loader: LoaderService,
    public filePath: FilePath,
    public fileOpener: FileOpener) {
    this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
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
  downloadFile(link) {
    this.loader.startLoader();
    const fileTransfer: FileTransferObject = this.fileTransfer.create();
    let fileName = this.createFileName();
    fileTransfer.download(link, this.path + '/' +fileName ).then(success => {
      let attachment ={
        name:fileName,
        type:'application/pdf'
      }
      this.loader.stopLoader();
      this.openFile(attachment);
    },error =>{
    this.loader.stopLoader();
    })
  }
  openFile(attachment) {
    this.fileOpener.open(this.path + '/' + attachment.name, attachment.type)
      .then(() => { console.log('File is opened'); })
      .catch(e => console.log('Error opening file', e));
  }
  createFileName() {
    let d = new Date(),
      n = d.getTime(),
      newFileName = n + "." + this.extension;
    return newFileName;
  }
}
