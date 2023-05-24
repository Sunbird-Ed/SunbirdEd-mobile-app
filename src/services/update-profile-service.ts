import {
    Framework,
    FrameworkCategoryCodesGroup,
    FrameworkDetailsRequest, FrameworkService, FrameworkUtilService,
    GetSuggestedFrameworksRequest,
    NetworkError,
    Profile, ProfileService
} from '@project-sunbird/sunbird-sdk';
import {AppGlobalService} from '../services/app-global-service.service';
import {PageId} from '../services/telemetry-constants';
import {Inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import each from 'lodash/each';
import find from 'lodash/find';
import map from 'lodash/map';
import {CommonUtilService} from '../services/common-util.service';
import {TelemetryGeneratorService} from '../services/telemetry-generator.service';
import {Events} from '../util/events';
import {SbProgressLoader} from '../services/sb-progress-loader.service';

@Injectable()

export class UpdateProfileService {
    profile: Profile;
    isProfileUpdated: boolean;
    categories: Array<any> = [];
    boardList: Array<any> = [];
    mediumList: Array<any> = [];
    gradeList: Array<any> = [];

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
        @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
        private translate: TranslateService,
        public commonUtilService: CommonUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private events: Events,
        private appGlobalService: AppGlobalService,
        private sbProgressLoader: SbProgressLoader
    ) {
    }

    private setCurrentProfile(index, data) {
        if (!this.profile.medium || !this.profile.medium.length) {
            this.profile.medium = [];
        }
        switch (index) {
            case 0:
                this.profile.syllabus = [data.framework];
                this.profile.board = [data.board];
                this.setMedium(true, data.medium);
                this.profile.subject = [];
                this.setGrade(true, data.gradeLevel);
                break;
            case 1:
                this.profile.board = [data.board];
                this.setMedium(true, data.medium);
                this.profile.subject = [];
                this.setGrade(true, data.gradeLevel);
                break;
            case 2:
                this.setMedium(false, data.medium);
                break;
            case 3:
                this.setGrade(false, data.gradeLevel);
                break;
        }
        this.editProfile();
    }

    checkProfileData(data, profile) {
        this.profile = profile;
        if (data) {
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: this.translate.currentLang,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            // Auto update the profile if that board/framework is listed in custodian framework list.
            this.frameworkUtilService.getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest).toPromise()
                .then((res: Framework[]) => {
                    this.isProfileUpdated = false;
                    res.forEach(element => {
                        // checking whether content data framework Id exists/valid in syllabus list
                        if (data.board[0] === element.name || data.board.indexOf(element.name) !== -1) {
                            data.framework = element.identifier;
                            this.isProfileUpdated = true;
                            const frameworkDetailsRequest: FrameworkDetailsRequest = {
                                frameworkId: element.identifier,
                                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
                            };
                            this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
                                .then((framework: Framework) => {
                                    this.categories = framework.categories;
                                    this.boardList = find(this.categories, (category) => category.code === 'board').terms;
                                    this.mediumList = find(this.categories, (category) => category.code === 'medium').terms;
                                    this.gradeList = find(this.categories, (category) => category.code === 'gradeLevel').terms;
                                    if (data.board) {
                                        data.board = this.findCode(this.boardList, data.board[0], 'board');
                                    }
                                    if (data.medium) {
                                        if (typeof data.medium === 'string') {
                                            data.medium = [this.findCode(this.mediumList, data.medium, 'medium')];
                                        } else {
                                            data.medium = map(data.medium, (dataMedium) => {
                                                return find(this.mediumList, (medium) => medium.name === dataMedium).code;
                                            });
                                        }
                                    }
                                    if (data.gradeLevel && data.gradeLevel.length) {
                                        data.gradeLevel = map(data.gradeLevel, (dataGrade) => {
                                            return find(this.gradeList, (grade) => grade.name === dataGrade).code;
                                        });
                                    }
                                    if (profile && profile.syllabus && profile.syllabus[0] && data.framework === profile.syllabus[0]) {
                                        if (data.board) {
                                            if (profile.board && !(profile.board.length > 1) && data.board === profile.board[0]) {
                                                if (data.medium) {
                                                    let existingMedium = false;
                                                    for (let i = 0; i < data.medium.length; i++) {
                                                        const mediumExists = find(profile.medium, (medium) => {
                                                            return medium === data.medium[i];
                                                        });
                                                        if (!mediumExists) {
                                                            continue;
                                                        }
                                                        existingMedium = true;
                                                    }
                                                    if (!existingMedium) {
                                                        this.setCurrentProfile(2, data);
                                                    }
                                                    if (data.gradeLevel && data.gradeLevel.length) {
                                                        let existingGrade = false;
                                                        for (let i = 0; i < data.gradeLevel.length; i++) {
                                                            const gradeExists = find(profile.grade, (grade) => {
                                                                return grade === data.gradeLevel[i];
                                                            });
                                                            if (!gradeExists) {
                                                                break;
                                                            }
                                                            existingGrade = true;
                                                        }
                                                        if (!existingGrade) {
                                                            this.setCurrentProfile(3, data);
                                                        }
                                                    }
                                                }
                                            } else {
                                                this.setCurrentProfile(1, data);
                                            }
                                        }
                                    } else {
                                        this.setCurrentProfile(0, data);
                                    }
                                }).catch((err) => {
                                if (NetworkError.isInstance(err)) {
                                    this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
                                }
                            });

                            return;
                        }
                    });
                })
                .catch((err) => {
                    if (NetworkError.isInstance(err)) {
                        this.commonUtilService.showToast('ERROR_OFFLINE_MODE');
                    }
                });
        }
    }

    private setGrade(reset, grades) {
        if (reset) {
            this.profile.grade = [];
            this.profile.gradeValue = {};
        }
        each(grades, (grade) => {
            if (grade && this.profile.grade.indexOf(grade) === -1) {
                if (this.profile.grade && this.profile.grade.length) {
                    this.profile.grade.push(grade);
                } else {
                    this.profile.grade = [grade];
                }
            }
        });
    }

    private setMedium(reset, mediums) {
        if (reset) {
            this.profile.medium = [];
        }
        each(mediums, (medium) => {
            if (medium && this.profile.medium.indexOf(medium) === -1) {
                if (this.profile.medium && this.profile.medium.length) {
                    this.profile.medium.push(medium);
                } else {
                    this.profile.medium = [medium];
                }
            }
        });
    }

    private editProfile() {
        const req: Profile = {
            board: this.profile.board,
            grade: this.profile.grade,
            medium: this.profile.medium,
            subject: this.profile.subject,
            uid: this.profile.uid,
            handle: this.profile.handle,
            profileType: this.profile.profileType,
            source: this.profile.source,
            createdAt: this.profile.createdAt,
            syllabus: this.profile.syllabus
        };
        if (this.profile.grade && this.profile.grade.length > 0) {
            this.profile.grade.forEach(gradeCode => {
                for (let i = 0; i < this.gradeList.length; i++) {
                    if (this.gradeList[i].code === gradeCode) {
                        req.gradeValue = this.profile.gradeValue;
                        req.gradeValue[this.gradeList[i].code] = this.gradeList[i].name;
                        break;
                    }
                }
            });
        }
        this.profileService.updateProfile(req).toPromise()
            .then(async (res: any) => {
                if (res.syllabus && res.syllabus.length && res.board && res.board.length
                    && res.grade && res.grade.length && res.medium && res.medium.length) {
                    this.events.publish(AppGlobalService.USER_INFO_UPDATED);
                    this.events.publish('refresh:profile');
                    await this.appGlobalService.setOnBoardingCompleted();
                }
                this.commonUtilService.handleToTopicBasedNotification();
                this.appGlobalService.guestUserProfile = res;
                this.telemetryGeneratorService.generateProfilePopulatedTelemetry(PageId.DIAL_CODE_SCAN_RESULT,
                    req, 'auto');
                await this.sbProgressLoader.hide({id: 'DEFAULT'});
            })
            .catch(async () => {
                await this.sbProgressLoader.hide({id: 'DEFAULT'});
            });
    }

    private findCode(categoryList: Array<any>, data, categoryType) {
        if (find(categoryList, (category) => category.name === data)) {
            return find(categoryList, (category) => category.name === data).code;
        } else {
            return undefined;
        }
    }
}
