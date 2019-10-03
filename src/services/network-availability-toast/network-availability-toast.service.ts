import { Injectable, Inject } from '@angular/core';
import { NetworkInfoService, NetworkStatus } from 'sunbird-sdk';
import { ToastController } from '@ionic/angular';
import { CommonUtilService } from '../common-util.service';
import { ToastOptions } from '@ionic/core';

@Injectable({ providedIn: 'root' })
export class NetworkAvailabilityToastService {

    private toast: any;
    private networkFlag: string; // This is use to avoid showing popup on sharing.

    constructor(@Inject('NETWORK_INFO_SERVICE') private networkInfoService: NetworkInfoService,
                private toastController: ToastController,
                private commonUtilService: CommonUtilService) { }

    public init() {
        this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE;
        this.networkInfoService.networkStatus$.skip(1)
            .distinctUntilChanged()
            .filter((networkStatus) => {
                if (
                    (this.networkFlag !== networkStatus) &&
                    ((networkStatus === NetworkStatus.ONLINE) ||
                        (networkStatus === NetworkStatus.OFFLINE))
                ) {
                    this.networkFlag = networkStatus;
                    return true;
                }
                this.networkFlag = networkStatus;
                return false;
            })
            .subscribe((networkStatus) => {
                if (this.toast) {
                    this.toast.dismiss();
                    this.toast = undefined;
                }
                if (networkStatus === NetworkStatus.ONLINE) {
                    this.showOnlineToast();
                } else {
                    this.showOfflineToast();
                }
            });
    }

    private async showOnlineToast() {
        const onlineOption: ToastOptions = {
            duration: 3000,
            message: this.commonUtilService.translateMessage('INTERNET_AVAILABLE'),
            showCloseButton: false,
            position: 'top',
            cssClass: ['online', 'toastForOnline']
        };
        this.openNetworkToast(onlineOption);
    }

    private async showOfflineToast() {
        const offlineOption: ToastOptions = {
            duration: 3000,
            message: this.commonUtilService.translateMessage('NO_INTERNET_TITLE'),
            showCloseButton: true,
            position: 'top',
            closeButtonText: 'X',
            cssClass: ['toastHeader', 'offline']
        };
        this.openNetworkToast(offlineOption);
    }

    private async openNetworkToast(toastOption: ToastOptions) {
        this.toast = await this.toastController.create(toastOption);
        await this.toast.present();
        await this.toast.onDidDismiss(() => {
            this.toast = undefined;
        });
    }

}
