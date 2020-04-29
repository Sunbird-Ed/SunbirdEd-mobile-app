import {Injectable} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {SbProgressLoaderPage} from '@app/app/components/popups/sb-progress-loader/sb-progress-loader.page';
import {BehaviorSubject} from 'rxjs';

interface Context {
    id: string;
    ignoreTelemetry?: {
        when: {
            [key: string]: RegExp
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class SbProgressLoader {
    private modal?: HTMLIonModalElement;
    private progress: BehaviorSubject<number> = new BehaviorSubject(0);

    readonly contexts =  new Map<string, Context>();

    constructor(
        private modalCtrl: ModalController,
    ) {
    }

    show(context: Context = { id: 'DEFAULT' }) {
        (async () => {
            this.contexts.set(context.id, context);

            if (this.modal) {
                return;
            }

            this.progress.next(0);

            this.modal = await this.modalCtrl.create({
                component: SbProgressLoaderPage,
                componentProps: {
                    progress: this.progress.asObservable(),
                }
            });

            await this.modal.present();

            setTimeout(() => {
                this.hide(context);
            }, 30 * 1000);
        })();
    }

    updateProgress(progress: number) {
        if (!this.modal) {
            return;
        }
        this.progress.next(progress);
    }

    hide(context: Context = { id: 'DEFAULT' }) {
        (async () => {
            if (!this.contexts.has(context.id)) {
                return;
            }

            this.contexts.delete(context.id);

            if (!this.modal || this.contexts.size) {
                return;
            }

            this.progress.next(100);

            setTimeout(() => {
                this.modal.dismiss();
                this.modal = undefined;
            }, 500);
        })();
    }
}
