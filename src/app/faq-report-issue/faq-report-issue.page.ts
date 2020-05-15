import { Component, OnInit, Inject, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentType, AudienceFilter, ProfileConstants } from '../app.constant';
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
  GetFrameworkCategoryTermsRequest,
  FrameworkCategoryCode,
  TelemetryService,
  TelemetrySyncStat,
  CorrelationData
} from 'sunbird-sdk';
import { Environment, InteractType, PageId, ImpressionType, InteractSubtype, CorReleationDataType } from '@app/services/telemetry-constants';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { map, tap, delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Observable, combineLatest, Subscription } from 'rxjs';

const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
const SUBJECT_NAME = 'support request';

@Component({
  selector: 'app-faq-report-issue',
  templateUrl: './faq-report-issue.page.html',
  styleUrls: ['./faq-report-issue.page.scss'],
})
export class FaqReportIssuePage implements OnInit, OnDestroy {

  @ViewChild('boardSelect') boardSelect: any;
  @ViewChild('mediumSelect') mediumSelect: any;
  @ViewChild('gradeSelect') gradeSelect: any;
  @ViewChild('subjectSelect') subjectSelect: any;

  boardOptions = {
    title: this.commonUtilService.translateMessage('BOARD').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  mediumOptions = {
    title: this.commonUtilService.translateMessage('MEDIUM').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  classOptions = {
    title: this.commonUtilService.translateMessage('CLASS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  subjectsOptions = {
    title: this.commonUtilService.translateMessage('SUBJECTS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

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
  supportCategoryForm: FormGroup;
  loader: any;
  private framework: Framework;
  private formControlSubscriptions: Subscription;
  profile: any = {
    board: [],
    medium: [],
    grade:[],
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

  get syllabusControl(): FormControl {
    return this.supportCategoryForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.supportCategoryForm.get('board') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.supportCategoryForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.supportCategoryForm.get('grades') as FormControl;
  }

  get subjectControl(): FormControl {
    return this.supportCategoryForm.get('subjects') as FormControl;
  }

  get emailContentControl(): FormControl {
    return this.supportCategoryForm.get('emailContent') as FormControl;
  }

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
    private socialSharing: SocialSharing,
    private appVersion: AppVersion,
    private translate: TranslateService,
    private fb: FormBuilder,
    public zone: NgZone
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.data = this.router.getCurrentNavigation().extras.state.data;
      console.log('Data from Faq-Help', this.data);
    }
    this.supportCategoryForm = new FormGroup({
      syllabus: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      board: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      medium: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      grades: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      subjects: new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' }),
      emailContent: new FormControl('', (c) => c.value !== '' ? undefined : { length: 'NOT_SELECTED' })
    });
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
      .then((res: any) => {
        this.profile = res;
      })
      .catch(async () => {
        await this.loader.dismiss();
      });
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

  async fetchSyllabusList() {
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
        this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
        await this.loader.dismiss();
      });
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
      Environment.USER
    );

    this.formControlSubscriptions = combineLatest(
      this.onBoardChange(),
      this.onMediumChange(),
      this.onGradeChange(),
      this.supportCategoryForm.valueChanges.pipe(
        delay(250),
        tap(() => {
          this.btnColor = this.supportCategoryForm.valid ? '#006DE5' : '#8FC4FF';
        })
      )
    ).subscribe();
    this.fetchSyllabusList();
  }

  private onBoardChange(): Observable<string[]> {
    return this.syllabusControl.valueChanges.pipe(
      tap(async (value) => {
        if (!Array.isArray(value)) {
          this.syllabusControl.patchValue([value]);
          return;
        }

        if (!value.length) {
          return;
        }

        await this.commonUtilService.getLoader().then((loader) => {
          this.loader = loader;
          this.loader.present();
        });

        try {
          this.framework = await this.frameworkService.getFrameworkDetails({
            from: CachedItemRequestSourceFrom.SERVER,
            frameworkId: value[0],
            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
          }).toPromise();

          const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.BOARD],
            currentCategoryCode: FrameworkCategoryCode.BOARD,
            language: this.translate.currentLang
          };

          const boardTerm = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
            .find(b => b.name === (this.syllabusList.find((s) => s.code === value[0])!.name));

          this.boardControl.patchValue([boardTerm.code]);

          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.MEDIUM],
            prevCategoryCode: FrameworkCategoryCode.BOARD,
            currentCategoryCode: FrameworkCategoryCode.MEDIUM,
            language: this.translate.currentLang,
            selectedTermsCodes: this.boardControl.value
          };

          this.mediumList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          if (!this.mediumControl.value.length) {
            this.mediumControl.patchValue(this.profile.medium || []);
          } else {
            this.mediumControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.mediumControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onMediumChange(): Observable<string[]> {
    return this.mediumControl.valueChanges.pipe(
      tap(async (value) => {
        await this.commonUtilService.getLoader().then((loader) => {
          this.loader = loader;
          this.loader.present();
        });

        try {
          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.GRADE_LEVEL],
            prevCategoryCode: FrameworkCategoryCode.MEDIUM,
            currentCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
            language: this.translate.currentLang,
            selectedTermsCodes: this.mediumControl.value
          };

          this.gradeList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          
          if (!this.gradeControl.value.length) {
            this.gradeControl.patchValue(this.profile.grade || []);
          } else {
            this.gradeControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.gradeControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  private onGradeChange(): Observable<string[]> {
    return this.gradeControl.valueChanges.pipe(
      tap(async () => {
        // await this.commonUtilService.getLoader().then((loader) => {
        //   this.loader = loader;
        //   this.loader.present();
        // });
        try {
          const nextCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.SUBJECT],
            prevCategoryCode: FrameworkCategoryCode.GRADE_LEVEL,
            currentCategoryCode: FrameworkCategoryCode.SUBJECT,
            language: this.translate.currentLang,
            selectedTermsCodes: this.gradeControl.value
          };

          this.subjectList = (await this.frameworkUtilService.getFrameworkCategoryTerms(nextCategoryTermsRequet).toPromise())
            .map(t => ({ name: t.name, code: t.code }));
          if (!this.subjectControl.value.length) {
            this.subjectControl.patchValue(this.profile.subject || []);
          } else {
            this.subjectControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          // todo
          // this.subjectControl.patchValue([]);
          this.loader.dismiss();
        }
      })
    );
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageListener);
    this.formControlSubscriptions.unsubscribe();
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
      ticketSummary = '.<br> <br> <strong>' + this.commonUtilService.translateMessage('TICKET_SUMMARY') + '</strong> <br> <br>';
    } else {
      ticketSummary = '.<br> <br> <strong>' + this.commonUtilService.translateMessage('MORE_DETAILS') + '</strong> <br> <br>';
    }
    const userDetails: string = 'From: ' + userProfile.profileType[0].toUpperCase() + userProfile.profileType.slice(1) + ', ' +
      this.appGlobalService.getSelectedBoardMediumGrade() +
      ticketSummary;
    return userDetails;
  }

  getBMCS() {
    return (this.boardControl.value)
  }

  initiateEmail() {
    if (this.supportCategoryForm.valid) {
      this.value = {};
      this.value.action = 'initiate-email-clicked';
      this.value.value = {};
      this.value.initiateEmailBody = this.emailContentControl.value;
      console.log('this.value', this.value);
      this.syncTelemetry();
      window.parent.postMessage(this.value, '*');
      return;
    }

    for (const [control, selector] of [
      [this.syllabusControl, this.boardSelect],
      [this.mediumControl, this.mediumSelect],
      [this.gradeControl, this.gradeSelect],
      [this.subjectControl, this.subjectSelect]
    ]) {
      if (!control.value.length) {
        selector.open();
        return;
      }
    }
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

  async syncTelemetry() {
    const that = this;
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const correlationlist: Array<CorrelationData> = [];
    correlationlist.push({ id: this.boardControl.value, type: CorReleationDataType.BOARD });
    correlationlist.push({ id: this.mediumControl.value, type: CorReleationDataType.MEDIUM });
    correlationlist.push({ id: this.gradeControl.value, type: CorReleationDataType.CLASS });
    correlationlist.push({ id: this.subjectControl.value, type: CorReleationDataType.SUBJECT });
    this.generateInteractEvent(InteractType.TOUCH, InteractSubtype.MANUALSYNC_INITIATED, null);
    this.telemetryService.sync({
      ignoreAutoSyncMode: true,
      ignoreSyncThreshold: true
    }).subscribe((syncStat: TelemetrySyncStat) => {
        that.zone.run(async () => {
          if (syncStat.error) {
            await loader.dismiss();
            this.commonUtilService.showToast('DATA_SYNC_FAILURE');
            console.error('Telemetry Data Sync Error: ', syncStat);
            return;
          } else if (!syncStat.syncedEventCount) {
            await loader.dismiss();
            this.commonUtilService.showToast('DATA_SYNC_NOTHING_TO_SYNC');
            console.error('Telemetry Data Sync Error: ', syncStat);
            return;
          }

          this.generateInteractEvent(InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, syncStat.syncedFileSize, correlationlist);
          await loader.dismiss();
          this.commonUtilService.showToast('DATA_SYNC_SUCCESSFUL');
          console.log('Telemetry Data Sync Success: ', syncStat);
        });
      }, async (error) => {
        await loader.dismiss();
        this.commonUtilService.showToast('DATA_SYNC_FAILURE');
        console.error('Telemetry Data Sync Error: ', error);
      });
  }

  generateInteractEvent(interactType: string, subtype: string, size: number, corRelationList?) {
    /*istanbul ignore else */
    if (size != null) {
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
}
