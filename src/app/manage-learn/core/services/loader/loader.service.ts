import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loaderRef: any;
  isLoading: boolean = false;

  constructor(private loader: LoadingController) {}

  // async startLoader(message?: string) {
  //   this.loaderRef = await this.loader.create({
  //     cssClass: 'my-custom-class',
  //     spinner: 'circular',
  //     message: message ? message : 'Please wait while loading ...',
  //     translucent: true,
  //     backdropDismiss: false
  //   });
  //   await this.loaderRef.present()
  // }
  // async stopLoader() {
  //   this.loaderRef ? await this.loaderRef.dismiss() : null;
  // }

  async startLoader(message?) {
    this.isLoading = true;
    return await this.loader
      .create({
        // duration: 5000,

        cssClass: 'custom-loader-message-class',
        spinner: 'circular',
        message: message ? message : 'Please wait while loading ...',
        translucent: true,
        backdropDismiss: false,
      })
      .then((a) => {
        a.present().then(() => {
          console.log('presented');
          if (!this.isLoading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }

  async stopLoader() {
    this.isLoading = false;
    return await this.loader.dismiss().then(() => console.log('dismissed'));
  }
}
