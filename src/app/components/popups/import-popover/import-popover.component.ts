import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Events, NavParams, Platform, PopoverController} from '@ionic/angular';
import {Observable, of, Subscription} from 'rxjs';
import {FileSizePipe} from '@app/pipes/file-size/file-size';
import {
    ContentEvent,
    ContentEventType,
    ContentImportResponse,
    ContentImportStatus, ContentService,
    EventNamespace,
    EventsBusEvent,
    EventsBusService
} from 'sunbird-sdk';
import {catchError, filter, map, mapTo, reduce, takeUntil, tap} from 'rxjs/operators';
import {SplaschreenDeeplinkActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {CommonUtilService} from '@app/services';

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
        private popoverCtrl: PopoverController,
        private platform: Platform,
        private navParams: NavParams,
        private fileSizePipe: FileSizePipe,
        @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
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
