import { Component, OnInit, Inject, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentType, AudienceFilter, ProfileConstants, FormConfigSubcategories } from '../app.constant';
import {
  ProfileService,
  ContentService,
  DeviceInfo,
  Profile,
  GetAllProfileRequest,
  ContentRequest,
  SharedPreferences,
  FrameworkUtilService,
  GetSuggestedFrameworksRequest,
  CachedItemRequestSourceFrom,
  FrameworkCategoryCodesGroup,
  Framework,
  FrameworkService,
  TelemetryService,
  TelemetrySyncStat,
  CorrelationData
} from 'sunbird-sdk';
import {
  Environment,
  InteractType,
  PageId,
  ImpressionType,
  InteractSubtype,
  CorReleationDataType,
  ID
} from '@app/services/telemetry-constants';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderService, FormAndFrameworkUtilService } from '@app/services';
import { Location } from '@angular/common';
import { ExploreBooksSortComponent } from '../resources/explore-books-sort/explore-books-sort.component';
import { ModalController } from '@ionic/angular';
import { FrameworkCommonFormConfigBuilder } from '@app/services/common-form-config-builders/framework-common-form-config-builder';

const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
const SUBJECT_NAME = 'support request';

@Component({
  selector: 'app-faq-report-issue',
  templateUrl: './faq-report-issue.page.html',
  styleUrls: ['./faq-report-issue.page.scss']
})
export class FaqReportIssuePage implements OnInit, OnDestroy {

