import { Router } from '@angular/router';
import { Events } from '../../../util/events';
import { TranslateService } from '@ngx-translate/core';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import isEqual from 'lodash/isEqual';
import {
  Framework,
  FrameworkCategoryCodesGroup,
  FrameworkService,
  FrameworkUtilService,
  GetFrameworkCategoryTermsRequest,
  GetSuggestedFrameworksRequest,
  Profile,
  ProfileService,
  ProfileSource,
  ProfileType,
  SharedPreferences,
  FrameworkCategoryCode,
  CachedItemRequestSourceFrom,
  CorrelationData
} from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '../../../services/common-util.service';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
  Environment,
  ImpressionType,
  InteractSubtype,
  InteractType,
  ObjectType,
  PageId,
} from '../../../services/telemetry-constants';
import { AppHeaderService } from '../../../services/app-header.service';
import {PreferenceKey, ProfileConstants, RegexPatterns, RouterLinks} from '../../../app/app.constant';
import { Location } from '@angular/common';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ProfileHandler } from '../../../services/profile-handler';
import { FormAndFrameworkUtilService } from '../../../services/formandframeworkutil.service';
import { OnboardingConfigurationService } from '../../../services/onboarding-configuration.service';
import { SegmentationTagService, TagPrefixConstants } from '../../../services/segmentation-tag/segmentation-tag.service';

@Component({
  selector: 'app-guest-edit',
  templateUrl: './guest-edit.page.html',
  styleUrls: ['./guest-edit.page.scss'],
})
export class GuestEditPage implements OnInit, OnDestroy {

  private framework: Framework;
  ProfileType = ProfileType;
  guestEditForm: FormGroup;
  profile: any = {};
  categories: Array<any> = [];
  boardList: Array<any> = [];
  userName = '';
  frameworkId = '';
  loader: any;
  isNewUser = false;
  unregisterBackButton: any;
  isCurrentUser = true;
  isFormValid = true;
  previousProfileType;
  profileForTelemetry: any = {};
  btnColor = '#8FC4FF';
  private formControlSubscriptions: Subscription;
  public syllabusList: { name: string, code: string }[] = [];
  public mediumList: { name: string, code: string }[] = [];
  public gradeList: { name: string, code: string }[] = [];
  public subjectList: { name: string, code: string }[] = [];
  public supportedProfileAttributes: { [key: string]: string } = {};
  public supportedUserTypes: Array<any> = [];
  profileSettingsForms: FormGroup;
  group: any = {};
  isCategoryLabelLoded = false;
  defaultFID = 'NCF';
  defaultFrameworkID: any;
  isDisable = true;

