import { Component, Input } from '@angular/core';
import { FileTransfer,FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@awesome-cordova-plugins/streaming-media/ngx';
import { Platform } from '@ionic/angular';
import { FileExtension } from '../../fileExtension';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener ,FileOpenerOptions} from '@capacitor-community/file-opener';
import { LoaderService, ToastService } from '../../../../../app/manage-learn/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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

  constructor(
    private streamingMedia: StreamingMedia, private platform: Platform,
    private fileTransfer: FileTransfer,
    private file: File,
    public toast: ToastService,
    public loader: LoaderService,
    ) {
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
  }

  openDocument(link) {

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
    const fileOpenerOptions: FileOpenerOptions = {
      filePath: this.path + '/' + attachment.name,
      contentType:  attachment.type,
      };
      FileOpener
      .open(fileOpenerOptions)
      .then(() => {
      console.log('File is opened');
      })
  }
  createFileName() {
    let d = new Date(),
      n = d.getTime(),
      newFileName = n + "." + this.extension;
    return newFileName;
  }
}
