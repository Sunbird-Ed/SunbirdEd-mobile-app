import {
  Component, OnInit, Inject, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterPipe } from '@app/pipes/filter/filter.pipe';
import {
  CommonUtilService, PageId, Environment, AppHeaderService,
  ImpressionType, TelemetryGeneratorService,
  CollectionService, AppGlobalService, InteractSubtype, InteractType, ID, AndroidPermissionsService
} from '@app/services';
import {
  GroupService, GroupActivityDataAggregationRequest,
  GroupMember, CachedItemRequestSourceFrom, Content,
  Group, MimeType, CorrelationData, TrackingEnabled
} from '@project-sunbird/sunbird-sdk';
import {
  CsGroupActivityDataAggregation,
  CsGroupActivityAggregationMetric
} from '@project-sunbird/client-services/services/group/activity';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RouterLinks } from './../../app.constant';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { File } from '@ionic-native/file/ngx';
import { AndroidPermission, AndroidPermissionsStatus } from '@app/services/android-permissions/android-permission';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.page.html',
  styleUrls: ['./activity-details.page.scss'],
})
export class ActivityDetailsPage implements OnInit, OnDestroy {

  corRelationList: Array<CorrelationData>;
  isActivityLoading = false;
  loggedinUser: GroupMember;
  headerObservable: any;
  unregisterBackButton: Subscription;
  searchMember = '';
  memberList: any;
  activityDetail: any;
  filteredMemberList: any;
  memberSearchQuery: string;
  group: Group;
  activity: any;
  courseList = [];
  showCourseDropdownSection = false;
  selectedCourse;
  courseData: Content;
  isTrackable = false;
  isGroupCreatorOrAdmin = false;
  appName: string;

  constructor(
    @Inject('GROUP_SERVICE') public groupService: GroupService,
    private headerService: AppHeaderService,
    private router: Router,
    private filterPipe: FilterPipe,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private platform: Platform,
    private collectionService: CollectionService,
    private appGlobalService: AppGlobalService,
    private file: File,
    private permissionService: AndroidPermissionsService,
    private fileOpener: FileOpener,
    private appVersion: AppVersion
  ) {
    const extras = this.router.getCurrentNavigation().extras.state;
    this.loggedinUser = extras.loggedinUser;
    this.group = extras.group;
    this.activity = extras.activity;
    this.corRelationList = extras.corRelation;
    this.isTrackable = this.activity.trackable && (this.activity.trackable.enabled === TrackingEnabled.YES) ;
    this.isGroupCreatorOrAdmin = extras.isGroupCreatorOrAdmin;
  }

