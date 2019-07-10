// import { ActiveDownloadsPage } from './../active-downloads/active-downloads';
import { Component, NgZone, OnInit, AfterViewInit, Inject } from '@angular/core';
import {
  Events,
  LoadingController,
  PopoverController,
} from '@ionic/angular';
import { OverflowMenuComponent } from './overflow-menu/overflow-menu.component';
import { generateInteractTelemetry } from '../telemetryutil';
import { ContentCard, ContentType, MenuOverflow, MimeType, ProfileConstants, RouterLinks } from '../app.constant';
// import { CategoriesEditPage } from '@app/pages/categories-edit/categories-edit';
import { PersonalDetailsEditPage } from './personal-details-edit/personal-details-edit.page';
// import { EnrolledCourseDetailsPage } from '@app/pages/enrolled-course-details/enrolled-course-details';
// import { CollectionDetailsPage } from '@app/pages/collection-details/collection-details';
// import { CollectionDetailsEtbPage } from '@app/pages/collection-details-etb/collection-details-etb';
// import { ContentDetailsPage } from '@app/pages/content-details/content-details';
import { FormAndFrameworkUtilService, AppGlobalService, CommonUtilService, TelemetryGeneratorService, AppHeaderService } from '../../services';
import { } from '../../services';
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
  CachedItemRequestSourceFrom
} from 'sunbird-sdk';
import { Environment, ImpressionType, InteractSubtype, InteractType, PageId } from '../../services';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { EditContactDetailsPopupComponent } from '../components/edit-contact-details-popup/edit-contact-details-popup.component';
import { EditContactVerifyPopupComponent } from '../components/edit-contact-verify-popup/edit-contact-verify-popup.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  profile: any = {};
  /**
   * Contains userId for the Profile
   */
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
  trainingsCompleted = [];
  roles = [];
  userLocation = {
    state: {},
    district: {}
  };

  /**
   * Contains paths to icons
   */
  imageUri = 'assets/imgs/ic_profile_default.png';

  readonly DEFAULT_PAGINATION_LIMIT = 2;
  rolesLimit = 2;
  badgesLimit = 2;
  trainingsLimit = 2;
  startLimit = 0;
  custodianOrgId: string;
  isCustodianOrgId: boolean;
  organisationDetails = '';
  contentCreatedByMe: any = [];
  orgDetails: {
    'state': '',
    'district': '',
    'block': ''
  };

  layoutPopular = ContentCard.LAYOUT_POPULAR;
  headerObservable: any;
  timer: any;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private popoverCtrl: PopoverController,
    private zone: NgZone,
    private events: Events,
    private appGlobalService: AppGlobalService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private commonUtilService: CommonUtilService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userId = this.router.getCurrentNavigation().extras.state.userId || '';
    this.isRefreshProfile = this.router.getCurrentNavigation().extras.state.returnRefreshedUserProfileDetails;
    this.isLoggedInUser = !this.userId;

    // Event for optional and forceful upgrade
    this.events.subscribe('force_optional_upgrade', async (upgrade) => {
      if (upgrade) {
        await this.appGlobalService.openPopover(upgrade);
      }
    });

    this.events.subscribe('loggedInProfile:update', (framework) => {
      this.updateLocalProfile(framework);
      this.refreshProfileData();
    });

    this.formAndFrameworkUtilService.getCustodianOrgId().then((orgId: string) => {
      this.custodianOrgId = orgId;
    });

  }

  ngOnInit() {
    this.doRefresh();
    this.events.subscribe('profilePicture:update', (res) => {
      if (res.isUploading && res.url !== '') {
        this.imageUri = res.url;
      }
    });
  }

  ionViewWillEnter() {
    this.events.subscribe('update_header', (data) => {
      this.headerService.showHeaderWithHomeButton();
    });
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.headerService.showHeaderWithHomeButton();
  }

  ionViewWillLeave(): void {
    this.headerObservable.unsubscribe();
    this.events.unsubscribe('update_header');
  }


  async doRefresh(refresher?) {
    const loader = await this.commonUtilService.getLoader();
    this.isRefreshProfile = true;
    if (!refresher) {
      await loader.present();
    } else {
      this.telemetryGeneratorService.generatePullToRefreshTelemetry(PageId.PROFILE, Environment.HOME);
      refresher.complete();
      this.refresh = true;
    }
    return this.refreshProfileData(refresher)
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            this.events.publish('refresh:profile');
            this.refresh = false;
            await loader.dismiss();
            resolve();
          }, 500);
          // This method is used to handle trainings completed by user

          this.getEnrolledCourses();
          this.searchContent();
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
            from: CachedItemRequestSourceFrom.SERVER,
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
                          //Migration-todo
                          /* that.app.getRootNav().setRoot(CategoriesEditPage, {
                            showOnlyMandatoryFields: true,
                            profile: frameWorkData['activeProfileData']
                          }); */
                        }
                      });
                    if (profileData && profileData.avatar) {
                      that.imageUri = profileData.avatar;
                    }
                    that.formatRoles();
                    that.formatOrgDetails();
                    that.getOrgDetails();
                    that.formatUserLocation();
                    that.isCustodianOrgId = (that.profile.rootOrg.rootOrgId === this.custodianOrgId);
                    resolve();
                  });
              });
            }).catch(err => {
              if (refresher) {
                refresher.complete();
              }
              reject();
            });
        }
      });
    });
  }

  /**
   * Method to convert Array to Comma separated string
   * @param {Array<string>} stringArray
   * @returns {string}
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
 *
 */
  formatUserLocation() {
    if (this.profile && this.profile.userLocations && this.profile.userLocations.length) {
      for (let i = 0, len = this.profile.userLocations.length; i < len; i++) {
        if (this.profile.userLocations[i].type === 'state') {
          this.userLocation.state = this.profile.userLocations[i];
        } else {
          this.userLocation.district = this.profile.userLocations[i];
        }
      }
    }
  }


  /**
 * Method to handle organisation details.
 */
  formatOrgDetails() {
    this.orgDetails = { 'state': '', 'district': '', 'block': '' };
    for (let i = 0, len = this.profile.organisations.length; i < len; i++) {
      if (this.profile.organisations[i].locations) {
        for (let j = 0, l = this.profile.organisations[i].locations.length; j < l; j++) {
          switch (this.profile.organisations[i].locations[j].type) {
            case 'state':
              this.orgDetails.state = this.profile.organisations[i].locations[j];
              break;

            case 'block':
              this.orgDetails.block = this.profile.organisations[i].locations[j];
              break;

            case 'district':
              this.orgDetails.district = this.profile.organisations[i].locations[j];
              break;

            default:
              break;
          }
        }
      }
    }
  }


  /**
 * To show popover menu
 */
  async showOverflowMenu(event) {
    const popover = await this.popoverCtrl.create({
      component: OverflowMenuComponent,
      componentProps: {
        list: MenuOverflow.MENU_LOGIN,
        profile: this.profile
      },
      cssClass: 'box'
    });
    await popover.present();
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
    generateInteractTelemetry(InteractType.TOUCH,
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
    this.trainingsLimit = this.trainingsCompleted.length;
    generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.VIEW_MORE_CLICKED,
      Environment.HOME,
      PageId.PROFILE, null,
      undefined,
      undefined);
  }

  showLessTrainings(): void {
    this.trainingsLimit = this.DEFAULT_PAGINATION_LIMIT;
  }


  /**
 *  Returns the Object with given Keys only
 * @param {string} keys - Keys of the object which are required in new sub object
 * @param {object} obj - Actual object
 * @returns {object}
 */
  getSubset(keys, obj) {
    return keys.reduce((a, c) => ({ ...a, [c]: obj[c] }), {});
  }



  /**
 * To get enrolled course(s) of logged-in user i.e, trainings in the UI.
 *
 * It internally calls course handler of genie sdk
 */
  getEnrolledCourses() {
    const option = {
      userId: this.profile.userId,
      refreshEnrolledCourses: false,
      returnRefreshedEnrolledCourses: true
    };
    this.trainingsCompleted = [];
    this.courseService.getEnrolledCourses(option).toPromise()
      .then((res: Course[]) => {
        // res = JSON.parse(res);
        const enrolledCourses = res;
        console.log('course is ', res);
        for (let i = 0, len = enrolledCourses.length; i < len; i++) {
          if (enrolledCourses[i].status === 2) {
            this.trainingsCompleted.push(enrolledCourses[i]);
          }
        }
      })
      .catch((error: any) => {
        console.error('error while loading enrolled courses', error);
      });
  }


  isResource(contentType) {
    return contentType === ContentType.STORY ||
      contentType === ContentType.WORKSHEET;
  }



  /**
 * Navigate to the course/content details page
 *
 * @param {string} layoutName
 * @param {object} content
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
          content: content
        }
      }
      this.router.navigate([RouterLinks.ENROLLED_COURSE_DETAILS], navigationExtras)
    } else if (content.mimeType === MimeType.COLLECTION) {
      const navigationExtras: NavigationExtras = {
        state: {
          content: content
        }
      }
      this.router.navigate([RouterLinks.COLLECTION_DETAIL_ETB], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          content: content
        }
      }
      this.router.navigate([RouterLinks.CONTENT_DETAILS], navigationExtras)
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
        PageId.PROFILE, null,
        undefined,
        undefined);
      this.router.navigate([RouterLinks.CATEGORIES_EDIT]);
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
        PageId.PROFILE, null,
        undefined,
        undefined);

      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile
        }
      }

      this.router.navigate([RouterLinks.PERSONAL_DETAILS_EDIT], navigationExtras);
    } else {
      this.commonUtilService.showToast('NEED_INTERNET_TO_CHANGE');
    }
  }


  /**
 * Searches contents created by the user
 */
  searchContent(): void {
    const contentSortCriteria: ContentSortCriteria = {
      sortAttribute: 'lastUpdatedOn',
      sortOrder: SortOrder.DESC
    };
    const contentSearchCriteria: ContentSearchCriteria = {
      createdBy: [this.userId || this.loggedInUserId],
      limit: 100,
      contentTypes: ContentType.FOR_PROFILE_TAB,
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
    const newTitle = this.profile.phone ?
      this.commonUtilService.translateMessage('EDIT_PHONE_POPUP_TITLE') :
      this.commonUtilService.translateMessage('ENTER_PHONE_POPUP_TITLE');
    const popover = await this.popoverCtrl.create({
      component: EditContactDetailsPopupComponent,
      componentProps: {
        phone: this.profile.phone,
        title: newTitle,
        description: '',
        type: 'phone',
        userId: this.profile.userId
      },
      cssClass: 'popover-alert'
    });
    await popover.present();
    const response = await popover.onDidDismiss()//(edited: boolean = false, key?: any) => {

    if (response.data.edited) {
      this.callOTPPopover(ProfileConstants.CONTACT_TYPE_PHONE, response.data.key);
    }
  }

  async editEmail(event) {
    const newTitle = this.profile.email ?
      this.commonUtilService.translateMessage('EDIT_EMAIL_POPUP_TITLE') :
      this.commonUtilService.translateMessage('EMAIL_PLACEHOLDER');
    const popover = await this.popoverCtrl.create({
      component: EditContactDetailsPopupComponent,
      componentProps: {
        email: this.profile.email,
        title: newTitle,
        description: '',
        type: 'email',
        userId: this.profile.userId
      },
      cssClass: 'popover-alert'
    });
    popover.present();
    const response = await popover.onDidDismiss();
    if (response.data.edited) {
      this.callOTPPopover(ProfileConstants.CONTACT_TYPE_EMAIL, response.data.key);
    }
  }


  async callOTPPopover(type: string, key?: any) {
    if (type === ProfileConstants.CONTACT_TYPE_PHONE) {
      const popover = await this.popoverCtrl.create({
        component: EditContactVerifyPopupComponent,
        componentProps: {
          key: key,
          phone: this.profile.phone,
          title: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_TITLE'),
          description: this.commonUtilService.translateMessage('VERIFY_PHONE_OTP_DESCRIPTION'),
          type: ProfileConstants.CONTACT_TYPE_PHONE
        },
        cssClass: 'popover-alert'
      });
      popover.present();
      const response = await popover.onDidDismiss();
      if (response.data.OTPSuccess) {

        //Migration-todo
        // this.viewCtrl.dismiss();
        this.updatePhoneInfo(response.data.phone);
      }
    } else {
      const popover = await this.popoverCtrl.create({
        component: EditContactVerifyPopupComponent,
        componentProps: {
          key: key,
          phone: this.profile.email,
          title: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_TITLE'),
          description: this.commonUtilService.translateMessage('VERIFY_EMAIL_OTP_DESCRIPTION'),
          type: ProfileConstants.CONTACT_TYPE_EMAIL
        },
        cssClass: 'popover-alert'
      });
      popover.present(
      );
      const response = await popover.onDidDismiss();
      if (response.data.OTPSuccess) {
        //Migration-todo
        // this.viewCtrl.dismiss();
        this.updateEmailInfo(response.data.email);
      }
    }
  }

  async updatePhoneInfo(phone) {
    const loader = await this.commonUtilService.getLoader();
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      phone: phone,
      phoneVerified: true
    };
    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        this.doRefresh();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PHONE_UPDATE_SUCCESS'));
      }).catch(async (e) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
      });
  }

  async updateEmailInfo(email) {
    const loader = await this.commonUtilService.getLoader();
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.userId,
      email: email,
      emailVerified: true
    };
    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await loader.dismiss();
        this.doRefresh();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('EMAIL_UPDATE_SUCCESS'));
      }).catch(async (e) => {
        await loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('SOMETHING_WENT_WRONG'));
      });
  }


  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'download':
        this.redirectToActiveDownloads();
        break;
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
      this.informationProfileName = this.informationProfileName ? false : true;
      this.informationOrgName = false;
      if (this.informationProfileName) {
        this.dismissMessage();
      }
    } else if (field === 'org') {
      this.informationOrgName = this.informationOrgName ? false : true;
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
    let orgList = [];
    let orgItemList;
    orgItemList = this.profile.organisations;
    if (orgItemList.length > 1) {
      orgItemList.map((org) => {
        if (this.profile.rootOrgId !== org.organisationId) {
          orgList.push(org);
        }
      });
      orgList = orgList.sort((orgDate1, orgdate2) => orgDate1.orgjoindate > orgdate2.organisation ? 1 : -1);
      this.organisationDetails = orgList[0].orgName;
    } else {
      this.organisationDetails = orgItemList[0].orgName;
    }
  }
}





