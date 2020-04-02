import { Component, Inject, NgZone } from '@angular/core';
import { Events, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedPreferences } from 'sunbird-sdk';

import { appLanguages, PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { Map } from '@app/app/telemetryutil';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppHeaderService } from '@app/services/app-header.service';
import {Environment, ID, ImpressionType, InteractSubtype, InteractType, PageId} from '@app/services/telemetry-constants';
import { NotificationService } from '@app/services/notification.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import {NativePageTransitions, NativeTransitionOptions} from '@ionic-native/native-page-transitions/ngx';


export interface ILanguages {
  label: string;
  code: string;
  isApplied: boolean;
  name: string;
}
@Component({
  selector: 'page-language-settings',
  templateUrl: 'language-settings.html',
  styleUrls: ['./language-settings.scss']
})
export class LanguageSettingsPage {

  languages: Array<ILanguages> = [];
  language: string;
  isLanguageSelected = false;
  isFromSettings = false;
  previousLanguage: any;
  selectedLanguage: any = {};
  btnColor = '#8FC4FF';
  unregisterBackButton: Subscription;
  headerConfig: any;
  headerObservable: any;
  appName = '';

  constructor(
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public translateService: TranslateService,
    private events: Events,
    private zone: NgZone,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private commonUtilService: CommonUtilService,
    private headerService: AppHeaderService,
    private notification: NotificationService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private nativePageTransitions: NativePageTransitions,

  ) { }

  handleBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH, InteractSubtype.DEVICE_BACK_CLICKED,
        this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
        this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
      );
      if (this.isFromSettings) {
        this.location.back();
      } else {
        this.commonUtilService.showExitPopUp(PageId.ONBOARDING_LANGUAGE_SETTING, Environment.ONBOARDING, false);
      }
    });
  }

  async ionViewWillEnter() {
    const params = this.activatedRoute.snapshot.params;

    this.isFromSettings = Boolean(params['isFromSettings']);

    if (!this.isFromSettings) {
      this.headerService.hideHeader();
    } else {
      this.headerService.showHeaderWithBackButton();
    }

    this.appName = await this.commonUtilService.getAppName();

    if (this.router.url === '/' + RouterLinks.LANGUAGE_SETTING || this.router.url === '/' + RouterLinks.LANGUAGE_SETTING + '/' + 'true') {
      setTimeout(() => {
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW, '',
            this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
            this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
        );
      }, 350);
    }

    this.selectedLanguage = {};
    this.init();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleBackButton();
  }

  ionViewWillLeave() {
    if (this.isLanguageSelected) {
      if (!this.selectedLanguage.code) {
        if (this.previousLanguage) {
          this.translateService.use(this.previousLanguage);
        } else {
          this.translateService.use('en');
        }
      }
    }
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  init(): void {
    this.languages = appLanguages;

    this.zone.run(() => {
      this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
        .then(val => {
          if (Boolean(val)) {
            this.previousLanguage = val;
            this.language = val;
          } else {
            this.previousLanguage = undefined;
          }
        });
    });

  }

  /**
   * It will set app language
   */
  onLanguageSelected() {
    if (this.language) {
      this.zone.run(() => {
        this.translateService.use(this.language);
        this.btnColor = '#006DE5';
        this.isLanguageSelected = true;
      });
    } else {
      this.btnColor = '#8FC4FF';
    }
  }

  generateLanguageSuccessInteractEvent(previousLanguage: string, currentLanguage: string) {
    const valuesMap = new Map();
    valuesMap['previousLanguage'] = previousLanguage ? previousLanguage : '';
    valuesMap['currentLanguage'] = currentLanguage;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LANGUAGE_SETTINGS_SUCCESS,
      this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
      this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
      undefined,
      valuesMap
    );
  }

  generateClickInteractEvent(selectedLanguage: string, interactSubType) {
    const valuesMap = new Map();
    valuesMap['selectedLanguage'] = selectedLanguage;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      interactSubType,
      this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
      this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
      undefined,
      valuesMap
    );
  }

  continue() {
    // if language is not null, then select the checked language,
    // else set default language as english
    if (this.isLanguageSelected) {
      this.generateClickInteractEvent(this.language, InteractSubtype.CONTINUE_CLICKED);
      this.generateLanguageSuccessInteractEvent(this.previousLanguage, this.language);

      if (this.language) {
        this.selectedLanguage = this.languages.find(i => i.code === this.language);
        this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE_CODE, this.selectedLanguage.code).toPromise();
        this.preferences.putString(PreferenceKey.SELECTED_LANGUAGE, this.selectedLanguage.label).toPromise();
        this.translateService.use(this.language);
      }
      this.events.publish('onAfterLanguageChange:update', {
        selectedLanguage: this.language
      });
      this.notification.setupLocalNotification(this.language);

      if (this.isFromSettings) {
        this.location.back();
      } else {
        const options: NativeTransitionOptions = {
          direction: 'up',
          duration: 500,
          androiddelay: 500,
          fixedPixelsTop: 0,
          fixedPixelsBottom: 0
        };
        this.nativePageTransitions.slide(options);
        this.router.navigate([RouterLinks.USER_TYPE_SELECTION]);
      }
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.DISABLED,
          '',
          Environment.ONBOARDING,
          PageId.ONBOARDING_LANGUAGE_SETTING,
          undefined,
          undefined,
          undefined,
          undefined,
          ID.CONTINUE_CLICKED
      );
      this.btnColor = '#8FC4FF';

      const parser = new DOMParser();
      const translatedString = this.commonUtilService.translateMessage('PLEASE_SELECT_A_LANGUAGE');
      const dom = parser.parseFromString(`<!doctype html><body>&#9432; ${translatedString}`, 'text/html');

      this.commonUtilService.showToast(dom.body.textContent, false, 'redErrorToast');
    }
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(
        this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.ONBOARDING_LANGUAGE_SETTING,
        this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
        true);
      this.location.back();
    }
  }
}
