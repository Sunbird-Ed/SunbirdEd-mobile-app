import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Inject, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
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
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { VideoConfig } from './faq-help-data';
import { ContentViewerComponent } from './../components/content-viewer/content-viewer.component';

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
  faqData: {
    categories: {
      name: string,
      videos?: any[],
      faqs?: {
        topic: string,
        description: string
      }[],
    }[],
    constants: any
  }
  constants: any;
  jsonURL: any;
  value: any;
  corRelation: Array<CorrelationData> = [];
  selectedFaqCategory: {
    name: string,
    videos?: any[],
    faqs?: {
      topic: string,
      description: string
    }[],
    constants?: any
  } | undefined;
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
    private zone: NgZone,
    private modalCtrl: ModalController,
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
      id: 'appFaqURL'
    };
    await this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        faqRequest.faqUrl = res.value;
      })
    this.loading = await this.commonUtilService.getLoader();
    await this.loading.present();
    if (this.selectedLanguage && this.commonUtilService.networkInfo.isNetworkAvailable) {
      faqRequest.language = this.selectedLanguage;
    } else {
      faqRequest.language = 'en';
    }
    this.fetchFaqData(faqRequest);
  }

  private fetchFaqData(faqRequest, retry=true) {
    this.faqService.getFaqDetails(faqRequest).subscribe(data => {
      this.zone.run(() => {
        this.faqData = data as any;
        this.constants = this.faqData.constants;
        this.loading.dismiss();
      });
    }, error => {
      console.error(error);
      faqRequest.language = 'en';
      if (retry) {
        this.fetchFaqData(faqRequest, false);
        return;
      }
      this.loading.dismiss();
    });
  }

  async ionViewDidLeave() {
    (<any>window).sbutility.removeFile(
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
    if (this.selectedFaqCategory) {
      this.selectedFaqCategory = undefined;
      return;
    }
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
  toggleGroup(event) {
    if (!event || !event.data) {
      return;
    }
    const telemetryObject = new TelemetryObject((event.data.position+1).toString(), 'faq', '');
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      event.data.action,
      Environment.USER,
      PageId.FAQ,
      telemetryObject);
  }

  logInteractEvent(event) {
    if (!event || !event.data) {
      return;
    }
    this.value = event.data;
    window.parent.postMessage(this.value, '*');
  }

  async navigateToReportIssue() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.REPORT_ISSUE_CLICKED,
      Environment.USER,
      PageId.FAQ);

    const formConfig = await this.formAndFrameworkUtilService.getFormConfig();
    this.appGlobalService.formConfig = formConfig;
    this.router.navigate([RouterLinks.FAQ_REPORT_ISSUE], {
      state: {
        data: this.faqData,
        corRelation: this.corRelation
      }
    });
  }

  onCategorySelect(event) {
    this.selectedFaqCategory = undefined;
    if (!event || !event.data) {
      return;
    }
    setTimeout(() => {
      this.replaceFaqText(event.data);
    }, 0);
  }

  replaceFaqText(faqData) {
    for (let i = 0; i < faqData.faqs.length; i++) {
      if (faqData.faqs[i].topic.includes('{{APP_NAME}}')) {
        faqData.faqs[i].topic = faqData.faqs[i].topic.replace('{{APP_NAME}}', this.appName);
      }
      if (faqData.faqs[i].description.includes('{{APP_NAME}}')) {
        faqData.faqs[i].description = faqData.faqs[i].description.replace('{{APP_NAME}}', this.appName);
      }
    }

    this.selectedFaqCategory = faqData;
    this.selectedFaqCategory.constants = this.constants;
  }

  enableFaqReport(event) {
    this.navigateToReportIssue();
  }

  async onVideoSelect(event) {
    if (!event || !event.data) {
      return;
    }

    const video = VideoConfig;
    video.metadata.appIcon = event.data.thumbnail;
    video.metadata.name = event.data.name;
    video.metadata.artifactUrl = event.data.url;

      const playerModal = await this.modalCtrl.create({
        component: ContentViewerComponent,
        componentProps: {
          playerConfig: video
        }
      });
      await playerModal.present();
  }

}