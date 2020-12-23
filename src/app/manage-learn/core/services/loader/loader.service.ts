import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loaderRef: any;

  constructor(private loader: LoadingController) { }

  async startLoader(message?: string) {
    this.loaderRef = await this.loader.create({
      cssClass: 'my-custom-class',
      spinner: 'circular',
      message: message ? message : 'Please wait while loading ...',
      translucent: true,
      backdropDismiss: false
    });
    await this.loaderRef.present()
  }
  async stopLoader() {
    this.loaderRef ? await this.loaderRef.dismiss() : null;
  }
}
