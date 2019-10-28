import { Inject, Injectable } from '@angular/core';
import * as  moment from 'moment';
import { File } from '@ionic-native/file/ngx';
import { SharedPreferences, Content, CorrelationData, Rollup } from 'sunbird-sdk';

import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractType, InteractSubtype, Environment, PageId } from '@app/services/telemetry-constants';
import { StoreRating, PreferenceKey, RouterLinks } from '@app/app/app.constant';
import { ContentRatingAlertComponent, AppRatingAlertComponent } from '@app/app/components';
import { PopoverController } from '@ionic/angular';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RatingHandler {

    private userRating = 0;
    private userComment: string;
    constructor(
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private popoverCtrl: PopoverController,
        private fileCtrl: File,
        private commonUtilService: CommonUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private appGlobalService: AppGlobalService,
        private router: Router
    ) { }
    public async showRatingPopup(
        isContentPlayed: boolean,
        content: Content,
        popupType: string,
        corRelationList: CorrelationData[],
        rollUp: Rollup
    ) {
        const paramsMap = new Map();
        const contentFeedback: any = content.contentFeedback;
        if (contentFeedback && contentFeedback.length) {
            this.userRating = contentFeedback[0].rating;
            this.userComment = contentFeedback[0].comments;
        }

        if (isContentPlayed || content.contentAccess.length) {
            if (popupType === 'automatic' && (this.userRating === 0 && !this.appGlobalService.getSelectedUser())) {
                if (!(await this.readRatingFile())) {
                    this.preferences.getString(PreferenceKey.APP_RATING_DATE).toPromise().then(async res => {
                        if (await this.shouldShowAppRating(res)) {
                            paramsMap['isPlayed'] = 'N';
                            this.showAppRatingPopup();
                        } else {
                            paramsMap['isPlayed'] = 'Y';
                            this.showContentRatingPopup(content, popupType);
                        }
                    }).catch(err => {
                        paramsMap['isPlayed'] = 'Y';
                        this.showContentRatingPopup(content, popupType);
                    });
                } else {
                    paramsMap['isPlayed'] = 'Y';
                    this.showContentRatingPopup(content, popupType);
                }
            } else if (popupType === 'manual') {
                paramsMap['isPlayed'] = 'Y';
                this.showContentRatingPopup(content, popupType);
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
            undefined,
            paramsMap,
            rollUp,
            corRelationList);

    }

    async showContentRatingPopup(content: Content, popupType: string) {
        const contentFeedback: any = content.contentFeedback;
        if (contentFeedback && contentFeedback.length) {
            this.userRating = contentFeedback[0].rating;
            this.userComment = contentFeedback[0].comments;
        }
        const popover = await this.popoverCtrl.create({
            component: ContentRatingAlertComponent,
            componentProps: {
                content,
                pageId: PageId.CONTENT_DETAIL,
                rating: this.userRating,
                comment: this.userComment,
                popupType
            },
            cssClass: 'sb-popover info'
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
        if (data && data.message === 'rating.success') {
            this.userRating = data.rating;
            this.userComment = data.comment;
        }
    }

    public resetRating() {
        this.userRating = 0;
        this.userComment = '';
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
                this.router.navigate([RouterLinks.FAQ_HELP]);
                break;
            }
        }
    }

    private shouldShowAppRating(date): boolean {
        let isValid = false;
        if (this.commonUtilService.networkInfo.isNetworkAvailable) {
            const presentDate = moment();
            const initialDate = moment(date);
            if (initialDate.isValid()) {
                const diffInDays = presentDate.diff(initialDate, 'days');
                if (diffInDays >= StoreRating.DATE_DIFF) {
                    isValid = true;
                }
            }
        }
        return isValid;
    }

    setInitialDate() {
        const today = moment().format();
        this.preferences.putString(PreferenceKey.APP_RATING_DATE, today).subscribe();
    }

    readRatingFile(): Promise<boolean> {
        return this.fileCtrl.readAsText(cordova.file.dataDirectory + '/' + StoreRating.FOLDER_NAME, StoreRating.FILE_NAME)
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    }
}
