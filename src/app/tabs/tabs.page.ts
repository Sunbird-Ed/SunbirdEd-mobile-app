import { Component, ViewChild } from '@angular/core';

import { IonTabs, Events, ToastController } from '@ionic/angular';
import { TelemetryGeneratorService, ContainerService,AppGlobalService } from '../../services';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

  configData: any;

  @ViewChild('myTabs') tabRef: IonTabs;

  tabIndex = 0;

  tabs = [];

  headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search', 'filter'],
  };

  selectedLanguage: string;

  constructor(
    private container: ContainerService,
    private events: Events,
    public toastCtrl: ToastController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService
  ) {}

  ionViewWillEnter() {
    this.tabs = this.container.getAllTabs();

    let tabIndex;

    this.tabs.forEach((tab, index) => {
      if (tab.isSelected === true) {
        tabIndex = index;
      }
    });

    this.events.publish('update_header', { index: tabIndex });
    // Raise an Event
    setTimeout(() => {
      this.tabRef.select(tabIndex);
    }, 300);
  }

  public ionChange(tab: any) {
    // if active tab is other than scanner tab i.e, = tab 2
    if (tab.index !== 2) {
      this.tabs.forEach((tabTo, index) => {
      this.appGlobalService.currentPageId = tab.tabTitle;
        if (tabTo.isSelected === true) {
          tabTo.isSelected = false;
        }

        if (index === tab.index) {
          tabTo.isSelected = true;
        }
      });
    }

    this.events.publish('tab.change', tab.tabTitle);
  }

  public async customClick(tab, _index) {
    // this.tabIndex = _index;
    if (tab.disabled && tab.availableLater) {
      let toast = await this.toastCtrl.create({
        message: 'Will be available in later release',
        duration: 3000,
        position: 'middle',
        cssClass: 'sb-toast available-later',
        showCloseButton: false
      });
     
      toast.present();
    }

    if (tab.disabled && !tab.availableLater) {
      const toast = await this.toastCtrl.create({
        message: 'Available for teachers only',
        duration: 3000,
        position: 'middle',
        cssClass: 'sb-toast available-later',
        showCloseButton: false
      });
      toast.present();
    }
  }

}
