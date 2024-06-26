import { Component, NgZone, OnInit, Inject, ViewChild } from '@angular/core';
import {
  PopoverController,
  ToastController,
  IonRefresher,
  Platform,
} from '@ionic/angular';
import { Events } from '../../util/events';
import {
  ContentCard,
  ProfileConstants,
  RouterLinks,
  ContentFilterConfig,
  EventTopics,
  OTPTemplates
} from '../../app/app.constant';
import { FormAndFrameworkUtilService } from '../../services/formandframeworkutil.service';
import { AppGlobalService } from '../../services/app-global-service.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { AppHeaderService } from '../../services/app-header.service';
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
  CertificateAlreadyDownloaded,
  NetworkError,
  FormService,
  FrameworkService,
  ProfileType,
  Batch,
  GetLearnerCerificateRequest,
  GenerateOtpRequest,
  CertificateService,
  CSGetLearnerCerificateRequest,
  CsLearnerCertificate,
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkDetailsRequest,
  OrganizationSearchCriteria
} from '@project-sunbird/sunbird-sdk';
import { Environment, InteractSubtype, InteractType, PageId, ID } from '../../services/telemetry-constants';
import { Router } from '@angular/router';
import { EditContactVerifyPopupComponent } from '../../app/components/popups/edit-contact-verify-popup/edit-contact-verify-popup.component';
import {
  EditContactDetailsPopupComponent
} from '../../app/components/popups/edit-contact-details-popup/edit-contact-details-popup.component';
import {
  AccountRecoveryInfoComponent
} from '../components/popups/account-recovery-id/account-recovery-id-popup.component';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AndroidPermissionsService } from '../../services/android-permissions/android-permissions.service';
import {
  AndroidPermissionsStatus,
  AndroidPermission
} from '../../services/android-permissions/android-permission';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from 'common-form-elements';
import { CertificateDownloadAsPdfService } from "@project-sunbird/sb-svg2pdf";
import { NavigationService } from '../../services/navigation-handler.service';
import { ContentUtil } from '../../util/content-util';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { FormConstants } from '../form.constants';
import { ProfileHandler } from '../../services/profile-handler';
import { SegmentationTagService, TagPrefixConstants } from '../../services/segmentation-tag/segmentation-tag.service';
import { FrameworkCategory } from '@project-sunbird/client-services/models/channel';
import { LocationHandler } from '../../services/location-handler';
import { urlConstants } from '../manage-learn/core/constants/urlConstants';
import { UnnatiDataService } from '../manage-learn/core/services/unnati-data.service';
import { ToastService, statusType } from '../manage-learn/core';
import { UtilityService } from '../../services/utility-service';
import { LogoutHandlerService } from '../../services/handlers/logout-handler.service';
import { DeleteUserRequest } from '@project-sunbird/sunbird-sdk/profile/def/delete-user-request';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  providers: [CertificateDownloadAsPdfService]
})
export class ProfilePage implements OnInit {
  private frameworkCategoriesMap: { [code: string]: FrameworkCategory | undefined } = {};

  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

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
  userLocation: any = {};
  appName = '';
  boardList = [];
  mediumList = [];
  gradeLevelList = [];
  subjectList = [];
      loader?: HTMLIonLoadingElement;


  imageUri = 'assets/imgs/ic_profile_default.png';

  readonly DEFAULT_PAGINATION_LIMIT = 3;
  readonly DEFAULT_ENROLLED_COURSE_LIMIT = 3;
  readonly DEFAULT_PROJECTS_LIMIT = 1;
  rolesLimit = 2;
  badgesLimit = 2;
  myLearningLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
  myImprovementsLimit = this.DEFAULT_PROJECTS_LIMIT;
  learnerPassbookLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
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
  mappedTrainingCertificates: {
    courseName: string,
    batch: Batch,
    dateTime: string,
    courseId: string,
    certificate?: string,
    issuedCertificate?: string,
    status: number,
    style: string,
    label: string
  }[] = [];
  isDefaultChannelProfile: boolean;
  personaTenantDeclaration: string;
  selfDeclaredDetails: any[] = [];
  selfDeclarationInfo: any;
  learnerPassbook: any[] = [];
  learnerPassbookCount: any;
  enrolledCourseList = [];
  categories = [];
  projects=[];
  projectsCount =0;
  projectStatus =statusType;
  isCategoryLoaded = false;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('FORM_SERVICE') private formService: FormService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('CERTIFICATE_SERVICE') private certificateService: CertificateService,
    private zone: NgZone,
    private router: Router,
    private popoverCtrl: PopoverController,
    private events: Events,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    public commonUtilService: CommonUtilService,
    private socialSharing: SocialSharing,
    private headerService: AppHeaderService,
    private permissionService: AndroidPermissionsService,
    private appVersion: AppVersion,
    private navService: NavigationService,
    private sbProgressLoader: SbProgressLoader,
    private fileOpener: FileOpener,
    private toastController: ToastController,
    private translate: TranslateService,
    private certificateDownloadAsPdfService: CertificateDownloadAsPdfService,
    private profileHandler: ProfileHandler,
    private segmentationTagService: SegmentationTagService,
    private platform: Platform,
    private locationHandler: LocationHandler,
    private unnatiDataService : UnnatiDataService,
    private utilityService: UtilityService,
    private logoutHandler: LogoutHandlerService,
    private toast: ToastService,
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

