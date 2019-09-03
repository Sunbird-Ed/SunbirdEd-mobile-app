import { Injectable } from '@angular/core';

export interface TabOptions {
  root: any;
  icon?: string;
  label?: string;
  index?: number;
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
      return prev.index - next.index;
    });
  }

  removeAllTabs() {
    this.tabs = [];
  }

}


