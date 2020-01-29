import { Subscription } from 'rxjs';
import { Component, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Events, IonSelect, Platform } from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import {
  FrameworkService,
  FrameworkUtilService,
  GetSuggestedFrameworksRequest,
  GetFrameworkCategoryTermsRequest,
  FrameworkDetailsRequest,
  Framework,
  FrameworkCategoryCodesGroup,
  Profile,
  ProfileService,
  CategoryTerm,
  UpdateServerProfileInfoRequest,
  ServerProfileDetailsRequest,
  CachedItemRequestSourceFrom,
  Channel
} from 'sunbird-sdk';
import { CommonUtilService } from '@app/services/common-util.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { ContainerService } from '@app/services/container.services';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { Environment, ActivePageService } from '@app/services';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';


@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.page.html',
  styleUrls: ['./categories-edit.page.scss'],
})
export class CategoriesEditPage {

  @ViewChild('boardSelect') boardSelect: IonSelect;
  @ViewChild('mediumSelect') mediumSelect: IonSelect;
  @ViewChild('gradeSelect') gradeSelect: IonSelect;

  private _syllabusList = [];
  private _mediumList = [];
  private _gradeList = [];
  private _subjectList = [];
  disableSubmitButton = false;

  get syllabusList() {
    return this._syllabusList;
  }
  set syllabusList(v) {
    this._syllabusList = v;
    this.changeDetectionRef.detectChanges();
  }

  get mediumList() {
    return this._mediumList;
  }
  set mediumList(v) {
    this._mediumList = v;
    this.changeDetectionRef.detectChanges();
  }

  get gradeList() {
    return this._gradeList;
  }
  set gradeList(v) {
    this._gradeList = v;
    this.changeDetectionRef.detectChanges();
  }

  get subjectList() {
    return this._subjectList;
  }
  set subjectList(v) {
    this._subjectList = v;
    this.changeDetectionRef.detectChanges();
  }

  boardList = [];

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

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    private commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private appGlobalService: AppGlobalService,
    private events: Events,
    private container: ContainerService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private headerService: AppHeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private activePageService: ActivePageService,
    private changeDetectionRef: ChangeDetectorRef,
    private externalIdVerificationService: ExternalIdVerificationService,
    private tncUpdateHandlerService: TncUpdateHandlerService,

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

  /**
   * Initializes form with default values or empty values
   */

  initializeForm() {
    if (this.profile.board && this.profile.board.length > 1) {
      this.profile.board.splice(1, this.profile.board.length);
    }
    this.profileEditForm = this.fb.group({
      syllabus: [this.profile.syllabus && this.profile.syllabus[0] || []],
      boards: [this.profile.board || []],
      grades: [this.profile.grade || []],
      medium: [this.profile.medium || []],
      subjects: [this.profile.subject || []]
    });
  }

  async initializeLoader() {
    this.loader = await this.commonUtilService.getLoader();
  }