  public profileTypeList = [];
  syllabusOptions = {
    title: this.commonUtilService.translateMessage('BOARD').toLocaleUpperCase(),
    cssClass: 'select-box'
  };

  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    public appGlobalService: AppGlobalService,
    public commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private headerService: AppHeaderService,
    private router: Router,
    private location: Location,
    private profileHandler: ProfileHandler,
    private segmentationTagService: SegmentationTagService,
    private onboardingConfigurationService: OnboardingConfigurationService,
    private formAndFrameworkUtilService: FormAndFrameworkUtilService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.isNewUser = Boolean(this.router.getCurrentNavigation().extras.state.isNewUser);
      this.isCurrentUser = Boolean(this.router.getCurrentNavigation().extras.state.isCurrentUser);
    }

    if (this.router.getCurrentNavigation().extras.state) {
      this.profile = this.router.getCurrentNavigation().extras.state.profile || {};
    } else {
      this.profile = {};
    }

    this.previousProfileType = this.profile.profileType;
    this.profileForTelemetry = Object.assign({}, JSON.parse(this.profile.categories));
    this.defaultFrameworkID = this.profile.syllabus[0]

  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.CREATE_USER,
      Environment.USER, this.isNewUser ? '' : this.profile.uid, this.isNewUser ? '' : ObjectType.USER
    );

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      this.isNewUser ? InteractSubtype.CREATE_USER_INITIATED : InteractSubtype.EDIT_USER_INITIATED,
      Environment.USER,
      PageId.CREATE_USER
    );
    await this.getCategoriesAndUpdateAttributes();
    this.supportedUserTypes = await this.profileHandler.getSupportedUserTypes(this.onboardingConfigurationService.getAppConfig().overriddenDefaultChannelId);
  }

  private async addAttributeSubscription() {
    const subscriptionArray: Array<any> = this.updateAttributeStreamsnSetValidators(this.supportedProfileAttributes);
    this.formControlSubscriptions = combineLatest(subscriptionArray).subscribe();
  }


  async ionViewWillEnter() {
    const headerTitle = this.isNewUser ? this.commonUtilService.translateMessage('CREATE_USER') :
      this.commonUtilService.translateMessage('EDIT_PROFILE');
    await this.headerService.showHeaderWithBackButton([], headerTitle);
  }

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
  
  }

  async onProfileTypeChange() {
    if (this.formControlSubscriptions) {
      this.formControlSubscriptions.unsubscribe();
    }
    // await this.getCategoriesAndUpdateAttributes(this.guestEditForm.value.profileType);
    this.categories.forEach((e, index) => {
      if (this.profileSettingsForms.get(e.identifier).value) {
        this.profileSettingsForms.get(e.identifier).patchValue([]);
        if (index != 0) {
          e['isDisable'] = true;
        }
      }
    })
    this.btnColor = '#8FC4FF';
  }

  async getSyllabusDetails() {
    this.loader = await this.commonUtilService.getLoader();
    await this.loader.present();

    const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      language: this.translate.currentLang,
      requiredCategories: this.appGlobalService.getRequiredCategories()
    };

    await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
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

  generateInteractTelemetry(value, categoryType) {
    let correlationList: Array<CorrelationData> = [];
    correlationList = this.populateCData(value, categoryType);
    correlationList.push({ id: value.toString(), type: categoryType });
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_CATEGORY, 
      InteractSubtype.EDIT_USER_SUCCESS,
      Environment.USER,
      PageId.EDIT_USER,
      undefined,
      undefined,
      undefined,
      correlationList
    );
  }

  resetFormCategories(index) {
    if (index <= this.categories.length) {
      if (this.profileSettingsForms.get(this.categories[index + 1].identifier).value.length > 0) {
        for (let i = index + 1; i < this.categories.length; i++) {
          this.categories[i]['isDisable'] = true;
          this.profileSettingsForms.get(this.categories[i].identifier).patchValue([]);
        }
      } else {
        for (let i = index + 1; i < this.categories.length; i++) {
          this.categories[i]['isDisable'] = true;
        }
      }
    }
  }

  /**
   * This method is added as we are not getting subject value in reset form method
   */
  async onCategoryChanged(category, event, index) {
    if (category && category.identifier) {
      let currentValue = Array.isArray(event) ? event : [event];
      let formVal = this.profileSettingsForms.get(category.identifier).value;
      formVal = Array.isArray(formVal) ? formVal : [formVal]
      if (!formVal.length) {
        this.resetFormCategories(index);
      }
      if (currentValue.length) {
        const oldAttribute: any = {};
        const newAttribute: any = {};
        oldAttribute[category.code] = this.profileForTelemetry[category.identifier] ? this.profileForTelemetry[category.identifier] : '';
        newAttribute[category.code] = event ? event : '';
        if (!isEqual(oldAttribute, newAttribute)) {
          this.appGlobalService.generateAttributeChangeTelemetry(oldAttribute, newAttribute, PageId.GUEST_PROFILE);
        }
        event = Array.isArray(event) ? event[0] : event;
        if (index !== this.categories.length - 1) {
          if (index === 0) {
            this.defaultFrameworkID = event;
            this.setCategoriesTerms();
            this.framework = await this.frameworkService.getFrameworkDetails({
              from: CachedItemRequestSourceFrom.SERVER,
              frameworkId: event,
              requiredCategories: this.appGlobalService.getRequiredCategories()
            }).toPromise();
          }
        this.resetFormCategories(index);
        const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
          frameworkId: this.framework ? this.framework.identifier : this.profile.syllabus[0] || this.defaultFrameworkID,
          requiredCategories: [this.categories[index + 1].code],
          // prevCategoryCode: this.categories[index].code,
          currentCategoryCode: this.categories[index + 1].code,
          language: this.translate.currentLang
        };
        const categoryTerms = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
          .map(t => ({ name: t.name, code: t.code }))
          this.categories[index + 1]['isDisable'] = false;
        this.categories[index + 1]['itemList'] = categoryTerms;
      }
      }
    }
  }

  /**
   * Call on Submit the form
   */

  async onSubmit() {
    if (!this.isFormValid) {
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('NEED_INTERNET_TO_CHANGE'));
      return;
    }
    const loader = await this.commonUtilService.getLoader();
    const formVal = this.profileSettingsForms.value;

    if (!formVal.profileType) {
      this.commonUtilService.showToast('USER_TYPE_SELECT_WARNING');
      return false;
    } else if (!this.validateName()) {
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('FULL_NAME')), false, 'red-toast');
    } else if (formVal.boards && formVal.boards.length === 0) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('BOARD')), false, 'red-toast');
      return false;
    } else if (formVal.medium && formVal.medium.length === 0 && !!this.supportedProfileAttributes['medium']) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('MEDIUM')), false, 'red-toast');
      return false;
    } else if (formVal.grades && formVal.grades.length === 0 && !!this.supportedProfileAttributes['gradeLevel']) {
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'failed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
      this.commonUtilService.showToast(
        this.commonUtilService.translateMessage('PLEASE_SELECT', this.commonUtilService.translateMessage('CLASS')), false, 'red-toast');
      return false;
    } else {
      await loader.present();
      if (this.isNewUser) {
        await this.submitNewUserForm(formVal, loader);
      } else {
        await this.submitEditForm(formVal, loader);
      }
      this.appGlobalService.generateSaveClickedTelemetry(
        this.extractProfileForTelemetry(formVal), 'passed', PageId.EDIT_USER, InteractSubtype.SAVE_CLICKED);
    }
  }


  /**
   *  It will validate the name field.
   */
  validateName() {
    const name = this.profileSettingsForms.getRawValue().name;
    if (name) {
      return Boolean(name.trim().length);
    } else {
      return false;
    }
  }

  extractProfileForTelemetry(formVal): any {
    const profileReq: any = {};
    this.categories.forEach((category) => {
      profileReq[category.code] = formVal[category.identifier]
    })
    profileReq.syllabus = this.profile.syllabus

    return profileReq;
  }

  /**
   * This will submit edit form.
   */
  async submitEditForm(formVal, loader): Promise<void> {
    const req = {} as Profile;
    let formValue = JSON.parse(JSON.stringify(formVal));
    req.uid = this.profile.uid;
    req.handle = (formValue.name.replace(RegexPatterns.SPECIALCHARECTERSANDEMOJIS, '')).trim();
    req.profileType = formValue.profileType;
    req.source = this.profile.source;
    req.createdAt = this.profile.createdAt;
    req.syllabus = [this.defaultFrameworkID];
    if(this.categories.length) {
      delete formValue.name;
      delete formValue.profileType;
      req.categories = formValue;
    }
    try {
      await this.profileService.updateProfile(req).toPromise()
      await this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_SUCCESS'));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER,
        InteractSubtype.EDIT_USER_SUCCESS,
        Environment.USER,
        PageId.EDIT_USER
      );
      if (this.isCurrentUser) {
        this.commonUtilService.handleToTopicBasedNotification();
        await this.publishProfileEvents(formVal);
      } else {
        this.location.back();
      }
      this.refreshSegmentTags();
    } catch {
      await this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('PROFILE_UPDATE_FAILED'));
    }
  }

  refreshSegmentTags() {
    this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
      .then(async (res: any) => {
        this.profile = res;
        let userFramework = JSON.parse(res.categories);
        let profileSegmentObj = {};
        this.categories.forEach((category) => {
          if (userFramework[category.identifier].length) {
            userFramework[category.identifier] = Array.isArray(userFramework[category.identifier]) ? 
            userFramework[category.identifier] : [userFramework[category.identifier]]
            profileSegmentObj[category.code] = userFramework[category.identifier].map(x => x.replace(/\s/g, '').toLowerCase());
          }
        });
        profileSegmentObj['syllabus'] = this.profile.syllabus;
        window['segmentation'].SBTagService.pushTag(profileSegmentObj, TagPrefixConstants.USER_ATRIBUTE, true);
        window['segmentation'].SBTagService.pushTag(res.profileType, TagPrefixConstants.USER_ROLE, true);
        await this.segmentationTagService.evalCriteria();
      }).catch(e => console.error(e));
}

  async publishProfileEvents(formVal) {
    // Publish event if the all the fields are submitted
    if (this.profileSettingsForms.valid) {
      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: true });
    } else {
      this.events.publish('onboarding-card:completed', { isOnBoardingCardCompleted: false });
    }
    this.events.publish('refresh:profile');
    this.events.publish('refresh:onboardingcard');

    if (this.previousProfileType && this.previousProfileType !== formVal.profileType) {
      if (this.previousProfileType && this.previousProfileType !== formVal.profileType) {
        await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, formVal.profileType).toPromise().then();
        if (formVal.profileType === ProfileType.ADMIN) {
          await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.ADMIN).toPromise().then();
          await this.router.navigate([RouterLinks.SIGN_IN]);
        }
      }
    }
    if (formVal.profileType !== ProfileType.ADMIN) {
      this.location.back();
    }
  }


  /**
   * It will submit new user form
   */
  async submitNewUserForm(formVal, loader): Promise<void> {
    const req = {} as Profile;
    this.categories.forEach((category) => {
      req[category.code] = formVal[category.identifier]
    })
    req.syllabus = this.profile.syllabus
    req.handle = formVal.name.trim();
    req.profileType = formVal.profileType;
    req.source = ProfileSource.LOCAL;

    if (formVal.grades && formVal.grades.length > 0) {
      formVal.grades.forEach(gradeCode => {
        for (let i = 0; i < this.gradeList.length; i++) {
          if (this.gradeList[i].code === gradeCode) {
            if (!req.gradeValue) {
              req.gradeValue = {};
            }
            req.gradeValue[this.gradeList[i].code] = this.gradeList[i].name;
            break;
          }
        }
      });
    }
    try {
      await this.profileService.createProfile(req, req.source).toPromise();
      await this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('USER_CREATED_SUCCESSFULLY'));
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER, InteractSubtype.CREATE_USER_SUCCESS, Environment.USER, PageId.CREATE_USER);
      this.location.back();
    } catch {
      await this._dismissLoader(loader);
      this.commonUtilService.showToast(this.commonUtilService.translateMessage('FILL_THE_MANDATORY_FIELDS'));
    }
  }

  private async _dismissLoader(loader?) {
    if (loader) {
      await loader.dismiss();
    } else if (this.loader) {
      await this.loader.dismiss();
      this.loader = undefined;
    }
  }

  private updateAttributeStreamsnSetValidators(attributes: { [key: string]: string }): Array<any> {
    const subscriptionArray = [];
    subscriptionArray.push(this.profileSettingsForms.valueChanges.pipe(
     delay(250),
      tap(() => {
       this.btnColor = this.profileSettingsForms.valid ? '#006DE5' : '#8FC4FF';
      })
    ));
    return subscriptionArray;
  }

  private async getCategoriesAndUpdateAttributes(change = false) {
    this.formAndFrameworkUtilService.invokedGetFrameworkCategoryList(this.defaultFrameworkID).then(async (categories) => {
      if (categories) {
        this.categories = categories.sort((a,b) => a.index - b.index);
        let categoryDetails = this.profile.categories ? JSON.parse(this.profile.categories) : this.profile.serverProfile.framework;
      this.categories[0]['itemList'] = change ? this.syllabusList : [];
      await this.setFrameworkCategory1Value();
        await this.setCategoriesTerms()
        // if (!change) {
        //   await this.setCategoriesTerms()
        // } else {
        //   this.resetCategoriesTerms()
        // }
      if (!change) {
        this.group['name'] = new FormControl(this.profile.handle || '');
        this.group['profileType'] = new FormControl(this.profile.profileType || ProfileType.STUDENT);
      }
      this.categories.forEach((ele: any, index) => {
      this.group[ele.identifier] = new FormControl([], ele.required ? Validators.required : []);
      });
      this.profileSettingsForms = new FormGroup(this.group);
     // this.addAttributeSubscription();
      if (change) {
        this.profileSettingsForms.get(this.categories[0].identifier).patchValue([this.defaultFrameworkID]);
      } else if(!change) {
        for (var key of Object.keys(categoryDetails)) {
          if(this.profileSettingsForms.get(key)) {
            let value = Array.isArray(categoryDetails[key]) ? categoryDetails[key] : [categoryDetails[key]];
            this.profileSettingsForms.get(key).patchValue(value);
          } else {
            this.profileSettingsForms.removeControl(key);
          }
        }
      }
    }
    }).catch(e => console.error(e));
  }

  async setCategoriesTerms() {
    this.categories.forEach(async (item, index) => {
      if (index !== 0) {
        const boardCategoryTermsRequet: GetFrameworkCategoryTermsRequest = {
          frameworkId: this.defaultFrameworkID,
          requiredCategories: [item.code],
          currentCategoryCode: item.code,
          language: this.translate.currentLang
        };
        const categoryTerms = (await this.frameworkUtilService.getFrameworkCategoryTerms(boardCategoryTermsRequet).toPromise())
          .map(t => ({ name: t.name, code: t.code }))
        if (categoryTerms) {
          this.categories[index]['itemList'] = categoryTerms;
          if (index === this.categories.length - 1) {
            this.isCategoryLabelLoded = true;
          }
        }
      }
    });
  }

  resetCategoriesTerms() {
    this.categories.forEach(async (item, index) => {
      if (index > 1) {
        this.categories[index]['itemList'] = [];
      }
    })
  }