  data: any;
  private messageListener: (evt: Event) => void;
  deviceId: string;
  fileUrl: string;
  subjectDetails: string;
  appName: string;
  value: any;
  emailContent: any;
  charsLeft: any;
  len: any;
  charEntered: boolean;
  loader: any;
  profile: any = {
    board: [],
    medium: [],
    grade: [],
    subject: []
  };
  boardValue: string;
  mediumtValue: string;
  gradeValue: string;
  subjectValue: string;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];

  btnColor = '#8FC4FF';
  preFillData: any;
  subcategory: any;
  formConfig: any;

  headerObservable: any;
  isFormValid: boolean;
  formValues: any;
  boardContact: { code: string; name: string; message: string; contactinfo: { number: string; email: any; }; };
  bmgsString: any;
  categories: any;
  cnotextasdas: { [key: string]: { code: string; path?: string[]; }[]; };
  callToAction: any = {};
  showSupportContact: boolean;
  showThanksResponse: boolean;
  formContext: any;
  supportEmail: any;
  relevantTerms: any;
  private corRelationList: Array<CorrelationData>;

  constructor(
    private router: Router,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private location: Location,
    private socialSharing: SocialSharing,
    private appVersion: AppVersion,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    public zone: NgZone,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private frameworkCommonFormConfigBuilder: FrameworkCommonFormConfigBuilder
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.data = this.router.getCurrentNavigation().extras.state.data;
      this.formContext = this.router.getCurrentNavigation().extras.state.formCnotext;
      this.corRelationList = this.router.getCurrentNavigation().extras.state.corRelation || [];
      if (this.router.getCurrentNavigation().extras.state.showHeader) {
        this.headerService.showHeaderWithBackButton();
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
          this.handleHeaderEvents(eventName);
        });
      }
      this.formConfig = this.appGlobalService.formConfig;
      this.arrayListHandling(this.formConfig);
    }
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
      .then((res: any) => {
        this.profile = res;
      })
      .catch(async () => {
        await this.loader.dismiss();
      });
  }

  private handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        setTimeout(() => {
          this.handleBackButton();
        }, 100);
        break;
    }
  }

  handleBackButton() {
    this.location.back();
  }

  async getBoardDetails() {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };

    this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (frameworks: Framework[]) => {
        if (!frameworks || !frameworks.length) {
          await this.loader.dismiss();
          this.commonUtilService.showToast('NO_DATA_FOUND');
          return;
        }
        this.syllabusList = frameworks.map(r => ({ name: r.name, code: r.identifier }));
        await this.loader.dismiss();
      });
  }

  ngOnInit() {
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
        console.log('AppName', this.appName);
      }
    );
    this.messageListener = (event) => {
      this.receiveMessage(event);
    };
    window.addEventListener('message', this.messageListener, false);
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.FAQ_REPORT_ISSUE,
      Environment.USER,
      undefined,
      undefined,
      undefined,
      undefined,
      this.corRelationList
    );
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.appGlobalService.formConfig = undefined;
  }

  receiveMessage(event) {
    const values = new Map();
    values['values'] = event.data;
    // send telemetry for all events except Initiate-Email
    if (event.data && event.data.action && event.data.action !== 'initiate-email-clicked') {
      this.generateInteractTelemetry(event.data.action, values);
    } else {
      event.data.initiateEmailBody = this.getBoardMediumGrade(event.data.initiateEmailBody) + event.data.initiateEmailBody;
      this.generateInteractTelemetry(event.data.action, values);
      // launch email sharing
      this.sendMessage(event.data.initiateEmailBody);
    }
  }

  async sendMessage(message: string) {
    const allUserProfileRequest: GetAllProfileRequest = {
      local: true,
      server: true
    };
    const contentRequest: ContentRequest = {
      contentTypes: ContentType.FOR_DOWNLOADED_TAB,
      audience: AudienceFilter.GUEST_TEACHER
    };
    const getUserCount = await this.profileService.getAllProfiles(allUserProfileRequest).pipe(
      map((profile) => profile.length)
    )
      .toPromise();
    const getLocalContentCount = await this.contentService.getContents(contentRequest).pipe(
      map((contentCount) => contentCount.length)
    )
      .toPromise();
    (<any>window).supportfile.shareSunbirdConfigurations(getUserCount, getLocalContentCount, async (result) => {
      const loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.preferences.putString(KEY_SUNBIRD_CONFIG_FILE_PATH, result).toPromise()
        .then((resp) => {
          this.preferences.getString(KEY_SUNBIRD_CONFIG_FILE_PATH).toPromise()
            .then(async val => {
              await loader.dismiss();
              if (Boolean(val)) {
                this.fileUrl = 'file://' + val;
                this.subjectDetails = this.appName + ' ' + SUBJECT_NAME + ' for ' + this.categories;
                this.socialSharing.shareViaEmail(message,
                  this.subjectDetails,
                  [this.supportEmail ? this.supportEmail : this.appGlobalService.SUPPORT_EMAIL],
                  undefined,
                  undefined,
                  this.fileUrl)
                  .catch(error => {
                    console.error(error);
                  });
              }
            });
        });
    }, (error) => {
      console.error('ERROR - ' + error);
    });
  }
  generateInteractTelemetry(interactSubtype, values) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, interactSubtype,
      Environment.USER,
      PageId.FAQ_REPORT_ISSUE,
      undefined,
      values,
      undefined,
      this.corRelationList
    );
  }

  getBoardMediumGrade(mailBody: string): string {
    this.deviceId = this.deviceInfo.getDeviceID();
    const userProfile: Profile = this.appGlobalService.getCurrentUser();
    let ticketSummary: string;
    if (mailBody.length) {
      ticketSummary = '<br> <br> <strong>' + this.commonUtilService.translateMessage('TICKET_SUMMARY') + '</strong> <br> <br>';
    } else {
      ticketSummary = '<br> <br> <strong>' + this.commonUtilService.translateMessage('MORE_DETAILS') + '</strong> <br> <br>';
    }
    let userDetails: string;
    if (this.bmgsString) {
      userDetails = 'From: ' + userProfile.profileType[0].toUpperCase() + userProfile.profileType.slice(1) + ', ' +
        this.bmgsString;
    } else {
      userDetails = 'From: ' + userProfile.profileType[0].toUpperCase() + userProfile.profileType.slice(1) + ', ' +
        this.appGlobalService.getSelectedBoardMediumGrade() + ticketSummary;
    }
    this.categories ? userDetails += '.<br> <br>' + this.commonUtilService.translateMessage('DEVICE_ID') + ': ' + this.deviceId + '<br>'
      : undefined;
    userDetails += ticketSummary;
    return userDetails;
  }

  submit() {
    if (!this.isFormValid) {
      return false;
    }
    this.prepareEmailContent(this.formValues);

    if (this.formValues) {
      if (Object.prototype.hasOwnProperty.call(this.callToAction, this.formValues.subcategory)) {
        this.takeAction(this.callToAction[this.formValues.subcategory]);
      } else if (Object.prototype.hasOwnProperty.call(this.callToAction, this.formValues.category)) {
        this.takeAction(this.callToAction[this.formValues.category]);
      } else {
        this.takeAction();
      }
    }

    if (this.formValues && this.formValues.children && this.formValues.children.subcategory) {
      const corRelationList: Array<CorrelationData> = this.prepareTelemetryCorrelation();
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SUPPORT,
        '', Environment.HOME,
        PageId.FAQ_REPORT_ISSUE,
        undefined,
        undefined,
        undefined,
        corRelationList,
        ID.SUBMIT_CLICKED
      );
    }

    if (this.formValues && this.formValues.children && this.formValues.children.subcategory &&
      this.formValues.subcategory === 'contentavailability') {
      const corRelationList: Array<CorrelationData> = this.prepareTelemetryCorrelation();
      if (this.formValues && this.formValues.children && this.formValues.children.subcategory &&
        this.formValues.children.subcategory.notify) {
        corRelationList.push({ id: 'true', type: 'Notify' });
      }
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.SUPPORT,
        '', Environment.HOME,
        PageId.FAQ_REPORT_ISSUE,
        undefined,
        undefined,
        undefined,
        corRelationList,
        ID.NOTIFICATION_REQUEST
      );
    }
    this.syncTelemetry();
  }

  takeAction(action?: string) {
    switch (action) {
      case 'contactBoard':
        this.showContactBoard();
        break;
      case 'initiateEmail':
        this.initiateEmailAction();
        break;
      default:
        if (this.formContext === FormConfigSubcategories.CONTENT_AVAILABILITY) {
          this.openExploreBooksComponent();
        } else {
          this.ackknowledgeResponse();
        }
    }
  }

  extractPrepareFieldStr(field) {
    if (this.formValues.children && this.formValues.children.subcategory && this.formValues.children.subcategory[field]) {
      if (typeof this.formValues.children.subcategory[field] === 'object' && this.formValues.children.subcategory[field].length) {
        return this.getStringFromArray(this.formValues.children.subcategory[field]);
      } else if(this.formValues.children.subcategory[field].name) {
        return this.formValues.children.subcategory[field].name
      } else if (typeof this.formValues.children.subcategory[field] === 'string') {
        return this.formValues.children.subcategory[field];
      }
      return undefined;
    } else if (this.profile) {
    }
  }

  async openExploreBooksComponent() {
    // generate telemetry and send class, medium and subject data to next page
    const props = {
      boardList: this.extractPrepareFieldStr('borad'),
      mediumList: this.extractPrepareFieldStr('medium'),
      geadeList: this.extractPrepareFieldStr('grade'),
      subjectList: this.extractPrepareFieldStr('subject'),
      relevantTerms: this.relevantTerms,
      curLang: this.translate.currentLang
    }
    const sortOptionsModal = await this.modalCtrl.create({
      component: ExploreBooksSortComponent,
      componentProps: props
    });
    this.location.back();
    await sortOptionsModal.present();
  }

  ackknowledgeResponse() {
    // show acknowdelgement message
    this.showThanksResponse = true;
    setTimeout(() => {
      this.showThanksResponse = false;
    }, 3000);
  }

  async initiateEmailAction() {
    const stateContactList = await this.formAndFrameworkUtilService.getStateContactList();
    this.supportEmail = undefined;
    stateContactList.forEach(element => {
      if (this.formValues.children.subcategory && this.formValues.children.subcategory.board &&
        this.formValues.children.subcategory.board.code === element.id && element.contactinfo &&
        element.contactinfo.email) {
        this.supportEmail = element.contactinfo.email;
      }
    });
    if (!this.showSupportContact && this.isFormValid) {
      this.value = {};
      this.value.action = 'initiate-email-clicked';
      this.value.value = {};
      if (this.formValues.children && this.formValues.children.subcategory && this.formValues.children.subcategory) {
        this.value.initiateEmailBody = this.formValues.children.subcategory.details
      } else if (this.formValues.children && this.formValues.children.category && this.formValues.children.category) {
        this.value.initiateEmailBody = this.formValues.children.category.details;
      }
      window.parent.postMessage(this.value, '*');
    }
    setTimeout(() => {
      this.location.back();
      this.location.back();
    }, 3000);
  }

  async showContactBoard() {
    const stateContactList = await this.formAndFrameworkUtilService.getStateContactList();
    let boardCode: string;
    if (this.formValues.children &&
    this.formValues.children.subcategory &&
    this.formValues.children.subcategory.board &&
    this.formValues.children.subcategory.board.code) {
      boardCode = this.formValues.children.subcategory.board.code;
    } else if (this.profile && this.profile.board && this.profile.board.length) {
      boardCode = this.profile.board[0];
    }

    stateContactList.forEach(element => {
      if (boardCode === element.id) {
        if (this.isFormValid && element.contactinfo && element.contactinfo.number) {
          this.boardContact = element;
          this.showSupportContact = true;
        }
      }
    });
    this.initiateEmailAction();
  }

  prepareTelemetryCorrelation(): Array<CorrelationData> {
    let correlationlist: Array<CorrelationData> =  [];
    correlationlist =  [...correlationlist, ...(this.corRelationList || [])];
    // Category
    this.formValues && this.formValues.category ?
      correlationlist.push({ id: this.formValues.category, type: CorReleationDataType.CATEGORY }) : undefined;
    // SubCategory
    this.formValues && this.formValues.subcategory ?
      correlationlist.push({ id: this.formValues.subcategory, type: CorReleationDataType.SUBCATEGORY }) : undefined;
    if (this.formValues && this.formValues.children && this.formValues.children.subcategory) {
      // Board
      correlationlist.push({ id: this.extractPrepareFieldStr('board') || '', type: CorReleationDataType.BOARD });
      // Medium
      correlationlist.push({ id: this.extractPrepareFieldStr('medium') || '', type: CorReleationDataType.MEDIUM });
      // Grade
      correlationlist.push({ id: this.extractPrepareFieldStr('grade') || '', type: CorReleationDataType.CLASS });
      // Subject
      correlationlist.push({ id: this.extractPrepareFieldStr('subject') || '', type: CorReleationDataType.SUBJECT });
      // Content Type
      correlationlist.push({ id: this.extractPrepareFieldStr('contenttype') || '', type: CorReleationDataType.CONTENT_TYPE });
      // Content name
      correlationlist.push({ id: this.extractPrepareFieldStr('contentname') || '', type: CorReleationDataType.CONTENT_NAME });
    }

    return correlationlist ? correlationlist : undefined;
  }

  async syncTelemetry() {
    const that = this;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const correlationlist: Array<CorrelationData> = this.prepareTelemetryCorrelation();

    this.generateInteractEvent(InteractType.TOUCH, InteractSubtype.MANUALSYNC_INITIATED, undefined);
    this.telemetryService.sync({
      ignoreAutoSyncMode: true,
      ignoreSyncThreshold: true
    }).subscribe((syncStat: TelemetrySyncStat) => {
      that.zone.run(async () => {
        if (syncStat.error) {
          await loader.dismiss();
          return;
        } else if (!syncStat.syncedEventCount) {
          await loader.dismiss();
          return;
        }

        this.generateInteractEvent(InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, syncStat.syncedFileSize, correlationlist);
        await loader.dismiss();
      });
    }, async (error) => {
      await loader.dismiss();
      console.error('Telemetry Data Sync Error: ', error);
    });
  }

  generateInteractEvent(interactType: string, subtype: string, size: number, corRelationList?) {
    if (size) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        interactType,
        subtype,
        Environment.USER,
        PageId.FAQ_REPORT_ISSUE,
        undefined,
        {
          SizeOfFileInKB: (size / 1000) + ''
        },
        undefined,
        corRelationList
      );
    }
  }

  // checks for dataSrc property
  checkDataSrc(obj) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, 'dataSrc')) {
      // attaching closure to options preperty
      this.converDataSrcToClosure(obj);
    } else if (obj) {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          this.arrayListHandling(obj[key]);
        } else if (typeof obj[key] === 'object') {
          this.checkDataSrc(obj[key]);
        }
      }
    }
  }

  arrayListHandling(arr, action?) {
    arr.forEach(element => {
      if (arr && Array.isArray(element)) {
        this.arrayListHandling(element);
      } else if (typeof element === 'object') {
        if (typeof action === 'function') {
          action(element);
        } else {
          this.checkDataSrc(element);
        }
      }
    });
  }

  converDataSrcToClosure(templateOptions) { // type definition
    const dataSrc = templateOptions.dataSrc;
    switch (dataSrc.marker) {
      case 'ACTIVE_CHANNEL.SUGGESTED_FRAMEWORK_LIST.MAPPED_TO_FRAMEWORKCATEGORIES':
        templateOptions.options = this.getClosure('board');
        break;
      case 'FRAMEWORK_CATEGORY_TERMS':
        templateOptions.options = this.getClosure(dataSrc.params.categoryCode);
        break;
    }
    if (dataSrc && dataSrc.action) {
      this.callToAction[templateOptions.value] = dataSrc.action;
    }
    if (dataSrc && dataSrc.params && dataSrc.params.relevantTerms) {
      this.relevantTerms = dataSrc.params.relevantTerms;
    }
    delete templateOptions.dataSrc;
  }

  getClosure(type: string) {
    switch (type) {
      case 'board':
        return this.frameworkCommonFormConfigBuilder.getBoardConfigOptionsBuilder(this.profile);
      case 'medium':
        return this.frameworkCommonFormConfigBuilder.getMediumConfigOptionsBuilder(this.profile);
      case 'grade':
        return this.frameworkCommonFormConfigBuilder.getGradeConfigOptionsBuilder(this.profile);
      case 'subject':
        return this.frameworkCommonFormConfigBuilder.getSubjectConfigOptionsBuilder(this.profile);
    }
  }

  valueChanged($event) {
    this.formValues = $event;
    if (!this.formContext && $event.category === 'otherissues') {
      this.formConfig[1].templateOptions.hidden = true;
    } else if (!this.formContext) {
      this.formConfig[1].templateOptions.hidden = false;
    }
  }

  getStringFromArray(arr) {
    return arr.reduce((acc, ele) => {
      if(!acc) {
        acc = ele.name ? ele.name : ele;
      } else {
        acc += ', ' + (ele.name ? ele.name : ele);
      }
      return acc;
    }, '');
  }

  prepareEmailContent(formValue) {
    this.bmgsString = undefined;
    this.categories = undefined;
    const bmgskeys = ['board', 'medium', 'grade', 'subject', 'contentname', 'contenttype'];
    const categorykeys = ['category', 'subcategory'];
    let fields = [];
    if (formValue.children.subcategory) {
      fields = formValue.children.subcategory;
    } else if (formValue.children) {
      fields = formValue.children;
    }
    bmgskeys.forEach(element => {
      if (Object.prototype.hasOwnProperty.call(fields, element)) {
        if (!this.bmgsString) {
          if(fields[element] && typeof fields[element] === 'object' && fields[element].length) {
            this.bmgsString = this.getStringFromArray(fields[element]);
          } else {
            this.bmgsString = fields[element].name ? fields[element].name : fields[element];
          }
        } else {
          if(fields[element] && typeof fields[element] === 'object' && fields[element].length) {
            this.bmgsString += ', ' + this.getStringFromArray(fields[element]);
          } else {
            this.bmgsString += ', ' + (fields[element].name ? fields[element].name : fields[element]);
          }
        }
      }
    });
    categorykeys.forEach(element => {
      if (Object.prototype.hasOwnProperty.call(formValue, element)) {
        if (!this.categories) {
          formValue[element] ? this.categories = formValue[element] : undefined;
        } else {
          formValue[element] ? this.categories += ' - ' + formValue[element] : undefined;
        }
      }
    });
  }

  statusChanged($event) {
    this.isFormValid = $event.isValid;
    this.btnColor = this.isFormValid ? '#006DE5' : '#8FC4FF';
  }

  async dataLoadStatus($event) {
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
    }
    if ('LOADING' === $event) {
      this.loader.present();
    } else {
      this.loader.dismiss();
    }
  }

  responseSubmitted() {
    if (this.formContext !== FormConfigSubcategories.CONTENT_AVAILABILITY) {
      this.location.back();
    }
  }
}
