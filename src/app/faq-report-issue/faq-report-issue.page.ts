import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentType, AudienceFilter } from '../app.constant';
import {
  ProfileService,
  ContentService,
  DeviceInfo,
  Profile,
  GetAllProfileRequest,
  ContentRequest,
  SharedPreferences
} from 'sunbird-sdk';
import { Environment, InteractType, PageId, ImpressionType } from '@app/services/telemetry-constants';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { map } from 'rxjs/operators';

const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
const SUBJECT_NAME = 'support request';

@Component({
  selector: 'app-faq-report-issue',
  templateUrl: './faq-report-issue.page.html',
  styleUrls: ['./faq-report-issue.page.scss'],
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

  constructor(
    private router: Router,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('DEVICE_INFO') private deviceInfo: DeviceInfo,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private socialSharing: SocialSharing,
    private appVersion: AppVersion
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.data = this.router.getCurrentNavigation().extras.state.data;
      console.log('Data from Faq-Help', this.data);
    }
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
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      PageId.FAQ_REPORT_ISSUE,
      Environment.USER);
  }
  ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
  }
  receiveMessage(event) {
    const values = new Map();
    values['values'] = event.data;
    console.log('Event.data', event.data);
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
    this.deviceId = this.deviceInfo.getDeviceID();
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
  generateInteractTelemetry(interactSubtype, values) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH, interactSubtype,
      Environment.USER,
      PageId.FAQ_REPORT_ISSUE, undefined,
      values
    );
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

  initiateEmail(emailContent) {
    this.value = {};
    this.value.action = 'initiate-email-clicked';
    this.value.value = {};
    this.value.initiateEmailBody = emailContent;
    console.log('this.value', this.value);
    window.parent.postMessage(this.value, '*');
  }

  countChar(val) {
    const maxLength = 1000;
    this.len = val.length;
    if (this.len === 0) {
      this.charEntered = false;
    }
    if (this.len > 0 && this.len <= 1000) {
      this.charEntered = true;
      this.charsLeft = maxLength - this.len;
    }
    if (val.length > 1000) {
      this.emailContent = this.emailContent.slice(0, 1000);
    }
  }
}
