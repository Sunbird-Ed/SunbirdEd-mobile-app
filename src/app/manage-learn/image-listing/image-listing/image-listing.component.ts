import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform } from '@ionic/angular';
import { LoaderService, LocalStorageService, ToastService, UtilsService } from '../../core';
import cloneDeep from 'lodash/cloneDeep';
import { TranslateService } from '@ngx-translate/core';
import { urlConstants } from '../../core/constants/urlConstants';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { KendraApiService } from '../../core/services/kendra-api.service';

declare var cordova: any;

@Component({
  selector: 'app-image-listing',
  templateUrl: './image-listing.component.html',
  styleUrls: ['./image-listing.component.scss'],
})
export class ImageListingComponent implements OnInit {
  tempevidenceSections: any;
  allStrings: any;

  constructor(
    private routerParam: ActivatedRoute,
    private platform: Platform,
    private localStorage: LocalStorageService,
    private utils: UtilsService,
    private loader: LoaderService,
    private file: File,
    private fileTransfer: FileTransfer,
    private toast: ToastService,
    private translate: TranslateService,
    private assessmentService: AssessmentApiService,
    private kendra:KendraApiService
  ) {
    this.routerParam.queryParams.subscribe((params) => {
      this.submissionId = params.submissionId;
      this.selectedEvidenceIndex = params.selectedEvidenceIndex;
      this.schoolName = params.name;
    });

      this.translate
      .get(["FRMELEMENTS_MSG_SOMETHING_WENT_WRONG",'FRMELEMENTS_MSG_SUBMISSION_NOT_ALLOWED'])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
  }

