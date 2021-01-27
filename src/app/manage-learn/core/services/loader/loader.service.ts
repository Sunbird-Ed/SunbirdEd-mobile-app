import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loaderRef: any;
  isLoading: boolean = false;
  loaderCounter = 0;
  loading: HTMLIonLoadingElement;

  constructor(private loadingController: LoadingController) {}

  async startLoader(message?) {
    this.loaderCounter = this.loaderCounter + 1;

    if (this.loaderCounter === 1) {
      this.isLoading = true;
      this.loading = await this.loadingController.create({
        cssClass: 'custom-loader-message-class',
        spinner: 'circular',
        message: message ? message : 'Please wait while loading ...',
        translucent: true,
        backdropDismiss: false,
      });
      await this.loading.present();
    }
  }

  async stopLoader() {
    this.loaderCounter = this.loaderCounter - 1;
    if (this.loaderCounter === 0) {
      this.isLoading = false;
      await this.loading.dismiss();
    }
  }
}
