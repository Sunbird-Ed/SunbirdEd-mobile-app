import { Component, NgZone, Inject, OnInit } from '@angular/core';
import {
    NavController, PopoverController, NavParams
} from '@ionic/angular';
import { Events } from '@app/util/events';
import {
    SharedPreferences, TelemetryObject, InteractType,
} from 'sunbird-sdk';
import {
    PreferenceKey, EventTopics
} from '@app/app/app.constant';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
    InteractSubtype, Environment, PageId
} from '@app/services/telemetry-constants';
import {
    LocalCourseService, AppGlobalService
} from '@app/services';
import { EnrollCourse } from '@app/app/enrolled-course-details-page/course.interface';
import { CsPrimaryCategory } from '@project-sunbird/client-services/services/content';
import { ContentUtil } from '@app/util/content-util';
import { CategoryKeyTranslator } from '@app/pipes/category-key-translator/category-key-translator-pipe';
import { NavigationService } from '@app/services/navigation-handler.service';

@Component({
    selector: 'app-enrollment-details',
    templateUrl: './enrollment-details.component.html',
    styleUrls: ['./enrollment-details.component.scss'],
})
export class EnrollmentDetailsComponent implements OnInit {
    ongoingBatches: any;
    upcommingBatches: any;
    retiredBatched: any;
    userId: any;
    isGuestUser: boolean;
    layoutInProgress: string;
    sectionName: any;
    index: any;
    layoutName: any;
    pageName: any;
    env: any;
    courseId: any;
    content: any;
    todayDate: string;

    constructor(
        @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
        private appGlobalService: AppGlobalService,
        public navCtrl: NavController,
        public navParams: NavParams,
        private events: Events,
        private zone: NgZone,
        private popOverCtrl: PopoverController,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService,
        private navService: NavigationService,
        private localCourseService: LocalCourseService,
        private categoryKeyTranslator: CategoryKeyTranslator
    ) {
        this.ongoingBatches = this.navParams.get('ongoingBatches');
        this.upcommingBatches = this.navParams.get('upcommingBatches');
        this.retiredBatched = this.navParams.get('retiredBatched');
        this.todayDate = window.dayjs().format('YYYY-MM-DD');
        this.content = this.navParams.get('content');
        this.courseId = this.content.identifier;
    }

    async ngOnInit() {
        this.userId = await this.appGlobalService.getActiveProfileUid();
        this.isGuestUser = !this.appGlobalService.isUserLoggedIn();
    }

    close(data?: any) {
        return this.popOverCtrl.dismiss(data);
    }

    resumeCourse(content: any) {
        this.saveContentContext(content);

        this.close().then(() => {
            this.navService.navigateToDetailPage(content.content, { content, skipCheckRetiredOpenBatch: true });
        });
    }

    saveContentContext(content: any) {
        const contentContextMap = new Map();
        // store content context in the below map
        contentContextMap['userId'] = content.userId;
        contentContextMap['courseId'] = content.courseId;
        contentContextMap['batchId'] = content.batchId;
        if (content.batch) {
            contentContextMap['batchStatus'] = content.batch.status;
        }

        // store the contentContextMap in shared preference and access it from SDK
        this.preference.putString(PreferenceKey.CONTENT_CONTEXT, JSON.stringify(contentContextMap)).toPromise();
    }

    async enrollIntoBatch(batch: any) {
        const enrollCourseRequest = this.localCourseService.prepareEnrollCourseRequest(this.userId, batch, this.courseId);
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.ENROLL_CLICKED,
            Environment.HOME,
            PageId.CONTENT_DETAIL, undefined,
            this.localCourseService.prepareRequestValue(enrollCourseRequest));

        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        const enrollCourse: EnrollCourse = {
            userId: this.userId,
            batch,
            pageId: PageId.COURSE_BATCHES,
            courseId: this.courseId
        };
        this.localCourseService.enrollIntoBatch(enrollCourse).toPromise()
            .then((data: any) => {
                this.zone.run(() => {
                    this.commonUtilService.showToast(this.categoryKeyTranslator.transform('FRMELEMNTS_MSG_COURSE_ENROLLED', this.content));
                    this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
                        batchId: batch.id,
                        courseId: batch.courseId
                    });
                    loader.dismiss();
                    this.popOverCtrl.dismiss({ isEnrolled: true, batchId: batch.id, courseId: batch.courseId });
                    this.navigateToDetailPage(this.content);
                });
            }, (error) => {
                loader.dismiss();
            });
    }

    navigateToDetailPage(content: any, layoutName?: string): void {
        const identifier = content.contentId || content.identifier;
        let telemetryObject;
        if (layoutName === this.layoutInProgress) {
            telemetryObject = new TelemetryObject(identifier, CsPrimaryCategory.COURSE, '');
        } else {
            telemetryObject = ContentUtil.getTelemetryObject(content);
        }

        const values = new Map();
        values['sectionName'] = this.sectionName;
        values['positionClicked'] = this.index;

        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.CONTENT_CLICKED,
            this.env,
            PageId.COURSE_BATCHES,
            telemetryObject,
            values
        );
        this.navService.navigateToDetailPage(content, { content });
    }

}
