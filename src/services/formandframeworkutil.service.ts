import { Inject, Injectable } from '@angular/core';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '@app/util/events';
import {
    CategoryTerm,
    FormRequest,
    FormService,
    FrameworkCategoryCodesGroup,
    FrameworkService,
    FrameworkUtilService,
    GetFrameworkCategoryTermsRequest,
    GetSystemSettingsRequest,
    OrganizationSearchCriteria,
    Profile,
    ProfileService,
    SharedPreferences,
    SystemSettings,
    SystemSettingsService,
    WebviewSessionProviderConfig,
    SignInError,
    FrameworkCategoryCode,
} from 'sunbird-sdk';

import { ContentFilterConfig, PreferenceKey, SystemSettingsIds, PrimaryCategory } from '@app/app/app.constant';
import { map } from 'rxjs/operators';
import { EventParams } from '@app/app/components/sign-in-card/event-params.interface';
import { Observable } from 'rxjs';
import { FormConstants } from '@app/app/form.constants';

@Injectable()
export class FormAndFrameworkUtilService {
    contentFilterConfig: Array<any> = [];
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
    ) { }

    async init() {
        await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise().then(val => {
            this.selectedLanguage = val ? val : 'en';
        });
        this.invokeUrlRegexFormApi();
    }

    getWebviewSessionProviderConfig(context: 'login' | 'merge' | 'migrate' | 'register' | 'state'): Promise<WebviewSessionProviderConfig> {
        return this.getFormFields(FormConstants.LOGIN_CONFIG).then((fields) => {
            const config = fields.find(c => c.context === context);
            if (!config) {
                throw new SignInError('SESSION_PROVIDER_CONFIG_NOT_FOUND');
            }

            return config;
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

    async getDialcodeRegexFormApi(): Promise<string> {
        const urlRegexConfig = this.appGlobalService.getCachedSupportedUrlRegexConfig();
        if (!urlRegexConfig || !urlRegexConfig.dialcode) {
            const regObj = await this.invokeUrlRegexFormApi();
            if (regObj && regObj.dialcode) {
                return regObj.dialcode;
            }
            return '';
        }
        return urlRegexConfig.dialcode;
    }

    async getDeeplinkRegexFormApi(): Promise<string> {
        const urlRegexConfig = this.appGlobalService.getCachedSupportedUrlRegexConfig();
        if (!urlRegexConfig || !urlRegexConfig.identifier) {
            const regObj = await this.invokeUrlRegexFormApi();
            if (regObj && regObj.identifier) {
                return regObj.identifier;
            }
            return '';
        }
        return urlRegexConfig.identifier;
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
     * This method gets the location config.
     *
     */
    getLocationConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            let locationConfig: Array<any> = [];

            // get cached course config
            locationConfig = this.appGlobalService.getCachedLocationConfig();

            if (locationConfig === undefined || locationConfig.length === 0) {
                locationConfig = [];
                this.invokeLocationConfigFormApi(locationConfig, resolve, reject);
            } else {
                resolve(locationConfig);
            }
        });
    }

    /**
     * This method checks if the newer version of the available and respectively shows the dialog with relevant contents
     */
    checkNewAppVersion(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('checkNewAppVersion Called');

            return this.appVersion.getVersionCode()
                .then((versionCode: any) => {
                    console.log('checkNewAppVersion Current app version - ' + versionCode);
                    this.getFormFields(FormConstants.UPGRADE_INFO).then((fields: any) => {
                        let ranges: Array<any> = [];
                        let upgradeTypes: Array<any> = [];
                        if (fields && fields.length) {
                            for (const element of fields) {
                                if (element.language === this.selectedLanguage) {
                                    if (element.range) {
                                        ranges = element.range;
                                    }

                                    if (element.upgradeTypes) {
                                        upgradeTypes = element.upgradeTypes;
                                    }
                                }
                            }

                            if (ranges && ranges.length > 0 && upgradeTypes && upgradeTypes.length > 0) {
                                const range = ranges.reduce((acc, r) => {
                                    if (versionCode >= r.minVersionCode && versionCode <= r.maxVersionCode) {
                                        if (acc && (acc.type === 'force' || acc.type === 'forced')) {
                                            return acc;
                                        }
                                        return r;
                                    }
                                    return acc;
                                }, undefined);

                                if (!range) {
                                    resolve(undefined);
                                    return;
                                }

                                const result = upgradeTypes.find((u) => u.type === range.type);
                                result.minVersionCode = range.minVersionCode;
                                result.maxVersionCode = range.maxVersionCode;
                                result.currentAppVersionCode = versionCode;
                                resolve(result);
                                return;
                            }
                        }
                        resolve(undefined);
                    }).catch((error: any) => {
                        reject(error);
                    });
                });
        });
    }

    /**
     * Network call to form api
     */
    private invokeCourseFilterConfigFormApi(
        courseFilterConfig: Array<any>,
        resolve: (value?: any) => void,
        reject: (reason?: any) => void) {

        this.getFormFields(FormConstants.PAGEASSEMBLE_FILTER_COURSE).then((fields: any) => {
            fields.forEach(config => {
                courseFilterConfig.push(config);
            });
            this.appGlobalService.setCourseFilterConfig(courseFilterConfig);
            resolve(courseFilterConfig);
        }).catch((error: any) => {
            console.log('Error - ' + error);
            resolve(courseFilterConfig);
        });
    }

    /**
     * Network call to form api
     */
    private invokeLibraryFilterConfigFormApi(
        libraryFilterConfig: Array<any>,
        resolve: (value?: any) => void,
        reject: (reason?: any) => void) {

        this.getFormFields(FormConstants.PAGEASSEMBLE_FILTER_COURSE).then((fields: any) => {
            fields.forEach(config => {
                libraryFilterConfig.push(config);
            });
            this.appGlobalService.setLibraryFilterConfig(libraryFilterConfig);
            resolve(libraryFilterConfig);
        }).catch((error: any) => {
            console.log('Error - ' + error);
            resolve(libraryFilterConfig);
        });
    }
    /**
     * Network call to form api to fetch Supported URL regex
     */
    invokeUrlRegexFormApi(): Promise<any> {
        return this.getFormFields(FormConstants.SUPPORTED_URL_REGEX).then((data) => {
            if (data && data.length) {
                const regObj = {};
                for (const ele of data) {
                    regObj[ele.code] = ele.values;
                }
                this.appGlobalService.setSupportedUrlRegexConfig(regObj);
                return regObj;
            }
        }).catch((error: any) => {
            console.error('error while fetching supported url reg ex ', error);
            return undefined;
        });
    }

    /**
     * Network call to form api
     */
    private invokeLocationConfigFormApi(
        locationConfig: Array<any>,
        resolve: (value?: any) => void,
        reject: (reason?: any) => void) {

        this.getFormFields(FormConstants.LOCATION_CONFIG).then((res) => {
            res.forEach(config => {
                locationConfig.push(config);
            });
            this.appGlobalService.setLocationConfig(locationConfig);
            resolve(locationConfig);
        }).catch((error: any) => {
            console.log('Error - ' + error);
            resolve(locationConfig);
        });
    }

    async getPdfPlayerConfiguration() {
        return new Promise((resolve, reject) => {
            let pdfPlayerConfig;
            // get cached pdfplayer config
            pdfPlayerConfig = this.appGlobalService.getPdfPlayerConfiguration();

            if (pdfPlayerConfig === undefined) {
                pdfPlayerConfig = this.invokePdfPlayerConfiguration(pdfPlayerConfig, resolve, reject);
            } else {
                resolve(pdfPlayerConfig);
            }
        });
    }




    // get pdf player enable or disable configuration
    async invokePdfPlayerConfiguration(
        pdfPlayerConfig: any,
        resolve: (value?: any) => void,
        reject: (reason?: any) => void) {
        let currentConfiguration;
        this.formService.getForm(FormConstants.PDF_PLAYER_CONFIG).toPromise()
            .then((res: any) => {
                currentConfiguration = res.form.data;
                this.appGlobalService.setpdfPlayerconfiguration(currentConfiguration);
                resolve(currentConfiguration);
            }).catch((error: any) => {
                console.log('Error - ' + error);
            });
    }

    private setContentFilterConfig(contentFilterConfig: Array<any>) {
        this.contentFilterConfig = contentFilterConfig;
    }

    private getCachedContentFilterConfig() {
        return this.contentFilterConfig;
    }

    public async invokeContentFilterConfigFormApi(): Promise<any> {
        return this.getFormFields(FormConstants.CONTENT_CONFIG)
            .then((res: any) => {
                this.setContentFilterConfig(res);
                return res;
            }).catch((error: any) => {
                console.log('Error - ' + error);
                return error;
            });
    }


    async getSupportedContentFilterConfig(name): Promise<Array<string>> {
        // get cached library config
        let contentFilterConfig: any = this.getCachedContentFilterConfig();
        let libraryTabContentTypes: Array<string>;

        if (contentFilterConfig === undefined || contentFilterConfig.length === 0) {
            await this.invokeContentFilterConfigFormApi()
                .then(fields => {
                    contentFilterConfig = fields;
                });
        }

        if (contentFilterConfig === undefined || contentFilterConfig.length === 0) {
            switch (name) {
                case ContentFilterConfig.NAME_LIBRARY:
                    libraryTabContentTypes = PrimaryCategory.FOR_LIBRARY_TAB;
                    break;
                case ContentFilterConfig.NAME_COURSE:
                    libraryTabContentTypes = PrimaryCategory.FOR_COURSE_TAB;
                    break;
                case ContentFilterConfig.NAME_DOWNLOADS:
                    libraryTabContentTypes = PrimaryCategory.FOR_DOWNLOADED_TAB;
                    break;
                case ContentFilterConfig.NAME_DIALCODE:
                    libraryTabContentTypes = PrimaryCategory.FOR_DIAL_CODE_SEARCH;
                    break;
            }
        } else {
            for (const field of contentFilterConfig) {
                if (field.name === name && field.code === ContentFilterConfig.CODE_PRIMARY_CATEGORY) {
                    libraryTabContentTypes = field.values;
                    break;
                }
            }
        }

        return libraryTabContentTypes;
    }


    /**
     * update local profile for logged in user and return promise with a status saying,
     *  whether user has to be redirected to category edit page or library page
     * @param profileRes : profile details of logged in user which can be obtained using userProfileService.getUserProfileDetails
     * @param profileData : Local profile of current user
     */
    updateLoggedInUser(profileRes, profileData, eventParams?: EventParams) {
        return new Promise(async (resolve, reject) => {
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
                if (profileRes.framework.id && profileRes.framework.id.length) {
                    profile.syllabus = [profileRes.framework.id[0]];
                }
                for (const categoryKey in profileRes.framework) {
                    if (profileRes.framework[categoryKey].length
                        && FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES.includes(categoryKey as FrameworkCategoryCode)) {
                        const request: GetFrameworkCategoryTermsRequest = {
                            currentCategoryCode: categoryKey,
                            language: this.translate.currentLang,
                            requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES,
                            frameworkId: (profileRes.framework && profileRes.framework.id) ? profileRes.framework.id[0] : undefined
                        };
                        await this.frameworkUtilService.getFrameworkCategoryTerms(request).toPromise()
                            .then((categoryTerms: CategoryTerm[]) => {
                                keysLength++;
                                profileRes.framework[categoryKey].forEach(element => {
                                    if (categoryKey === 'gradeLevel') {
                                        const codeObj = categoryTerms.find((category) => category.name === element);
                                        if (codeObj) {
                                            profile['grade'].push(codeObj.code);
                                            profile['gradeValue'][codeObj.code] = element;
                                        }
                                    } else {
                                        const codeObj = categoryTerms.find((category) => category.name === element);
                                        if (codeObj) {
                                            profile[categoryKey].push(codeObj.code);
                                        }
                                    }
                                });
                                if (categoryKeysLen === keysLength) {
                                    this.updateProfileInfo(profile, profileData, eventParams)
                                        .then((response) => {
                                            resolve(response);
                                        });
                                }
                            })
                            .catch(err => {
                                keysLength++;
                                if (categoryKeysLen === keysLength) {
                                    this.updateProfileInfo(profile, profileData, eventParams)
                                        .then((response) => {
                                            resolve(response);
                                        });
                                }
                            });
                    } else {
                        keysLength++;
                        if (categoryKeysLen === keysLength) {
                            this.updateProfileInfo(profile, profileData, eventParams)
                                .then((response) => {
                                    resolve(response);
                                });
                        }
                    }
                }
            } else {
                resolve({ status: false });
            }
        });
    }

    updateProfileInfo(profile, profileData, eventParams?: EventParams) {
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

            this.profileService.updateProfile(req).toPromise()
                .then((res: any) => {
                    const updateProfileRes = res;
                    this.events.publish('refresh:loggedInProfile', eventParams);
                    if (updateProfileRes.grade && updateProfileRes.medium &&
                        updateProfileRes.grade.length && updateProfileRes.medium.length
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
                const searchOrganizationReq: OrganizationSearchCriteria<{ hashTagId: string; orgName: string; slug: string; }> = {
                    filters: {
                        isRootOrg: true
                    },
                    fields: ['hashTagId', 'orgName', 'slug']
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

    async getTenantSpecificMessages(rootOrgId) {
        return new Promise((resolve, reject) => {
            this.getFormFields(FormConstants.EXTERNAL_ID_VERIFICATION, rootOrgId)
                .then((res: any) => {
                    const data = res;
                    if (data && data.length) {
                        resolve(data);
                    }
                }).catch((error: any) => {
                    reject(error);
                    console.error('error while fetching dial code reg ex ', error);
                });
        });
    }

    // get the required webview version
    getWebviewConfig() {
        return new Promise((resolve, reject) => {
            this.getFormFields(FormConstants.WEBVIEW_VERSION)
                .then((res: any) => {
                    if (res && res.length && res[0].version) {
                        resolve(parseInt(res[0].version, 10));
                    } else {
                        resolve(54);
                    }
                }).catch((error: any) => {
                    reject(error);
                });
        });
    }

    async getFormConfig() {
        return (await this.getFormFields(FormConstants.DYNAMIC_FORM_CONFIG).then() as any);
    }

    async getStateContactList() {
        return (await this.getFormFields(FormConstants.CONTACT_INFO).then() as any);
    }

    async getContentRequestFormConfig() {
        return (await this.getFormFields(FormConstants.DYNAMIC_CONTENT_REQUEST).then() as any);
    }

    async getConsentFormConfig() {
        return (await this.getFormFields(FormConstants.CONSENT_DECLARATION).then() as any);
    }

    async getNotificationFormConfig() {
        return (await this.getFormFields(FormConstants.NOTIFICATION).then() as any);
    }

    async getBoardAliasName() {
        return (await this.getFormFields(FormConstants.BOARD_ALIAS).then() as any);
    }

    async getSearchFilters(): Promise<any[]>{
        return await this.getFormFields(FormConstants.SEARCH_FILTER_CONFIG);
    }

    async getFormFields(formRequest: FormRequest, rootOrgId?: string) {
        formRequest.rootOrgId = rootOrgId || '*' ;
        const formData  = await this.formService.getForm(formRequest).toPromise() as any;
        return  (formData && formData.form && formData.form.data && formData.form.data.fields) || [];
    }

    public getOrganizationList(channelFacetFilter): Observable<{ orgName: string; rootOrgId: string; }[]> {
        const channelList = channelFacetFilter.values
            .reduce((acc, facet) => {
                acc.push(facet.name);
                return acc;
            }, []);
        const searchOrganizationReq: OrganizationSearchCriteria<{ orgName: string; rootOrgId: string; }> = {
            filters: {
                isRootOrg: true
            },
            fields: ['orgName', 'rootOrgId']
        };
        searchOrganizationReq.filters['rootOrgId'] = channelList;
        return this.frameworkService.searchOrganization(searchOrganizationReq).pipe(
            map((res) => res.content)
        );
    }

    async changeChannelIdToName(filterCriteria) {
        const channelFacet = filterCriteria.facetFilters.find((facetFilter) => facetFilter.name === 'channel');

        if (!channelFacet) {
            return filterCriteria;
        }

        let organizationList;
        try {
            organizationList = await this.getOrganizationList(channelFacet).toPromise();
        } catch (e) {
            console.error(e);
            return filterCriteria;
        }

        filterCriteria.facetFilters = filterCriteria.facetFilters.map(filter => {
            if (filter.name === 'channel') {
                const filterValues = []
                for (let i = 0; i < filter.values.length; i++) {
                    const channelData = organizationList.find(channel => channel.rootOrgId === filter.values[i].name);
                    if (channelData) {
                        filterValues.push({
                            ...filter.values[i],
                            name: channelData && channelData.orgName ? channelData.orgName : filter.values[i].name,
                            rootOrgId: channelData && channelData.rootOrgId ? channelData.rootOrgId : filter.values[i].name
                        })
                    }
                }
                filter.values = filterValues;
            }
            return filter;
        });

        return filterCriteria;
    }

    changeChannelNameToId(filterCriteria) {
        filterCriteria.facetFilters = filterCriteria.facetFilters.map(filter => {
            if (filter.name === 'channel') {
                filter.values = filter.values.map(val => {
                    val.name = val.rootOrgId || val.name;
                    return val;
                });
            }
            return filter;
        });

        return filterCriteria;
    }

    private async setSupportedAttributes(framework, userType?: string) {
        if (!userType) {
            userType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        }
        const frameworkDetails = {};
        frameworkDetails['userType'] = userType;
        const supportedFrameworkConfig = framework.filter((item) => {
            return (item.supportedUserTypes.find((type) => type === userType));
        });
        frameworkDetails['supportedFrameworkConfig'] = supportedFrameworkConfig;
        const  supportedAttributes = supportedFrameworkConfig.reduce((map, item) => {
            map[item.frameworkCode] = item.frameworkCode;
            return map;
        }, {});
        frameworkDetails['supportedAttributes'] = supportedAttributes;
        return frameworkDetails;
    }

    private invokeFrameworkCategoriesFormApi(userType?: string): Promise<any> {
        return this.getFormFields(FormConstants.FRAMEWORK_CONFIG).then(async (res) => {
            const categoryConfig = await this.setSupportedAttributes(res, userType);
            this.appGlobalService.setFramewokCategory(categoryConfig);
            return categoryConfig;
        }).catch((error) => {
            return error;
        });
    }

    getFrameworkCategoryList(userType?: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!userType) {
                await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise().then((type) => {
                    userType = type;
                });
            }
            const framework = this.appGlobalService.getCachedFrameworkCategory();
            console.log('................', framework);
            if (Object.keys(framework).length === 0 || (Object.keys(framework).length > 0 &&
             (framework.userType !== userType || !userType))) {
                  this.invokeFrameworkCategoriesFormApi(userType).then((res) => {
                resolve(res);
                });
            } else {
                resolve(framework);
            }
        });
    }

}
