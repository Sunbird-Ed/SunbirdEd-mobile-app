import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';

@Component({
    selector: 'app-sb-progress-loader',
    templateUrl: './sb-progress-loader.page.html',
    styleUrls: ['./sb-progress-loader.page.scss'],
})
export class SbProgressLoaderPage implements OnInit, OnDestroy {
    private backButtonSubscription: Subscription;
    @Input()
    public progress: Observable<number>;

    constructor(private platform: Platform
    ) {
    }

    ngOnInit() {
        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(11, () => {
        });
    }

    ngOnDestroy(): void {
        if (this.backButtonSubscription) {
            this.backButtonSubscription.unsubscribe();
        }
    }
}
