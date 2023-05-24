import {Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SbProgressLoaderPage} from '../app/components/popups/sb-progress-loader/sb-progress-loader.page';
import {BehaviorSubject} from 'rxjs';

export interface Context {
    id: string;
    ignoreTelemetry?: {
        when: {
            interact?: RegExp;
            impression?: RegExp;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class SbProgressLoader {
    private modal?: HTMLIonModalElement;
    private progress: BehaviorSubject<number> = new BehaviorSubject(0);

    readonly contexts = new Map<string, Context>();

    constructor(
        private modalCtrl: ModalController,
    ) {
    }

    async show(context: Context = {id: 'DEFAULT'}) {
        this.contexts.set(context.id, context);

        if (this.modal) {
            return;
        }

        this.progress.next(0);

        this.modal = await this.modalCtrl.create({
            component: SbProgressLoaderPage,
            componentProps: {
                progress: this.progress.asObservable(),
            },
            cssClass: 'sb-progress-loader'
        });

        await this.modal.present();

        setTimeout(async () => {
            await this.hide(context);
        }, 30 * 1000);
    }

    updateProgress(progress: number) {
        if (!this.modal) {
            return;
        }
        this.progress.next(progress);
    }

    async hide(context: Context = {id: 'DEFAULT'}) {
        if (!this.contexts.has(context.id)) {
            return;
        }

        this.contexts.delete(context.id);

        if (!this.modal || this.contexts.size) {
            return;
        }

        this.progress.next(100);

        setTimeout(async () => {
            await this.modal.dismiss();
            this.modal = undefined;
        }, 500);
    }
}
