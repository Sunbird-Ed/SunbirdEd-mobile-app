import { Injectable } from "@angular/core";
import { Camera, CameraOptions, PictureSourceType } from "@ionic-native/camera/ngx";
import { Chooser } from "@ionic-native/chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { File } from "@ionic-native/file/ngx";
import { ActionSheetController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { FILE_EXTENSION_HEADERS } from "../../constants";

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  mediaType: string;
  texts: any;

  constructor(
    private camera: Camera,
    private file: File,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private platform: Platform,
    private filePath: FilePath,
    private chooser: Chooser,
    // private filePickerIOS: IOSFilePicker,
    private translate: TranslateService
  ) {
    this.translate
      .get([
        "FRMELEMNTS_MSG_SELECT_IMAGE_SOURCE",
        "FRMELEMNTS_MSG_LOAD_FROM_LIBRARY",
        "FRMELEMNTS_MSG_USE_CAMERA",
        "FRMELEMNTS_MSG_USE_FILE",
        "CANCEL",
        "FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE",
        "FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED",
      ])
      .subscribe((data) => {
        this.texts = data;
      });
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: this.texts["FRMELEMNTS_MSG_SELECT_IMAGE_SOURCE"],
      cssClass: 'sb-popover',
      buttons: [
        {
          text: this.texts["FRMELEMNTS_MSG_LOAD_FROM_LIBRARY"],
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
            return false;
          },
        },
        {
          text: this.texts["FRMELEMNTS_MSG_USE_CAMERA"],
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
            return false;
          },
        },
        {
          text: this.texts["FRMELEMNTS_MSG_USE_FILE"],
          handler: () => {
            this.openFile();
            return false;
          },
        },
        {
          text: this.texts["CANCEL"],
          role: "cancel",
        },
      ],
    });
    await actionSheet.present();
    return actionSheet.onDidDismiss();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 10,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };

    this.camera
      .getPicture(options)
      .then((imagePath) => {
        if (this.platform.is("android") && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath
            .resolveNativePath(imagePath)
            .then((filePath) => {
              this.copyFile(filePath);
            })
            .catch((err) => { console.log(err) });
        } else {
          this.copyFile(imagePath);
        }
      })
      .catch((err) => {
        console.log(err);
        if(err !== "No Image Selected") {
          this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
        }
      });
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.directoryPath(), newFileName).then(
      (success) => {
        const data = {
          name: newFileName,
          type: this.mimeType(newFileName),
          isUploaded: false,
          url: "",
        };

        this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
        this.actionSheetController.dismiss(data);
      },
      (error) => {
        this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
      }
    );
  }

  async presentToast(text, color = "danger") {
    const toast = await this.toastController.create({
      message: text,
      position: "top",
      duration: 3000,
      color: color,
    });
    toast.present();
  }

  async openFile() {
    try {
      const file = await this.chooser.getFile();
      const pathToWrite = this.directoryPath();
      const newFileName = this.createFileName(file.name)
      const writtenFile = await this.file.writeFile(pathToWrite, newFileName, file.data.buffer)
      if (writtenFile.isFile) {
        const data = {
          name: newFileName,
          type: this.mimeType(newFileName),
          isUploaded: false,
          url: "",
        };

        this.presentToast(this.texts["FRMELEMNTS_MSG_SUCCESSFULLY_ATTACHED"], "success");
        this.actionSheetController.dismiss(data);
      }
    } catch (error) {
       this.presentToast(this.texts["FRMELEMNTS_MSG_ERROR_WHILE_STORING_FILE"]);
    }

    // non working code for sdk30-android 11
    // new Promise((resolve) => {
    //   if (this.platform.is('ios')) {
    //     // resolve(this.filePickerIOS.pickFile());
    //   } else {
    //     resolve(this.chooser.getFileMetadata());
    //   }
    // })
    //   .then((res: any) => {
    //     return this.filePath.resolveNativePath(res.uri);
    //   })
    //   .then((filePath) => {
    //     this.copyFile(filePath);
    //   })
    //   .catch((err) => {});
  }

  copyFile(filePath) {
    let correctPath = filePath.substr(0, filePath.lastIndexOf("/") + 1);
    let currentName = filePath.split("/").pop();
    currentName = currentName.split("?")[0];
    this.copyFileToLocalDir(correctPath, currentName, this.createFileName(currentName));
  }

  createFileName(name) {
    let d = new Date(),
      n = d.getTime(),
      extentsion = name.split(".").pop(),
      newFileName = n + "." + extentsion;
    return newFileName;
  }

  directoryPath(): string {
    if (this.platform.is("ios")) {
      return this.file.documentsDirectory;
    } else {
      return this.file.externalDataDirectory;
    }
  }

  mimeType(fileName) {
    let ext = fileName.split(".").pop();
    return FILE_EXTENSION_HEADERS[ext];
  }

  deleteFile(fileName) {
    return this.file.removeFile(this.directoryPath(), fileName);
  }
}
