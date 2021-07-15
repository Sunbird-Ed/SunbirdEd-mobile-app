import { Inject, Injectable } from "@angular/core";
import { PreferenceKey, ProfileConstants } from "@app/app/app.constant";
import { AuthService, Profile, ProfileService, SegmentationService, SharedPreferences } from 'sunbird-sdk';
import { AppGlobalService } from "../app-global-service.service";
import { NotificationService } from '@app/services/notification.service';
import * as _ from "dayjs/locale/*";
import { FormAndFrameworkUtilService } from "../formandframeworkutil.service";
import { SplaschreenDeeplinkActionHandlerDelegate } from "../sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate";
export class TagPrefixConstants {
    static readonly DEVICE_CONFIG = 'DEVCONFIG_';
    static readonly USER_ATRIBUTE = 'USERFRAMEWORK_';
    static readonly USER_LOCATION = 'USERLOCATION_';
    static readonly CONTENT_ID = 'CONTENT_';
    static readonly USER_LANG = 'USERLANG_';
    static readonly ALL = 'ALL_';
    static readonly USER_ROLE = 'USERROLE_';
}

export class CommandFunctions {
    static readonly LOCAL_NOTIFICATION = 'LOCAL_NOTIF';
    static readonly BANNER = 'BANNER_CONFIG';
}

@Injectable()
export class SegmentationTagService {

    private _localNotificationId: number;
    public exeCommands = [];

    private comdList = [];

    set localNotificationId(id) {
        this._localNotificationId = id;
    }

    get localNotificationId() {
        return this._localNotificationId;
    }

    constructor(
        @Inject('SEGMENTATION_SERVICE') private segmentationService: SegmentationService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('AUTH_SERVICE') private authService: AuthService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private notificationSrc: NotificationService,
        private appGlobalService: AppGlobalService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate
    ) {
    }

    persistSegmentation() {
        this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
        .then((userProfile: Profile) => {
            if (userProfile && userProfile.uid) {
                console.log(this);

                this.segmentationService.saveTags(JSON.stringify(window['segmentation'].SBTagService), userProfile.uid)
                .subscribe(response => {
                    console.log(response);
                    response ? window['segmentation'].SBTagService.removeAllTags() : null;
                });
                this.segmentationService.saveCommandList(JSON.stringify(this.exeCommands), userProfile.uid).subscribe(response => {
                    console.log(response);
                    response ? this.exeCommands = [] : null;
                });
            }
        });
    }

    getPersistedSegmentaion() {
        this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
        .then((userProfile: Profile) => {
            if (userProfile && userProfile.uid) {
                console.log(userProfile.uid);
                this.segmentationService.getTags(userProfile.uid)
                .subscribe(response => {
                    if (response) {
                        window['segmentation'].SBTagService.restoreTags(response);
                    }
                });

                this.segmentationService.getCommand(userProfile.uid)
                .subscribe(cmdList => {
                    if (cmdList) {
                        this.exeCommands = JSON.parse(cmdList);
                    }
                    this.getSegmentCommand();
                });
            }
        });
    }

    getSegmentCommand() {
        // FormConfig for Segment
        this.formAndFrameworkUtilService.getSegmentationCommands()
        .then(cmdList => {
            if(cmdList && cmdList.length) {
                this.comdList = cmdList;
                this.evalCriteria();
            }
        });
    }

    evalCriteria() {
        const validCommand = window['segmentation'].SBActionCriteriaService.evaluateCriteria(
            window['segmentation'].SBTagService.__tagList,
            this.comdList
        );
        this.executeCommand(validCommand);
        this.evalExecutedCommands();
    }

    async executeCommand(validCmdList, revert?) {
        /*
        ** check if command already exist in command list
        ** check if command already executed, then do nothing
        ** if new command then execute command and store it in executedCommandList
        */
        const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
        validCmdList.forEach(cmdCriteria => {
            if (!this.exeCommands.find(ele => ele.commandId === cmdCriteria.commandId)) {
                switch (cmdCriteria.controlFunction) {
                    case CommandFunctions.LOCAL_NOTIFICATION:
                        this.notificationSrc.setupLocalNotification(selectedLanguage, cmdCriteria.controlFunctionPayload);
                        this.exeCommands.push(cmdCriteria);
                        break;
                    case CommandFunctions.BANNER:
                        if (cmdCriteria.controlFunctionPayload && cmdCriteria.controlFunctionPayload.showBanner && !revert) {
                            this.exeCommands.push(cmdCriteria);
                        }
                        break;
                    default:
                        break;
                }
            }
        });
        this.handleLocalNotificationTap();
    }

    handleLocalNotificationTap() {
        let payloadData;
        if (this._localNotificationId) {
            payloadData = this.exeCommands.find((ele) => {
                return ele.controlFunctionPayload[0].config[0].id === this._localNotificationId;
            }).controlFunctionPayload[0].config;
            this.splaschreenDeeplinkActionHandlerDelegate.onAction(payloadData[0]);
            this.localNotificationId = null;
        }
    }

    evalExecutedCommands() {
        const validCommand = window['segmentation'].SBActionCriteriaService.evaluateCriteria(
            window['segmentation'].SBTagService.__tagList,
            this.exeCommands
        );
        const invalidcomd = this.exeCommands.filter(exeCmd => !validCommand.some(validCmd => validCmd.commandId === exeCmd.commandId));
        for (let i = (invalidcomd.length - 1); i >= 0; i--) {
            this.exeCommands.splice(this.exeCommands.indexOf(invalidcomd[i]), 1);
        }
        this.executeCommand(invalidcomd, true);
    }
}