async setFrameworkCategory1Value() {
  this.loader = await this.commonUtilService.getLoader();
  await this.loader.present();
  const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
    from: CachedItemRequestSourceFrom.SERVER,
    language: this.translate.currentLang,
    requiredCategories: this.appGlobalService.getRequiredCategories()
  };

  await this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
    .then(async (frameworks: Framework[]) => {
      if (!frameworks || !frameworks.length) {
        await this.loader.dismiss();
        this.commonUtilService.showToast('NO_DATA_FOUND');
        return;
      }
      this.syllabusList = frameworks.map(r => ({ name: r.name, code: r.identifier }));
      this.categories[0]['itemList'] = this.syllabusList;
      await this.loader.dismiss();
    });
}

isMultipleVales(category) {
  return category.index === 1 ? "false" : "true";
}

isDisabled(category, index) {
 // return (index <2 || this.profileSettingsForms.get(this.categories[index-1]).value.length) ? false : true
}

cancelEvent(category, event) {}

private populateCData(formControllerValues, correlationType): Array<CorrelationData> {
  const correlationList: Array<CorrelationData> = [];
  if (formControllerValues) {
    formControllerValues.forEach((value) => {
      correlationList.push({
        id: value,
        type: correlationType
      });
    });
  }
  return correlationList;
}

}
