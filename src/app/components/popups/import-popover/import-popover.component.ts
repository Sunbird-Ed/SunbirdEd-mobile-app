import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {NavParams, Platform, PopoverController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {FileSizePipe} from '@app/pipes/file-size/file-size';
import {
    ContentEventType,
    EventsBusEvent,
    EventsBusService
} from 'sunbird-sdk';
import {TelemetryGeneratorService, AppGlobalService} from '@app/services';
import {
    Environment,
    ImpressionType,
    PageId,
    ID,
    InteractType
  } from '@app/services/telemetry-constants';

@Component({
    selector: 'app-import-popover',
    templateUrl: './import-popover.component.html',
    styleUrls: ['./import-popover.component.scss'],
})
export class ImportPopoverComponent implements OnInit, OnDestroy {
    backButtonFunc: Subscription;
    filePath;
    fileSize;
    deleteChecked = false;
    fileName: string;
    currentCount;
    totalCount;
    private eventSubscription: Subscription;
    importingAndDisablingButton = false;
    onLoadClicked: () => void;

    constructor(
        @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private appGlobalService: AppGlobalService,
        private popoverCtrl: PopoverController,
        private platform: Platform,
        private navParams: NavParams,
        private fileSizePipe: FileSizePipe,
        private zone: NgZone
    ) {
    }

    async ngOnInit() {
        this.fileName = this.navParams.get('filename');
        this.fileSize = this.navParams.get('size');
        this.onLoadClicked = this.navParams.get('onLoadClicked');
        this.fileSize = this.fileSizePipe.transform(this.fileSize, 2);
        this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
            this.popoverCtrl.dismiss();
            this.backButtonFunc.unsubscribe();
        });
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW,
            '',
            PageId.IMPORT_CONTENT_POPUP,
            this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        );
    }

    closePopover() {
        if (!this.importingAndDisablingButton) {
            this.popoverCtrl.dismiss();
        }
    }

    checkboxClicked(e: CustomEvent) {
        if (e.detail.checked) {
            this.deleteChecked = true;
        }
    }

    importInitiated() {
        this.importingAndDisablingButton = true;
        this.onLoadClicked();
        this.telemetryGeneratorService.generateInteractTelemetry(
            this.deleteChecked ? InteractType.DELETE_CHECKED : InteractType.DELETE_UNCHECKED, '',
            this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
            PageId.IMPORT_CONTENT_POPUP, undefined, undefined, undefined, undefined,
            ID.LOAD_CLICKED
          );
        this.eventSubscription = this.eventsBusService.events().subscribe((event: EventsBusEvent) => {
            this.zone.run(() => {
                if (event.type === ContentEventType.IMPORT_PROGRESS) {
                    this.currentCount = event.payload.currentCount;
                    this.totalCount = event.payload.totalCount;
                }

                if (event.type === ContentEventType.IMPORT_COMPLETED) {
                    if (this.deleteChecked) {
                        this.popoverCtrl.dismiss({isDeleteChecked: true});
                    } else {
                        this.popoverCtrl.dismiss({isDeleteChecked: false});
                    }
                }
            });
        });
    }
    ngOnDestroy(): void {
        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }
    }
}
