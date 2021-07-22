import { Inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ContentFilterConfig, RouterLinks } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { AppHeaderService } from '@app/services/app-header.service';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { Environment, InteractSubtype } from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentUtil } from '@app/util/content-util';
import { File } from '@ionic-native/file/ngx';
import { Content, CorrelationData, CourseService, InteractType, PlayerService } from 'sunbird-sdk';
import { ContentInfo } from '../content-info';

@Injectable({
    providedIn: 'root'
})
export class ContentPlayerHandler {
    private isPlayerLaunched = false;
    private lastPlayedContentId: string;
    constructor(
        @Inject('PLAYER_SERVICE') private playerService: PlayerService,
        @Inject('COURSE_SERVICE') private courseService: CourseService,
        private canvasPlayerService: CanvasPlayerService,
        private file: File,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private router: Router,
        private commonUtilService: CommonUtilService,
        private appHeaderService: AppHeaderService
    ) { }

    /**
     * Launches Content-Player with given configuration
     */
    public launchContentPlayer(
        content: any, isStreaming: boolean, shouldDownloadnPlay: boolean, contentInfo: ContentInfo, isCourse: boolean,
        navigateBackToContentDetails?: boolean , isChildContent?: boolean, maxAttemptAssessment?: { isLastAttempt: boolean, isContentDisabled: boolean, currentAttempt: number, maxAttempts: number }) {
        if (!AppGlobalService.isPlayerLaunched) {
            AppGlobalService.isPlayerLaunched = true;
        }
        const values = new Map();
        values['autoAfterDownload'] = shouldDownloadnPlay;
        values['isStreaming'] = isStreaming;
        if (isStreaming) {
            const extraInfoMap = { hierarchyInfo: [] };
            extraInfoMap.hierarchyInfo = contentInfo.hierachyInfo;
        }
        const request: any = {};
        if (isStreaming) {
            request.streaming = isStreaming;
        }
        request['correlationData'] = contentInfo.correlationList;
        if (isCourse && (content.contentData['totalQuestions'] || 
        content.contentData.mimeType === 'application/vnd.sunbird.questionset')) {
            const correlationData: CorrelationData = {
                id: this.courseService.generateAssessmentAttemptId({
                    courseId: contentInfo.course.identifier || contentInfo.course.courseId,
                    batchId: contentInfo.course.batchId,
                    contentId: content.identifier,
                    userId: contentInfo.course.userId
                }),
                type: 'AttemptId'
            };

            if (request['correlationData']) {
                request['correlationData'].push(correlationData);
            }

            if (!contentInfo.correlationList) {
                contentInfo.correlationList = [correlationData];
            }

            request['correlationData'] = [correlationData];
        }
        this.playerService.getPlayerConfig(content, request).subscribe((data) => {
            data['data'] = {};
            if (isCourse || (content.contentData &&
                content.contentData.status === ContentFilterConfig.CONTENT_STATUS_UNLISTED)) {
                data.config.overlay.enableUserSwitcher = false;
                data.config.overlay.showUser = false;
            } else {
                data.config.overlay.enableUserSwitcher = true;
            }
            this.lastPlayedContentId = content.identifier;
            this.isPlayerLaunched = true;

            if (data.metadata.mimeType === 'application/vnd.sunbird.questionset') {
                data['metadata']['contentData']['maxAttempt'] = maxAttemptAssessment.maxAttempts == undefined ? 0 : maxAttemptAssessment.maxAttempts;
                data['metadata']['contentData']['currentAttempt'] = maxAttemptAssessment.currentAttempt == undefined ? 0 : maxAttemptAssessment.currentAttempt;
            }
            if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
                const filePath = this.commonUtilService.convertFileSrc(`${data.metadata.basePath}`);
                if (!isStreaming) {
                    this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
                        this.canvasPlayerService.xmlToJSon(`${filePath}/index.ecml`).then((json) => {
                            data['data'] = JSON.stringify(json);
                            this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, navigateBackToContentDetails, isCourse } });

                        }).catch((error) => {
                            console.error('error1', error);
                        });
                    }).catch((err) => {
                        console.error('err', err);
                        this.canvasPlayerService.readJSON(`${filePath}/index.json`).then((json) => {
                            data['data'] = json;
                            this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, navigateBackToContentDetails,
                                        corRelation: contentInfo.correlationList, isCourse } });

                        }).catch((e) => {
                            console.error('readJSON error', e);
                        });
                    });
                } else {
                    this.router.navigate([RouterLinks.PLAYER],
                        { state: { config: data, course : contentInfo.course, navigateBackToContentDetails,
                                corRelation: contentInfo.correlationList, isCourse } });
                }

            } else {
                this.router.navigate([RouterLinks.PLAYER],
                    { state: { contentToPlay : content , config: data,  course : contentInfo.course, navigateBackToContentDetails,
                            corRelation: contentInfo.correlationList, isCourse , childContent: isChildContent } });
            }
        });
    }
    public isContentPlayerLaunched(): boolean {
        return this.isPlayerLaunched;
    }

    public setContentPlayerLaunchStatus(isPlayerLaunced: boolean) {
        this.isPlayerLaunched = isPlayerLaunced;
    }

    public getLastPlayedContentId(): string {
        return this.lastPlayedContentId;
    }

    public setLastPlayedContentId(contentId: string) {
        this.lastPlayedContentId = contentId;
    }

    playContent(content: Content, navExtras: NavigationExtras, telemetryDetails, isCourse: boolean,
                navigateBackToContentDetails: boolean = true, hideHeaders: boolean = true) {
        if (hideHeaders) {
            this.appHeaderService.hideHeader();
        }
        const playingContent = content;

        const contentInfo: ContentInfo = {
            telemetryObject: ContentUtil.getTelemetryObject(playingContent),
            rollUp: ContentUtil.generateRollUp(playingContent.hierarchyInfo, playingContent.identifier),
            correlationList: telemetryDetails.corRelationList,
            hierachyInfo: playingContent.hierarchyInfo
        };
        if (navExtras.state && navExtras.state.course && isCourse) {
            contentInfo['course'] = navExtras.state.course;
        } else {
            isCourse = false;
        }
        let isStreaming: boolean;
        let shouldDownloadAndPlay: boolean;
        if (playingContent.contentData.streamingUrl && this.commonUtilService.networkInfo.isNetworkAvailable &&
            !(playingContent.mimeType === 'application/vnd.ekstep.h5p-archive')) { // 1
            isStreaming = true;
            shouldDownloadAndPlay = false;
        } else if (!this.commonUtilService.networkInfo.isNetworkAvailable && playingContent.isAvailableLocally) { // 2
            isStreaming = false;
            shouldDownloadAndPlay = false;
        } else if (this.commonUtilService.networkInfo.isNetworkAvailable && playingContent.isAvailableLocally) { // 3
            isStreaming = false;
            shouldDownloadAndPlay = true;
        } else {
            this.router.navigate([RouterLinks.CONTENT_DETAILS], navExtras);
            return;
        }

        // Executes only if the conditions are passed else skip
        this.generateInteractTelemetry(isStreaming, telemetryDetails.pageId, contentInfo);
        this.launchContentPlayer(playingContent, isStreaming, shouldDownloadAndPlay, contentInfo, isCourse, navigateBackToContentDetails);
    }

    private generateInteractTelemetry(isStreaming: boolean, pageId: string, contentInfo) {
        const subType: string = isStreaming ? InteractSubtype.PLAY_ONLINE : InteractSubtype.PLAY_FROM_DEVICE;
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            subType,
            Environment.HOME,
            pageId,
            contentInfo.telemetryObject || undefined,
            undefined,
            contentInfo.rollup || undefined,
            contentInfo.corRelationList || undefined
        );
    }

}