  /**
   * It will fetch the syllabus details
   */
  async getSyllabusDetails() {
    if (this.profile.syllabus && this.profile.syllabus[0]) {
      this.frameworkId = this.profile.syllabus[0];
    }
    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      language: this.translate.currentLang,
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
      .then(async (result: Framework[]) => {
        if (result && result.length) {
          result.forEach(element => {
            // renaming the fields to text, value and checked
            const value = { 'name': element.name, 'code': element.identifier };
            this.syllabusList.push(value);
          });

          if (this.profile && this.profile.syllabus && this.profile.syllabus[0] !== undefined) {
            const frameworkDetailsRequest: FrameworkDetailsRequest = {
              frameworkId: this.profile.syllabus[0],
              requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
              .then(async (framework: Framework) => {
                this.categories = framework.categories;
                this.resetForm(0);
              }).catch(async () => {
                await this.loader.dismiss();
                this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
              });
          } else {
            await this.loader.dismiss();
          }
        } else {
          await this.loader.dismiss();

          this.commonUtilService.showToast(this.commonUtilService.translateMessage('NO_DATA_FOUND'));
        }
      });
  }

  /**
   * It will resets the form to empty values
   */
  resetForm(index: number) {
    switch (index) {
      case 0:
        this.profileEditForm.patchValue({
          boards: [],
          grades: [],
          subjects: [],
          medium: []
        });
        this.fetchNextCategoryOptionsValues(1, 'boardList', [this.profileEditForm.value.syllabus]);
        break;
      case 1:
        this.profileEditForm.patchValue({
          medium: [],
          grades: [],
          subjects: []
        });
        this.fetchNextCategoryOptionsValues(2, 'mediumList', this.profileEditForm.value.boards);
        break;
      case 2:
        this.profileEditForm.patchValue({
          grades: [],
          subjects: []
        });
        this.fetchNextCategoryOptionsValues(3, 'gradeList', this.profileEditForm.value.medium);
        break;
      case 3:
        this.profileEditForm.patchValue({
          subjects: []
        });
        this.fetchNextCategoryOptionsValues(4, 'subjectList', this.profileEditForm.value.grades);
        break;
    }
  }

  /**
   * It builds API request object and internally call form API to fetch category data.
   * @param index Index of the field in the form
   * @param currentField Variable Name of the current field list
   * @param selectedValue selected value for the currently selected field
   */
  fetchNextCategoryOptionsValues(index: number, currentField: string, selectedValue: Array<string>) {
    if (index === 1) {
      this.frameworkId = selectedValue[0];
      if (this.frameworkId.length !== 0) {
        const frameworkDetailsRequest: FrameworkDetailsRequest = {
          frameworkId: this.frameworkId,
          requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
        };
        this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
          .then((framework: Framework) => {
            this.categories = framework.categories;
            const request: GetFrameworkCategoryTermsRequest = {
              currentCategoryCode: this.categories[0].code,
              language: this.translate.currentLang,
              requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
              frameworkId: this.frameworkId
            };
            this.getCategoryData(request, currentField);
          }).catch(() => {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
          });
      }
    } else {
      const request: GetFrameworkCategoryTermsRequest = {
        currentCategoryCode: this.categories[index - 1].code,
        prevCategoryCode: this.categories[index - 2].code,
        selectedTermsCodes: selectedValue,
        language: this.translate.currentLang,
        requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
        frameworkId: this.frameworkId
      };
      this.getCategoryData(request, currentField);
    }
  }

  /**
   * It makes an API call to fetch the categories values for the selected framework
   * @param request API request body
   * @param currentField Variable name of the current field list
   */
  getCategoryData(request: GetFrameworkCategoryTermsRequest, currentField: string) {
    this.frameworkUtilService.getFrameworkCategoryTerms(request).toPromise()
      .then((result: CategoryTerm[]) => {
        this[currentField] = result;
        if (request.currentCategoryCode === 'board') {
          const boardName = this.syllabusList.find(framework => this.frameworkId === framework.code);
          if (boardName) {
            const boardCode = result.find(board => boardName.name === board.name);
            if (boardCode) {
              this.profileEditForm.patchValue({
                boards: [boardCode.code]
              });
              this.resetForm(1);
            } else {
              this.profileEditForm.patchValue({
                boards: [result[0].code]
              });
              this.resetForm(1);
            }
          }
        } else if (this.editData) {
          this.editData = false;
          if (this.isBoardAvailable) {
            this.profileEditForm.patchValue({
              medium: this.profile.medium || []
            });
          }
          this.profileEditForm.patchValue({
            grades: this.profile.grade || []
          });
          this.profileEditForm.patchValue({
            subjects: this.profile.subject || []
          });
        }

      })
      .catch(() => {
      });
  }

  /**
   * It will validate the forms and internally call submit method
   */
  onSubmit() {
    const formVal = this.profileEditForm.value;
    if (!formVal.boards.length && this.syllabusList.length) {
      if (this.showOnlyMandatoryFields) {
        this.boardSelect.open();
      } else {
        this.showErrorToastMessage('BOARD');
      }
    } else if (!formVal.medium.length) {
      if (this.showOnlyMandatoryFields) {
        this.mediumSelect.open();
      } else {
        this.showErrorToastMessage('MEDIUM');
      }
    } else if (!formVal.grades.length) {
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
      req.framework['id'] = [formVal.syllabus];
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

        if (this.showOnlyMandatoryFields) {
          const reqObj: ServerProfileDetailsRequest = {
            userId: this.profile.uid,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
            from: CachedItemRequestSourceFrom.SERVER
          };
          this.profileService.getServerProfilesDetails(reqObj).toPromise()
            .then(updatedProfile => {
              this.formAndFrameworkUtilService.updateLoggedInUser(updatedProfile, this.profile)
                .then( async (value) => {
                  initTabs(this.container, LOGIN_TEACHER_TABS);
                  if (this.hasFilledLocation || await this.tncUpdateHandlerService.isSSOUser(this.profile)) {
                    this.router.navigate([RouterLinks.TABS]);
                    this.externalIdVerificationService.showExternalIdVerificationPopup();
                  } else {
                    const navigationExtras: NavigationExtras = {
                      state: {
                        isShowBackButton: false
                      }
                    };
                    this.router.navigate([RouterLinks.DISTRICT_MAPPING] , navigationExtras);
                  }
                });
            }).catch(e => {
              initTabs(this.container, LOGIN_TEACHER_TABS);
              if (this.hasFilledLocation) {
                this.router.navigate([RouterLinks.TABS]);
                this.externalIdVerificationService.showExternalIdVerificationPopup();
              } else {
                const navigationExtras: NavigationExtras = {
                  state: {
                    isShowBackButton: false
                  }
                };
                this.router.navigate([RouterLinks.DISTRICT_MAPPING] , navigationExtras);
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

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async getLoggedInFrameworkCategory() {
    try {
      const activeChannelDetails: Channel = await this.frameworkService.getChannelDetails({ channelId: this.frameworkService.activeChannelId }).toPromise()
      const defaultFrameworkDetails: Framework = await this.frameworkService.getFrameworkDetails({
        frameworkId: activeChannelDetails.defaultFramework, requiredCategories: []
      }).toPromise();
      const activeChannelSuggestedFrameworkList: Framework[] = await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList({
        language: '',
        requiredCategories: []
      }).toPromise();
      this.frameworkId =  activeChannelDetails.defaultFramework;
      this.categories = defaultFrameworkDetails.categories;
      const boardCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'board');
      const mediumCategory = defaultFrameworkDetails.categories.find((c) => c.code === 'medium');

      if (boardCategory) {
        this.syllabusList = activeChannelSuggestedFrameworkList.map(f => ({ name: f.name, code: f.identifier }));
        this.isBoardAvailable = true;
        this.resetForm(0);
      } else {
        this.categories.unshift([]);
        this.isBoardAvailable = false;
        this.mediumList = mediumCategory.terms;
        this.resetForm(2);
      }
    } catch (err) {
      if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
        this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      }
      console.error('getFrameWorkCategoryOrder', err);
    }
  }
}
