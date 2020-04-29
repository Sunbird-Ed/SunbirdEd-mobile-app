import {Component, Input, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-sb-progress-loader',
    templateUrl: './sb-progress-loader.page.html',
    styleUrls: ['./sb-progress-loader.page.scss'],
})
export class SbProgressLoaderPage implements OnInit {
    @Input('progress')
    public progress$: Observable<number>;

    constructor() {
    }

    ngOnInit() {
    }
}
