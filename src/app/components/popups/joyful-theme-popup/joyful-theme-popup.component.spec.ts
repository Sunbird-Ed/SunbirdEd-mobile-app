import {JoyfulThemePopupComponent} from './joyful-theme-popup.component';
import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes } from '@app/app/app.constant';
import { SharedPreferences } from 'sunbird-sdk';
import { AppHeaderService } from '@app/services';
import { of } from 'rxjs';

describe("JoyfulThemePopupComponent", () => {
    let joyfulThemePopupComponent : JoyfulThemePopupComponent ;
    const mockPreferences : Partial<SharedPreferences> = {};
    const mockPopoverController : Partial<PopoverController> = {};
    const mockNavParams : Partial<NavParams> = {};
    const mockAppHeaderService : Partial<AppHeaderService> = {};
    
    beforeAll(() => {
        joyfulThemePopupComponent = new JoyfulThemePopupComponent(
            mockPreferences as SharedPreferences,
            mockPopoverController as PopoverController,
            mockNavParams as NavParams,
            mockAppHeaderService as AppHeaderService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of JoyfulThemePopupComponent',() => {
        expect(joyfulThemePopupComponent).toBeTruthy();
    });

    describe('ngOnit', () => {
        it('should set values to appTheme and appName', (done) => {
            //arrange
            mockNavParams.get = jest.fn(() => ('appName'));
            //act
            joyfulThemePopupComponent.ngOnInit();
            //assert
            expect(joyfulThemePopupComponent.appName).toEqual('appName');
            // expect(joyfulThemePopupComponent.appTheme).toEqual('');
            setTimeout(() => {
                expect(joyfulThemePopupComponent.isPopoverPresent).toEqual(true);
                done();
            },2000);
        })
    })

    describe('switchToJoyfulTheme', () => {
        it('should switch default to joyful theme', (done) => {
            //arrange
            mockPreferences.putString = jest.fn(() => of());
            mockAppHeaderService.showStatusBar = jest.fn(() =>
             Promise.resolve() );
             jest.spyOn(document, 'querySelector').mockImplementation(() => {
                 return {getAttribute : jest.fn(() => AppThemes.DEFAULT )} as any;
                
             });
            // document.querySelector() = {
            //     getAttribute : jest.fn(() => ('sample-result'))
            // }

            //act
            joyfulThemePopupComponent.switchToJoyfulTheme()

            //assert
            setTimeout(() => {
                expect(joyfulThemePopupComponent.appTheme).toEqual(AppThemes.JOYFUL);
                expect(mockPreferences.putString).toHaveBeenCalledWith('current_selected_theme', AppThemes.JOYFUL);
                expect(mockAppHeaderService.showStatusBar).toHaveBeenCalled();
                done();
            },0);
        });
    });

    describe('closePopover()', () => {
        it('should switch to JoyfulTheme', (done) => {
            //arrange
            jest.spyOn(joyfulThemePopupComponent,'switchToJoyfulTheme').mockImplementation();
            mockPopoverController.dismiss = jest.fn();
            //act
            joyfulThemePopupComponent.closePopover();
            //assert
            setTimeout(() => {
                expect(mockPopoverController.dismiss).toHaveBeenCalled();
                done();
            },0);
        })
    });

    describe('switchToNewTheme()', () => {
        it('should switch to JoyfulTheme', (done) => {
            //arrange
            jest.spyOn(joyfulThemePopupComponent,'switchToJoyfulTheme').mockImplementation();
            mockPopoverController.dismiss = jest.fn();
            //act
            joyfulThemePopupComponent.switchToNewTheme();
            //assert
            setTimeout(() => {
                expect(mockPopoverController.dismiss).toHaveBeenCalled();
                done();
            },0);
        })
    })
})