import { Inject, Injectable } from "@angular/core";
import { SBTagModule } from 'sb-tag-manager';
import { AuthService, OAuthSession, SegmentationService } from 'sunbird-sdk';

interface SBTagManager {
    SBTagService: SBTagService;
    isInitialised: boolean;
    _container: any;
    _isInitialised: boolean;

    init(): void;
}

interface SBTagService {
    __tagList: Object;
    __tagObj: any;
    __tagSnapShot: any;

    // appendTag
    // calculateTags: ƒ ()
    getAllTags(): any;

    // getTagAttributeValues: ƒ ()
    // getTagAttributes: ƒ ()
    getTags(prefix: string): any;
    // propertiesToArray: ƒ (t)
    // propertiesToArrayKeyValues: ƒ (t,e)
    pushTag(tagContent: any, prefix): any;
    removeAllTags(): void;
    removeTag(prefix: string): void;
}

export class TagPrefixConstants {
    static readonly DEVICE_CONFIG = 'DEVCONFIG_';
    static readonly USER_ATRIBUTE = 'UA_';
}

@Injectable()
export class SegmentationTagService {

    private sbTagManager: SBTagManager;

    constructor(
        @Inject('SEGMENTATION_SERVICE') private segmentationService: SegmentationService,
        @Inject('AUTH_SERVICE') private authService: AuthService,
    ) {
        this.sbTagManager = SBTagModule.instance;
        this.sbTagManager.init();
        console.log('tagManager initialisation success', this.sbTagManager.isInitialised);
    }

    presistTags(str?, str2?) {
        if(str) {
            this.segmentationService.putTags(str, str2)
                .subscribe(response => console.log(response));
        }
        this.authService.getSession().toPromise().then((session: OAuthSession) => {
            if (session && session.userToken) {
                console.log(this);
                let tagsObj = {
                    __tagList: this.sbTagManager.SBTagService.__tagList,
                    __tagObj: this.sbTagManager.SBTagService.__tagObj,
                    __tagSnapShot: this.sbTagManager.SBTagService.__tagSnapShot

                };
                this.segmentationService.putTags(JSON.stringify(tagsObj), session.userToken)
                .subscribe(response => console.log(response));
            }
        });
    }

    getPersistedTags() {
        this.authService.getSession().toPromise().then((session: OAuthSession) => {
            if (session && session.userToken) {
                console.log(session.userToken);
                let tagsObj = {
                    __tagList: this.sbTagManager.SBTagService.__tagList,
                    __tagObj: this.sbTagManager.SBTagService.__tagObj,
                    __tagSnapShot: this.sbTagManager.SBTagService.__tagSnapShot
                };
                this.segmentationService.getTags(session.userToken)
                .subscribe(response => {
                    let object = JSON.parse(response);
                    console.log(object);
                    this.sbTagManager.SBTagService.__tagList = object.__tagList;
                    this.sbTagManager.SBTagService.__tagObj = object.__tagObj;
                    this.sbTagManager.SBTagService.__tagSnapShot = object.__tagSnapShot;
                });
            }
        });
    }

    pushTag( tagContent: any, prefix: string ): void {
        this.sbTagManager.SBTagService.pushTag(tagContent, prefix);
    }

    getAllTags(): any {
        return this.sbTagManager.SBTagService.getAllTags();
    }

}
