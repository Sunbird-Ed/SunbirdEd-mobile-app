import { Injectable, Inject } from '@angular/core';
import { EMPTY } from 'rxjs';
import { NetworkInfoService, NetworkStatus } from 'sunbird-sdk';
import { ToastController } from '@ionic/angular';
import { CommonUtilService } from '../common-util.service';
import { ToastOptions } from '@ionic/core';
import { Router, NavigationStart } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';

interface RouterToastConfig {
    [key: string]: {
        online?: NetworkToastOptions,
        offline?: NetworkToastOptions
    };
}
interface NetworkToastOptions {
    showCloseButton?: boolean;
    cssClass?: string[];
}
@Injectable({ providedIn: 'root' })
export class NetworkAvailabilityToastService {

    // Add RouterLinks and options to display in individual pages.
    private networkToastList: RouterToastConfig =
        {
            [RouterLinks.TABS]: {
                offline: { showCloseButton: true }
            },
            [RouterLinks.RESOURCES]: {
                offline: { showCloseButton: true }
            },
            [RouterLinks.CONTENT_DETAILS]: {
                online: {},
                offline: { showCloseButton: true },
            },
            [RouterLinks.COLLECTION_DETAIL_ETB]: {
                offline: { showCloseButton: true }
            },
            [RouterLinks.ENROLLED_COURSE_DETAILS]: {
                offline: { showCloseButton: true }
            }
        };
    private toast: any;
    private networkFlag: string; // This is use to avoid showing popup on sharing.

    constructor(@Inject('NETWORK_INFO_SERVICE') private networkInfoService: NetworkInfoService,
                private toastController: ToastController,
                private commonUtilService: CommonUtilService,
                private router: Router) { }

    public init() {
        console.log('Tiggered NA');
        this.router.events
            .filter((e) => e instanceof NavigationStart)
            .distinctUntilChanged()
            .map((e: NavigationStart) => {
                console.log('URL', e.url);
                const urlArray = e.url.split('/');
                const endpoint = urlArray[urlArray.length - 1];
                for (const [key, value] of Object.entries(this.networkToastList)) {
                    if (endpoint === key) {
                        this.networkFlag = this.commonUtilService.networkInfo.isNetworkAvailable ?
                            NetworkStatus.ONLINE : NetworkStatus.OFFLINE;
                        return value;
                    }
                }
                return null;
            })
            .switchMap((options) => {
                if (options) {
                    return this.networkInfoService.networkStatus$.skip(1)
                        .distinctUntilChanged()
                        .filter((networkStatus) => {
                            if (
                                (this.networkFlag !== networkStatus) &&
                                ((options.online && networkStatus === NetworkStatus.ONLINE) ||
                                    (options.offline && networkStatus === NetworkStatus.OFFLINE))
                            ) {
                                this.networkFlag = networkStatus;
                                return true;
                            }
                            this.networkFlag = networkStatus;
                            return false;
                        })
                        .map(networkStatus => {
                            return { networkStatus, options };
                        });
                }
                return EMPTY;
            })
            .subscribe((networkDetails) => {
                if (this.toast) {
                    this.toast.dismiss();
                    this.toast = undefined;
                }
                if (networkDetails.networkStatus === NetworkStatus.ONLINE) {
                    if (networkDetails.options.online) {
                        this.showOnlineToast(networkDetails.options.online);
                    } else {
                        this.showOnlineToast();
                    }
                } else {
                    if (networkDetails.options.offline) {
                        this.showOfflineToast(networkDetails.options.offline);
                    } else {
                        this.showOfflineToast();
                    }
                }
            });
    }

    private async showOnlineToast(options?: NetworkToastOptions) {
        const onlineOption: ToastOptions = {
            duration: 3000,
            message: this.commonUtilService.translateMessage('INTERNET_AVAILABLE'),
            showCloseButton: (options && options.showCloseButton) ? true : false,
            position: 'top',
            cssClass: (options && options.cssClass) ? options.cssClass : ['online', 'toastForOnline']
        };
        this.openNetworkToast(onlineOption);
    }

    private async showOfflineToast(options?: NetworkToastOptions) {
        const offlineOption: ToastOptions = {
            duration: 3000,
            message: this.commonUtilService.translateMessage('NO_INTERNET_TITLE'),
            showCloseButton: (options && options.showCloseButton) ? true : false,
            position: 'top',
            closeButtonText: 'X',
            cssClass: (options && options.cssClass) ? options.cssClass : ['toastHeader', 'offline']
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
