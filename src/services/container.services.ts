import { Injectable } from '@angular/core';

export interface TabOptions {
  root: any;
  icon?: string;
  label?: string;
  index?: number;
  tabsHideOnSubPages?: boolean;
  isSelected?: boolean;
}

@Injectable()
export class ContainerService {

  private tabs: Array<TabOptions> = [];

  addTab(tab: TabOptions) {
    this.tabs.push(tab);
  }

  getAllTabs(): Array<any> {
    return this.tabs.sort((prev, next) => {
      if (prev.index < next.index) return -1;
      if (prev.index > next.index) return 1;
      return 0;
    });
  }

  removeAllTabs() {
    this.tabs = [];
  }

}


