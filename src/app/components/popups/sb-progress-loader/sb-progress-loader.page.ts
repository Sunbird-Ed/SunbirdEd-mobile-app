import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';

@Component({
    selector: 'app-sb-progress-loader',
    templateUrl: './sb-progress-loader.page.html',
    styleUrls: ['./sb-progress-loader.page.scss'],
})
export class SbProgressLoaderPage implements OnInit {
    private readonly testData;

    constructor(
        private navParams: NavParams,
        private modalController: ModalController
    ) {
       this.testData = this.navParams.get('dataSent');
    }

    ngOnInit() {
    }

    async close() {
        this.modalController.dismiss(this.testData);
    }

    async setProgress() {

    }
}
