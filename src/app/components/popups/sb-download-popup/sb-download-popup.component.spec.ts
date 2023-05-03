import { SbDownloadPopupComponent } from './sb-download-popup.component';
import { Events } from '../../../../util/events';
import { FileSizePipe } from '../../../../pipes/file-size/file-size';
import { SimpleChanges, SimpleChange } from '@angular/core';

describe('SbDownloadPopupComponent', () => {
    let sbDownloadPopupComponent: SbDownloadPopupComponent;

    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockFileSizePipe: Partial<FileSizePipe> = {
        transform: jest.fn()
    };
    beforeAll(() => {
        sbDownloadPopupComponent = new SbDownloadPopupComponent(
            mockEvents as Events,
            mockFileSizePipe as FileSizePipe
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of SbDownloadPopupComponent', () => {
        expect(sbDownloadPopupComponent).toBeTruthy();
    });

    it('should publish proper events', () => {
        // arrange
        // act
        sbDownloadPopupComponent.togglePopover({});
        // assert
        expect(mockEvents.publish).toHaveBeenCalledWith('header:decreasezIndex');

        // act
        sbDownloadPopupComponent.togglePopover();
        // assert
        expect(mockEvents.publish).toHaveBeenCalledWith('header:setzIndexToNormal');
    });

    it('should emit cancel download event', () => {
        // arrange
       jest.spyOn(sbDownloadPopupComponent.cancelDownloadEmit, 'emit');
        // act
        sbDownloadPopupComponent.ngOnInit();
        sbDownloadPopupComponent.cancelDownload();
        // assert
        expect(sbDownloadPopupComponent.cancelDownloadEmit.emit).toHaveBeenCalled();
    });

    it('should populate all the required Fields', () => {
        // arrange
        sbDownloadPopupComponent.queuedIdentifiers = ['do_1234'];
        sbDownloadPopupComponent.currentCount = 2;
        sbDownloadPopupComponent.downloadSize = 200;
        sbDownloadPopupComponent.downloadProgress = 100;
        sbDownloadPopupComponent.contentName = 'sample_content_name';
        sbDownloadPopupComponent.contentAvailableLocally = true;
        // act
        const changes: SimpleChanges = {
            queuedIdentifiers: new SimpleChange(['do_1234'], ['do_1234'], true),
            currentCount: new SimpleChange(2, 2, true),
            downloadSize: new SimpleChange(200, 200, true),
            downloadProgress: new SimpleChange(100, 100, true),
            contentName: new SimpleChange('sample_content_name', 'sample_content_name', true)
        };
        sbDownloadPopupComponent.ngOnChanges(changes);
        // assert
        expect(sbDownloadPopupComponent.queuedIdentifiers).toEqual(['do_1234']);
        expect(sbDownloadPopupComponent.currentCount).toEqual(2);
        expect(sbDownloadPopupComponent.downloadSize).toEqual(200);
        expect(sbDownloadPopupComponent.downloadProgress).toEqual(100);
        expect(sbDownloadPopupComponent.showDownload).toBeFalsy();

        // arrange
        sbDownloadPopupComponent.downloadProgress = 10;
        // act
        sbDownloadPopupComponent.ngOnChanges(changes);
        // assert
        expect(sbDownloadPopupComponent.showDownload).toBeFalsy();

        // arrange
        sbDownloadPopupComponent.downloadProgress = undefined;
        // act
        sbDownloadPopupComponent.ngOnChanges(changes);
        // assert
        expect(sbDownloadPopupComponent.showDownload).toBeFalsy();
    });

    it('should populate all the required Fields for else case', () => {
        // arrange
        sbDownloadPopupComponent.queuedIdentifiers = 12312;
        sbDownloadPopupComponent.currentCount = 2;
        sbDownloadPopupComponent.downloadSize = 200;
        sbDownloadPopupComponent.downloadProgress = 100;
        sbDownloadPopupComponent.isUpdateAvail = true;
        sbDownloadPopupComponent.contentName = 'sample_content_name';
        sbDownloadPopupComponent.contentAvailableLocally = true;
        // act
        const changes: SimpleChanges = {
        };
        sbDownloadPopupComponent.ngOnChanges(changes);
        // assert
        expect(sbDownloadPopupComponent.queuedIdentifiers).toEqual(12312);
        expect(sbDownloadPopupComponent.currentCount).toEqual(2);
        expect(sbDownloadPopupComponent.downloadSize).toEqual(200);
        expect(sbDownloadPopupComponent.downloadProgress).toEqual(100);
        expect(sbDownloadPopupComponent.showDownload).toBeFalsy();
    });

});
