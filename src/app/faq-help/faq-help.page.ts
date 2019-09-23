import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
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
import { PreferenceKey, appLanguages, ContentType, AudienceFilter, RouterLinks } from '../app.constant';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Location } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { LoadedRouterConfig } from '@angular/router/src/config';
import { Observable } from 'rxjs-compat';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';

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
  shownGroup: any;
  isNoClicked: boolean;
  isYesClicked: boolean;
  isSubmitted: boolean;
  data: any;
  constants: any;
  faqs: any;
  jsonURL: any;
  textValue: any;
  value: any;
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
    private platform: Platform,
    private translate: TranslateService,
    private http: HttpClient,
    private router: Router
  ) {
  }

   ngOnInit() {
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
        console.log('APpName', this.appName);
      });
    this.messageListener = (event) => {
        this.receiveMessage(event);
    };
    window.addEventListener('message', this.messageListener, false);
    this.getSelectedLanguage();
    console.log('this.data', this.data);
    this.getDataFromUrl();
  }
  receiveMessage(event) {
    const values = new Map();
    values['values'] = event.data;
    console.log('Event.data', event.data);
    // send telemetry for all events except Initiate-Email
    if (event.data && event.data.action && event.data.action !== 'initiate-email-clicked') {
      this.generateInteractTelemetry(event.data.action, values);
    }
  }

  public getJSON(): Observable<any> {
    return this.http.get(this.jsonURL);
  }
  private async getSelectedLanguage() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    console.log('Selected Language', selectedLanguage);
    if (selectedLanguage) {
      await this.translate.use(selectedLanguage).toPromise();
    }
  }
  private async getDataFromUrl() {
    this.loading = await this.commonUtilService.getLoader();
    await this.loading.present();
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (this.selectedLanguage) {
        this.jsonURL = 'https://ntpstagingall.blob.core.windows.net/public/faq/resources/res/faq-' + this.selectedLanguage + '.json';
      } else {
        this.jsonURL = 'https://ntpstagingall.blob.core.windows.net/public/faq/resources/res/faq-en.json';
      }
    } else if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      if (this.selectedLanguage) {
        console.log('LANGUAGESELCTED', this.selectedLanguage);
        this.jsonURL = '../../assets/faq/resources/res/faq-en.json';
        // + this.selectedLanguage + '.json';
      } else {
        this.jsonURL = '../../assets/faq/resources/res/faq-en.json';
      }
    }
    console.log('JSONURl', this.jsonURL);

    this.getJSON().subscribe(data => {
      this.data = data;
      console.log('JSONDATA from httpclient', data);
      console.log('this.data', this.data);
      this.constants = this.data.constants;
      this.faqs = this.data.faqs;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.data.faqs.length; i++) {
        if (this.data.faqs[i].topic.search('{{APP_NAME}}')) {
          this.data.faqs[i].topic = this.data.faqs[i].topic.replace('{{APP_NAME}}', this.appName);
        } else {
          this.data.faqs[i].topic = this.data.faqs[i].topic;
        }
        if (this.data.faqs[i].description.search('{{APP_NAME}}')) {
          this.data.faqs[i].description = this.data.faqs[i].description.replace('{{APP_NAME}}', this.appName);
        } else {
          this.data.faqs[i].description = this.data.faqs[i].description;
        }
      }
      this.loading.dismiss();
    });
    console.log('Data To be Loaded, constants, faqs', this.data, this.constants, this.faqs);
  }
  async ionViewDidLeave() {
    (<any>window).supportfile.removeFile(
      result => ({}),
      error => {
        console.error('error' + error);
      });

    window.removeEventListener('message', this.messageListener);
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }

  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    // this.loading = await this.commonUtilService.getLoader();
    // await this.loading.present();
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
        console.log('this.consumptionurl', this.consumptionFaqUrl);
      } else {
        this.consumptionFaqUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.faq.url);
        console.log('this.consumptionurl', this.consumptionFaqUrl);

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
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    this.location.back();
  }

  


  generateInteractTelemetry(interactSubtype, values) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, interactSubtype,
      Environment.USER,
      PageId.FAQ, undefined,
      values
    );
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
    this.headerObservable.unsubscribe();
  }

  // toggle the card
  toggleGroup(group) {
    this.isNoClicked = false;
    this.isYesClicked = false;
    this.isSubmitted = false;

    let isCollapsed = true;
    if (this.isGroupShown(group)) {
      isCollapsed = false;
      this.shownGroup = null;
    } else {
      isCollapsed = false;
      this.shownGroup = group;
    }
  }

  // to check whether the card is toggled or not
 isGroupShown(group) {
   return this.shownGroup === group;
}

noClicked(i) {
  this.value = {};
  if (!this.isNoClicked) {
    this.isNoClicked = true;
  }
  this.value.action = 'no-clicked';
  this.value.position = i;
  this.value.value = {};
  this.value.value.topic = this.data.faqs[i].topic;
  this.value.value.description = this.data.faqs[i].description;
  console.log('this.value, noclicked', this.value);
  window.parent.postMessage(this.value, '*');

}

yesClicked(i) {
  this.value = {};
  if (!this.isYesClicked) {
    this.isYesClicked = true;
  }

  this.value.action = 'yes-clicked';
  this.value.position = i;
  this.value.value = {};
  this.value.value.topic = this.data.faqs[i].topic;
  this.value.value.description = this.data.faqs[i].description;

  console.log('this.value, yesclicked', this.value);
  window.parent.postMessage(this.value, '*');
}

submitClicked(textValue, i) {
  this.isSubmitted = true;
  console.log(this.textValue);

  this.value.action = 'no-clicked';
  this.value.position = i;
  this.value.value = {};
  this.value.value.topic = this.data.faqs[i].topic;
  this.value.value.description = this.data.faqs[i].description;
  this.value.value.knowMoreText = textValue;
  console.log('this.value, noclicked', this.value);
  window.parent.postMessage(this.value, '*');
  this.textValue = '';
}

navigateToReportIssue() {
  console.log('Data', this.data);
  this.router.navigate([RouterLinks.FAQ_REPORT_ISSUE], {
    state: {
      data: this.data
    }
  });
}

}
