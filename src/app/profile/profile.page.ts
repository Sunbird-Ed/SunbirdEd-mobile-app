import { Component, NgZone, OnInit, Inject, ViewChild } from '@angular/core';
import {
  Events,
  PopoverController,
  ToastController,
  IonRefresher,
} from '@ionic/angular';
import { generateInteractTelemetry } from '@app/app/telemetryutil';
import {
  ContentCard,
  ContentType,
  MimeType,
  ProfileConstants,
  RouterLinks,
  ContentFilterConfig,
  Location as loc
} from '@app/app/app.constant';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { AppHeaderService } from '@app/services/app-header.service';
import {
  AuthService,
  ContentSearchCriteria,
  ContentSearchResult,
  ContentService,
  ContentSortCriteria,
  Course,
  CourseService,
  OAuthSession,
  ProfileService,
  SearchType,
  ServerProfileDetailsRequest,
  SortOrder,
  TelemetryObject,
  UpdateServerProfileInfoRequest,
  CachedItemRequestSourceFrom,
  CourseCertificate,
  SharedPreferences,
  CertificateAlreadyDownloaded,
  NetworkError,
  LocationSearchCriteria
} from 'sunbird-sdk';
import { Environment, InteractSubtype, InteractType, PageId, ID } from '@app/services/telemetry-constants';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { EditContactVerifyPopupComponent } from '@app/app/components/popups/edit-contact-verify-popup/edit-contact-verify-popup.component';
import {
  EditContactDetailsPopupComponent
} from '@app/app/components/popups/edit-contact-details-popup/edit-contact-details-popup.component';
import { AccountRecoveryInfoComponent } from '../components/popups/account-recovery-id/account-recovery-id-popup.component';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TeacherIdVerificationComponent } from '../components/popups/teacher-id-verification-popup/teacher-id-verification-popup.component';
import { Observable } from 'rxjs';
import { AndroidPermissionsService } from '@app/services';
import { AndroidPermissionsStatus, AndroidPermission } from '@app/services/android-permissions/android-permission';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @ViewChild('refresher') refresher: IonRefresher;

  profile: any = {};
  userId = '';
  isLoggedInUser = false;
  isRefreshProfile = false;
  informationProfileName = false;
  informationOrgName = false;
  checked = false;
  loggedInUserId = '';
  refresh: boolean;
  profileName: string;
  onProfile = true;
  roles = [];
  userLocation = {
    state: {},
    district: {}
  };
  appName = '';

  imageUri = 'assets/imgs/ic_profile_default.png';

  readonly DEFAULT_PAGINATION_LIMIT = 3;
  readonly DEFAULT_ENROLLED_COURSE_LIMIT = 3;
  rolesLimit = 2;
  badgesLimit = 2;
  trainingsLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
  startLimit = 0;
  custodianOrgId: string;
  isCustodianOrgId: boolean;
  isStateValidated: boolean;
  organisationName: string;
  contentCreatedByMe: any = [];
  orgDetails: {
    'state': string,
    'district': string,
    'block': string
  };

  layoutPopular = ContentCard.LAYOUT_POPULAR;
  headerObservable: any;
  timer: any;
  mappedTrainingCertificates: CourseCertificate[] = [];
  isDefaultChannelProfile$: Observable<boolean>;
  selfDeclaredTeacherDetails: any;
  private stateList: any;

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private popoverCtrl: PopoverController,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private commonUtilService: CommonUtilService,
    private socialShare: SocialSharing,
    private headerService: AppHeaderService,
    private permissionService: AndroidPermissionsService,
    private appVersion: AppVersion,
    private sbProgressLoader: SbProgressLoader,
    private fileOpener: FileOpener,
    private toastController: ToastController,
    private translate: TranslateService
  ) {
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState) {
      this.userId = extrasState.userId || '';
      this.isRefreshProfile = extrasState.returnRefreshedUserProfileDetails;
    }
    this.isLoggedInUser = !this.userId;

    // Event for optional and forceful upgrade
    this.events.subscribe('force_optional_upgrade', async (upgrade) => {
      if (upgrade) {
        await this.appGlobalService.openPopover(upgrade);
      }
    });

    this.events.subscribe('loggedInProfile:update', (framework) => {
      if (framework) {
        this.updateLocalProfile(framework);
        this.refreshProfileData();
      } else {
        this.doRefresh();
      }
    });

    this.formAndFrameworkUtilService.getCustodianOrgId().then((orgId: string) => {
      this.custodianOrgId = orgId;
    });

  }

  async ngOnInit() {
    this.doRefresh();
    this.events.subscribe('profilePicture:update', (res) => {
      if (res.isUploading && res.url !== '') {
        this.imageUri = res.url;
      }
    });
    this.appName = await this.appVersion.getAppName();
    this.stateList = await this.commonUtilService.getStateList();
  }

  ionViewWillEnter() {
    this.events.subscribe('update_header', () => {
      this.headerService.showHeaderWithHomeButton();
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton();
    this.isDefaultChannelProfile$ = this.profileService.isDefaultChannelProfile();
  }

  ionViewWillLeave(): void {
    this.headerObservable.unsubscribe();
    this.events.unsubscribe('update_header');
    this.refresher.disabled = true;
  }

  ionViewDidEnter() {
    this.refresher.disabled = false;
  }
  
  async doRefresh(refresher?) {
    const loader = await this.commonUtilService.getLoader();
    this.isRefreshProfile = true;
    if (!refresher) {
      await loader.present();
    } else if (refresher.target) {
      this.telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.PROFILE, Environment.HOME);
      refresher.target.complete();
      this.refresh = true;
    }
    return this.refreshProfileData(refresher)
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            this.events.publish('refresh:profile');
            this.refresh = false;
            await loader.dismiss();
            await this.sbProgressLoader.hide({ id: 'login' });
            resolve();
          }, 500);
          // This method is used to handle trainings completed by user

          this.getEnrolledCourses(refresher);
          this.searchContent();
          this.getSelfDeclaredTeacherDetails();
        });
      })
      .catch(async error => {
        console.error('Error while Fetching Data', error);
        this.refresh = false;
        await loader.dismiss();
      });
  }


  /**
   * To reset Profile Before calling new fresh API for Profile
   */
  resetProfile() {
    this.profile = {};
  }

  /**
   * To refresh Profile data on pull to refresh or on click on the profile
   */
  refreshProfileData(refresher?) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.authService.getSession().toPromise().then((session: OAuthSession) => {
        if (session === null || session === undefined) {
          reject('session is null');
        } else {
          that.loggedInUserId = session.userToken;
          if (that.userId && session.userToken === that.userId) {
            that.isLoggedInUser = true;
          }
          const serverProfileDetailsRequest: ServerProfileDetailsRequest = {
            userId: that.userId && that.userId !== session.userToken ? that.userId : session.userToken,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
            from: CachedItemRequestSourceFrom.SERVER
          };

          if (that.isLoggedInUser) {
            that.isRefreshProfile = !that.isRefreshProfile;
          }
          that.profileService.getServerProfilesDetails(serverProfileDetailsRequest).toPromise()
            .then((profileData) => {
              that.zone.run(() => {
                that.resetProfile();
                that.profile = profileData;
                that.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
                  .then((activeProfile) => {
                    that.formAndFrameworkUtilService.updateLoggedInUser(profileData, activeProfile)
                      .then((frameWorkData) => {
                        if (!frameWorkData['status']) {
                          // Migration-todo
                          /* that.app.getRootNav().setRoot(CategoriesEditPage, {
                            showOnlyMandatoryFields: true,
                            profile: frameWorkData['activeProfileData']
                          }); */

                          // Need to test thoroughly
                          that.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                            state: {
                              showOnlyMandatoryFields: true,
                              profile: frameWorkData['activeProfileData']
                            }
                          });
                        }
                      });
                    if (profileData && profileData.avatar) {
                      that.imageUri = profileData.avatar;
                    }
                    that.formatRoles();
                    that.getOrgDetails();
                    that.userLocation = that.commonUtilService.getUserLocation(that.profile);
                    that.isCustodianOrgId = (that.profile.rootOrg.rootOrgId === this.custodianOrgId);
                    that.isStateValidated = that.profile.stateValidated;
                    resolve();
                  });
              });
            }).catch(err => {
              if (refresher) {
                refresher.target.complete();
              }
              reject();
            });
        }
      });
    });
  }

  /**
   * Method to convert Array to Comma separated string
   */
  arrayToString(stringArray: Array<string>): string {
    return stringArray.join(', ');
  }

  /**
   * Method to store all roles from different organizations into single array
   */
  formatRoles() {
    this.roles = [];
    if (this.profile && this.profile.roleList) {
      if (this.profile.organisations && this.profile.organisations.length) {
        for (let i = 0, len = this.profile.organisations[0].roles.length; i < len; i++) {
          const roleKey = this.profile.organisations[0].roles[i];
          const val = this.profile.roleList.find(role => role.id === roleKey);
          if (val && val.name.toLowerCase() !== 'public') {
            this.roles.push(val.name);
          }
        }
      }
    }
  }

  /**
   * To show more Items in skills list
   */
  showMoreItems(): void {
    this.rolesLimit = this.roles.length;
    generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null,
      undefined,
      undefined);
  }

  /**
   * To show Less items in skills list
   * DEFAULT_PAGINATION_LIMIT = 10
   */
  showLessItems(): void {
    this.rolesLimit = this.DEFAULT_PAGINATION_LIMIT;
  }

  showMoreBadges(): void {
    this.badgesLimit = this.profile.badgeAssertions.length;
    generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null,
      undefined,
      undefined);
  }

  showLessBadges(): void {
    this.badgesLimit = this.DEFAULT_PAGINATION_LIMIT;
  }

  showMoreTrainings(): void {
    this.trainingsLimit = this.mappedTrainingCertificates.length;
    generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null,
      undefined,
      undefined);
  }

  showLessTrainings(): void {
    this.trainingsLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
  }


  /**
   *  Returns the Object with given Keys only
   * @param keys - Keys of the object which are required in new sub object
   * @param obj - Actual object
   */
  getSubset(keys, obj) {
    return keys.reduce((a, c) => ({ ...a, [c]: obj[c] }), {});
  }



  /**
   * To get enrolled course(s) of logged-in user i.e, trainings in the UI.
   *
   * It internally calls course handler of genie sdk
   */
  async getEnrolledCourses(refresher?, refreshCourseList?) {
    const loader = await this.commonUtilService.getLoader();
    if (refreshCourseList) {
      loader.present();
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.REFRESH_CLICKED,
        Environment.USER,
        PageId.PROFILE
      );
    }
    const option = {
      userId: this.profile.userId || this.profile.id,
      returnFreshCourses: refresher ? true : false
    };
    this.mappedTrainingCertificates = [];
    this.courseService.getEnrolledCourses(option).toPromise()
      .then((res: Course[]) => {
        if (res.length) {
          this.mappedTrainingCertificates = this.mapTrainingsToCertificates(res);
        }
        refreshCourseList ? loader.dismiss() : false;
      })
      .catch((error: any) => {
        console.error('error while loading enrolled courses', error);
      });
  }

  mapTrainingsToCertificates(trainings: Course[]): CourseCertificate[] {
    /**
     * If certificate is there loop through certificates and add certificates in accumulator
     * with Course_Name and Date
     * if not then add only Course_Name and Date and add in to the accumulator
     */
    return trainings.reduce((accumulator, course) => {
      const oneCert = {
        courseName: course.courseName,
        dateTime: course.dateTime,
        courseId: course.courseId,
        certificate: undefined,
        status: course.status
      };
      if (course.certificates && course.certificates.length) {
        oneCert.certificate = course.certificates[0];
        accumulator = accumulator.concat(oneCert);
      } else {
        accumulator = accumulator.concat(oneCert);
      }
      return accumulator;
    }, []);
  }

  // getCertificateCourse(certificate: CourseCertificate): Course {
  //   return this.trainingsCompleted.find((course: Course) => {
  //     return course.certificates ? course.certificates.indexOf(certificate) > -1 : undefined;
  //   });
  // }

  async downloadTrainingCertificate(course: Course, certificate: CourseCertificate) {
    const downloadMessage = await this.translate.get('CERTIFICATE_DOWNLOAD_INFO').toPromise();
    const toastOptions = {
      message: downloadMessage || 'Certificate getting downloaded'
    };

    await this.checkForPermissions().then(async (result) => {
      if (result) {
        const telemetryObject: TelemetryObject = new TelemetryObject(certificate.id, ContentType.CERTIFICATE, undefined);

        const values = new Map();
        values['courseId'] = course.courseId;

        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
          InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
          Environment.USER, // env
          PageId.PROFILE, // page name
          telemetryObject,
          values);
        const downloadRequest = {
          courseId: course.courseId,
          certificateToken: certificate.token
        };
        let toast;
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
          toast = await this.toastController.create(toastOptions);
          await toast.present();
        }
        this.courseService.downloadCurrentProfileCourseCertificate(downloadRequest).toPromise()
          .then(async (res) => {
            if (toast) {
              await toast.dismiss();
            }
            this.openpdf(res.path);
          }).catch(async (err) => {
            if (toast) {
              await toast.dismiss();
            }
            if (err instanceof CertificateAlreadyDownloaded) {
              const certificateName = certificate.url.substring(certificate.url.lastIndexOf('/') + 1);
              const filePath = `${cordova.file.externalRootDirectory}Download/${certificateName}`;
              this.openpdf(filePath);
            } else if (NetworkError.isInstance(err)) {
              this.commonUtilService.showToast('NO_INTERNET_TITLE', false, '', 3000, 'top');
            }
          });
      } else {
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
      }
    });
  }

  openpdf(path) {
    this.fileOpener
      .open(path, 'application/pdf')
      .then(() => console.log('File is opened'))
      .catch((e) => {
        console.log('Error opening file', e);
        this.commonUtilService.showToast('CERTIFICATE_ALREADY_DOWNLOADED');
      });
  }

  shareTrainingCertificate(course: Course, certificate: CourseCertificate) {
    this.courseService.downloadCurrentProfileCourseCertificate({
      courseId: course.courseId,
      certificateToken: certificate.token
    })
      .subscribe((res) => {
        this.socialShare.share('', '', res.path, '');
      });
  }

  isResource(contentType) {
    return contentType === ContentType.STORY ||
      contentType === ContentType.WORKSHEET;
  }

  /**
   * Navigate to the course/content details page
   */
  navigateToDetailPage(content: any, layoutName: string, index: number): void {
    const identifier = content.contentId || content.identifier;
    let telemetryObject: TelemetryObject;
    if (layoutName === ContentCard.LAYOUT_INPROGRESS) {
      telemetryObject = new TelemetryObject(identifier, ContentType.COURSE, undefined);
    } else {
      const telemetryObjectType = this.isResource(content.contentType) ? ContentType.RESOURCE : content.contentType;
      telemetryObject = new TelemetryObject(identifier, telemetryObjectType, undefined);
    }

    const values = new Map();
    values['sectionName'] = 'Contributions';
    values['positionClicked'] = index;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.CONTENT_CLICKED,
      Environment.USER,
      PageId.PROFILE,
      telemetryObject,
      values);
    if (content.contentType === ContentType.COURSE) {
      const navigationExtras: NavigationExtras = {
        state: {
          content
        }
      };
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], navigationExtras)
    } else if (content.mimeType === MimeType.COLLECTION) {
      const navigationExtras: NavigationExtras = {
        state: {
          content
        }
      };
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          content
        }
      };
      this.router.navigate([RouterLinks.CONTENT_DETAILS], navigationExtras);
    }
  }

  updateLocalProfile(framework) {
    this.profile.framework = framework;
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .toPromise()
      .then((resp: any) => {
        this.formAndFrameworkUtilService.updateLoggedInUser(this.profile, resp)
          .then((success) => {
            console.log('updateLocalProfile-- ', success);
          });
      });
  }


  navigateToCategoriesEditPage() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.EDIT_CLICKED,
        Environment.HOME,
        PageId.PROFILE, null);
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }
  }

  navigateToEditPersonalDetails() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.EDIT_CLICKED,
        Environment.HOME,
        PageId.PROFILE, null);

      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile,
          isShowBackButton: true
        }
      };

      // this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.PERSONAL_DETAILS_EDIT}`], navigationExtras);
      this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
    } else {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }
  }


  /**
   * Searches contents created by the user
   */
  async searchContent() {
    const contentSortCriteria: ContentSortCriteria = {
      sortAttribute: 'lastUpdatedOn',
      sortOrder: SortOrder.DESC
    };

    const contentTypes = await this.formAndFrameworkUtilService.getSupportedContentFilterConfig(
      ContentFilterConfig.NAME_DOWNLOADS);
    const contentSearchCriteria: ContentSearchCriteria = {
      createdBy: [this.userId || this.loggedInUserId],
      limit: 100,
      contentTypes,
      sortCriteria: [contentSortCriteria],
      searchType: SearchType.SEARCH
    };

    this.contentService.searchContent(contentSearchCriteria).toPromise()
      .then((result: ContentSearchResult) => {
        this.contentCreatedByMe = result.contentDataList || [];
      })
      .catch((error: any) => {
        console.error('Error', error);
      });
  }



  async editMobileNumber(event) {
    const componentProps = {
      phone: this.profile.phone,
      title: this.profile.phone ?
        this.commonUtilService.translateMessage('EDIT_PHONE_POPUP_TITLE') :
        this.commonUtilService.translateMessage('ENTER_PHONE_POPUP_TITLE'),
      description: '',
      type: ProfileConstants.CONTACT_TYPE_PHONE,
      userId: this.profile.userId
    };

    await this.showEditContactPopup(componentProps);
  }

  async editEmail(event) {
    const componentProps = {
      email: this.profile.email,
      title: this.profile.email ?
        this.commonUtilService.translateMessage('EDIT_EMAIL_POPUP_TITLE') :
        this.commonUtilService.translateMessage('EMAIL_PLACEHOLDER'),
      description: '',
      type: ProfileConstants.CONTACT_TYPE_EMAIL,
      userId: this.profile.userId
    };

    await this.showEditContactPopup(componentProps);
  }

  async showEditContactPopup(componentProps) {
    const popover = await this.popoverCtrl.create({
      component: EditContactDetailsPopupComponent,
      componentProps,
      cssClass: 'popover-alert input-focus'
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();

    if (data && data.isEdited) {
      this.callOTPPopover(componentProps.type, data.value);
    }
  }

  async callOTPPopover(type: string, key?: any) {
    if (type === ProfileConstants.CONTACT_TYPE_PHONE) {
      const componentProps = {
        key,
        phone: this.profile.phone,
        title: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_TITLE'),
        description: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_PHONE,
        userId: this.profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (data && data.OTPSuccess) {
        this.updatePhoneInfo(data.value);
      }
    } else {
      const componentProps = {
        key,
        phone: this.profile.email,
        title: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_TITLE'),
        description: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_EMAIL,
        userId: this.profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (data && data.OTPSuccess) {
        this.updateEmailInfo(data.value);
      }
    }
  }

  async openContactVerifyPopup(component, componentProps, cssClass) {
    const popover = await this.popoverCtrl.create({ component, componentProps, cssClass });
    await popover.present();
    const { data } = await popover.onDidDismiss();

    return data;
  }

  async updatePhoneInfo(phone) {
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      phone,
      phoneVerified: true
    };
    await this.updateProfile(req, 'PHONE_UPDATE_SUCCESS');
  }

  async updateEmailInfo(email) {
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      email,
      emailVerified: true
    };
    await this.updateProfile(req, 'EMAIL_UPDATE_SUCCESS');
  }

  async updateProfile(request: UpdateServerProfileInfoRequest, successMessage: string) {
    const loader = await this.commonUtilService.getLoader();
    this.profileService.updateServerProfile(request).toPromise()
      .then(async () => {
        await loader.dismiss();
        this.doRefresh();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage(successMessage));
      }).catch(async (e) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
      });
  }

  handleHeaderEvents($event) {
    if ($event.name === 'download') {
      this.redirectToActiveDownloads();
    }
  }

  private redirectToActiveDownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.PROFILE);

    this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
  }

  toggleTooltips(event, field) {
    clearTimeout(this.timer);
    if (field === 'name') {
      this.informationProfileName = !Boolean(this.informationProfileName);
      this.informationOrgName = false;
      if (this.informationProfileName) {
        this.dismissMessage();
      }
    } else if (field === 'org') {
      this.informationOrgName = !Boolean(this.informationOrgName);
      this.informationProfileName = false;
      if (this.informationOrgName) {
        this.dismissMessage();
      }
    } else {
      this.informationProfileName = false;
      this.informationOrgName = false;
    }
    event.stopPropagation();
  }


  dismissMessage() {
    this.timer = setTimeout(() => {
      this.informationProfileName = false;
      this.informationOrgName = false;
    }, 3000);
  }


  getOrgDetails() {
    const orgList = [];
    let orgItemList;
    orgItemList = this.profile.organisations;
    if (orgItemList.length > 1) {
      orgItemList.map((org) => {
        if (this.profile.rootOrgId !== org.organisationId) {
          orgList.push(org);
        }
      });
      orgList.sort((orgDate1, orgdate2) => orgDate1.orgjoindate > orgdate2.organisation ? 1 : -1);
      this.organisationName = orgList[0].orgName;
      this.orgDetails = this.commonUtilService.getOrgLocation(orgList[0]);
    } else if (orgItemList.length === 1) {
      this.organisationName = orgItemList[0].orgName;
      this.orgDetails = this.commonUtilService.getOrgLocation(orgItemList[0]);
    }
  }

  async editRecoveryId() {

    const componentProps = {
      recoveryEmail: this.profile.recoveryEmail ? this.profile.recoveryEmail : '',
      recoveryPhone: this.profile.recoveryPhone ? this.profile.recoveryPhone : '',
    };
    const popover = await this.popoverCtrl.create({
      component: AccountRecoveryInfoComponent,
      componentProps,
      cssClass: 'popover-alert input-focus'
    });

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RECOVERY_ACCOUNT_ID_CLICKED,
      Environment.USER,
      PageId.PROFILE
    );

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.isEdited) {
      const req: UpdateServerProfileInfoRequest = {
        userId: this.profile.userId
      };
      await this.updateProfile(req, 'RECOVERY_ACCOUNT_UPDATE_SUCCESS');
    }
  }

  async showTeacherIdVerificationPopup() {
    const popover = await this.popoverCtrl.create({
      component: TeacherIdVerificationComponent,
      backdropDismiss: false,
      cssClass: 'popover-alert'
    });

    await popover.present();
  }

  async openEnrolledCourse(coursecertificate) {
    try {
      const content = await this.contentService.getContentDetails({ contentId: coursecertificate.courseId }).toPromise();
      const courseParams: NavigationExtras = {
        state: {
          content,
          resumeCourseFlag: (coursecertificate.status === 1 || coursecertificate.status === 0)
        }
      };
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], courseParams);
    } catch (err) {
      console.error(err);
    }
  }

  private async checkForPermissions(): Promise<boolean | undefined> {
    return new Promise<boolean | undefined>(async (resolve, reject) => {
      const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.WRITE_EXTERNAL_STORAGE);
      if (permissionStatus.hasPermission) {
        resolve(true);
      } else if (permissionStatus.isPermissionAlwaysDenied) {
        await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
        resolve(false);
      } else {
        this.showStoragePermissionPopup().then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }

  private async showStoragePermissionPopup(): Promise<boolean | undefined> {
    // await this.popoverCtrl.dismiss();
    return new Promise<boolean | undefined>(async (resolve, reject) => {
      const confirm = await this.commonUtilService.buildPermissionPopover(
        async (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.NOT_NOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.ALLOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE)
              .subscribe(async (status: AndroidPermissionsStatus) => {
                if (status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.ALLOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.APP_PERMISSION_POPUP
                  );
                  resolve(true);
                } else if (status.isPermissionAlwaysDenied) {
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
                  resolve(false);
                } else {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                    InteractType.TOUCH,
                    InteractSubtype.DENY_CLICKED,
                    Environment.SETTINGS,
                    PageId.APP_PERMISSION_POPUP
                  );
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
                }
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', PageId.PROFILE, true
      );
      await confirm.present();
    });
  }

  openSelfDeclareTeacherForm(type) {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }
    const telemetryId = type === 'add' ? ID.BTN_I_AM_A_TEACHER : ID.BTN_UPDATE;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      '',
      Environment.USER,
      PageId.PROFILE,
      undefined,
      undefined,
      undefined,
      undefined,
      telemetryId
    );

    this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SELF_DECLARED_TEACHER_EDIT}/${type}`], {
      state: {
        profile: this.profile
      }
    });
  }

  async getSelfDeclaredTeacherDetails() {
    this.selfDeclaredTeacherDetails = {
      state: '',
      district: '',
      schoolName: '',
      udiseId: '',
      teacherId: ''
    };

    if (this.isCustodianOrgId && this.profile && this.profile.externalIds) {
      let stateCode = '';
      let districtCode = '';
      let stateDetails;
      let districtDetails;

      this.profile.externalIds.forEach(ele => {
        switch (ele.idType) {
          case 'declared-state':
            stateCode = ele.id;
            break;
          case 'declared-district':
            districtCode = ele.id;
            break;
          case 'declared-phone':
            this.selfDeclaredTeacherDetails.mobile = ele.id;
            break;
          case 'declared-email':
            this.selfDeclaredTeacherDetails.email = ele.id;
            break;
          case 'declared-school-name':
            this.selfDeclaredTeacherDetails.schoolName = ele.id;
            break;
          case 'declared-school-udise-code':
            this.selfDeclaredTeacherDetails.udiseId = ele.id;
            break;
          case 'declared-ext-id':
            this.selfDeclaredTeacherDetails.teacherId = ele.id;
            break;
        }
      });
      if (stateCode && this.stateList && this.stateList.length) {
        stateDetails = this.stateList.find(state => state.code === stateCode);
        this.selfDeclaredTeacherDetails.state = (stateDetails && stateDetails.name) || '';
      }
      if (stateDetails && stateDetails.id) {
        const districtList = await this.commonUtilService.getDistrictList(stateDetails.id);
        districtDetails = districtList.find(district => district.code === districtCode);
        this.selfDeclaredTeacherDetails.district = (districtDetails && districtDetails.name) || '';
      }
    }
  }



}
