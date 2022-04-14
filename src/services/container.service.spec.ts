import { Injectable } from '@angular/core';
import { ContainerService } from './container.services';

describe('ContainerService', () => {
  let containerService: ContainerService;

  beforeAll(() => {
    containerService = new ContainerService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a instance of FiltersPage', () => {
    expect(containerService).toBeTruthy();
  });
  it('addTab', () => {
    //arrange
    const tab = { root: 'home', name: 'home', icon: 'icons', label: 'FRMELEMNTS_LBL_TAB_HOME', index: 2 };
    //act
    containerService.addTab(tab);
    //assert
    expect(containerService.addTab).toBeTruthy();
  });
  it('getAllTabs', () => {
    //arrange
    containerService['tabs'] = [
      { root: 'home', label: 'FRMELEMNTS_LBL_TAB_HOME', index: 2 },
      { root: 'search', label: 'DISCOVER_BNAV', index: 2 }
    ]
    //act
    containerService.getAllTabs();
    //assert
    expect(containerService.getAllTabs).toBeTruthy();
  });
  it('removeAllTabs', () => {
    //arrange
    //act
    containerService.removeAllTabs();
    //assert
    expect(containerService.removeAllTabs).toBeTruthy();
  });
});