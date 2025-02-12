import { Injectable } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { ContentImport } from '@project-sunbird/sunbird-sdk';
import { ViewCreditsComponent } from '../app/components/popups/view-credits/view-credits.component';
import { FilePathService } from '../services/file-path/file.service';
import { FilePaths } from '../services/file-path/file';

@Injectable()
export class CourseUtilService {

    constructor(
        private popOverCtrl: PopoverController,
        private platform: Platform,
        private filePathService: FilePathService,
    ) { }

    /**
     * Returns course progress in percentage
     * @param progress Course Progress
     */
    getCourseProgress(leafNodeCount: any, progress: number) {
        if (leafNodeCount === 0 || leafNodeCount === '0' || leafNodeCount === undefined) {
            return 0;
        }

        const returnData = ((progress / leafNodeCount) * 100);

        if (isNaN(returnData)) {
            return 0;
        } else if (returnData > 100) {
            return 100;
        } else {
            const cProgress = String(returnData);
            return cProgress.split('.')[0];
        }
    }

    /**
     * Returns ImportContentRequest body
     */
    async getImportContentRequestBody(identifiers, isChild: boolean): Promise<Array<ContentImport>> {
        const requestParams = [];
        const filePath = this.platform.is('ios')? FilePaths.DOCUMENTS : FilePaths.EXTERNAL_DATA;
         const folderPath = await this.filePathService.getFilePath(filePath);identifiers.forEach((value) => {
            requestParams.push({
                isChildContent: isChild,
                destinationFolder: folderPath,
                contentId: value,
                correlationData: []
            });
        });

        return requestParams;
    }

    /**
     * Opens up popup for the credits.
     */
    async showCredits(content, pageId, rollUp, correlation) {
        const popUp = await this.popOverCtrl.create({
            component: ViewCreditsComponent,
            componentProps: { content, pageId, rollUp, correlation },
            cssClass: 'view-credits'
        });
        await popUp.present();
    }
}
