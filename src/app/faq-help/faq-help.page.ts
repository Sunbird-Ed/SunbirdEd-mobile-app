import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import {
  TelemetryGeneratorService,
  CommonUtilService,
  AppGlobalService,
  AppHeaderService,
  FormAndFrameworkUtilService,
  Environment,
  InteractType,
  PageId
} from '../../services';
import {
  ProfileService,
  ContentService,
  DeviceInfo,
  Profile,
  GetAllProfileRequest,
  ContentRequest,
  SharedPreferences
} from 'sunbird-sdk';
import { PreferenceKey, appLanguages, ContentType, AudienceFilter } from '../app.constant';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Location } from '@angular/common';

const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
const SUBJECT_NAME = 'support request';

@Component({
  selector: 'app-faq-help',
  templateUrl: './faq-help.page.html',
  styleUrls: ['./faq-help.page.scss'],
})
export class FaqHelpPage {

  consumptionFaqUrl: SafeResourceUrl;

  faq: any = {
    url: 'file:///android_asset/www/assets/faq/consumption-faqs.html?selectedlang=en&randomid=' + Math.random()
  };
  selectedLanguage: string;
  chosenLanguageString: any;
  deviceId: string;
  fileUrl: string;
  subjectDetails: string;
  appName: string;
  loading?: any;
  private messageListener: (evt: Event) => void;
  @ViewChild('f') iframe: ElementRef;
  backButtonFunc: any;
  headerObservable: any;
  constructor(
    private loadingCtrl: LoadingController,
    private domSanitizer: DomSanitizer,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private socialSharing: SocialSharing,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private location: Location
  ) {
    this.messageListener = (event) => {
      this.receiveMessage(event);
    };
  }

  ionViewDidLoad() {
    /* migration-TODO
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
      });
    */
    window.addEventListener('message', this.messageListener, false);
  }

  ionViewDidLeave() {
    (<any>window).supportfile.removeFile(
      result => ({}),
      error => {
        console.error('error' + error);
      });

    window.removeEventListener('message', this.messageListener);
    if (this.loading) {
      this.loading.dismissAll();
    }
  }

  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    await this.createAndPresentLoadingSpinner();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.registerDeviceBackButton();
    await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE).toPromise()
      .then(value => {
        // get chosen language code from  lang mapping constant array
        this.selectedLanguage = appLanguages.filter((el) => {
          return value.trim() === el.label;
        })[0].code;
      });

    await this.formAndFrameworkUtilService.getConsumptionFaqsUrl().then((url: string) => {
      if (this.selectedLanguage && this.commonUtilService.networkInfo.isNetworkAvailable) {
        url += '?selectedlang=' + this.selectedLanguage + '&randomid=' + Math.random();
        this.faq.url = url;
        this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);
      } else {
        this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);

      }
    }).catch((error) => {
      console.log('In error', error);
      this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);
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
  registerDeviceBackButton() {
    /* migration-TODO
    this.backButtonFunc = this.platform.registerBackButtonAction(() => {
      this.handleBackButton();
    }, 10);
    */
  }

  handleBackButton() {
    const length = this.iframe.nativeElement.contentWindow.location.href.split('/').length;
    if (this.iframe.nativeElement.contentWindow.location.href.split('/')[length - 1].startsWith('consumption') ||
      this.iframe.nativeElement.contentWindow.history.length === 1) {
      this.location.back();
      /* migration-TODO
      this.navCtrl.pop();
      */
      this.backButtonFunc.unsubscribe();
    } else {
      this.iframe.nativeElement.contentWindow.history.go(-1);
    }
  }

  onLoad() {
    const element = document.getElementsByTagName('iframe')[0];
    if (element) {
      if (element.contentDocument.documentElement.getElementsByTagName('body')[0].innerHTML.length !== 0 && this.loading) {
        const appData = { appName: this.appName };
        element.contentWindow.postMessage(appData, '*');
        this.loading.dismissAll();
      }
      if (element.contentDocument.documentElement.getElementsByTagName('body').length === 0 ||
        element['contentWindow'].location.href.startsWith('chrome-error:')
      ) {
        this.onError();
      }
    }
  }

  onError() {
    if (this.loading) {
      this.loading.dismissAll();
    }
    this.faq.url = 'file:///android_asset/www/assets/faq/consumption-faqs.html?selectedlang=en&randomid=' + Math.random();
    this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);
  }

  private async createAndPresentLoadingSpinner() {
    this.loading = await this.loadingCtrl.create({
      showBackdrop: true,
      spinner: 'crescent'
    });

    await this.loading.present();
  }

  receiveMessage(event) {
    const values = new Map();
    values['values'] = event.data;
    debugger;
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
  getBoardMediumGrade(mailBody: string): string {
    const userProfile: Profile = this.appGlobalService.getCurrentUser();
    let ticketSummary: string;
    if (mailBody.length) {
      ticketSummary = '.<br> <br> <b>' + this.commonUtilService.translateMessage('TICKET_SUMMARY') + '</b> <br> <br>';
    } else {
      ticketSummary = '.<br> <br> <b>' + this.commonUtilService.translateMessage('MORE_DETAILS') + '</b> <br> <br>';
    }
    const userDetails: string = 'From: ' + userProfile.profileType[0].toUpperCase() + userProfile.profileType.slice(1) + ', ' +
      this.appGlobalService.getSelectedBoardMediumGrade() +
      ticketSummary;
    return userDetails;
  }
  debugger;
  generateInteractTelemetry(interactSubtype, values) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, interactSubtype,
      Environment.USER,
      PageId.FAQ, undefined,
      values,
      undefined
    );
  }

  async sendMessage(message: string) {
    this.deviceId = this.deviceInfo.getDeviceID();
    const allUserProfileRequest: GetAllProfileRequest = {
      local: true,
      server: true
    };
    const contentRequest: ContentRequest = {
      contentTypes: ContentType.FOR_DOWNLOADED_TAB,
      audience: AudienceFilter.GUEST_TEACHER
    };
    const getUserCount = await this.profileService.getAllProfiles(allUserProfileRequest).map((profile) => profile.length).toPromise();
    const getLocalContentCount = await this.contentService.getContents(contentRequest)
      .map((contentCount) => contentCount.length).toPromise();
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
                this.subjectDetails = this.appName + ' ' + SUBJECT_NAME + '-' + this.deviceId;
                this.socialSharing.shareViaEmail(message,
                  this.subjectDetails,
                  [this.appGlobalService.SUPPORT_EMAIL],
                  null,
                  null,
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

}
