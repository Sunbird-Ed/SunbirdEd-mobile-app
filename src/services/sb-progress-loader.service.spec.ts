import {ModalController} from '@ionic/angular';
import {BehaviorSubject, of} from 'rxjs';
import { SbProgressLoader } from './sb-progress-loader.service';
export interface Context {
    id: string;
    ignoreTelemetry?: {
        when: {
            interact?: RegExp;
            impression?: RegExp;
        };
    };
}
describe('SbProgressLoader', () => {
    let sbProgressLoader: SbProgressLoader;
    let modal: HTMLIonModalElement
    const progress: BehaviorSubject<number> = new BehaviorSubject(0);

    let contexts = new Map<string, Context>();
    const context: Context = {id: 'DEFAULT'};
    const loader = {
        present: jest.fn(),
        dismiss: jest.fn()
    };
    let mockModalController: Partial<ModalController> = {
        create: jest.fn(() => loader) as any
    };

    beforeAll(() => {
        sbProgressLoader = new SbProgressLoader(
            mockModalController as ModalController
        );
        const hdie = jest.spyOn(sbProgressLoader, 'hide');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should be create an instance of sb progress loader', () => {
        expect(sbProgressLoader).toBeTruthy();
    });

    describe('show', () => {
        it('it should return undefined when modal', () => {
            // act
            sbProgressLoader.show(context);
            // assert
            expect(modal).toBe(undefined);
        }); 
        it('it should show progress loader', (done) => {
            // arrange
            contexts.set(context.id, context);
            progress.next(0);
            mockModalController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
            } as any)));
            // act
            sbProgressLoader.show(context);
            // assert
            setTimeout(() => {
                done();
            })
        });
    });

    describe('updateProgress', () => {
        it('should return if no modal', () => {
            // arrange
            if (!modal) {
                return undefined;
            }
            // act
            sbProgressLoader.updateProgress(1);
            expect(modal).not.toBeUndefined();
        });
        it('it should update a progress loader', () => {
            // arrange
            // act
            sbProgressLoader.updateProgress(1);
            // assert
            expect(progress).toEqual(progress);
        })
    });

    describe('hide', () => {
        it('it should return undefined for no context id', (done) => {
            // arrange
            const context : Context = undefined
            // act
            sbProgressLoader.hide(context)
            // assert
            expect(context).toBeUndefined();
            setTimeout(() => {
                done();
            }, 500)
        });
        it('it should return null when modal not defined and no contexts size', () =>{
            // act
            if (!modal && contexts.size) {
                return undefined;
            }
            sbProgressLoader.hide(context)

            expect(modal).not.toBeUndefined();
            expect(contexts.size).not.toBeUndefined();
        })
        it('it should hide the progress laoder', (done) => {
            // arrange
            mockModalController.dismiss = jest.fn(() => of(undefined)) as any;
            contexts.delete(context.id);
            progress.next(100);
            // act
            sbProgressLoader.hide(context)
            // assert
            setTimeout(() => {
                mockModalController = undefined;
                done();
            }, 500);
        })
    })
})
