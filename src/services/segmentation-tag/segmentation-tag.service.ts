import { Inject, Injectable } from "@angular/core";
import { ProfileConstants } from "@app/app/app.constant";
import { SBTagService, SBActionCriteriaService } from 'sb-tag-manager';
import { AuthService, Profile, ProfileService, SegmentationService } from 'sunbird-sdk';
import { AppGlobalService } from "../app-global-service.service";
import { NotificationService } from '@app/services/notification.service';
import * as _ from "dayjs/locale/*";
import { FormAndFrameworkUtilService } from "../formandframeworkutil.service";
export class TagPrefixConstants {
    static readonly DEVICE_CONFIG = 'DEVCONFIG_';
    static readonly USER_ATRIBUTE = 'USERFRAMEWORK_';
    static readonly USER_LOCATION = 'USERLOCATION_';
    static readonly CONTENT_ID = 'CONTENT_';
    static readonly USER_LANG = 'USERLANG_';
}

export class CommandFunctions {
    static readonly LOCAL_NOTIFICATION = 'LOCAL_NOTIF';
}

@Injectable()
export class SegmentationTagService {

    private exeCommands = [];

    private comdList = [];

    constructor(
        @Inject('SEGMENTATION_SERVICE') private segmentationService: SegmentationService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('AUTH_SERVICE') private authService: AuthService,
        private notificationSrc: NotificationService,
        private appGlobalService: AppGlobalService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,

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
    }

    executeCommand(validCmdList) {
        /*
        ** check if command already exist in command list
        ** check if command already executed, then do nothing
        ** if new command then execute command and store it in executedCommandList
        */
        validCmdList.forEach(cmdCriteria => {
            if (!this.exeCommands.find(ele => ele.commandId === cmdCriteria.commandId)) {
                switch(cmdCriteria.controlFunction) {
                    case CommandFunctions.LOCAL_NOTIFICATION:
                        this.notificationSrc.setupLocalNotification( null, cmdCriteria.controlFunctionPayload);
                        this.exeCommands.push(cmdCriteria);
                        break;
                    default:
                        break;
                }
            }
        });
    }
}
