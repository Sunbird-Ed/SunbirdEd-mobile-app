import {Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SbProgressLoaderPage} from '@app/app/components/popups/sb-progress-loader/sb-progress-loader.page';

@Injectable({
    providedIn: 'root'
})
export class SbProgressLoader {
    private modal?;
    private progress = 0;

    constructor(
        private modalCtrl: ModalController
    ) {
    }

    async show() {
        this.progress = 0;
        this.modal = await this.modalCtrl.create({
            component: SbProgressLoaderPage,
            componentProps: {
                data: 'sample_data',
            }
        });
        this.modal.present();
    }

    updateProgress(progress: number) {
        if (progress >= this.progress && progress <= 100) {
            this.progress = progress;
        }
        console.log('checkProgressStatus');
    }

    hide() {
        this.progress = 100;
        this.modal.dismiss();
    }
}
