import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Inject, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService, } from '@app/services/app-global-service.service';
import { AppHeaderService, } from '@app/services/app-header.service';
import { FormAndFrameworkUtilService, } from '@app/services/formandframeworkutil.service';
import { Environment, InteractType, PageId, InteractSubtype, ImpressionType, CorReleationDataType } from '@app/services/telemetry-constants';
import {
  SharedPreferences,
  TelemetryObject,
  GetSystemSettingsRequest,
  SystemSettingsService,
  SystemSettings,
  FaqService,
  GetFaqRequest,
  CorrelationData,
} from 'sunbird-sdk';
import { PreferenceKey, appLanguages, RouterLinks } from '../app.constant';
import { Location } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  @ViewChild('f', { static: false }) iframe: ElementRef;
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
  corRelation: Array<CorrelationData> = [];
  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('FAQ_SERVICE') private faqService: FaqService,
    private domSanitizer: DomSanitizer,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private location: Location,
    private appVersion: AppVersion,
    private platform: Platform,
    private translate: TranslateService,
    private http: HttpClient,
    private router: Router,
    private zone: NgZone
  ) {
    this.getNavParam();
  }

  private getNavParam() {
    const navExtras = this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state;
    if (navExtras) {
      this.corRelation = navExtras.corRelation || [];
      this.corRelation.push({ id: PageId.FAQ, type: CorReleationDataType.FROM_PAGE });
    }
  }

  ngOnInit() {
    this.appVersion.getAppName()
      .then((appName) => {
        this.appName = appName;
      });
    this.messageListener = (event) => {
      this.receiveMessage(event);
    };
    window.addEventListener('message', this.messageListener, false);
    this.getSelectedLanguage();
    this.getDataFromUrl();
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.FAQ,
      Environment.USER,
      undefined,
      undefined,
      undefined,
      undefined,
      this.corRelation);
  }

  receiveMessage(event) {
    const values = new Map();
    values['values'] = event.data;
    // send telemetry for all events except Initiate-Email
    if (event.data && event.data.action && event.data.action !== 'initiate-email-clicked') {
      this.generateInteractTelemetry(event.data.action, values);
    }
  }

  private async getSelectedLanguage() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (selectedLanguage) {
      await this.translate.use(selectedLanguage).toPromise();
    }
  }

  private async getDataFromUrl() {
    const faqRequest: GetFaqRequest = { language: '', faqUrl: '' };
    const getSystemSettingsRequest: GetSystemSettingsRequest = {
      id: 'faqURL'
    };
    await this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        faqRequest.faqUrl = res.value;
      }).catch(err => {
      });
    this.loading = await this.commonUtilService.getLoader();
    await this.loading.present();
    if (this.selectedLanguage && this.commonUtilService.networkInfo.isNetworkAvailable) {
      faqRequest.language = this.selectedLanguage;
    } else {
      faqRequest.language = 'en';
    }

    this.faqService.getFaqDetails(faqRequest).subscribe(data => {
      this.zone.run(() => {
        this.data = data;
        this.constants = this.data.constants;
        this.faqs = this.data.faqs;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.data.faqs.length; i++) {
          if (this.data.faqs[i].topic.includes('{{APP_NAME}}')) {
            this.data.faqs[i].topic = this.data.faqs[i].topic.replace('{{APP_NAME}}', this.appName);
          } else {
            this.data.faqs[i].topic = this.data.faqs[i].topic;
          }
          if (this.data.faqs[i].description.includes('{{APP_NAME}}')) {
            this.data.faqs[i].description = this.data.faqs[i].description.replace('{{APP_NAME}}', this.appName);
          } else {
            this.data.faqs[i].description = this.data.faqs[i].description;
          }
        }
        this.loading.dismiss();
      });
    });
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
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    this.location.back();
  }

  generateInteractTelemetry(interactSubtype, values) {
    values.values.value.description = values.values.value.description.replace(/(<([^>]+)>)/ig, '');
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
    const telemetryObject = new TelemetryObject((group + 1).toString(), 'faq', '');
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.HELP_SECTION_CLICKED,
      Environment.USER,
      PageId.FAQ,
      telemetryObject,
      undefined);

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
    window.parent.postMessage(this.value, '*');
  }

  submitClicked(textValue, i) {
    this.isSubmitted = true;
    this.value.action = 'no-clicked';
    this.value.position = i;
    this.value.value = {};
    this.value.value.topic = this.data.faqs[i].topic;
    this.value.value.description = this.data.faqs[i].description;
    this.value.value.knowMoreText = textValue;
    window.parent.postMessage(this.value, '*');
    this.textValue = '';
  }

  async navigateToReportIssue() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.REPORT_ISSUE_CLICKED,
      Environment.USER,
      PageId.FAQ,
      undefined,
      undefined);

    const formConfig = await this.formAndFrameworkUtilService.getFormConfig();
    this.appGlobalService.formConfig = formConfig;
    this.router.navigate([RouterLinks.FAQ_REPORT_ISSUE], {
      state: {
        data: this.data,
        corRelation: this.corRelation
      }
    });
  }

}
