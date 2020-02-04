import { Injectable, Inject } from '@angular/core';
import { PlayerService, InteractType, Content, CorrelationData } from 'sunbird-sdk';
import { CanvasPlayerService } from '@app/services/canvas-player.service';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { File } from '@ionic-native/file/ngx';
import { InteractSubtype, Environment, PageId } from '@app/services/telemetry-constants';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContentInfo } from '../content-info';
import { RouterLinks, ContentType, ContentFilterConfig } from '@app/app/app.constant';
import { Router } from '@angular/router';
import { CommonUtilService } from '@app/services/common-util.service';
import { Course, CourseService } from 'sunbird-sdk';


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
        private commonUtilService: CommonUtilService
    ) { }

    /**
     * Launches Content-Player with given configuration
     */
    public launchContentPlayer(
        content: Content, isStreaming: boolean, shouldDownloadnPlay: boolean, contentInfo: ContentInfo, isCourse: boolean,
        isFromTextbookTOC?: boolean) {
        if (!AppGlobalService.isPlayerLaunched) {
            AppGlobalService.isPlayerLaunched = true;
        }
        const values = new Map();
        values['autoAfterDownload'] = shouldDownloadnPlay;
        values['isStreaming'] = isStreaming;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
            InteractSubtype.CONTENT_PLAY,
            Environment.HOME,
            PageId.CONTENT_DETAIL,
            contentInfo.telemetryObject,
            values,
            contentInfo.rollUp,
            contentInfo.correlationList);

        if (isStreaming) {
            const extraInfoMap = { hierarchyInfo: [] };
            extraInfoMap.hierarchyInfo = contentInfo.hierachyInfo;
        }
        const request: any = {};
        if (isStreaming) {
            request.streaming = isStreaming;
        }
        request['correlationData'] = contentInfo.correlationList;
        if (isCourse && content.contentData['totalQuestions']) {
            const correlationData: CorrelationData = {
                id: this.courseService.generateAssessmentAttemptId({
                    courseId: contentInfo.course!.identifier,
                    batchId: contentInfo.course.batchId,
                    contentId: content.identifier,
                    userId: contentInfo.course.userId
                }),
                type: 'AttemptId'
            };

            if (request['correlationData']) {
                request['correlationData'].push(correlationData);
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
            if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
                const filePath = this.commonUtilService.convertFileSrc(`${data.metadata.basePath}`);
                if (!isStreaming) {
                    this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
                        this.canvasPlayerService.xmlToJSon(`${filePath}/index.ecml`).then((json) => {
                            data['data'] = JSON.stringify(json);
                            this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, isFromTOC: isFromTextbookTOC } });

                        }).catch((error) => {
                            console.error('error1', error);
                        });
                    }).catch((err) => {
                        console.error('err', err);
                        this.canvasPlayerService.readJSON(`${filePath}/index.json`).then((json) => {
                            data['data'] = json;
                            this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, isFromTOC: isFromTextbookTOC,
                                        corRelation: contentInfo.correlationList } });

                        }).catch((e) => {
                            console.error('readJSON error', e);
                        });
                    });
                } else {
                    this.router.navigate([RouterLinks.PLAYER],
                        { state: { config: data, course : contentInfo.course, isFromTOC: isFromTextbookTOC,
                                corRelation: contentInfo.correlationList } });
                }

            } else {
                this.router.navigate([RouterLinks.PLAYER],
                    { state: { config: data,  course : contentInfo.course, isFromTOC: isFromTextbookTOC,
                            corRelation: contentInfo.correlationList } });
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
}