  ngOnInit() {
    this.localStorage
      .getLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId))
      .then((data) => {
        this.schoolData = data;
        this.currentEvidence = this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex];
        this.imageLocalCopyId = 'images_' + this.currentEvidence.externalId + '_' + this.submissionId;
        this.evidenceSections = this.currentEvidence['sections'];
        this.selectedEvidenceName = this.currentEvidence['name'];
        this.getAllImages();
      });
  }
  uploadImages: any;
  imageList = [];
  appFolderPath: string = this.platform.is('ios')
    ? cordova.file.documentsDirectory + 'images'
    : cordova.file.externalDataDirectory + 'images';
  schoolName: string;
  selectedEvidenceIndex: any;
  uploadIndex: number = 0;
  schoolData: any;
  currentEvidence: any;
  evidenceSections: any;
  selectedEvidenceName: any;
  imageLocalCopyId: any;
  retryCount: number = 0;
  page = 'ECM submission page';
  failedUploadImageNames = [];
  errorObj = {
    fallback: 'User Details',
    title: `Error Details`,
    text: ``,
  };
  submissionId;

  ionViewDidLoad() {
  }

  getAllImages() {
    let imageArray = [];
    for (const sections of this.currentEvidence.sections) {
      for (const question of sections.questions) {
        let questImage;
        if (question.responseType === 'pageQuestions') {
          question.pageQuestions.forEach((element) => {
            questImage = this.utils.getImageNamesForQuestion(element);
            const newArray = questImage.length ? imageArray.concat(questImage) : imageArray;
            imageArray = newArray;
          });
        } else {
          questImage = this.utils.getImageNamesForQuestion(question);
          const newArray = questImage.length ? imageArray.concat(questImage) : imageArray;
          imageArray = newArray;
        }
      }
    }
    this.uploadImages = imageArray;
     if (this.uploadImages.length) {
       this.createImageFromName(this.uploadImages);
     } else {
       this.submitEvidence();
     }
  }

  createImageFromName(imageList) {
    this.loader.startLoader();
    for (const image of imageList) {
      this.imageList.push({ uploaded: false, file: image, url: '' });
    }
    this.getImageUploadUrls();
  }

  async getImageUploadUrls() {
    const submissionId = this.submissionId;
    const files =[]
    for (const image of this.uploadImages) {
      files.push(image);
    }

    let payload = await this.utils.getProfileInfo();
    payload.ref = "survey"
    payload.request = {}
    payload.request[submissionId] = {
        files: files,
    };
    const config = {
      url: urlConstants.API_URLS.PRESIGNED_URLS,
      payload: payload,
    };

    this.kendra.post(config).subscribe(
      (success) => {
        this.loader.stopLoader();
        if (!success.result || !success.result[submissionId] || !success.result[submissionId].files) {
          return
        }
        let array = success.result[submissionId].files
          for (let i = 0; i < array.length; i++) {
            this.imageList[i]['url'] = array[i].url;
            this.imageList[i]['sourcePath'] = array[i].payload.sourcePath;
            array[i].cloudStorage ? (this.imageList[i]['cloudStorage'] = array[i].cloudStorage) : null;
          }
        this.checkForLocalFolder();
      },
      (error) => {
        this.loader.stopLoader();
        this.translate.get('FRMELEMENTS_MSG_ENABLE_TO_GET_GOOGLE_URLS').subscribe((translations) => {
          this.toast.openToast(translations);
        });
      }
    );
  }

  checkForLocalFolder() {
    if (this.platform.is('ios')) {
      this.file
        .checkDir(this.file.documentsDirectory, 'images')
        .then((success) => {
          this.fileTransfer.create();
          this.cloudImageUpload();
        });
    } else {
      this.file
        .checkDir(this.file.externalDataDirectory, 'images')
        .then((success) => {
          this.cloudImageUpload();
          this.fileTransfer.create();
        });
    }
  }

  cloudImageUpload() {
    var options: FileUploadOptions = {
      fileKey: this.imageList[this.uploadIndex].file,
      fileName: this.imageList[this.uploadIndex].file,
      chunkedMode: false,
      mimeType: 'image/jpeg',
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-ms-blob-type':
          this.imageList[this.uploadIndex].cloudStorage && this.imageList[this.uploadIndex].cloudStorage === 'AZURE'
            ? 'BlockBlob'
            : null,
      },
      httpMethod: 'PUT',
    };
    let targetPath = this.pathForImage(this.imageList[this.uploadIndex].file);
    let fileTrns: FileTransferObject = this.fileTransfer.create();
    this.file
      .checkFile(
        (this.platform.is('ios') ? this.file.documentsDirectory : this.file.externalDataDirectory) + 'images/',
        this.imageList[this.uploadIndex].file
      )
      .then((success) => {
        fileTrns
          .upload(targetPath, this.imageList[this.uploadIndex].url, options)
          .then((result) => {
            this.retryCount = 0;
            this.imageList[this.uploadIndex].uploaded = true;
            if (this.uploadIndex < this.imageList.length - 1) {
              this.uploadIndex++;
              this.cloudImageUpload();
            } else {
              this.submitEvidence();
            }
          })
          .catch((err) => {
            const errorObject = { ...this.errorObj };
            this.retryCount++;
            if (this.retryCount > 3) {
              this.translate.get('FRMELEMENTS_MSG_SOMETHING_WENT_WRONG').subscribe((translations) => {
                this.toast.openToast(translations);
              });
              errorObject.text = `${this.page}: Cloud image upload failed.URL:  ${this.imageList[this.uploadIndex].url}.
            Details: ${JSON.stringify(err)}`;
              history.go(-1);
            } else {
              this.cloudImageUpload();
            }
          });
      })
      .catch((error) => {
        this.failedUploadImageNames.push(this.imageList[this.uploadIndex].file);
        if (this.uploadIndex < this.imageList.length - 1) {
          this.uploadIndex++;
          this.cloudImageUpload();
        } else {
          this.submitEvidence();
        }
      });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      const path = this.platform.is('ios') ? cordova.file.documentsDirectory : cordova.file.externalDataDirectory;
      return path + 'images/' + img;
    }
  }
  async submitEvidence() {
    this.loader.startLoader(this.allStrings['FRMELEMENTS_MSG_PLEASE_WAIT_WHILE_SUBMITTING']);
    console.log('submitting');
    const constructPayload = this.constructPayload();
    const submissionId = this.submissionId;
    const url =
      (this.schoolData.survey
        ? urlConstants.API_URLS.SURVEY_FEEDBACK_MAKE_SUBMISSION
        : this.schoolData.observation
        ? urlConstants.API_URLS.OBSERVATION_SUBMISSION_UPDATE
        : urlConstants.API_URLS.SUBMISSION) +
      submissionId +
      '/';

    let payload = await this.utils.getProfileInfo();
    payload = { ...payload, ...constructPayload };
    const config = {
      url: url,
      payload: payload,
    };

    this.assessmentService.post(config).subscribe(
      (response) => {
        if (this.schoolData.observation) {
        }
        if (response && response.result && response.result.allowed==false) {
          this.toast.openToastWithClose(this.allStrings['FRMELEMENTS_MSG_SUBMISSION_NOT_ALLOWED']);
        } else {
          this.toast.openToast(response.message);
        }
        this.schoolData['assessment']['evidences'][this.selectedEvidenceIndex].isSubmitted = true;
        this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(this.submissionId), this.schoolData);
        const options = {
          _id: this.submissionId,
          name: this.schoolName,
        };
        this.loader.stopLoader();
        history.go(-2);
      },
      (error) => {
        this.loader.stopLoader();
      }
    );

  }

  constructPayload(): any {
    const payload = {
      evidence: {},
    };
    const evidence = {
      id: '',
      externalId: '',
      answers: {},
      startTime: 0,
      endTime: 0,
    };
    this.currentEvidence;
    /*
    !deepclone to avoid structure change in the type:pageQuestion
    !using to take the tempevidnceSections and pullout page questions
    */
    const currentEvidence = cloneDeep(this.currentEvidence);
    evidence.id = currentEvidence._id;
    evidence.externalId = currentEvidence.externalId;
    evidence.startTime = currentEvidence.startTime;
    evidence.endTime = Date.now();
    this.tempevidenceSections = currentEvidence.sections;
    this.tempevidenceSections = this.pullOutPageQuestion();

    for (const section of this.tempevidenceSections) {
      for (const question of section.questions) {
        let obj = {
          qid: question._id,
          value: question.responseType === 'matrix' ? this.constructMatrixObject(question) : question.value,
          remarks: question.remarks,
          fileName: [],
          gpsLocation: question.gpsLocation,
          payload: {
            question: question.question,
            labels: [],
            responseType: question.responseType,
            filesNotUploaded: [],
          },
          startTime: question.startTime,
          endTime: question.endTime,
        };

        if (question.fileName && question.fileName.length) {
          const filePaylaod = [];
          for (const fileName of question.fileName) {
            for (const updatedFileDetails of this.imageList) {
              if (fileName === updatedFileDetails.file) {
                const obj = {
                  name: fileName,
                  sourcePath: updatedFileDetails.sourcePath,
                };
                filePaylaod.push(obj);
              }
            }
          }
          obj.fileName = filePaylaod;
        }

        if (question.responseType === 'multiselect') {
          for (const val of question.value) {
            for (const option of question.options) {
              if (val === option.value && obj.payload.labels.indexOf(option.label) <= 0) {
                obj.payload.labels.push(option.label);
              }
            }
          }
        } else if (question.responseType === 'radio') {
          for (const option of question.options) {
            if (obj.value === option.value && obj.payload.labels.indexOf(option.label) <= 0) {
              obj.payload.labels.push(option.label);
            }
          }
        } else {
          obj.payload.labels.push(question.value);
        }
        for (const key of Object.keys(question.payload)) {
          obj[key] = question.payload[key];
        }
        evidence.answers[obj.qid] = obj;
      }
    }

    payload.evidence = evidence;
    return payload;
  }
  pullOutPageQuestion() {
    console.log('Pull Out page Questions');
    let sections = this.tempevidenceSections;
    sections.forEach((section, sectionIndex) => {
      let questionsArray = [];
      section.questions.forEach((question) => {
        if (question.responseType === 'pageQuestions') {
          const parentquestionGpsLocation = question.gpsLocation;
          question.pageQuestions.forEach((pageQuestion) => {
            pageQuestion.gpsLocation = parentquestionGpsLocation;
            questionsArray.push(pageQuestion);
          });
        } else {
          questionsArray.push(question);
        }
      });
      this.tempevidenceSections[sectionIndex].questions = questionsArray;
    });

    console.log('After Pull Out page Questions');

    return this.tempevidenceSections;
  }

  constructMatrixObject(question) {
    const value = [];
    const currentEvidence = this.currentEvidence;

    for (const instance of question.value) {
      let eachInstance = {};
      for (let qst of instance) {
        const obj1 = {
          qid: qst._id,
          value: qst.value,
          remarks: qst.remarks,
          fileName: [],
          gpsLocation: qst.gpsLocation,
          payload: {
            question: qst.question,
            labels: [],
            responseType: qst.responseType,
          },
          startTime: qst.startTime,
          endTime: qst.endTime,
        };
        if (qst.fileName && qst.fileName.length) {
          const filePaylaod = [];
          for (const fileName of qst.fileName) {
            for (const updatedFileDetails of this.imageList) {
              if (fileName === updatedFileDetails.file) {
                const fileobj = {
                  name: fileName,
                  sourcePath: updatedFileDetails.sourcePath,
                };
                filePaylaod.push(fileobj);
              }
            }
          }
          obj1.fileName = filePaylaod;
        }
        if (qst.responseType === 'multiselect') {
          for (const val of qst.value) {
            for (const option of qst.options) {
              if (val === option.value && obj1.payload.labels.indexOf(option.label) <= 0) {
                obj1.payload.labels.push(option.label);
              }
            }
          }
        } else if (qst.responseType === 'radio') {
          for (const option of qst.options) {
            if (obj1.value === option.value && obj1.payload.labels.indexOf(option.label) <= 0) {
              obj1.payload.labels.push(option.label);
            }
          }
        } else {
          obj1.payload.labels.push(qst.value);
        }

        for (const key of Object.keys(qst.payload)) {
          obj1[key] = qst.payload[key];
        }
        eachInstance[obj1.qid] = obj1;
      }
      value.push(eachInstance);
    }

    return value;
  }
}
