import { tap } from 'rxjs/operators';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Component, Inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { IonSelect, Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import {
  FrameworkService,
  FrameworkUtilService,
  GetSuggestedFrameworksRequest,
  GetFrameworkCategoryTermsRequest,
  Framework,
  FrameworkCategoryCodesGroup,
  Profile,
  ProfileService,
  UpdateServerProfileInfoRequest,
  ServerProfileDetailsRequest,
  CachedItemRequestSourceFrom,
  Channel,
  FrameworkCategoryCode,
  SharedPreferences
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { ContainerService } from '@app/services/container.services';
import { PreferenceKey, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { Environment, ActivePageService } from '@app/services';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { ProfileHandler } from '@app/services/profile-handler';
import { SegmentationTagService, TagPrefixConstants } from '@app/services/segmentation-tag/segmentation-tag.service';


@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.page.html',
  styleUrls: ['./categories-edit.page.scss'],
})
export class CategoriesEditPage implements OnInit, OnDestroy {

  @ViewChild('boardSelect', { static: false }) boardSelect: IonSelect;
  @ViewChild('mediumSelect', { static: false }) mediumSelect: IonSelect;
  @ViewChild('gradeSelect', { static: false }) gradeSelect: IonSelect;

  private framework: Framework;
  private formControlSubscriptions: Subscription;

  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];
  public boardList: { name: string, code: string }[] = [];

  disableSubmitButton = false;

  profile: Profile;
  profileEditForm: FormGroup;
  frameworkId: string;
  categories = [];
  btnColor = '#8FC4FF';
  showOnlyMandatoryFields = true;
  editData = true;
  loader: any;
  headerConfig = {
    showHeader: false,
    showBurgerMenu: false,
    actionButtons: []
  };

  backButtonFunc: Subscription;
  isRootPage = false;
  hasFilledLocation = false;
  public supportedProfileAttributes: { [key: string]: string } = {};
  userType: string;

  /* Custom styles for the select box popup */
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
  subjectOptions = {
    title: this.commonUtilService.translateMessage('SUBJECTS').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  isBoardAvailable = true;

  get syllabusControl(): FormControl {
    return this.profileEditForm.get('syllabus') as FormControl;
  }

  get boardControl(): FormControl {
    return this.profileEditForm.get('boards') as FormControl;
  }

  get mediumControl(): FormControl {
    return this.profileEditForm.get('medium') as FormControl;
  }

  get gradeControl(): FormControl {
    return this.profileEditForm.get('grades') as FormControl;
  }

  get subjectControl(): FormControl {
    return this.profileEditForm.get('subjects') as FormControl;
  }

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private container: ContainerService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private activePageService: ActivePageService,
    private externalIdVerificationService: ExternalIdVerificationService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
    private sbProgressLoader: SbProgressLoader,
    private profileHandler: ProfileHandler,
    private segmentationTagService: SegmentationTagService

  ) {
    this.appGlobalService.closeSigninOnboardingLoader();
    this.profile = this.appGlobalService.getCurrentUser();
    const extrasState = this.router.getCurrentNavigation().extras.state;
    if (extrasState && extrasState.showOnlyMandatoryFields) {
      this.hasFilledLocation = extrasState.hasFilledLocation;
      this.showOnlyMandatoryFields = extrasState.showOnlyMandatoryFields;
      this.isRootPage = Boolean(extrasState.isRootPage);
      if (extrasState.profile) {
        this.profile = extrasState.profile;
      }
    } else {
      this.showOnlyMandatoryFields = false;
    }
    this.initializeForm();
  }

  async ngOnInit() {
    this.supportedProfileAttributes = await this.profileHandler.getSupportedProfileAttributes(false);
    const subscriptionArray: Array<any> = this.updateAttributeStreamsnSetValidators(this.supportedProfileAttributes);
    this.formControlSubscriptions = combineLatest(subscriptionArray).subscribe();
    this.userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
  }

  ngOnDestroy() {
    this.formControlSubscriptions.unsubscribe();
  }
  /**
   * Ionic life cycle event - Fires every time page visits
   */
  ionViewWillEnter() {
    this.initializeLoader();
    if (this.appGlobalService.isUserLoggedIn()) {
      this.getLoggedInFrameworkCategory();
    } else {
      this.getSyllabusDetails();
    }
    this.disableSubmitButton = false;
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = false;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);

    if (this.isRootPage) {
      this.backButtonFunc = this.platform.backButton.subscribeWithPriority(0, () => {
        this.commonUtilService.showExitPopUp(this.activePageService.computePageId(this.router.url), Environment.HOME, false);
      });
    }
  }

  ionViewDidEnter() {
    this.sbProgressLoader.hide({ id: 'login' });
  }

  /**
   * Initializes form with default values or empty values
   */

  initializeForm() {
    if (this.profile.board && this.profile.board.length > 1) {
      this.profile.board.splice(1, this.profile.board.length);
    }
    this.profileEditForm = this.fb.group({
      syllabus: [],
      boards: [],
      medium: [],
      grades: [],
      subjects: []
    });
  }

  async initializeLoader() {
    this.loader = await this.commonUtilService.getLoader();
  }

  async getSyllabusDetails() {
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

  private onSyllabusChange(): Observable<string[]> {
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
          await this.getFrameworkData(value[0]);

          const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
            frameworkId: this.framework.identifier,
            requiredCategories: [FrameworkCategoryCode.BOARD],
            currentCategoryCode: FrameworkCategoryCode.BOARD,
            language: this.translate.currentLang
          };

          const boards = await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise();
          this.boardList = boards.map(t => ({ name: t.name, code: t.code }));

          const boardTerm = boards.find(b => b.name === (this.syllabusList.find((s) => s.code === value[0]).name));

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
          if (!this.mediumControl.value) {
            this.mediumControl.patchValue(this.profile.medium || []);
          } else {
            this.mediumControl.patchValue([]);
          }
        } catch (e) {
          // todo
          console.error(e);
        } finally {
          this.loader.dismiss();
        }
      })
    );
  }

  private onMediumChange(): Observable<string[]> {
    return this.mediumControl.valueChanges.pipe(
      tap(async () => {
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
          if (!this.gradeControl.value) {
            this.gradeControl.patchValue(this.profile.grade || []);
          } else {
            this.gradeControl.patchValue([]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.loader.dismiss();
        }
      })
    );
  }

  private onGradeChange(): Observable<string[]> {
    return this.gradeControl.valueChanges.pipe(
      tap(async () => {
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
          if (!this.subjectControl.value) {
            this.subjectControl.patchValue(this.profile.subject || []);
          } else {
            this.subjectControl.patchValue([]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.loader.dismiss();
        }
      })
    );
  }

  /**
   * It will validate the forms and internally call submit method
   */
  onSubmit() {
    const formVal = this.profileEditForm.value;
    if (formVal.boards && !formVal.boards.length && this.syllabusList.length && this.isBoardAvailable) {
      if (this.showOnlyMandatoryFields) {
        this.boardSelect.open();
      } else {
        this.showErrorToastMessage('BOARD');
      }
    } else if (formVal.medium && !formVal.medium.length && this.supportedProfileAttributes['medium']) {
      if (this.showOnlyMandatoryFields) {
        this.mediumSelect.open();
      } else {
        this.showErrorToastMessage('MEDIUM');
      }
    } else if (formVal.grades && !formVal.grades.length && this.supportedProfileAttributes['gradeLevel']) {
      if (this.showOnlyMandatoryFields) {
        this.gradeSelect.open();
      } else {
        this.showErrorToastMessage('CLASS');
      }
    } else {
      this.submitForm(formVal);
    }
  }

  /**
   * Shows Toast Message with `red` color
   * @param fieldName Name of the field in the form
   */
  showErrorToastMessage(fieldName: string) {
    this.btnColor = '#8FC4FF';
    this.commonUtilService.showToast(this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService
      .translateMessage(fieldName)), false, 'redErrorToast');
  }

  /**
   * It changes the color of the submit button on change of class.
   */
  enableSubmitButton() {
    if (this.profileEditForm.value.grades.length) {
      this.btnColor = '#006DE5';
    } else {
      this.btnColor = '#8FC4FF';
    }
  }

  /**
   * It makes an update API call.
   * @param formVal Object of Form values
   */

  async submitForm(formVal) {
    await this.loader.present();
    const req: UpdateServerProfileInfoRequest = {
      userId: this.profile.uid,
      framework: {}
    };
    if (!this.isBoardAvailable) {
      req.framework['id'] = [this.frameworkId];
    } else if (formVal.syllabus && formVal.syllabus.length) {
      req.framework['id'] = [...formVal.syllabus];
    }
    if (formVal.boards && formVal.boards.length) {
      const code = typeof (formVal.boards) === 'string' ? formVal.boards : formVal.boards[0];
      req.framework['board'] = [this.boardList.find(board => code === board.code).name];
    }
    if (formVal.medium && formVal.medium.length) {
      const Names = [];
      formVal.medium.forEach(element => {
        Names.push(this.mediumList.find(medium => element === medium.code).name);
      });
      req.framework['medium'] = Names;
    }
    if (formVal.grades && formVal.grades.length) {
      const Names = [];
      formVal.grades.forEach(element => {
        Names.push(this.gradeList.find(grade => element === grade.code).name);
      });
      req.framework['gradeLevel'] = Names;
    }
    if (formVal.subjects && formVal.subjects.length) {
      const Names = [];
      formVal.subjects.forEach(element => {
        Names.push(this.subjectList.find(subject => element === subject.code).name);
      });
      req.framework['subject'] = Names;
    }
    this.profileService.updateServerProfile(req).toPromise()
      .then(async () => {
        await this.loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
        this.disableSubmitButton = true;
        this.events.publish('loggedInProfile:update', req.framework);
        const isSSOUser = await this.tncUpdateHandlerService.isSSOUser(this.profile);
        await this.refreshSegmentTags();
        if (this.showOnlyMandatoryFields) {
          const reqObj: ServerProfileDetailsRequest = {
            userId: this.profile.uid,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
            from: CachedItemRequestSourceFrom.SERVER
          };
          this.profileService.getServerProfilesDetails(reqObj).toPromise()
            .then(updatedProfile => {
               this.formAndFrameworkUtilService.updateLoggedInUser(updatedProfile, this.profile)
                .then(async () => {
                  initTabs(this.container, LOGIN_TEACHER_TABS);
                  if (this.hasFilledLocation || isSSOUser) {
                    if (!isSSOUser) {
                      this.appGlobalService.showYearOfBirthPopup(updatedProfile);
                    }
                    this.router.navigate([RouterLinks.TABS]);
                    this.events.publish('update_header');
                    this.externalIdVerificationService.showExternalIdVerificationPopup();
                  } else {
                    const navigationExtras: NavigationExtras = {
                      state: {
                        isShowBackButton: false
                      }
                    };
                    this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
                  }
                });
            }).catch(() => {
              initTabs(this.container, LOGIN_TEACHER_TABS);
              if (this.hasFilledLocation) {
                if (!isSSOUser) {
                  this.appGlobalService.showYearOfBirthPopup(this.profile.serverProfile);
                }
                this.router.navigate([RouterLinks.TABS]);
                this.events.publish('update_header');
                this.externalIdVerificationService.showExternalIdVerificationPopup();
              } else {
                const navigationExtras: NavigationExtras = {
                  state: {
                    isShowBackButton: false
                  }
                };
                this.router.navigate([RouterLinks.DISTRICT_MAPPING], navigationExtras);
              }
            });
        } else {
          this.location.back();
        }
      }).catch(async (error) => {
        await this.loader.dismiss();
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
        console.error('Unable to submit:', error);
      });
  }

  refreshSegmentTags() {
    const reqObj: ServerProfileDetailsRequest = {
      userId: this.profile.uid,
      requiredFields: ProfileConstants.REQUIRED_FIELDS,
      from: CachedItemRequestSourceFrom.SERVER
    };
    this.profileService.getServerProfilesDetails(reqObj).toPromise()
      .then(updatedProfile => {
         // ******* Segmentation
         var frameworkData = [];
         Object.keys(updatedProfile.framework).forEach((key) => {
          if (key !== 'id' && Array.isArray(updatedProfile.framework[key])) {
            frameworkData.push(updatedProfile.framework[key].map( x => x.replace(/\s/g, '').toLowerCase()));
          }
         });
         window['segmentation'].SBTagService.pushTag(frameworkData, TagPrefixConstants.USER_ATRIBUTE, true);
         let userLocation = [];
         (updatedProfile['userLocations'] || []).forEach(element => {
           userLocation.push({ name: element.name, code: element.code });
         });
         window['segmentation'].SBTagService.pushTag({ location: userLocation }, TagPrefixConstants.USER_LOCATION, true);
         window['segmentation'].SBTagService.pushTag(updatedProfile.profileUserType.type, TagPrefixConstants.USER_LOCATION, true);
         this.segmentationTagService.evalCriteria();
      });
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async getLoggedInFrameworkCategory() {
    try {
      const activeChannelDetails: Channel = await this.frameworkService.getChannelDetails(
        { channelId: this.frameworkService.activeChannelId }).toPromise();
      const defaultFrameworkDetails: Framework = await this.frameworkService.getFrameworkDetails({
        frameworkId: activeChannelDetails.defaultFramework, requiredCategories: []
      }).toPromise();
      const activeChannelSuggestedFrameworkList: Framework[] = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList({
        language: '',
        requiredCategories: []
      }).toPromise();
      this.frameworkId = activeChannelDetails.defaultFramework;
      this.categories = defaultFrameworkDetails.categories;
      const boardCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'board');
      const mediumCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'medium');

      if (boardCategory) {
        this.syllabusList = activeChannelSuggestedFrameworkList.map(f => ({ name: f.name, code: f.identifier }));
        this.isBoardAvailable = true;
        this.syllabusControl.patchValue([this.profile.syllabus && this.profile.syllabus[0]] || []);
      } else {
        await this.getFrameworkData(this.frameworkId);
        this.categories.unshift([]);
        this.isBoardAvailable = false;
        this.mediumList = mediumCategory.terms;
        this.mediumControl.patchValue(this.profile.medium || []);
      }
    } catch (err) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      }
      console.error('getFrameWorkCategoryOrder', err);
    }
  }

  private async getFrameworkData(frameworkId) {
    this.framework = await this.frameworkService.getFrameworkDetails({
      from: CachedItemRequestSourceFrom.SERVER,
      frameworkId,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    }).toPromise();
  }

  private updateAttributeStreamsnSetValidators(attributes: { [key: string]: string }): Array<any> {
    const subscriptionArray = [];
    Object.keys(attributes).forEach((attribute) => {
      switch (attribute) {
        case 'board':
          subscriptionArray.push(this.onSyllabusChange());
          break;
        case 'medium':
          subscriptionArray.push(this.onMediumChange());
          break;
        case 'gradeLevel':
          subscriptionArray.push(this.onGradeChange());
          break;
      }
    });
    return subscriptionArray;
  }

  goBack() {
    this.location.back();
  }
}
