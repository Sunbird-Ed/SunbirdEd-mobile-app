import { Component, Inject, OnInit } from '@angular/core';
import { AppGlobalService, CommonUtilService } from '@app/services';
import { CourseCardGridTypes } from '@project-sunbird/common-consumption';
import { NavigationExtras, Router } from '@angular/router';
import { FrameworkService, FrameworkDetailsRequest, FrameworkCategoryCodesGroup, Framework, Profile, ProfileService } from '@project-sunbird/sunbird-sdk';
import { ProfileConstants, RouterLinks } from '../app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-home',
  templateUrl: './new-home.page.html',
  styleUrls: ['./new-home.page.scss'],
})
export class NewHomePage implements OnInit {

  aggregatorResponse = [];
  courseCardType = CourseCardGridTypes;
  selectedFilter: string;
  concatProfileFilter: Array<string> = [];
  categories: Array<any> = [];
  boards: string;
  medium: string;
  grade: string;
  profile: Profile;
  guestUser: boolean;
  appLabel: string;

  constructor(
    @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private appGlobalService: AppGlobalService,
    private appVersion: AppVersion,
    private translate: TranslateService,
  ) {
  }

  async getUserProfileDetails() {
    await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS })
    .subscribe((profile: Profile) => {
      this.profile = profile;
      this.getFrameworkDetails();
    });
    this.guestUser = !this.appGlobalService.isUserLoggedIn();
    this.appVersion.getAppName()
    .then((appName: any) => {
      this.appLabel = appName;
    });
  }

  ionViewWillEnter() {
    this.getUserProfileDetails();
  }

  ngOnInit() {
    // this.aggregatorResponse = '';
    // if (this.aggregatorResponse) {
    //   this.aggregatorResponse.forEach((val) => {
    //     val['name'] = this.commonUtilService.getTranslatedValue(val.title, '');
    //     if (val.dataSrc === 'TRACKABLE_CONTENTS') {
    //       for (let count = 0; count < val.data.contents.length; count++) {
    //         val.data[0].contents[count]['cardImg'] =
    //           this.commonUtilService.getContentImg(val.data[0].contents[count]);
    //       }
    //       // } else if (val.orientation === Orientation.VERTICAL) {
    //       //     for (let i = 0; i < val.section.sections.length; i++) {
    //       //         for (let count = 0; count < val.section.sections[i].contents.length; count++) {
    //       //             val.section.sections[i].contents[count]['cardImg'] =
    //       //                 this.commonUtilService.getContentImg(val.section.sections[i].contents[count]);
    //       //         }
    //       //     }
    //     }
    //   });
    // }
    // console.log('hhhhhh', this.aggregatorResponse);
  }

  editProfileDetails() {
    if (!this.guestUser) {
      this.router.navigate([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`]);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          profile: this.profile,
          isCurrentUser: true
        }
      };
      this.router.navigate([RouterLinks.GUEST_EDIT], navigationExtras);
    }
  }

  getFrameworkDetails(frameworkId?: string): void {
    const frameworkDetailsRequest: FrameworkDetailsRequest = {
      frameworkId: (this.profile && this.profile.syllabus && this.profile.syllabus[0]) ? this.profile.syllabus[0] : '',
      requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
    };
    this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
      .then(async (framework: Framework) => {
        this.categories = framework.categories;

        if (this.profile.board && this.profile.board.length) {
          this.boards = this.getFieldDisplayValues(this.profile.board, 0);
        }
        if (this.profile.medium && this.profile.medium.length) {
          this.medium = this.getFieldDisplayValues(this.profile.medium, 1);
        }
        if (this.profile.grade && this.profile.grade.length) {
          this.grade = this.getFieldDisplayValues(this.profile.grade, 2);
        }
      });
  }

  getFieldDisplayValues(field: Array<any>, catIndex: number): string {
    const displayValues = [];
    this.categories[catIndex].terms.forEach(element => {
      if (field.includes(element.code)) {
        displayValues.push(element.name);
      }
    });
    return this.commonUtilService.arrayToString(displayValues);
  }

    goToNextPage() {
        const mockData: any = {
            facet: 'English',
            searchCriteria: {
                board: ['State (Andhra Pradesh)'],
                facets: ['subject'],
                grade: ['Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'],
                limit: 0,
                medium: ['English', 'Telugu', 'Urdu'],
                mode: 'hard',
                offset: 0,
                subject: ['english']
            },
            aggregate: {groupBy: 'primaryCategory'}
        };
        const params = {
            formField: mockData
        };
        this.router.navigate([RouterLinks.HOME_PAGE], {state: params});
    }
}
