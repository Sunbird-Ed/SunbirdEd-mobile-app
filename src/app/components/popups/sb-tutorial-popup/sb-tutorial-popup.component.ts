import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {CommonUtilService} from '../../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import {Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, PageId} from '../../../../services/telemetry-constants';

@Component({
    selector: 'app-sb-tutorial-popup',
    templateUrl: './sb-tutorial-popup.component.html',
    styleUrls: ['./sb-tutorial-popup.component.scss']
})
export class SbTutorialPopupComponent implements OnInit {
    appName = '';
    isPopoverPresent = false;
    explainVideos;
    quesBanks;
    interactiveMaterial;
    constructor(
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private commonUtilService: CommonUtilService,
        private telemetryGeneratorService: TelemetryGeneratorService
    ) {
        this.explainVideos = '<strong class="bold">' + this.commonUtilService.translateMessage('EXP_VIDEOS') + '</strong>';
        this.quesBanks = '<strong class="bold">' + this.commonUtilService.translateMessage('QUES_BANKS') + '</strong>';
        this.interactiveMaterial = '<strong class="bold">' + this.commonUtilService.translateMessage('INTERACTIVE_MATERIAL') + '</strong>';
    }

    ngOnInit() {
        this.appName = this.navParams.get('appLabel');
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW,
            ImpressionSubtype.TUTORIAL_WALKTHROUGH,
            PageId.LIBRARY,
            Environment.HOME
        );

        setTimeout(() => {
            this.isPopoverPresent = true;
        }, 2000);
    }

    async closePopover(continueClicked: boolean) {
        await this.popoverCtrl.dismiss();
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            continueClicked ? InteractSubtype.TUTORIAL_CONTINUE_CLICKED : InteractSubtype.CLOSE_CLICKED,
            Environment.HOME,
            PageId.APP_TUTORIAL_POPUP
        );
    }
}
