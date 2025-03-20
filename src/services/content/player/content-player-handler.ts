import { Inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import {ContentFilterConfig, GenericAppConfig, RouterLinks} from '../../../app/app.constant';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { CanvasPlayerService } from '../../../services/canvas-player.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { Environment, InteractSubtype } from '../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ContentUtil } from '../../../util/content-util';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Content, CorrelationData, CourseService, InteractType, PlayerService } from '@project-sunbird/sunbird-sdk';
import { ContentInfo } from '../content-info';
import {UtilityService} from '../../../services/utility-service';
import { FilePathService } from '@app/services/file-path/file.service';

declare const cordova;

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
        private appHeaderService: AppHeaderService,
        private utilityService: UtilityService,
        private readAsText: FilePathService
    ) { }

    /**
     * Launches Content-Player with given configuration
     */
    public async launchContentPlayer(
        content: Content, isStreaming: boolean, shouldDownloadnPlay: boolean, contentInfo: ContentInfo, isCourse: boolean, navigateBackToContentDetails?: boolean , isChildContent?: boolean,
        maxAttemptAssessment?: { isLastAttempt: boolean, isContentDisabled: boolean, currentAttempt: number, maxAttempts: number }, callback?) {
        const maxCompatibilityLevel = await this.utilityService.getBuildConfigValue(GenericAppConfig.MAX_COMPATIBILITY_LEVEL);
        // TODO: Uncomment the below code once buildConfig is set
        
        // if (content.contentData['compatibilityLevel'] > maxCompatibilityLevel) {
        //     cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
        //         () => { },
        //         () => { }
        //     );
        //     return;
        // }
        if (!AppGlobalService.isPlayerLaunched) {
            AppGlobalService.isPlayerLaunched = true
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
        this.playerService.getPlayerConfig(content, request).subscribe(async (data) => {
            debugger
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

            if (data?.metadata?.mimeType === 'application/vnd.sunbird.questionset' && maxAttemptAssessment) {
                data['metadata']['contentData']['maxAttempt'] = maxAttemptAssessment?.maxAttempts;
                data['metadata']['contentData']['currentAttempt'] = maxAttemptAssessment.currentAttempt == undefined ? 0 : maxAttemptAssessment.currentAttempt;
            }
            if (data.metadata.mimeType === 'application/vnd.ekstep.ecml-archive') {
                const filePath = this.commonUtilService.convertFileSrc(`${data.metadata.basePath}`);
               console.log('printing filePath', filePath);
               console.log('printing data', `${data.metadata.basePath}`);
                if (!isStreaming) {
                    console.log('inside if condition');
                    debugger
                    this.file.checkFile(`file://${data.metadata.basePath}/`, 'index.ecml').then((isAvailable) => {
                        console.log("printing file path inside if condition", `file://${data.metadata.basePath}/`);
                        this.canvasPlayerService.xmlToJSon(`file://${data.metadata.basePath}/`, 'index.ecml').then(async (json) => {
                            data['data'] = JSON.stringify(json);
                            debugger
                            await this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, navigateBackToContentDetails, isCourse } });

                        }).catch((error) => {
                            console.error('error1', error);
                        });
                    }).catch((err) => {
                        console.error('err', err);
                        console.log('inside the catch block before readAsText', `file://${data.metadata.basePath}/`);

                        this.readAsText.readFilePath(`file://${data.metadata.basePath}/index.json`).then(async (response)=> {
                            data['data'] = response;
                            await this.router.navigate([RouterLinks.PLAYER],
                                { state: { config: data,  course : contentInfo.course, navigateBackToContentDetails,
                                        corRelation: contentInfo.correlationList, isCourse } });
                        }).catch((e) => {
                            console.error('readAsText error', e);
                        })
                    
                    });
                } else {
                    await this.router.navigate([RouterLinks.PLAYER],
                        { state: { config: data, course : contentInfo.course, navigateBackToContentDetails,
                                corRelation: contentInfo.correlationList, isCourse } });
                }
            } else {
                if (callback && (data.metadata.mimeType === 'video/mp4' || data.metadata.mimeType === 'video/webm')) {
                    callback({ state: { config: data,  course : contentInfo.course, navigateBackToContentDetails, isCourse } });
                } else {
                    await this.router.navigate([RouterLinks.PLAYER],
                        { state: { contentToPlay : content , config: data,  course : contentInfo.course, navigateBackToContentDetails,
                                corRelation: contentInfo.correlationList, isCourse , childContent: isChildContent } });
                }
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

    async playContent(content: Content, navExtras: NavigationExtras, telemetryDetails, isCourse: boolean,
                navigateBackToContentDetails: boolean = true, hideHeaders: boolean = true) {
        if (hideHeaders) {
            await this.appHeaderService.hideHeader();
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
            (playingContent.mimeType !== 'application/vnd.ekstep.h5p-archive')) { // 1
            isStreaming = true;
            shouldDownloadAndPlay = false;
        } else if (!this.commonUtilService.networkInfo.isNetworkAvailable && playingContent.isAvailableLocally) { // 2
            isStreaming = false;
            shouldDownloadAndPlay = false;
        } else if (this.commonUtilService.networkInfo.isNetworkAvailable && playingContent.isAvailableLocally) { // 3
            isStreaming = false;
            shouldDownloadAndPlay = true;
        } else {
            await this.router.navigate([RouterLinks.CONTENT_DETAILS], navExtras);
            return;
        }

        // Executes only if the conditions are passed else skip
        this.generateInteractTelemetry(isStreaming, telemetryDetails.pageId, contentInfo);
        await this.launchContentPlayer(playingContent, isStreaming, shouldDownloadAndPlay, contentInfo, isCourse, navigateBackToContentDetails);
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
