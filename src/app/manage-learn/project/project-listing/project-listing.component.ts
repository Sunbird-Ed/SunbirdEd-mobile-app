import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService, CommonUtilService } from '@app/services';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { LoaderService, UtilsService, ToastService } from "../../core";
import { DbService } from '../../core/services/db.service';
import { urlConstants } from '../../core/constants/urlConstants';
import { Platform } from '@ionic/angular';
import { LibraryFiltersLayout } from '@project-sunbird/common-consumption';
import { TranslateService } from '@ngx-translate/core';
import { SyncService } from '../../core/services/sync.service';
import { PopoverController, ToastController } from '@ionic/angular';
import { KendraApiService } from '../../core/services/kendra-api.service';
import { GenericPopUpService } from '../../shared';

@Component({
    selector: 'app-project-listing',
    templateUrl: './project-listing.component.html',
    styleUrls: ['./project-listing.component.scss'],
})
export class ProjectListingComponent implements OnInit {
    private backButtonFunc: Subscription;
    page = 1;
    offlineProjectPage = 1;
    count = 0;
    description;
    limit = 10;
    offset = 0;
    currentOnlineProjectLength = 0;

    searchText: string = '';
    headerConfig = {
        showHeader: true,
        showBurgerMenu: false,
        actionButtons: [],
    };
    projects = [];
    filters = [];
    selectedFilterIndex = 0;
    selectedFilter;
    layout = LibraryFiltersLayout.ROUND;
    payload;
    networkFlag: any;
    private _networkSubscription?: Subscription;
    private _toast: any;