  async ngOnInit() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '', PageId.ACTIVITY_DETAIL, Environment.GROUP,
      undefined, undefined, undefined, undefined, this.corRelationList);
      this.appName = await this.appVersion.getAppName();
  }

  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleDeviceBackButton();
    this.courseList = [];
    try {
      this.courseData = await this.collectionService.fetchCollectionData(this.activity.identifier, this.activity.objectType);
      console.log('this.courseData', this.courseData);
      this.getNestedCourses(this.courseData.children);
      if (this.courseList.length) {
        this.showCourseDropdownSection = true;
      }
      console.log('this.courselist', this.courseList)
    } catch (err) {
      console.log('fetchCollectionData err', err);
    }
    this.selectedCourse = this.courseList.find((s) => s.identifier === this.appGlobalService.selectedActivityCourseId) || '';
    this.getActvityDetails(this.appGlobalService.selectedActivityCourseId || this.activity.identifier);
  }

  ionViewWillLeave() {
    this.headerObservable.unsubscribe();
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.appGlobalService.selectedActivityCourseId = '';
  }

  private async getActvityDetails(id) {
    const req: GroupActivityDataAggregationRequest = {
      from: CachedItemRequestSourceFrom.SERVER,
      groupId: this.group.id,
      activity: {
        id,
        type: this.activity.type
      },
      mergeGroup: this.group
    };
    if (this.isTrackable) {
      if (this.selectedCourse) {
        req.leafNodesCount = this.selectedCourse.contentData.leafNodes.length;
      } else {
        req.leafNodesCount = this.courseData.contentData.leafNodes.length;
      }
    }
    try {
      this.isActivityLoading = true;
      const response: CsGroupActivityDataAggregation = await this.groupService.activityService.getDataAggregation(req).toPromise();
      if (response) {
        this.memberList = response.members;
        this.activityDetail = response.activity;
        const loggedInUserId = this.loggedinUser.userId;
        if (this.memberList) {
          this.memberList = this.memberList.sort((a, b) => {
            if (a.userId === loggedInUserId) {
              return -1;
            } else if (b.userId === loggedInUserId) {
              return 1;
            }
            const aCompletedCount = a.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.COMPLETED_COUNT);
            const bCompletedCount = b.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.COMPLETED_COUNT);
            if (!aCompletedCount && !bCompletedCount) {
              return 0;
            }
            if (!aCompletedCount && bCompletedCount) {
              return 1;
            } else if (aCompletedCount && !bCompletedCount) {
              return -1;
            }
            return bCompletedCount!.value - aCompletedCount!.value;
          });
        }
        this.filteredMemberList = new Array(...this.memberList);
        console.log('this.filteredMemberList', this.filteredMemberList);
        this.isActivityLoading = false;
      }
    } catch (e) {
      console.log(' CsGroupActivityDataAggregation err', e);
      this.isActivityLoading = false;
    }
  }

  onMemberSearch(query) {
    this.memberSearchQuery = query;
    this.filteredMemberList = [...this.filterPipe.transform(this.memberList, 'name', query)];
  }

  getMemberName(member) {
    let memberName = member.name;
    if (this.loggedinUser.userId === member.userId) {
      memberName = this.commonUtilService.translateMessage('LOGGED_IN_MEMBER', { member_name: member.name });
    }
    return memberName;
  }

  getMemberProgress(member) {
    let progress = 0;
    if (member.agg) {
      const progressMetric = member.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.PROGRESS);
      progress = progressMetric ? progressMetric.value : 0;
    }
    return '' + progress;
  }

  getActivityAggLastUpdatedOn() {
    let lastUpdatedOn = 0;
    if (this.activityDetail && this.activityDetail.agg) {
      const activityAgg = this.activityDetail.agg.find(a => a.metric === CsGroupActivityAggregationMetric.ENROLMENT_COUNT);
      if (activityAgg && activityAgg.lastUpdatedOn) {
        lastUpdatedOn = typeof activityAgg.lastUpdatedOn === 'string' ? parseInt(activityAgg.lastUpdatedOn, 10) : activityAgg.lastUpdatedOn;
      }
    }
    return lastUpdatedOn;
  }

  private getNestedCourses(courseData) {
    courseData.forEach(c => {
      if ((c.mimeType === MimeType.COLLECTION) && (c.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase())) {
        this.courseList.push(c);
      }
      if (c.children && c.children.length) {
        this.getNestedCourses(c.children);
      }
    });
  }

  openActivityToc() {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.SELECT_NESTED_ACTIVITY_CLICKED, Environment.GROUP, PageId.ACTIVITY_DETAIL,
      undefined, undefined, undefined, this.corRelationList);

    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}/${RouterLinks.ACTIVITY_TOC}`],
      {
        state: {
          courseList: this.courseList,
          mainCourseName: this.activity.name,
          corRelation: this.corRelationList
        }
      });
  }

  handleDeviceBackButton() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton(false);
    });
  }

  handleHeaderEvents($event) {
    switch ($event.name) {
      case 'back':
        this.handleBackButton(true);
        break;
    }
  }

  handleBackButton(isNavBack) {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_DETAIL,
      Environment.GROUP, isNavBack, undefined, this.corRelationList);
    this.location.back();
  }

  convertToCSV(memberList) {
    let csv: any = '';
    let line: any = '';

    memberList.forEach(member => {
      let progress = 0;
      if (member.agg) {
        const progressMetric = member.agg.find((agg) => agg.metric === CsGroupActivityAggregationMetric.PROGRESS);
        progress = progressMetric ? progressMetric.value : 0;
      }
      member.progress = progress;
    });
    console.log('memberList progress', this.memberList)
    line += 'Course name' + ',';
    line += 'Member name' + ',';
    line += 'Progress' + '\n';
    line += '\n';
    for (let j = 0; j < memberList.length; j++) {
      line += '\"' + this.courseData.name.trim() + '\"' + ',';
      line += '\"' + memberList[j].name + '\"' + ',';
      line += '\"' + memberList[j].progress + '%\"' + '\n';
    }
    csv += line + '\n';
    return csv;

  }

  async downloadCsv() {
    await this.checkForPermissions().then(async (result) => {
      if (result) {
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.DOWNLOAD_CLICKED,
          Environment.USER,
          PageId.ACTIVITY_DETAIL
        );
        const expTime = new Date().getTime();
        const csvData: any = this.convertToCSV(this.memberList);
        const filename = this.courseData.name.trim() + '_' + expTime + '.csv';
        const downloadDirectory = `${cordova.file.externalRootDirectory}Download/`;
        
        this.file.writeFile(downloadDirectory, filename, csvData, {replace: true})
        .then((res)=> {
          console.log('rs write file', res);
          this.openCsv(res.nativeURL)
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('DOWNLOAD_COMPLETED', filename), false, 'custom-toast');
        })
        .catch((err) => {
          console.log('writeFile err', err)
        });
      } else{
        this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.ACTIVITY_DETAIL, true);
      }
    });
    
  }

  async checkForPermissions(): Promise<boolean | undefined> {
    return new Promise<boolean | undefined>(async (resolve) => {
      const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.WRITE_EXTERNAL_STORAGE);
      if (permissionStatus.hasPermission) {
        resolve(true);
      } else if (permissionStatus.isPermissionAlwaysDenied) {
        await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
        resolve(false);
      } else {
        this.showStoragePermissionPopover().then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }

  private async showStoragePermissionPopover(): Promise<boolean | undefined> {
    return new Promise<boolean | undefined>(async (resolve) => {
      const confirm = await this.commonUtilService.buildPermissionPopover(
        async (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.NOT_NOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.ALLOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE).subscribe(async (status: AndroidPermissionsStatus) => {
                if (status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP);
                  resolve(true);
                } else if (status.isPermissionAlwaysDenied) {
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
                  resolve(false);
                } else {
                  this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.DENY_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP);
                  await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, PageId.PROFILE, true);
                }
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', PageId.PROFILE, true
      );
      await confirm.present();
    });
  }

  openCsv(path) {
    this.fileOpener.open(path, 'text/csv')
      .then(() => console.log('File is opened'))
      .catch((e) => {
        console.log('Error opening file', e);
        this.commonUtilService.showToast('CERTIFICATE_ALREADY_DOWNLOADED');
      });
  }
  
  openDashboard() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.SELECT_ACTIVITY_DASHBOARD,
      undefined,
      Environment.GROUP,
      PageId.ACTIVITY_DETAIL,
      undefined,
      undefined,
      undefined,
      this.corRelationList,
      ID.SELECT_ACTIVITY_DASHBOARD
    );
    this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.ACTIVITY_DETAILS}/${RouterLinks.ACTIVITY_DASHBOARD}`],
    {
      state: {
        aggData: {
          members: this.memberList,
          activity: this.activityDetail
        },
        hierarchyData: this.courseData,
        activity: this.activity,
        lastUpdatedOn: this.getActivityAggLastUpdatedOn(),
        collectionName: this.courseData.name
      }
    });
  }

}
