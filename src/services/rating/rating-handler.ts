import { Inject, Injectable } from '@angular/core';
import * as  dayjs from 'dayjs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { SharedPreferences, Content, CorrelationData, Rollup, TelemetryObject } from '@project-sunbird/sunbird-sdk';

import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import { InteractType, InteractSubtype, Environment, PageId } from '../../services/telemetry-constants';
import { StoreRating, PreferenceKey, RouterLinks } from '../../app/app.constant';
import { ContentRatingAlertComponent, AppRatingAlertComponent } from '../../app/components';
import { PopoverController } from '@ionic/angular';
import { AppGlobalService } from '../../services/app-global-service.service';
import { ContentUtil } from '../../util/content-util';
import { Router } from '@angular/router';
import { FilePathService } from '../../services/file-path/file.service';
import { FilePaths } from '../../services/file-path/file';

@Injectable({
    providedIn: 'root'
})
export class RatingHandler {

    private userRating = 0;
    private userComment: string;
    public telemetryObject: TelemetryObject;
    public useNewComments = false;
    private courseContext: any;
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private popoverCtrl: PopoverController,
        private fileCtrl: File,
        private commonUtilService: CommonUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private appGlobalService: AppGlobalService,
        private filePathService: FilePathService,
        private router: Router
    ) { }

    public async showRatingPopup(
        isContentPlayed: boolean,
        content: Content,
        popupType: string,
        corRelationList: CorrelationData[],
        rollUp: Rollup,
        shouldNavigateBack?: boolean,
        onDidDismiss?: () => void
    ) {
        const paramsMap = new Map();
        const contentFeedback: any = content.contentFeedback;
        this.telemetryObject = ContentUtil.getTelemetryObject(content);
        if (contentFeedback && contentFeedback.length) {
            this.userRating = this.userRating ? this.userRating : contentFeedback[0].rating;
            this.userComment = this.useNewComments ? this.userComment : contentFeedback[0].comments;
        }

        if (isContentPlayed || content.contentAccess.length) {
            if (popupType === 'automatic' && (this.userRating === 0 && !this.appGlobalService.getSelectedUser())) {
                if (!(await this.readRatingFile())) {
                    this.preferences.getString(PreferenceKey.APP_RATING_DATE).toPromise().then(async res => {
                        if (await this.shouldShowAppRating(res)) {
                            paramsMap['isPlayed'] = 'N';
                            await this.showAppRatingPopup();
                        } else {
                            paramsMap['isPlayed'] = 'Y';
                            await this.showContentRatingPopup(content, popupType, shouldNavigateBack, onDidDismiss);
                        }
                    }).catch(async err => {
                        paramsMap['isPlayed'] = 'Y';
                        await this.showContentRatingPopup(content, popupType, shouldNavigateBack, onDidDismiss);
                    });
                } else {
                    paramsMap['isPlayed'] = 'Y';
                    await this.showContentRatingPopup(content, popupType, shouldNavigateBack, onDidDismiss);
                }
            } else if (popupType === 'manual') {
                paramsMap['isPlayed'] = 'Y';
                await this.showContentRatingPopup(content, popupType, shouldNavigateBack);
            }

        } else {
            paramsMap['isPlayed'] = 'N';
            this.commonUtilService.showToast('TRY_BEFORE_RATING');
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.RATING_CLICKED,
            Environment.HOME,
            PageId.CONTENT_DETAIL,
            this.telemetryObject,
            paramsMap,
            rollUp,
            corRelationList);

    }

    async showContentRatingPopup(content: Content, popupType: string, shouldNavigateBack?: boolean, onDidDismiss?: () => void) {
        const contentFeedback: any = content.contentFeedback;
        if (contentFeedback && contentFeedback.length) {
            this.userRating = this.userRating ? this.userRating : contentFeedback[0].rating;
            this.userComment = this.useNewComments ? this.userComment : contentFeedback[0].comments;
        }
        const popover = await this.popoverCtrl.create({
            component: ContentRatingAlertComponent,
            componentProps: {
                content,
                pageId: PageId.CONTENT_DETAIL,
                rating: this.userRating,
                comment: this.userComment,
                navigateBack: shouldNavigateBack,
                popupType
            },
            cssClass: 'sb-popover info content-rating-alert'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if (data && data.message === 'rating.success') {
            this.useNewComments = true;
            this.userRating = data.rating;
            this.userComment = data.comment;
        }
        if (onDidDismiss) {
            onDidDismiss();
        }
    }

    public resetRating() {
        this.userRating = 0;
        this.userComment = '';
        this.useNewComments = false;
    }

    private async showAppRatingPopup() {
        const popover = await this.popoverCtrl.create({
            component: AppRatingAlertComponent,
            componentProps: { pageId: PageId.CONTENT_DETAIL },
            cssClass: 'sb-popover'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        switch (data) {
            case null: {
                this.setInitialDate();
                break;
            }
            case StoreRating.RETURN_HELP: {
                this.setInitialDate();
                await this.router.navigate([RouterLinks.FAQ_HELP]);
                break;
            }
        }
    }

    private shouldShowAppRating(date): boolean {
        let isValid = false;
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
            const presentDate = dayjs();
            const initialDate = dayjs(date);
            if (initialDate.isValid()) {
                const diffInDays = presentDate.diff(initialDate, 'day');
                if (diffInDays >= StoreRating.DATE_DIFF) {
                    isValid = true;
                }
            }
        }
        return isValid;
    }

    setInitialDate() {
        const today = dayjs().format();
        this.preferences.putString(PreferenceKey.APP_RATING_DATE, today).subscribe();
    }

    async readRatingFile(): Promise<boolean> {
        const filePath = FilePaths.DATA;
        const folderPath = await this.filePathService.getFilePath(filePath);

        return this.fileCtrl.readAsText(folderPath + StoreRating.FOLDER_NAME, StoreRating.FILE_NAME)
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }
}