    constructor(
        private router: Router,
        private location: Location,
        private headerService: AppHeaderService,
        private platform: Platform,
        private unnatiService: UnnatiDataService,
        private kendra: KendraApiService,
        private loader: LoaderService,
        private translate: TranslateService,
        private utils: UtilsService,
        private commonUtilService: CommonUtilService,
        private syncService: SyncService,
        private db: DbService,
        private popOverCtrl: PopoverController,
        private toastController: ToastController,
        private popupService: GenericPopUpService,
        private toastService: ToastService
    ) {
        this.translate.get(['FRMELEMNTS_LBL_ASSIGNED_TO_ME', 'FRMELEMNTS_LBL_CREATED_BY_ME']).subscribe(translations => {
            this.filters = [translations['FRMELEMNTS_LBL_CREATED_BY_ME'], translations['FRMELEMNTS_LBL_ASSIGNED_TO_ME']];
            this.selectedFilter = this.filters[0];
        });

        this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
            this.clearFields();
            this.networkFlag = available;
            this.projects = [];
            this.fetchProjectList();
        });
    }

    ngOnInit() { }
    async getDownloadedProjects(fields?: any[]): Promise<[]> {
        let isAprivateProgramQuery;
        this.selectedFilterIndex === 1 ? (isAprivateProgramQuery = false) : (isAprivateProgramQuery = { $ne: false });
        let query = {
            selector: {
                downloaded: true,
                isAPrivateProgram: isAprivateProgramQuery,
            },
            limit: 10 * this.offlineProjectPage,
        };
        fields ? (query['fields'] = fields) : null;
        try {
            let data: any = await this.db.customQuery(query);
            return data.docs;
        } catch (error) {
        }
    }

    async getOfflineCreatedProjects(fields?: any[]): Promise<[]> {
        let isAprivateProgramQuery;
        this.selectedFilterIndex === 1 ? (isAprivateProgramQuery = false) : (isAprivateProgramQuery = { $ne: false });
        let query = {
            selector: {
                downloaded: true,
                isAPrivateProgram: isAprivateProgramQuery,
                isNew: true,
            },
            limit: 10 * this.offlineProjectPage,
        };
        if (fields) {
            query['fields'] = fields
        }
        try {
            let data: any = await this.db.customQuery(query);
            return data.docs;
        } catch (error) {
            console.log(error);
        }
    }


    // private initNetworkDetection() {
    //     this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
    //     this.projects = [];
    //     this._networkSubscription = this.commonUtilService.networkAvailability$.subscribe(async (available: boolean) => {
    //         this.clearFields();
    //         this.networkFlag = available;
    //         this.projects = [];
    //         console.log(this.projects, "this.projects 123");
    //         this.fetchProjectList();
    //     });
    // }

    getDownloadedProjectsList() {
        this.getDownloadedProjects().then(project => {
            this.projects = project;
        })
    }
    clearFields() {
        this.searchText = '';
        this.page = 1;
        this.count = 0;
    }

    async getCreatedProjects() {
        this.getOfflineCreatedProjects().then(offlineProjects => {
            this.projects = offlineProjects;
            this.currentOnlineProjectLength = 0;
            this.getProjectList();
        })
    }

    private async presentPopupForOffline(text = this.commonUtilService.translateMessage('INTERNET_CONNECTIVITY_NEEDED')) {
        const toast = await this.toastController.create({
            message: text,
            position: 'top',
            duration: 2000,
            color: 'danger',
        });
        toast.present();
    }

    ionViewWillEnter() {
        this.clearFields();
        this.projects = [];
        this.page = 1;
        this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable;
        // this.initNetworkDetection();
        this.fetchProjectList();
        this.headerConfig = this.headerService.getDefaultPageConfig();
        this.headerConfig.actionButtons = [];
        this.headerConfig.showHeader = true;
        this.headerConfig.showBurgerMenu = false;
        this.headerService.updatePageConfig(this.headerConfig);
        this.handleBackButton();
    }

    getDataByFilter(filter) {
        this.projects = [];
        this.page = 1;
        this.currentOnlineProjectLength = 0;

        this.selectedFilter = filter ? filter.data.text : this.selectedFilter;
        this.selectedFilterIndex = filter ? filter.data.index : this.selectedFilterIndex;
        this.searchText = '';
        this.fetchProjectList();
    }

    fetchProjectList() {
        this.projects = [];
        if (this.networkFlag) {
            this.selectedFilterIndex == 1 ? this.getProjectList() : this.getCreatedProjects()
        } else {
            this.getDownloadedProjectsList();
        }
    }

    async getProjectList() {
        if (!this.networkFlag) {
            return;
        }
        let offilineIdsArr = await this.getDownloadedProjects(['_id']);
        this.loader.startLoader();
        const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
        if (selectedFilter == 'assignedToMe') {
            this.payload = !this.payload ? await this.utils.getProfileInfo() : this.payload;
        }
        const config = {
            url: urlConstants.API_URLS.GET_TARGETED_SOLUTIONS + '?type=improvementProject&page=' + this.page + '&limit=' + this.limit + '&search=' + this.searchText + '&filter=' + selectedFilter,
            payload: selectedFilter == 'assignedToMe' ? this.payload : ''
        }
        this.kendra.post(config).subscribe(success => {
            this.loader.stopLoader();
            this.projects = this.projects.concat(success.result.data);
            this.projects.map((p) => {
                if (offilineIdsArr.find((offProject) => offProject['_id'] == p._id)) p.downloaded = true;
            });
            this.count = success.result.count;
            this.currentOnlineProjectLength = this.currentOnlineProjectLength + success.result.data.length;
            this.description = success.result.description;
        }, error => {
            this.projects = [];
            this.loader.stopLoader();
        })
    }

    ionViewWillLeave() {
        if (this.backButtonFunc) {
            this.backButtonFunc.unsubscribe();
        }
        this.utils.closeProfileAlert();
    }

    public handleBackButton() {
        this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
            this.location.back();
            this.backButtonFunc.unsubscribe();
        });
    }

    selectedProgram(project) {
        const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
        this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
            queryParams: {
                projectId: project._id,
                programId: project.programId,
                solutionId: project.solutionId,
                type: selectedFilter,
            },
        });
    }

    loadMore() {
        this.page = this.page + 1;
        this.limit = 10;
        this.getProjectList();
    }


    onSearch(e) {
        if (this.searchText) {
            let query = this.networkFlag ? this.searchCreatedProjects() : this.searchOfflineProjects();
            const searchFilter: any = {
                title: {
                    $regex: RegExp(this.searchText, 'i')
                }
            };
            query.selector.$and.push(searchFilter);
            this.db.customQuery(query).then(success => {
                this.projects = success['docs'];
                if (this.networkFlag) {
                    this.page = 1;
                    this.currentOnlineProjectLength = 0;
                    this.getProjectList();
                }
            }, error => {
            })
        } else {
            this.projects = [];
            this.getDownloadedProjectsList();
        }
    }

    searchOfflineProjects() {
        const query = {
            selector: {
                $and: [
                    {
                        isDeleted: {
                            $ne: true
                        },
                        Downloaded: {
                            $ne: false
                        }
                    }
                ],
            },
            fields: ['title', '_id', 'downloaded', 'hasAcceptedTAndC'],
        };
        return query
    }
    searchCreatedProjects() {
        const query = {
            selector: {
                $and: [
                    {
                        isDeleted: {
                            $ne: true
                        },
                        Downloaded: {
                            $ne: false
                        },
                        isNew: {
                            $ne: false
                        }
                    }
                ],
            },
            fields: ['title', '_id', 'downloaded', 'hasAcceptedTAndC'],
        };
        return query
    }
    async createProject(data) {
        // if (!this.networkFlag) {
        //     this.presentPopupForOffline(this.commonUtilService.translateMessage('FRMELEMNTS_MSG_OFFLINE_CREATE_PROJECT'));
        //     return;
        // }
        this.router.navigate([`${RouterLinks.CREATE_PROJECT_PAGE}`], {
            queryParams: { hasAcceptedTAndC: data },
        });
    }

    async downloaded(project) {
        let projectData
        try {
            projectData = await this.db.getById(project._id);

        } catch (error) {
            projectData = null
        }
        if (projectData) {
            projectData.downloaded = true
            await this.db.update(projectData)
            project.downloaded = true
            // this.initNetworkDetection()
            return
        }


        this.loader.startLoader();
        let payload = this.selectedFilterIndex == 1 ? await this.utils.getProfileInfo() : '';
        let id = project._id ? '/' + project._id : '';
        const config = {
            url: urlConstants.API_URLS.GET_PROJECT + id + '?solutionId=' + project.solutionId,
            payload: this.selectedFilterIndex == 1 ? payload : {},
        };
        this.unnatiService.post(config).subscribe(async (success) => {
            this.loader.stopLoader();
            let data = success.result;
            success.result.downloaded = true;
            let newCategories = []
            for (const category of data.categories) {
                if (category._id || category.name) {
                    const obj = {
                        label: category.name || category.label,
                        value: category._id
                    }
                    newCategories.push(obj)
                }
            }
            data.categories = newCategories.length ? newCategories : data.categories;
            if (data.tasks) {

                data.tasks.map(t => {
                    if ((t.type == 'observation' || t.type == 'assessment') && t.submissionDetails && t.submissionDetails.status) {
                        if (t.submissionDetails.status != t.status) {
                            t.status = t.submissionDetails.status
                            t.isEdit = true;
                            data.isEdit = true
                        }
                    }
                })

            }
            await this.db.create(success.result)
            // this.initNetworkDetection()
            project.downloaded = true;

        })

    }

    ngOnDestroy() {
        if (this._networkSubscription) {
            this._networkSubscription.unsubscribe();
            if (this._toast) {
                this._toast.dismiss();
                this._toast = undefined;
            }
        }
    }

    doAction(id?, project?) {
        if (project) {
            const selectedFilter = this.selectedFilterIndex === 1 ? 'assignedToMe' : 'createdByMe';
            if (!project.hasAcceptedTAndC && selectedFilter == 'createdByMe') {
                this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
                    if (data && data.isClicked) {
                        if (data.isChecked) {
                            if (project.isNew) {
                                project.hasAcceptedTAndC = data.isChecked;
                                this.db.update(project)
                                    .then((success) => {
                                        this.selectedProgram(project);
                                    })
                                return;
                            }
                            if (this.networkFlag) {
                                this.checkProjectInLocal(id, data.isChecked, project);
                            } else {
                                this.toastService.showMessage('FRMELEMNTS_MSG_PROJECT_PRIVACY_POLICY_TC_OFFLINE', 'danger');
                                this.selectedProgram(project);
                            }
                        } else {
                            this.selectedProgram(project);
                        }
                    }
                })
            } else {
                this.selectedProgram(project);
            }
        } else {
            this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
                data && data.isClicked ? this.createProject(data.isChecked) : '';
            })
        }
    }

    checkProjectInLocal(id, status, selectedProject) {
        this.db.query({ _id: id }).then(
            (success) => {
                if (success.docs.length) {
                    let project = success.docs.length ? success.docs[0] : {};
                    project.hasAcceptedTAndC = status;
                    this.db.update(project)
                        .then((success) => {
                            this.updateInserver(project);
                        })
                } else {
                    selectedProject.hasAcceptedTAndC = status;
                    selectedProject.hasAcceptedTAndC ? this.updateInserver(selectedProject) : this.selectedProgram(selectedProject);
                }
            },
            (error) => {
            }
        );
    }
    updateInserver(project) {
        let payload = {
            _id: project._id,
            lastDownloadedAt: project.lastDownloadedAt,
            hasAcceptedTAndC: project.hasAcceptedTAndC
        }
        this.syncService.syncApiRequest(payload, false).then(resp => {
            this.selectedProgram(project);
        })
    }
}