    this.events.subscribe('onAfterLanguageChange:update', async () => {
      await this.refreshProfileData();
    });

    this.events.subscribe('loggedInProfile:update', async (framework) => {
      if (framework) {
        this.updateLocalProfile(framework);
        await this.refreshProfileData();
      } else {
        await this.doRefresh();
      }
    });

    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async (data) => {
      await this.doRefresh();
    });

    this.formAndFrameworkUtilService.getCustodianOrgId().then((orgId: string) => {
      this.custodianOrgId = orgId;
    });

  }

  async ngOnInit() {
    await this.doRefresh();
    // this.getCategories();
    this.appName = await this.appVersion.getAppName();
  }

  async ionViewWillEnter() {
   // this.getCategories();
    this.events.subscribe('update_header', async () => {
      await this.headerService.showHeaderWithHomeButton();
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(async eventName => {
      await this.handleHeaderEvents(eventName);
    });
    await this.headerService.showHeaderWithHomeButton();
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
        return new Promise<void>(async (resolve) => {
          setTimeout(async () => {
            this.events.publish('refresh:profile');
            this.refresh = false;
            await loader.dismiss();
            await this.sbProgressLoader.hide({ id: 'login' });
            resolve();
          }, 500);
          // This method is used to handle trainings completed by user
          await this.getLearnerPassbook();
          await this.getEnrolledCourses(refresher);
          await this.searchContent();
          await this.getSelfDeclaredDetails();
          this.getProjectsCertificate();
        });
      })
      .catch(async error => {
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
    return new Promise<void>((resolve, reject) => {
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
            .then(async (profileData) => {
              await that.zone.run(async () => {
                that.resetProfile();
                that.profile = profileData;
                this.getCategories();
                // ******* Segmentation
                let segmentDetails = JSON.parse(JSON.stringify(profileData.framework));
                Object.keys(segmentDetails).forEach((key) => {
                  if (key !== 'id' && Array.isArray(segmentDetails[key])) {
                  segmentDetails[key] = segmentDetails[key].map( x => x.replace(/\s/g, '').toLowerCase());
                  }
                });
                window['segmentation'].SBTagService.pushTag(segmentDetails, TagPrefixConstants.USER_ATRIBUTE, true);
                let userLocation = [];
                (profileData['userLocations'] || []).forEach(element => {
                  userLocation.push({ name: element.name, code: element.code });
                });
                window['segmentation'].SBTagService.pushTag({ location: userLocation }, TagPrefixConstants.USER_LOCATION, true);
                window['segmentation'].SBTagService.pushTag(profileData.profileUserType.type, TagPrefixConstants.USER_ROLE, true);
                await this.segmentationTagService.evalCriteria();
                // *******
                await that.frameworkService.setActiveChannelId(profileData.rootOrg.hashTagId).toPromise();
                that.isDefaultChannelProfile = await that.profileService.isDefaultChannelProfile().toPromise();
                const role: string = (!that.profile.profileUserType.type ||
                  (that.profile.profileUserType.type
                    && that.profile.profileUserType.type === ProfileType.OTHER.toUpperCase())) ? '' : that.profile.profileUserType.type;
                that.profile['persona'] =  await that.profileHandler.getPersonaConfig(role.toLowerCase());
                that.userLocation = that.commonUtilService.getUserLocation(that.profile);

                that.profile['subPersona'] = await that.profileHandler.getSubPersona(this.profile,
                      role.toLowerCase(), this.userLocation);
                that.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
                  .then((activeProfile) => {
                    that.formAndFrameworkUtilService.updateLoggedInUser(profileData, activeProfile)
                      .then((frameWorkData) => {
                        if (!frameWorkData['status']) {

                        }
                      }).catch(e => console.error(e));
                    that.formatRoles();
                    that.getOrgDetails();
                    that.isCustodianOrgId = (that.profile.rootOrg.rootOrgId === this.custodianOrgId);
                    that.isStateValidated = that.profile.stateValidated;
                    resolve();
                  }).catch(e => console.error(e));
                  if(profileData && profileData.framework && Object.keys(profileData.framework).length == 0 && this.isCustodianOrgId) {
                    await this.getFrameworkDetails();
                  }
              });
            }).catch(err => {
              if (refresher) {
                refresher.target.complete();
              }
              reject();
            });
        }
      }).catch(e => console.error(e));
    });
  }

  /**
   * Method to store all roles from different organizations into single array
   */
  formatRoles() {
    this.roles = [];
    if (this.profile && this.profile.roleList) {
      const roles = {};
      this.profile.roleList.forEach((r) => {
        roles[r.id] = r;
      });
      if (this.profile.roles && this.profile.roles.length) {
        for (let i = 0, len = this.profile.roles.length; i < len; i++) {
          const roleKey = this.profile.roles[i].role;
          const val = roles[roleKey];
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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null);
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
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null);
  }

  showLessBadges(): void {
    this.badgesLimit = this.DEFAULT_PAGINATION_LIMIT;
  }

  async showMoreTrainings(listName): Promise<void> {
    switch (listName) {
      case 'myLearning':
        this.myLearningLimit = this.mappedTrainingCertificates.length;
        break;
      case 'learnerPassbook':
        await this.getLearnerPassbook();
        this.learnerPassbookLimit = this.learnerPassbook.length;
        break;
        case 'myImprovements':
          this.myImprovementsLimit = this.projects.length;
          break;
    }
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null);
  }

  async showLessTrainings(listName): Promise<void> {
    switch (listName) {
      case 'myLearning':
        this.myLearningLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
        break;
      case 'learnerPassbook':
        this.learnerPassbookLimit = this.DEFAULT_ENROLLED_COURSE_LIMIT;
        this.learnerPassbookCount = null;
        await this.getLearnerPassbook();
        break;
    }
  }

  /**
   * To get enrolled course(s) of logged-in user i.e, trainings in the UI.
   *
   * It internally calls course handler of genie sdk
   */
  async getEnrolledCourses(refresher?, refreshCourseList?) {
    const loader = await this.commonUtilService.getLoader();
    if (refreshCourseList) {
      await loader.present();
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.REFRESH_CLICKED,
        Environment.USER,
        PageId.PROFILE
      );
    }
    const option = {
      userId: this.profile.userId || this.profile.id,
      returnFreshCourses: !!refresher
    };
    this.mappedTrainingCertificates = [];
    this.courseService.getEnrolledCourses(option).toPromise()
      .then(async (res: Course[]) => {
        if (res.length) {
          this.enrolledCourseList = res.sort((a, b) => (a.enrolledDate > b.enrolledDate ? -1 : 1));
          this.mappedTrainingCertificates = this.mapTrainingsToCertificates(res);
        }
        if (refreshCourseList) {
          await loader.dismiss();
        } 
      })
      .catch((error: any) => {
        console.error('error while loading enrolled courses', error);
      });
  }

  mapTrainingsToCertificates(trainings: Course[]) {
    /**
     * If certificate is there loop through certificates and add certificates in accumulator
     * with Course_Name and Date
     * if not then add only Course_Name and Date and add in to the accumulator
     */
    return trainings.reduce((accumulator, course) => {
      const oneCert = {
        courseName: course.courseName,
        batch: course.batch,
        dateTime: course.dateTime,
        courseId: course.courseId,
        certificate: undefined,
        issuedCertificate: undefined,
        status: course.status,
        style: 'completed-status-text',
        label: 'COMPLETED'
      };
      if(course.status === 0 || course.status === 1) {
        oneCert.style = 'ongoing-status-text';
        oneCert.label = 'ONGOING';
        if(course.batch && course.batch.status === 2) {
          oneCert.style = 'ongoing-status-text';
          oneCert.label = 'BATCH_EXPIRED';
        }
      }
      if (course.certificates && course.certificates.length) {
        oneCert.certificate = course.certificates[0];
      }
      if (course.issuedCertificates && course.issuedCertificates.length) {
        oneCert.issuedCertificate = course.issuedCertificates[0];
      }
      accumulator = accumulator.concat(oneCert);
      return accumulator;
    }, []);
  }

  verifyUser() {
    if (this.profile.roles && this.profile.roles.length === 0) {
        this.launchDeleteUrl();
    } else {
        this.toast.showMessage('FRMELEMNTS_LBL_DELETE_AUTH', 'danger');
    }
}

