import { Location } from '@angular/common';
import { Component, Inject, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appLanguages, PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { Map } from '@app/app/telemetryutil';
import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { NotificationService } from '@app/services/notification.service';
import {
  AuditProps, AuditType, CorReleationDataType, Environment, ID, ImpressionType, InteractSubtype,
  InteractType, PageId
} from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';
import { Events, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuditState, CorrelationData, SharedPreferences } from 'sunbird-sdk';

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
  tappedLanguage: string;
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
    private nativePageTransitions: NativePageTransitions
  ) { }

  ionViewDidEnter() {
    this.activatedRoute.params.subscribe(async params => {
      this.isFromSettings = Boolean(params['isFromSettings']);
      if (!this.isFromSettings) {
        this.headerService.hideHeader();
      } else {
        this.headerService.showHeaderWithBackButton();
      }
    });
  }

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
        /* New Telemetry */
        this.telemetryGeneratorService.generatePageLoadedTelemetry(
          this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.LANGUAGE,
          this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING
        );

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
    /* New Telemetry */
    const cData: CorrelationData[] = [{
      id: this.language,
      type: CorReleationDataType.NEW_VALUE
    }];
    if (this.tappedLanguage) {
      cData.push({ id: this.tappedLanguage, type: CorReleationDataType.OLD_VALUE });
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_LANGUAGE, '',
      this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
      PageId.LANGUAGE,
      undefined,
      undefined,
      undefined,
      cData
    );
    this.tappedLanguage = this.language;
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

  generateLanguageFailedInteractEvent() {
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
    /* New Telemetry */
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CONTINUE,
      InteractSubtype.FAIL,
      Environment.ONBOARDING,
      PageId.LANGUAGE
    );
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
    /* New Telemetry */
    const cData: CorrelationData[] = [{
      id: currentLanguage,
      type: CorReleationDataType.NEW_VALUE
    }];
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CONTINUE,
      InteractSubtype.SUCCESS,
      this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
      this.isFromSettings ? PageId.SETTINGS_LANGUAGE : PageId.LANGUAGE,
      undefined,
      undefined,
      undefined,
      cData
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
      const corRelationList: Array<CorrelationData> = [
        { id: PageId.LANGUAGE, type: CorReleationDataType.FROM_PAGE }
      ];
      corRelationList.push({ id: this.language || '', type: CorReleationDataType.LANGUAGE });
      this.telemetryGeneratorService.generateAuditTelemetry(
        this.isFromSettings ? Environment.SETTINGS : Environment.ONBOARDING,
        AuditState.AUDIT_UPDATED,
        [AuditProps.LANGUAGE],
        AuditType.SET_LANGUAGE,
        undefined,
        undefined,
        undefined,
        corRelationList
      );
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
      this.generateLanguageFailedInteractEvent();

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
