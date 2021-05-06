import { ContentViewerComponent } from './content-viewer.component';
import { ModalController } from '@ionic/angular';
import {  Component, Input, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

describe("ContentViewerComponent", () => {
    let contentViewerComponent : ContentViewerComponent ;
    const mockScreenOrientation : Partial<ScreenOrientation> = {
        ORIENTATIONS : {
            PORTRAIT_PRIMARY: 'portrait-primary',
            PORTRAIT_SECONDARY: 'portrait-secondary',
            LANDSCAPE_PRIMARY: 'landscape-primary',
            LANDSCAPE_SECONDARY: 'landscape-secondary',
            PORTRAIT: 'portrait',
            LANDSCAPE: 'landscape',
            ANY: 'any'
        }
    };
    const mockStatusBar : Partial<StatusBar> = {};
    const mockModalController : Partial<ModalController> = {};

    beforeAll(() => {
        contentViewerComponent = new ContentViewerComponent(
            mockScreenOrientation as ScreenOrientation,
            mockStatusBar as StatusBar,
            mockModalController as ModalController,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of ContentViewerComponent',() => {
        expect(contentViewerComponent).toBeTruthy();
    });

    it('should set orientation to landscape', () => {
        //arrange
        mockScreenOrientation.lock = jest.fn();
        mockStatusBar.hide = jest.fn();
        //act
        contentViewerComponent.ngOnInit();

        //assert
        expect(mockScreenOrientation.lock).toHaveBeenCalledWith(
            mockScreenOrientation.ORIENTATIONS.LANDSCAPE);
        expect(mockStatusBar.hide).toHaveBeenCalled();
    })

    

    describe('ionViewWillLeave', () => {
        it('should show status bar and set orientation to portrait', () => {
            //arrange
            mockScreenOrientation.lock = jest.fn();
            mockScreenOrientation.unlock = jest.fn();
            mockStatusBar.show = jest.fn();
            const PORTRAIT = 'PORTRAIT';
            
            //act
            contentViewerComponent.ionViewWillLeave();

            //assert
            expect(mockStatusBar.show).toHaveBeenCalled();
            expect(mockScreenOrientation.unlock).toHaveBeenCalled();
            expect(mockScreenOrientation.lock).toHaveBeenCalledWith(
                mockScreenOrientation.ORIENTATIONS.PORTRAIT);
        });
    });

    describe('eventHandler', () => {
        it('should dismiss modalCtrl', () => {
            //arrange
            mockModalController .dismiss = jest.fn();
            const event = 'EXIT';

            //act
            contentViewerComponent.eventHandler(event);

            //assert
            expect(mockModalController.dismiss).toHaveBeenCalled();
        })
    })


})