async launchDeleteUrl() {
  this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,   //telemetry for delete button clicked
    InteractSubtype.DELETE_CLICKED,
    undefined,
    PageId.PROFILE,
    undefined,
    undefined,
    undefined,
    undefined,
    ID.DELETE_CLICKED);

  const baseUrl = await this.utilityService.getBuildConfigValue('BASE_URL');
  const deeplinkValue = await this.utilityService.getBuildConfigValue('URL_SCHEME');
  const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const deleteEndpoint = 'guest-profile/delete-user';

  var data = { type: '', value: '' };
  if (this.profile.maskedEmail) {
    data.type = 'email';
    data.value = this.profile.maskedEmail;
  } else if (this.profile.maskedPhone) {
    data.type = 'phone';
    data.value = this.profile.maskedPhone;
  }

  const modifiedDeeplinkValue = deeplinkValue + '://mobile';
  const url = new URL(formattedBaseUrl + deleteEndpoint);
  url.searchParams.append('deeplink', modifiedDeeplinkValue);
  url.searchParams.append('userId', this.profile.userId);
  url.searchParams.append('type', data.type);
  url.searchParams.append('value', data.value);

  const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

  const inAppBrowserRef = (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  inAppBrowserRef.addEventListener('loadstart', async (event) => {
    if ((<string>event.url).indexOf(`${deeplinkValue}//mobile`) > -1) {
      const loadedURL = new URL((<string>event.url));
      const urlSearchParams = loadedURL.searchParams;
      const userId = urlSearchParams.get("userId");
      inAppBrowserRef.close();
      this.profileService.getActiveProfileSession().toPromise()   //getting active profile uid
      .then(async (profile) => {
        try {
          if (profile.uid === userId) {       //if active profile uid and user is deleted
            this.loader = this.commonUtilService.getLoader();
            if (this.loader) {
              this.logoutHandler.onLogout();
              let req: DeleteUserRequest;
              if (profile.uid) {
                req = {
                  userId: profile.uid
                };
              }
              else {
                console.log('profile does not exists');
              }
              await this.profileService.deleteUser(req).toPromise()
                .then((result) => {
                  if (result) {
                    console.log('profile deleted succesfully');
                    this.profileService.deleteProfileData(profile.uid).toPromise()       //deleting local data
                      .then((result) => {
                        if (result) {
                          console.log('Profile data deleted successfully');
                        } else {
                          console.log('Unable to delete profile data');
                        }
                      });
                  }
                  else {
                    console.log('unable to delete profile');
                  }
                })
            }
          }
          else {
            console.log('userID does not match')
          }
        } catch (error) {
          console.error('Error occurred while deleting profile', error);
        }
      })
      .catch((error) => {
        console.error('Error occurred while getting active profile session:', error);
      });
    }

  });
  customtabs.launchInBrowser(
    url.toString(),
    (callbackUrl) => {
      const params = new URLSearchParams(callbackUrl); // Parse the callbackUrl as URLSearchParams
      const userId = params.get('userId'); // Get the value of 'userId' parameter
      this.profileService.getActiveProfileSession().toPromise()   //getting active profile uid
        .then(async (profile) => {
          try {
            if (profile.uid === userId) {       //if active profile uid and user is deleted
              this.loader = this.commonUtilService.getLoader();
              if (this.loader) {
                this.logoutHandler.onLogout();
                let req: DeleteUserRequest;
                if (profile.uid) {
                  req = {
                    userId: profile.uid
                  };
                }
                else {
                  console.log('profile does not exists');
                }
                await this.profileService.deleteUser(req).toPromise()
                  .then((result) => {
                    if (result) {
                      console.log('profile deleted succesfully');
                      this.profileService.deleteProfileData(profile.uid).toPromise()       //deleting local data
                        .then((result) => {
                          if (result) {
                            console.log('Profile data deleted successfully');
                          } else {
                            console.log('Unable to delete profile data');
                          }
                        });
                    }
                    else {
                      console.log('unable to delete profile');
                    }
                  })
              }
            }
            else {
              console.log('userID does not match')
            }
          } catch (error) {
            console.error('Error occurred while deleting profile', error);
          }
        })
        .catch((error) => {
          console.error('Error occurred while getting active profile session:', error);
        });
    },
    (error) => {
      console.error('Error launching Custom Tab:', error);
    }
  );
}


  async getLearnerPassbook() {
    try {
      const request: GetLearnerCerificateRequest = { userId: this.profile.userId || this.profile.id };
      request.size = this.learnerPassbookCount ? this.learnerPassbookCount : null;
      const getCertsReq: CSGetLearnerCerificateRequest = {
        userId: this.profile.userId || this.profile.id,
        schemaName: 'certificate',
        size: this.learnerPassbookCount? this.learnerPassbookCount : null
      };



      await this.certificateService.getCertificates(getCertsReq).toPromise().then(response => {
        this.learnerPassbookCount = response.certRegCount + response.rcCount || null;

        this.learnerPassbook = response.certificates
          .map((learnerCertificate: CsLearnerCertificate) => {
            const oneCert: any = {
              issuingAuthority: learnerCertificate.issuerName,
              issuedOn: learnerCertificate.issuedOn,
              courseName: learnerCertificate.trainingName,
              courseId: learnerCertificate.courseId,
            };
            if (learnerCertificate.pdfUrl) {
              oneCert.certificate = {
                url: learnerCertificate.pdfUrl || undefined,
                id: learnerCertificate.id || undefined,
                identifier: learnerCertificate.id,
                issuedOn: learnerCertificate.issuedOn,
                name: learnerCertificate.issuerName,
                type: learnerCertificate.type,
                templateUrl: learnerCertificate.templateUrl
              };
            } else {
              oneCert.issuedCertificate = {
                identifier: learnerCertificate.id,
                name: learnerCertificate.issuerName,
                issuedOn: learnerCertificate.issuedOn,
                type: learnerCertificate.type,
                templateUrl: learnerCertificate.templateUrl
              };
            }
            return oneCert;
          });
      });
    } catch (error) {
      console.log('Learner Passbook API Error', error);
    }
  }

  async downloadCertificate(data,type?){
    if(type && type == 'project'){
      await this.projectCertificateDownload(data);
    }else{
      await this.downloadTrainingCertificate(data)
    }
  }
  async projectCertificateDownload(project) {
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.commonUtilService.showToast('OFFLINE_CERTIFICATE_MESSAGE', false, '', 3000, 'top');
      return;
    }
    if(this.commonUtilService.isAndroidVer13()) {
      await this.navigateToCertificateViewPage(project);
    } else {
      await this.checkForPermissions().then(async (result) => {
        if (result) {
          await this.navigateToCertificateViewPage(project);
        } else {
          await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
        }
      });
    }
  }

  async navigateToCertificateViewPage(project: any) {
    const request = { type:'project',name:project.title, project: project._id, certificate: project.certificate, templateUrl : project.certificate.templateUrl };
    if (this.platform.is('ios')) {
      (window as any).cordova.InAppBrowser.open(request.certificate['templateUrl'], '_blank', "toolbarposition=top");
    } else {
      await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CERTIFICATE_VIEW}`], {
        state: { request }
      });
    }
  }
  async downloadTrainingCertificate(course: {
    courseName: string,
    dateTime: string,
    courseId: string,
    certificate?: CourseCertificate,
    issuedCertificate?: CourseCertificate,
    status: number
  }) {
    const telemetryObject: TelemetryObject = new TelemetryObject(course.courseId, 'Certificate', undefined);

    const values = new Map();
    values['courseId'] = course.courseId;

    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.DOWNLOAD_CERTIFICATE_CLICKED,
      Environment.USER,
      PageId.PROFILE,
      telemetryObject,
      values);

      if(this.commonUtilService.isAndroidVer13()) {
        await this.navigateToDownlaodCertificateView(course);
      } else {
        await this.checkForPermissions().then(async (result) => {
          if (result) {
            await this.navigateToDownlaodCertificateView(course)
          } else {
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
          }
        });
      }
  }

  async navigateToDownlaodCertificateView(course) {
    if (course.issuedCertificate) {
      const request = { courseId: course.courseId, certificate: course.issuedCertificate };
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        if (!(await this.courseService.certificateManager.isCertificateCached(request).toPromise())) {
          this.commonUtilService.showToast('OFFLINE_CERTIFICATE_MESSAGE', false, '', 3000, 'top');
          return;
        }
      }
      await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CERTIFICATE_VIEW}`], {
        state: { request }
      });
    } else {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast('OFFLINE_CERTIFICATE_MESSAGE', false, '', 3000, 'top');
        return;
      }
      const downloadMessage = await this.translate.get('CERTIFICATE_DOWNLOAD_INFO').toPromise();
      const toastOptions = {
        message: downloadMessage || 'Certificate getting downloaded'
      };
      const toast = await this.toastController.create(toastOptions);
      await toast.present();

      await this.downloadLegacyCertificate(course, toast);
    }
  }

  private async downloadLegacyCertificate(course, toast) {
    const downloadRequest = {
      courseId: course.courseId,
      certificate: course.certificate
    };
    this.courseService.downloadCurrentProfileCourseCertificate(downloadRequest).toPromise()
      .then(async (res) => {
        if (toast) {
          await toast.dismiss();
        }
        this.openpdf(res.path);
      }).catch(async (err) => {
        await this.handleCertificateDownloadIssue(toast, err);
      });
  }

  private async handleCertificateDownloadIssue(toast: any, err: any) {
    if (toast) {
      await toast.dismiss();
    }
    if (err instanceof CertificateAlreadyDownloaded) {
      this.openpdf(err.filePath);
    } else if (NetworkError.isInstance(err)) {
      this.commonUtilService.showToast('OFFLINE_CERTIFICATE_MESSAGE', false, '', 3000, 'top');
    } else {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
    }
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

  /**
   * Navigate to the course/content details page
   */
  async navigateToDetailPage(content: any, layoutName: string, index: number): Promise<void> {
    const identifier = content.contentId || content.identifier;
    let telemetryObject: TelemetryObject;
    if (layoutName === ContentCard.LAYOUT_INPROGRESS) {
      telemetryObject = new TelemetryObject(identifier, CsPrimaryCategory.COURSE, undefined);
    } else {
      telemetryObject = ContentUtil.getTelemetryObject(content);
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
    await this.navService.navigateToDetailPage(
      content,
      {
        content
      }
    );
  }

  updateLocalProfile(framework) {
    this.profile.framework = framework;
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
      .toPromise()
      .then((resp: any) => {
        if (framework.userType) {
          resp.profileType = framework.userType;
        }
        this.formAndFrameworkUtilService.updateLoggedInUser(this.profile, resp)
          .then((success) => {
            console.log('updateLocalProfile-- ', success);
          }).catch(e => console.error(e));
      }).catch(e => console.error(e));
  }


  async navigateToCategoriesEditPage() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
        InteractSubtype.EDIT_CLICKED,
        Environment.HOME,
        PageId.PROFILE, null);
      await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }
  }

  async onEditProfileClicked() {
    await this.navService.navigateToEditPersonalDetails(this.profile, PageId.PROFILE);
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

  async editMobileNumber() {
    const componentProps = {
      phone: this.profile.phone,
      title: this.commonUtilService.translateMessage('UPDATE_PHONE_POPUP_TITLE'),
      description: this.commonUtilService.translateMessage('ERROR_RECOVERY_ID_PHONE_INVALID'),
      type: ProfileConstants.CONTACT_TYPE_PHONE,
      userId: this.profile.userId
    };

    this.validateAndEditContact()
    .then((_) => this.showEditContactPopup(componentProps))
    .catch(err => console.log(err) );
  }

  async editEmail() {
    const componentProps = {
      email: this.profile.email,
      title: this.commonUtilService.translateMessage('UPDATE_EMAIL_POPUP_TITLE'),
      description: this.commonUtilService.translateMessage('EMAIL_PLACEHOLDER'),
      type: ProfileConstants.CONTACT_TYPE_EMAIL,
      userId: this.profile.userId
    };

    this.validateAndEditContact()
    .then((_) => this.showEditContactPopup(componentProps))
    .catch(e => {
      if (e && e.response && e.response.body && e.response.body.params && e.response.body.params.err &&
        e.response.body.params.err === 'UOS_OTPCRT0059') {
        this.commonUtilService.showToast('ERROR_OTP_LIMIT_EXCEEDED');
      } else if (e.message !== 'CANCEL') {
        this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
      }
    });
  }

  private async validateAndEditContact(): Promise<boolean> {
        const request: GenerateOtpRequest = {
            key: this.profile.email || this.profile.phone || this.profile.recoveryEmail,
            userId: this.profile.userId,
            templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE,
            type: ''
        };
        if ((this.profile.email && !this.profile.phone) ||
        (!this.profile.email && !this.profile.phone && this.profile.recoveryEmail)) {
            request.type = ProfileConstants.CONTACT_TYPE_EMAIL;
        } else if (this.profile.phone || this.profile.recoveryPhone) {
            request.type = ProfileConstants.CONTACT_TYPE_PHONE;
        }

        const resp = await this.profileService.generateOTP(request).toPromise();
        if (resp) {
            const response = await this.callOTPPopover(request.type, request.key, false);
            if (response && response.OTPSuccess) {
                return Promise.resolve(true);
            } else {
                return Promise.reject(true);
            }
        }
  }

  private async showEditContactPopup(componentProps) {
    const popover = await this.popoverCtrl.create({
      component: EditContactDetailsPopupComponent,
      componentProps,
      cssClass: 'popover-alert input-focus',
      translucent: true
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();

    if (data && data.isEdited) {
      await this.callOTPPopover(componentProps.type, data.value);
    }
  }

  private async callOTPPopover(type: string, key?: any, updateContact: boolean = true) {
    if (type === ProfileConstants.CONTACT_TYPE_PHONE) {
      const componentProps = {
        key,
        phone: this.profile.phone,
        title: !updateContact ? this.commonUtilService.translateMessage('AUTHRISE_USER_OTP_TITLE') :
            this.commonUtilService.translateMessage('AUTHRISE_USER_OTP_DESCRIPTION'),
        description: !updateContact ? this.commonUtilService.translateMessage('AUTHRISE_USER_OTP_DESCRIPTION') :
            this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_PHONE,
        userId: this.profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (updateContact && data && data.OTPSuccess) {
        await this.updatePhoneInfo(data.value);
      }
    } else {
      const componentProps = {
        key,
        phone: this.profile.email,
        title: !updateContact ? this.commonUtilService.translateMessage('AUTHRISE_USER_OTP_TITLE') :
            this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_TITLE'),
        description: !updateContact ? this.commonUtilService.translateMessage('AUTHRISE_USER_OTP_DESCRIPTION') :
            this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_DESCRIPTION'),
        type: ProfileConstants.CONTACT_TYPE_EMAIL,
        userId: this.profile.userId
      };

      const data = await this.openContactVerifyPopup(EditContactVerifyPopupComponent, componentProps, 'popover-alert input-focus');
      if (updateContact && data && data.OTPSuccess) {
        await this.updateEmailInfo(data.value);
      }
      return data;
    }
  }

  private async openContactVerifyPopup(component, componentProps, cssClass) {
    const popover = await this.popoverCtrl.create({ component, componentProps, cssClass });
    await popover.present();
    const { data } = await popover.onDidDismiss();

    return data;
  }

  private async updatePhoneInfo(phone) {
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      phone,
      phoneVerified: true
    };
    await this.updateProfile(req, 'PHONE_UPDATE_SUCCESS');
  }

  private async updateEmailInfo(email) {
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      email,
      emailVerified: true
    };
    await this.updateProfile(req, 'EMAIL_UPDATE_SUCCESS');
  }

  private async updateProfile(request: UpdateServerProfileInfoRequest, successMessage: string) {
    const loader = await this.commonUtilService.getLoader();
    this.profileService.updateServerProfile(request).toPromise()
      .then(async () => {
        await loader.dismiss();
        await this.doRefresh();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage(successMessage));
      }).catch(async () => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
      });
  }

  async handleHeaderEvents($event) {
    if ($event.name === 'download') {
      await this.redirectToActiveDownloads();
    }
  }

  private async redirectToActiveDownloads() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
      Environment.HOME,
      PageId.PROFILE);

    await this.router.navigate([RouterLinks.ACTIVE_DOWNLOADS]);
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


  private dismissMessage() {
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

    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.RECOVERY_ACCOUNT_ID_CLICKED,
        Environment.USER,
        PageId.PROFILE
    );

    const componentProps = {
      recoveryEmail: this.profile.recoveryEmail ? this.profile.recoveryEmail : '',
      recoveryPhone: this.profile.recoveryPhone ? this.profile.recoveryPhone : '',
    };

    this.validateAndEditContact()
    .then(async (_) => {
        const popover = await this.popoverCtrl.create({
          component: AccountRecoveryInfoComponent,
          componentProps,
          cssClass: 'popover-alert input-focus'
        });
        await popover.present();

        const { data } = await popover.onDidDismiss();
        if (data && data.isEdited) {
          const req: UpdateServerProfileInfoRequest = {
            userId: this.profile.userId
          };
          await this.updateProfile(req, 'RECOVERY_ACCOUNT_UPDATE_SUCCESS');
        }
    })
    .catch(err => console.log(err) );
  }

  async openEnrolledCourse(training) {
    try {
      const content = this.enrolledCourseList.find((course) => (course.courseId === training.courseId)
          && training.batch.batchId === course.batch.batchId);
      await this.navService.navigateToTrackableCollection(
        {
          content
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  private async checkForPermissions(): Promise<boolean | undefined> {
    if(this.platform.is('ios')) {
      return new Promise<boolean | undefined>(async (resolve, reject) => {
        resolve(true);
      });
    }
    return new Promise<boolean | undefined>(async (resolve) => {
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
        }).catch(err => console.error(err));
      }
    });
  }

  private async showStoragePermissionPopup(): Promise<boolean | undefined> {
    return new Promise<boolean | undefined>(async (resolve) => {
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
            this.appGlobalService.isNativePopupVisible = true;
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
                this.appGlobalService.setNativePopupVisible(false);
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage
        ('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', PageId.PROFILE, true
      );
      await confirm.present();
    });
  }

  async openSelfDeclareTeacherForm(type) {
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

    await this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.SELF_DECLARED_TEACHER_EDIT}/${type}`], {
      state: {
        profile: this.profile
      }
    });
  }

  async getSelfDeclaredDetails() {

    if (this.isCustodianOrgId && this.profile && this.profile.declarations && this.profile.declarations.length) {
      this.selfDeclarationInfo = this.profile.declarations[0];
      const tenantPersonaList = await this.formAndFrameworkUtilService.getFormFields(
        FormConstants.TENANT_PERSONAINFO, this.profile.rootOrg.rootOrgId);
      const tenantConfig: any = tenantPersonaList.find(config => config.code === 'tenant');
      const searchOrganizationReq: OrganizationSearchCriteria<{ orgName: string, rootOrgId: string}> = {
        filters: {
            isTenant: true
        },
        fields: ['orgName', 'rootOrgId']
    };
      const organisations = (await this.frameworkService.searchOrganization(searchOrganizationReq).toPromise()).content;
      let index = 0;
      const organisationList = organisations.map((org) => ({
        value: org.rootOrgId,
        label: org.orgName,
        index: index++
      }));
      index = 0;
      tenantConfig.templateOptions.options = organisationList;
      const tenantDetails = tenantConfig.templateOptions && tenantConfig.templateOptions.options &&
        tenantConfig.templateOptions.options.find(tenant => tenant.value === this.selfDeclarationInfo.orgId);

      this.personaTenantDeclaration = this.commonUtilService.translateMessage('FRMELEMNTS_LBL_SHARE_DATA_WITH', {
          '%tenant': (tenantDetails && tenantDetails.label) || ''
        });

      if (this.selfDeclarationInfo.orgId) {
        const formConfig = await this.formAndFrameworkUtilService.getFormFields(
          FormConstants.SELF_DECLARATION, this.selfDeclarationInfo.orgId);
        const externalIdConfig = formConfig.find(config => config.code === 'externalIds');
        this.selfDeclaredDetails = [];
        (externalIdConfig.children as FieldConfig<any>[]).forEach(config => {
          if (this.profile.declarations[0].info[config.code]) {
            this.selfDeclaredDetails.push({ name: config.fieldName, value: this.profile.declarations[0].info[config.code] });
          }
        });
      }
    }
  }

  async shareUsername() {
    let fullName = this.profile.firstName;
    if (this.profile.lastName) {
      fullName = fullName + ' ' + this.profile.lastName;
    }
    const translatedMsg = this.commonUtilService.translateMessage('SHARE_USERNAME', {
      app_name: this.appName,
      user_name: fullName,
      sunbird_id: this.profile.userName
    });
    await this.socialSharing.share(translatedMsg);
  }

  private async getFrameworkDetails() {
    const guestUser = await this.commonUtilService.getGuestUserConfig();
    let id = "";
      id = guestUser.syllabus[0];
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: id,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    await this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then(async (framework: Framework) => {
        this.frameworkCategoriesMap = framework.categories.reduce((acc, category) => {
          acc[category.code] = category;
          return acc;
        }, {});
        this.profile.framework.board = [];
        this.profile.framework.medium = [];
        this.profile.framework.grade = [];
        this.profile.framework.subject = [];
        setTimeout(() => {
          this.boardList = this.getFieldDisplayValues(guestUser.board, 'board');
          this.mediumList = this.getFieldDisplayValues(guestUser.medium, 'medium');
          this.gradeLevelList = this.getFieldDisplayValues(guestUser.grade, 'gradeLevel');
          this.subjectList = this.getFieldDisplayValues(guestUser.subject, 'subject');
          this.profile.framework.board = this.boardList;
          this.profile.framework.medium = this.mediumList;
          this.profile.framework.gradeLevel = this.gradeLevelList;
          this.profile.framework.grade = this.gradeLevelList;
          this.profile.framework.subject = this.subjectList;
        }, 0);
      });
      this.profile.userLocations = await this.locationHandler.getAvailableLocation(guestUser, true);
      this.userLocation = this.commonUtilService.getUserLocation(this.profile);
      this.profile['persona'] =  await this.profileHandler.getPersonaConfig(guestUser.profileType.toLowerCase());
  }

  getFieldDisplayValues(field: Array<any>, categoryCode: string, lowerCase?: boolean): any[] {
    const displayValues = [];

    if (!this.frameworkCategoriesMap[categoryCode]) {
      return displayValues;
    }

    this.frameworkCategoriesMap[categoryCode].terms.forEach(element => {
      if (field.includes(element.code) || field.includes(element.name.replace(/[^a-zA-Z0-9]/g,'').toLowerCase())) {
        if (lowerCase) {
          displayValues.push(element.name.toLowerCase());
        } else {
          displayValues.push(element.name);
        }
      }
    });

    return displayValues;
  }

  private getCategories() {
      this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(this.profile.framework.id[0] || this.profile.syllabus[0], this.profile.rootOrgId).then((categories) => {
        this.categories = categories;
        this.isCategoryLoaded = true;
      }).catch(e => console.error(e));
  }
  
  getProjectsCertificate(){
    const config ={
      url : urlConstants.API_URLS.PROJECT_CERTIFICATES
    }
    this.unnatiDataService.get(config).subscribe(resp =>{
      this.projects =  resp.result.data;
    })
  }
}