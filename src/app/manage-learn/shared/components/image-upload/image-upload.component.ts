import { Component, OnInit, Input } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { TranslateService } from "@ngx-translate/core";
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FILE_EXTENSION_HEADERS, LocalStorageService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { GenericPopUpService } from '../../generic.popup';
import { Chooser } from '@ionic-native/chooser/ngx';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent implements OnInit {
  recording: boolean = false;
  filesPath: string;
  fileName: string;
  audio: MediaObject;
  audioList: any[] = [];
  isIos: boolean = this.platform.is("ios");
  interval;
  timeLeft: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  text: string;
  datas;
  appFolderPath: string;
  videoFormats = ["mp4", "WMV", "WEBM", "flv", "avi", "3GP", "OGG"];
  audioFormats = ["AIF", "cda", "mpa", "ogg", "wav", "wma", "mp3"];
  pptFormats = ["ppt", "pptx", "pps", "ppsx"];
  wordFormats = ["docx", "doc", "docm", "dotx"];
  imageFormats = ["jpg", "png", "jpeg"];
  pdfFormats = ["pdf"];
  spreadSheetFormats = ["xls", "xlsx"];

  @Input()
  set data(data) {
    this.datas = data;
    this.createImageFromName(data["fileName"]);
  }

  get name() {
    return true;
  }
  @Input() evidenceId: any;
  @Input() schoolId: string;
  @Input() submissionId: any;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;

  imageList: Array<any> = [];
  imageNameCounter: number = 0;
  localEvidenceImageList: any;

  constructor(
    private actionSheet: ActionSheetController,
    private camera: Camera,
    private localStorage: LocalStorageService,
    private file: File,
    private imgPicker: ImagePicker,
    private utils: UtilsService,
    private photoLibrary: PhotoLibrary,
    private platform: Platform,
    private translate: TranslateService,
    private filePath: FilePath,
    private fileOpener: FileOpener,
    private fileChooser: FileChooser,
    private chooser: Chooser,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    private media: Media,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private popupService: GenericPopUpService
  ) {
    this.text = "Hello World";
    this.isIos = this.platform.is("ios") ? true : false;
    if (this.isIos) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => { })
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => { },
              (error) => { }
            );
        });
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => { })
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => { },
              (error) => { }
            );
        });
    }
  }

  ngOnInit() {
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "images"
      : cordova.file.externalDataDirectory + "images";
  }

  doAction() {
    this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_TEXT', 'FRMELEMNTS_LBL_EVIDENCES_CONTENT_POLICY_LABEL', 'FRMELEMNTS_LBL_UPLOAD_EVIDENCES', 'https://diksha.gov.in/term-of-use.html', 'contentPolicy').then((data: any) => {
      if (data.isClicked) {
        data.isChecked ? this.openActionSheet() : this.toast.showMessage('FRMELEMNTS_MSG_EVIDENCES_CONTENT_POLICY_REJECT', 'danger');
      }
    })
  }
  async openActionSheet() {
    let translateObject;
    this.translate
      .get([
        "FRMELEMENTS_LBL_ADD_IMAGE",
        "FRMELEMENTS_LBL_CAMERA",
        "FRMELEMENTS_LBL_UPLOAD_FILE",
        "FRMELEMENTS_LBL_UPLOAD_IMAGE",
        // "actionSheet.upload",
        "CANCEL",
      ])
      .subscribe((translations) => {
        translateObject = translations;
      });
    const actionSheet = await this.actionSheet.create({
      header: translateObject["FRMELEMENTS_LBL_ADD_IMAGE"],
      buttons: [
        {
          text: translateObject["FRMELEMENTS_LBL_CAMERA"],
          role: "destructive",
          icon: "camera",
          handler: () => {
            this.openCamera();
          },
        },
        {
          text: translateObject["FRMELEMENTS_LBL_UPLOAD_IMAGE"],
          icon: "cloud-upload",
          handler: () => {
            this.openLocalLibrary();
          },
        },
        {
          text: translateObject["FRMELEMENTS_LBL_UPLOAD_FILE"],
          icon: "document",
          handler: () => {
            this.openFilePicker();
          },
        },
        {
          text: translateObject["CANCEL"],
          role: "cancel",
          handler: () => { },
        },
      ],
    });
    await actionSheet.present();
  }


  // For android
  async openFilePicker() {
    
    try {
      const file = await this.chooser.getFile();
      const pathToWrite = this.appFolderPath;
      const newFileName = this.createFileName(file.name)
      const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.data.buffer)
      if (writtenFile.isFile) {
        this.pushToFileList(newFileName);

        
      }
    } catch (error) {
       
    }

	  //non working in sdk30 -adnroid 11
    // this.fileChooser
    //   .open()
    //   .then((filePath) => {
    //     this.filePath
    //       .resolveNativePath(filePath)
    //       .then((data) => {
    //         this.checkForLocalFolder(data);
    //       })
    //       .catch((err) => { });
    //   })
    //   .catch((e) => console.log(e));
  }

  openCamera(): void {
    const options: CameraOptions = {
      quality: 10,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
    };
    this.camera
      .getPicture(options)
      .then((imagePath) => {
        this.checkForLocalFolder(imagePath);
      })
  }

  saveToLibrary(url): void {
    this.photoLibrary
      .saveImage(url, "samiksha")
      .then((data) => { })
  }

  checkForLocalFolder(imagePath) {
    let currentName = imagePath.substr(imagePath.lastIndexOf("/") + 1);
    let currentPath = imagePath.substr(0, imagePath.lastIndexOf("/") + 1);
    if (this.isIos) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {
          this.copyFileToLocalDir(currentPath, currentName);
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => {
                this.copyFileToLocalDir(currentPath, currentName);
              },
              (error) => { }
            );
        });
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {
          this.copyFileToLocalDir(currentPath, currentName);
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => {
                this.copyFileToLocalDir(currentPath, currentName);
              },
              (error) => { }
            );
        });
    }
  }

  createFileName(filename) {
    let d = new Date(),
      n = d.getTime(),
      extension= filename.split('.').pop(),
      newFileName = n + "." + extension;
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName) {
    // this.file.resolveLocalFilesystemUrl(namePath).then(succes => {
    //   console.log("Resolved  path " + JSON.stringify(succes.nativeURL))
    // }).catch(error => {

    // })
    let newName = this.createFileName(currentName);
    this.file
      .copyFile(namePath, currentName, this.appFolderPath, newName)
      .then(
        (success) => {
          this.pushToFileList(newName);
        },
        (error) => { }
      );
  }

  pushToFileList(fileName) {
    this.file
      .checkFile(this.appFolderPath + "/", fileName)
      .then((response) => {
        this.imageList.push({
          data: "",
          imageName: fileName,
          extension: this.getExtensionFromName(fileName),
        });
        this.setLocalDatas(fileName);

      })
  }

  setLocalDatas(fileName) {
    this.datas.fileName.push(fileName);
    this.updateLocalImageList();
  }

  getExtensionFromName(fileName) {
    let splitString = fileName.split(".");
    let extension = splitString[splitString.length - 1];
    return extension;
  }

  createImageFromName(imageList) {
    this.isIos = this.platform.is("ios") ? true : false;
    this.appFolderPath = this.isIos
      ? cordova.file.documentsDirectory + "images"
      : cordova.file.externalDataDirectory + "images";
    for (const image of imageList) {
      this.file
        .checkFile(this.appFolderPath + "/", image)
        .then((response) => {
          this.imageList.push({
            data: "",
            imageName: image,
            extension: this.getExtensionFromName(image),
          });
        })
        .catch((error) => {
          this.imageList.push(image);
        });
    }
  }

  openLocalLibrary(): void {
    const options: ImagePickerOptions = {
      maximumImagesCount: 50,
      quality: 10,
    };
    this.imgPicker.getPictures(options).then((imageData) => {
      for (const image of imageData) {
        this.checkForLocalFolder(image);
      }
    }).catch(err => {
      console.log(err)
    });
  }

  removeImgFromList(index): void {
    let indexInLocalList;
    this.datas.fileName.splice(index, 1);
    this.imageList.splice(index, 1);
    this.updateLocalImageList();
  }

  async deleteImageAlert(index) {
    let translateObject;
    this.translate
      .get([
        "FRMELEMNTS_LBL_COFIRM_DELETE",
        "actionSheet.confirmDeleteInstance",
        "FRMELEMNTS_LBL_NO",
        "FRMELEMNTS_LBL_YES",
      ])
      .subscribe((translations) => {
        translateObject = translations;
      });
    let alert = await this.alertCtrl.create({
      // header: translateObject["FRMELEMNTS_LBL_COFIRM_DELETE"],
      message: translateObject["FRMELEMNTS_LBL_COFIRM_DELETE"],
      cssClass:'central-alert',
      buttons: [
        {
          text: translateObject["FRMELEMNTS_LBL_NO"],
          role: "cancel",
          handler: () => { },
        },
        {
          text: translateObject["FRMELEMNTS_LBL_YES"],
          handler: () => {
            this.removeImgFromList(index);
          },
        },
      ],
    });
    await alert.present();
  }

  updateLocalImageList() {
  }

  previewFile(fileName, extension) {
    this.fileOpener
      .open(
        this.appFolderPath + "/" + fileName,
        FILE_EXTENSION_HEADERS[extension]
      )
      .then(() => console.log("File is opened"))
      .catch((e) => {
        this.toast.openToast("No file readers available")
      });
  }

  mediaObject;

  startRecord() {
    if (this.platform.is("ios")) {
      this.file
        .checkDir(this.file.documentsDirectory, "images")
        .then((success) => {
          this.fileName =
            "record" +
            new Date().getDate() +
            new Date().getMonth() +
            new Date().getFullYear() +
            new Date().getHours() +
            new Date().getMinutes() +
            new Date().getSeconds() +
            ".mp3";
          this.filesPath =
            this.file.documentsDirectory + "images/" + this.fileName;
          this.file
            .createFile(this.file.tempDirectory, this.fileName, true)
            .then(() => {
              this.mediaObject = this.media.create(
                this.file.tempDirectory.replace(/^file:\/\//, "") +
                this.fileName
              );
              this.mediaObject.startRecord();
              this.startTimer();
            })
            .catch((error) => {
              this.toast.openToast("Something went wrong");
            });
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.documentsDirectory, "images", false)
            .then(
              (success) => {
                this.fileName =
                  "record" +
                  new Date().getDate() +
                  new Date().getMonth() +
                  new Date().getFullYear() +
                  new Date().getHours() +
                  new Date().getMinutes() +
                  new Date().getSeconds() +
                  ".mp3";
                this.filesPath =
                  this.file.documentsDirectory + "images/" + this.fileName;
                this.mediaObject = this.media.create(
                  this.file.tempDirectory.replace(/^file:\/\//, "") +
                  this.fileName
                );
                this.mediaObject.startRecord();
                this.startTimer();
              },
              (error) => { }
            );
        });
    } else if (this.platform.is("android")) {
      this.file
        .checkDir(this.file.externalDataDirectory, "images")
        .then((success) => {
          this.fileName =
            "record" +
            new Date().getDate() +
            new Date().getMonth() +
            new Date().getFullYear() +
            new Date().getHours() +
            new Date().getMinutes() +
            new Date().getSeconds() +
            ".mp3";
          this.filesPath =
            this.file.externalDataDirectory + "images/" + this.fileName;
          this.audio = this.media.create(this.filesPath);
          this.startTimer();
          this.audio.startRecord();
        })
        .catch((err) => {
          this.file
            .createDir(cordova.file.externalDataDirectory, "images", false)
            .then(
              (success) => {
                this.fileName =
                  "record" +
                  new Date().getDate() +
                  new Date().getMonth() +
                  new Date().getFullYear() +
                  new Date().getHours() +
                  new Date().getMinutes() +
                  new Date().getSeconds() +
                  ".mp3";
                this.filesPath =
                  this.file.externalDataDirectory + "images/" + this.fileName;
                this.audio = this.media.create(this.filesPath);
                this.startTimer();
                this.audio.startRecord();
              },
              (error) => { }
            );
        });
    }
  }

  startTimer() {
    this.recording = true;
    if (this.recording) {
      this.interval = setInterval(() => {
        if (this.timeLeft >= 0) {
          this.timeLeft++;
          this.minutes = Math.ceil(this.timeLeft / 60) - 1;
          this.seconds = Math.floor(this.timeLeft % 60);
        } else {
          this.timeLeft = 0;
          this.minutes = 0;
          this.seconds = 0;
        }
      }, 1000);
    }
  }
  checkRecordMediaPermission() {
    this.diagnostic
      .isMicrophoneAuthorized()
      .then((success) => {
        this.diagnostic
          .requestMicrophoneAuthorization()
          .then((success) => {
            if (success === "authorized" || success === "GRANTED") {
              const permissionsArray = [
                this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                this.androidPermissions.PERMISSION.RECORD_AUDIO,
              ];
              this.androidPermissions
                .requestPermissions(permissionsArray)
                .then((successResult) => {
                  successResult.hasPermission
                    ? this.startRecord()
                    : this.toast.openToast(
                      "Please accept the permissions to use this feature"
                    );
                })
                .catch((error) => {
                  this.toast.openToast(
                    "Please accept the permissions to use this feature"
                  );
                });
            } else {
              this.toast.openToast(
                "Please accept the permissions to use this feature"
              );
            }
          })
          .catch((error) => {
            console.log("Please accept the permissions to use this feature");
          });
      })

  }

  stopRecord() {
    this.recording = false;
    this.timeLeft = 0;
    this.minutes = 0;
    this.seconds = 0;
    clearInterval(this.interval);
    if (this.isIos) {
      this.mediaObject.stopRecord();
      this.mediaObject.release();
      this.file
        .copyFile(
          this.file.tempDirectory,
          this.fileName,
          this.appFolderPath,
          this.fileName
        )
        .then(
          (success) => {
            this.file.removeFile(this.file.tempDirectory, this.fileName);
            this.pushToFileList(this.fileName);
          },
          (error) => { }
        );
    } else {
      this.audio.stopRecord();
      this.audio.release();
      this.pushToFileList(this.fileName);
    }
  }


}