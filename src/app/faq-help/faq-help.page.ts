import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService, } from '@app/services/app-global-service.service';
import { AppHeaderService, } from '@app/services/app-header.service';
import { FormAndFrameworkUtilService, } from '@app/services/formandframeworkutil.service';
import { Environment, InteractType, PageId } from '@app/services/telemetry-constants';
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
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription } from 'rxjs/Subscription';

const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
const SUBJECT_NAME = 'support request';

@Component({
  selector: 'app-faq-help',
  templateUrl: './faq-help.page.html',
  styleUrls: ['./faq-help.page.scss'],
})
export class FaqHelpPage implements OnInit {

  consumptionFaqUrl: SafeResourceUrl;

  faq: any = {
    url: './assets/faq/consumption-faqs.html?selectedlang=en&randomid=' + Math.random()
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
  backButtonFunc: Subscription;
  headerObservable: any;
  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private domSanitizer: DomSanitizer,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private socialSharing: SocialSharing,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private location: Location,
    private appVersion: AppVersion,
    private platform: Platform
  ) {
    this.messageListener = (event) => {
      this.receiveMessage(event);
    };
  }

  ngOnInit() {
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
      });
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
      this.loading.dismiss();
    }
  }

  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.loading = await this.commonUtilService.getLoader();
    await this.loading.present();
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
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    this.location.back();
  }

  async onLoad() {
    const element = document.getElementsByTagName('iframe')[0];
    if (element && element.contentDocument) {
      if (element.contentDocument.documentElement.getElementsByTagName('body')[0].innerHTML.length !== 0 && this.loading) {
        const appData = { appName: this.appName };
        element.contentWindow.postMessage(appData, '*');
        await this.loading.dismiss();
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
      this.loading.dismiss();
    }
    this.faq.url = './assets/faq/consumption-faqs.html?selectedlang=en&randomid=' + Math.random();
    this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);
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

  generateInteractTelemetry(interactSubtype, values) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, interactSubtype,
      Environment.USER,
      PageId.FAQ, undefined,
      values
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

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
    this.headerObservable.unsubscribe();
  }

}
