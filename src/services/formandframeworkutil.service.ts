import { Inject, Injectable } from '@angular/core';
import { AppGlobalService } from './app-global-service.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { PreferenceKey, SystemSettingsIds } from '../app/app.constant';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Events } from '@ionic/angular';
import {
    CategoryTerm,
    FormRequest,
    FormService,
    FrameworkService,
    FrameworkCategoryCodesGroup,
    FrameworkUtilService,
    GetFrameworkCategoryTermsRequest,
    GetSystemSettingsRequest,
    OrganizationSearchCriteria,
    Profile,
    ProfileService,
    SystemSettings,
    SystemSettingsService,
    SharedPreferences
} from 'sunbird-sdk';

@Injectable()
export class FormAndFrameworkUtilService {

    /**
     * This variable is used to store the language selected, which is required when getting form related details.
     *
     */
    selectedLanguage: string;
    profile: Profile;

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
        @Inject('FRAMEWORK_UTIL_SERVICE') private frameworkUtilService: FrameworkUtilService,
        @Inject('FORM_SERVICE') private formService: FormService,
        @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private appVersion: AppVersion,
        private translate: TranslateService,
        private events: Events
    ) {
        // Get language selected
        this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise()
            .then(val => {
                if (val && val.length) {
                    this.selectedLanguage = val;
                }
            });
    }

    /**
     * This method gets the Library filter config.
     *
     */
    getLibraryFilterConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            let libraryFilterConfig: Array<any> = [];

            // get cached library config
            libraryFilterConfig = this.appGlobalService.getCachedLibraryFilterConfig();

            if (libraryFilterConfig === undefined || libraryFilterConfig.length === 0) {
                libraryFilterConfig = [];
                this.invokeLibraryFilterConfigFormApi(libraryFilterConfig, resolve, reject);
            } else {
                resolve(libraryFilterConfig);
            }
        });
    }

    /**
     * This method gets the course filter config.
     *
     */
    getCourseFilterConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            let courseFilterConfig: Array<any> = [];

            // get cached course config
            courseFilterConfig = this.appGlobalService.getCachedCourseFilterConfig();

            if (courseFilterConfig === undefined || courseFilterConfig.length === 0) {
                courseFilterConfig = [];
                this.invokeCourseFilterConfigFormApi(courseFilterConfig, resolve, reject);
            } else {
                resolve(courseFilterConfig);
            }
        });
    }

    /**
     * This method checks if the newer version of the available and respectively shows the dialog with relevant contents
     */
    checkNewAppVersion(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('checkNewAppVersion Called');

            this.appVersion.getVersionCode()
                .then((versionCode: any) => {
                    console.log('checkNewAppVersion Current app version - ' + versionCode);

                    let result: any;

                    // form api request
                    const req: FormRequest = {
                        type: 'app',
                        subType: 'install',
                        action: 'upgrade'
                    };
                    // form api call
                    this.formService.getForm(req).toPromise()
                        .then((res: any) => {
                            let fields: Array<any> = [];
                            let ranges: Array<any> = [];
                            let upgradeTypes: Array<any> = [];

                            if (res && res.form && res.form.data) {
                                fields = res.form.data.fields;

                                fields.forEach(element => {
                                    if (element.language === this.selectedLanguage) {
                                        if (element.range) {
                                            ranges = element.range;
                                        }

                                        if (element.upgradeTypes) {
                                            upgradeTypes = element.upgradeTypes;
                                        }
                                    }
                                });

                                if (ranges && ranges.length > 0 && upgradeTypes && upgradeTypes.length > 0) {
                                    let type: string;
                                    const forceType = 'force';

                                    ranges.forEach(element => {
                                        if (versionCode >= element.minVersionCode && versionCode <= element.maxVersionCode) {
                                            console.log('App needs a upgrade of type - ' + element.type);
                                            type = element.type;

                                            if (type === forceType) {
                                                return true; // this is to stop the foreach loop
                                            }
                                        }
                                    });

                                    upgradeTypes.forEach(upgradeElement => {
                                        if (type === upgradeElement.type) {
                                            result = upgradeElement;
                                        }
                                    });
                                }
                            }

                            resolve(result);
                        }).catch((error: any) => {
                            reject(error);
                        });
                });
        });
    }

    /**
     * Network call to form api
     *
     * @param courseFilterConfig
     * @param resolve
     * @param reject
     */
    private invokeCourseFilterConfigFormApi(courseFilterConfig: Array<any>,
                                            resolve: (value?: any) => void,
                                            reject: (reason?: any) => void) {

        const req: FormRequest = {
            type: 'pageassemble',
            subType: 'course',
            action: 'filter_v2',
        };
        // form api call
        this.formService.getForm(req).toPromise()
            .then((res: any) => {
                courseFilterConfig = res.form.data.fields;
                this.appGlobalService.setCourseFilterConfig(courseFilterConfig);
                resolve(courseFilterConfig);
            }).catch((error: any) => {
                console.log('Error - ' + error);
                resolve(courseFilterConfig);
            });
    }

    /**
     * Get all categories using framework api
     */
    // getFrameworkDetails(frameworkId: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         const req: FrameworkDetailsRequest = {
    //             defaultFrameworkDetails: true,
    //             categories: FrameworkCategory.DEFAULT_FRAMEWORK_CATEGORIES
    //         };

    //         if (frameworkId !== undefined && frameworkId.length) {
    //             req.defaultFrameworkDetails = false;
    //             req.frameworkId = frameworkId;
    //         }

    //         this.framework.getAllCategories(req)
    //             .then(res => {
    //                 resolve(res);
    //             })
    //             .catch(error => {
    //                 reject(error);
    //             });
    //     });
    // }

    /**
     *
     * This gets the categoy data according to current and previously selected values
     *
     * @param req
     * @param frameworkId
     */
    // getCategoryData(req: CategoryRequest, frameworkId?: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         if (frameworkId !== undefined && frameworkId.length) {
    //             req.frameworkId = frameworkId;
    //         }

    //         const categoryList: Array<any> = [];

    //         this.framework.getCategoryData(req)
    //             .then(res => {
    //                 const category = JSON.parse(res);
    //                 const resposneArray = category.terms;
    //                 let value = {};
    //                 resposneArray.forEach(element => {

    //                     value = { 'name': element.name, 'code': element.code };

    //                     categoryList.push(value);
    //                 });

    //                 resolve(categoryList);
    //             })
    //             .catch(err => {
    //                 reject(err);
    //             });
    //     });
    // }

    /**
     * Network call to form api
     *
     * @param libraryFilterConfig
     * @param resolve
     * @param reject
     */
    private invokeLibraryFilterConfigFormApi(libraryFilterConfig: Array<any>,
                                             resolve: (value?: any) => void,
                                             reject: (reason?: any) => void) {
        const req: FormRequest = {
            type: 'pageAssemble',
            subType: 'library',
            action: 'filter',
        };
        // form api call
        this.formService.getForm(req).toPromise()
            .then((res: any) => {
                libraryFilterConfig = res.form.data.fields;
                this.appGlobalService.setLibraryFilterConfig(libraryFilterConfig);
                resolve(libraryFilterConfig);
            }).catch((error: any) => {
                console.log('Error - ' + error);
                resolve(libraryFilterConfig);
            });
    }
    /**
     * update local profile for logged in user and return promise with a status saying,
     *  whether user has to be redirected to categoryedit page or library page
     * @param profileRes : profile details of logged in user which can be obtained using userProfileService.getUserProfileDetails
     * @param profileData : Local profile of current user
     */
    updateLoggedInUser(profileRes, profileData) {
        return new Promise((resolve, reject) => {
            const profile = {
                board: [],
                grade: [],
                medium: [],
                subject: [],
                syllabus: [],
                gradeValue: {}
            };
            if (profileRes.framework && Object.keys(profileRes.framework).length) {
                const categoryKeysLen = Object.keys(profileRes.framework).length;
                let keysLength = 0;
                profile.syllabus = [profileRes.framework.id[0]];
                for (const categoryKey in profileRes.framework) {
                    if (profileRes.framework[categoryKey].length) {
                        const request: GetFrameworkCategoryTermsRequest = {
                            currentCategoryCode: categoryKey,
                            language: this.translate.currentLang,
                            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
                            frameworkId: profileRes.framework.id ? profileRes.framework.id[0] : undefined
                        };
                        this.frameworkUtilService.getFrameworkCategoryTerms(request).toPromise()
                            .then((categoryList: CategoryTerm[]) => {
                                keysLength++;
                                profileRes.framework[categoryKey].forEach(element => {
                                    if (categoryKey === 'gradeLevel') {
                                        const codeObj = _.find(categoryList, (category) => category.name === element);
                                        if (codeObj) {
                                            profile['grade'].push(codeObj.code);
                                            profile['gradeValue'][codeObj.code] = element;
                                        }
                                    } else {
                                        const codeObj = _.find(categoryList, (category) => category.name === element);
                                        if (codeObj) {
                                            profile[categoryKey].push(codeObj.code);
                                        }
                                    }
                                });
                                if (categoryKeysLen === keysLength) {
                                    this.updateProfileInfo(profile, profileData)
                                        .then((response) => {
                                            resolve(response);
                                        });
                                }
                            })
                            .catch(err => {
                                keysLength++;
                                if (categoryKeysLen === keysLength) {
                                    this.updateProfileInfo(profile, profileData)
                                        .then((response) => {
                                            resolve(response);
                                        });
                                }
                            });
                    } else {
                        keysLength++;
                    }
                }
            } else {
                resolve({ status: false });
            }
        });
    }

    updateProfileInfo(profile, profileData) {
        return new Promise((resolve, reject) => {
            const req: Profile = {
                syllabus: profile.syllabus,
                board: profile.board,
                grade: profile.grade,
                medium: profile.medium,
                subject: profile.subject,
                gradeValue: profile.gradeValue,
                uid: profileData.uid,
                handle: profileData.uid,
                profileType: profileData.profileType,
                source: profileData.source,
                createdAt: profileData.createdAt || this.formatDate()
            };
            if (profile.board && profile.board.length > 1) {
                profile.board.splice(1, profile.board.length);
            }
            // this.preference.getString('current_framework_id')
            // .then(value => {
            // req.syllabus = [value];
            this.profileService.updateProfile(req).toPromise()
                .then((res: any) => {
                    const updateProfileRes = res;
                    this.events.publish('refresh:loggedInProfile');
                    if (updateProfileRes.board && updateProfileRes.grade && updateProfileRes.medium &&
                        updateProfileRes.board.length && updateProfileRes.grade.length
                        && updateProfileRes.medium.length
                    ) {
                        resolve({ status: true });
                    } else {
                        resolve({ status: false, profile: updateProfileRes });
                    }
                })
                .catch((err: any) => {
                    console.error('Err', err);
                    resolve({ status: false });
                });
            // });
        });
    }

    formatDate() {
        const options = {
            day: '2-digit', year: 'numeric', month: 'short', hour: '2-digit',
            minute: '2-digit', second: '2-digit', hour12: true
        };
        const date = new Date().toLocaleString('en-us', options);
        return (date.slice(0, 12) + date.slice(13, date.length));
    }

    async getRootOrganizations() {
        let rootOrganizations;
        try {
            rootOrganizations = this.appGlobalService.getCachedRootOrganizations();
            // if data not cached
            if (rootOrganizations === undefined || rootOrganizations.length === 0) {
                const searchOrganizationReq: OrganizationSearchCriteria<{ any }> = {
                    filters: {
                        isRootOrg: true
                    }
                };
                rootOrganizations = await this.frameworkService.searchOrganization(searchOrganizationReq).toPromise();
                console.log('rootOrganizations', rootOrganizations);
                rootOrganizations = rootOrganizations.content;
                // cache the data
                this.appGlobalService.setRootOrganizations(rootOrganizations);
                return rootOrganizations;
            } else {
                // return from cache
                return rootOrganizations;
            }
        } catch (error) {
            console.log(error);
        }

    }

    async getCourseFrameworkId() {
        return new Promise((resolve, reject) => {
            const getSystemSettingsRequest: GetSystemSettingsRequest = {
                id: SystemSettingsIds.COURSE_FRAMEWORK_ID
            };
            this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
                .then((res: SystemSettings) => {
                    resolve(res.value);
                }).catch(err => {
                    reject(err);
                });
        });

    }

    /**
     *
     */
    async getCustodianOrgId() {
        return new Promise((resolve, reject) => {
            const getSystemSettingsRequest: GetSystemSettingsRequest = {
                id: SystemSettingsIds.CUSTODIAN_ORG_ID
            };
            this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
                .then((res: SystemSettings) => {
                    resolve(res.value);
                }).catch(err => {
                    reject(err);
                });
        });
    }

    /**
     *
     */
    async getContentComingSoonMsg() {
        return new Promise((resolve, reject) => {
            const getSystemSettingsRequest: GetSystemSettingsRequest = {
                id: SystemSettingsIds.CONTENT_COMING_SOON_MSG
            };
            this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
                .then((res: SystemSettings) => {
                    console.log('getContentComingSoonMsg : res.value: ', res.value);
                    resolve(res.value);
                }).catch(err => {
                    reject(err);
                });
        });
    }

    async getConsumptionFaqsUrl() {
        return new Promise((resolve, reject) => {
            const getSystemSettingsRequest: GetSystemSettingsRequest = {
                id: SystemSettingsIds.CONSUMPTION_FAQS
            };
            this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
                .then((res: SystemSettings) => {
                    resolve(res.value);
                }).catch(err => {
                    reject(err);
                });
        });
    }

}
